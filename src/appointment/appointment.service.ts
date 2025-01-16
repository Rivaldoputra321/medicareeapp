import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull, In, DataSource, QueryRunner, Between, Not, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { Appointment, AppointmentStatus } from 'src/entities/appoinments.entity';
import { PaymentStatus, Transaction } from 'src/entities/transactions.entity';
import { MidtransService } from 'src/midtrans/midtrans.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { SetMeetingLinkDto, UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { Doctor } from 'src/entities/doctors.entity';
import { Patient } from 'src/entities/patients.entity';
import { peran } from 'src/entities/roles.entity';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);
  private readonly WIB_TIMEZONE = 'Asia/Jakarta';
  
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    private readonly emailService: EmailService,
    private readonly midtransService: MidtransService,
    private readonly configService: ConfigService,
      private readonly dataSource: DataSource
  ) {}

  private convertToWIB(date: Date): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: this.WIB_TIMEZONE }));
  }

  private isValidWIBTime(date: Date): boolean {
    const wibDate = this.convertToWIB(date);
    const hours = wibDate.getHours();
    // Assuming business hours are 8 AM - 5 PM WIB
    return true;
  }

  

  async createAppointment(
    userId: string, 
    createAppointmentDto: CreateAppointmentDto
  ) {
    const { doctorId, schedule } = createAppointmentDto;
  
    if (!doctorId) {
      throw new HttpException(
        'Doctor ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }
  
    if (!schedule) {
      throw new HttpException(
        'Schedule is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const scheduledDate = new Date(schedule);
    if (isNaN(scheduledDate.getTime())) {
      throw new HttpException(
        'Invalid date format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
        HttpStatus.BAD_REQUEST
      );
    }

    // Convert and validate WIB time
    const wibSchedule = this.convertToWIB(scheduledDate);
    if (!this.isValidWIBTime(scheduledDate)) {
      throw new HttpException(
        'Appointments must be scheduled between 8 AM and 5 PM WIB',
        HttpStatus.BAD_REQUEST
      );
    }
  
  
    const patient = await this.patientRepo.findOne({
      where: { user: { id: userId } }
    });
  
    if (!patient) {
      throw new HttpException(
        'Patient not found',
        HttpStatus.NOT_FOUND,
      );
    }
  
    const doctor = await this.doctorRepo.findOne({
      where: { id: doctorId }
    });
  
    if (!doctor) {
      throw new HttpException(
        'Doctor not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check for existing active appointments with the same doctor
    const existingActiveAppointment = await this.appointmentRepo.findOne({
      where: {
        doctorId,
        patientId: patient.id,
        status: In([
          AppointmentStatus.PENDING,
          AppointmentStatus.APPROVED,
          AppointmentStatus.AWAITING_PAYMENT,
          AppointmentStatus.PAID,
          AppointmentStatus.IN_PROGRESS,
          AppointmentStatus.RESCHEDULED
        ]),
      },
    });

    if (existingActiveAppointment) {
      throw new HttpException(
        'You already have an active appointment with this doctor. Please wait until it is completed or cancelled.',
        HttpStatus.CONFLICT,
      );
    }
  
    // Check for time slot availability in WIB
    const existingAppointment = await this.appointmentRepo.findOne({
      where: {
        doctorId,
        schedule: wibSchedule,
        status: In([
          AppointmentStatus.PENDING,
          AppointmentStatus.APPROVED,
          AppointmentStatus.PAID,
          AppointmentStatus.IN_PROGRESS,
        ]),
      },
    });
  
    if (existingAppointment) {
      throw new HttpException(
        'Doctor already has appointment at this time (WIB)',
        HttpStatus.CONFLICT,
      );
    }
  
    const appointment = new Appointment();
    appointment.doctorId = doctorId;
    appointment.patientId = patient.id;
    appointment.schedule = wibSchedule;
    appointment.status = AppointmentStatus.PENDING;
  
    try {
      const savedAppointment = await this.appointmentRepo.save(appointment);
      
      try {
        const fullAppointment = await this.appointmentRepo.findOne({
          where: { id: savedAppointment.id },
          relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
        });

        await this.emailService.sendAppointmentRequestToDoctor(fullAppointment);
      } catch (emailError) {
        this.logger.error(`Failed to send appointment email: ${emailError.message}`, emailError.stack);
      }

      return savedAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new HttpException(
        'Failed to create appointment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAppointmentStatus(
    doctorId: string,
    appointmentId: string,
    updateDto: UpdateAppointmentStatusDto,
  ) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const appointment = await queryRunner.manager.findOne(Appointment, {
        where: { 
          id: appointmentId, 
          doctorId: doctorId 
        },
        relations: {
          doctor: {
            user: true
          },
          patient: {
            user: true
          },
          transaction: true
        }
      });
      
      if (!appointment) {
        throw new HttpException(
          'Appointment not found',
          HttpStatus.NOT_FOUND,
        );
      }

      switch (updateDto.action) {
        case 'approve': {
          if (appointment.reschedule_count > 3) {
            throw new HttpException(
              'Maximum reschedule attempts exceeded',
              HttpStatus.BAD_REQUEST,
            );
          }

          appointment.status = AppointmentStatus.AWAITING_PAYMENT;
          const savedAppointment = await queryRunner.manager.save(appointment);
          
          if (appointment.transaction) {
            throw new HttpException(
              'Transaction already exists for this appointment',
              HttpStatus.CONFLICT,
            );
          }

          const doctor = await queryRunner.manager.findOne(Doctor, {
            where: { id: doctorId }
          });

          if (!doctor || !doctor.price) {
            throw new HttpException(
              'Doctor price not found',
              HttpStatus.BAD_REQUEST
            );
          }

          const amount = Number(doctor.price);
          const transaction = queryRunner.manager.create(Transaction, {
            appointment_id: savedAppointment.id,
            appointment: savedAppointment,
            amount: amount,
            adminFee: amount * 0.1,
            doctorFee: amount * 0.9,
            status: PaymentStatus.PENDING,
            midtransOrderId: `ORDER-${Date.now()}-${savedAppointment.id}`
          });
          
          const savedTransaction = await queryRunner.manager.save(transaction);
          savedAppointment.transaction = savedTransaction;
          await queryRunner.manager.save(Appointment, savedAppointment);
        
          const paymentLink = await this.midtransService.createPaymentLink(savedTransaction);
          await this.emailService.sendPaymentLink(savedAppointment, paymentLink);
          break;
        }

        case 'reject': {
          appointment.status = AppointmentStatus.REJECTED;
          appointment.rejection_reason = updateDto.rejectionReason;
          await queryRunner.manager.save(Appointment, appointment);
          
          break;
        }
      }

      await queryRunner.commitTransaction();
      
      return await queryRunner.manager.findOne(Appointment, {
        where: { id: appointmentId },
        relations: {
          doctor: true,
          patient: {
            user: true
          },
          transaction: true
        }
      });

    } catch (error) {
      this.logger.error('Error in updateAppointmentStatus', {
        doctorId,
        appointmentId,
        error: error.message,
        stack: error.stack
      });
      
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rescheduleAppointment(
    patientId: string,
    appointmentId: string,
    updateDto: UpdateAppointmentStatusDto,
  ) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const appointment = await queryRunner.manager.findOne(Appointment, {
        where: { 
          id: appointmentId,
          patientId: patientId,
          status: AppointmentStatus.REJECTED 
        },
        relations: {
          doctor: true,
          patient: {
            user: true
          }
        }
      });

      if (!appointment) {
        throw new HttpException(
          'Rejected appointment not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (appointment.reschedule_count >= 3) {
        throw new HttpException(
          'Maximum reschedule attempts exceeded',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update appointment
      appointment.schedule = updateDto.reschedule;
      appointment.status = AppointmentStatus.PENDING;
      appointment.reschedule_count += 1;

      const savedAppointment = await queryRunner.manager.save(appointment);
      await queryRunner.commitTransaction();

      // Notify doctor about the reschedule
      await this.emailService.sendAppointmentRscheduleToDoctor(savedAppointment);

      return savedAppointment;

    } catch (error) {
      this.logger.error('Error in rescheduleAppointment', {
        patientId,
        appointmentId,
        error: error.message,
        stack: error.stack
      });
      
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

async handlePaymentCallback(orderId: string, paymentStatus: PaymentStatus) {
  this.logger.log(`Processing payment callback for order: ${orderId} with status: ${paymentStatus}`);
  
  try {
    // Extract transaction ID from order ID
    const transactionId = orderId.replace('ORDER-', '');
    
    const transaction = await this.transactionRepo.findOne({
      where: [
        { id: transactionId },
        { midtransOrderId: orderId }
      ],
      relations: {
        appointment: {
          doctor: {
            user: true
          },
          patient: {
            user: true
          }
        }
      }
    });

    if (!transaction) {
      this.logger.warn(`Transaction not found for order ID: ${orderId}`);
      
      // Log all transactions for debugging
      const allTransactions = await this.transactionRepo.find({
        select: ['id', 'midtransOrderId']
      });
      
      this.logger.debug('Available transactions:', allTransactions);
      
      return {
        status: 'not_found',
        message: `Transaction ${orderId} not found`,
        recorded: false
      };
    }

    // Start a transaction to ensure both updates succeed or fail together
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`Updating transaction ${transaction.id} status to: ${paymentStatus}`);
      transaction.status = paymentStatus;
      
      if (paymentStatus === PaymentStatus.SETTLEMENT || 
          paymentStatus === PaymentStatus.CAPTURE) {
        transaction.paidAt = new Date();
        
        if (transaction.appointment) {
          // Update appointment status
          transaction.appointment.status = AppointmentStatus.PAID;
          
          // Save appointment first
          await queryRunner.manager.save(Appointment, transaction.appointment);
          this.logger.log(`Updated appointment ${transaction.appointment.id} status to PAID`);
        }
      }

      // Save transaction
      const savedTransaction = await queryRunner.manager.save(Transaction, transaction);
      
      // Commit the transaction
      await queryRunner.commitTransaction();
      
      this.logger.log('Successfully updated both transaction and appointment');
      
      return {
        status: 'success',
        transaction: savedTransaction,
        recorded: true
      };
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
    
  } catch (error) {
    this.logger.error('Error in handlePaymentCallback:', {
      orderId,
      error: error.message,
      stack: error.stack
    });
    
    return {
      status: 'error',
      message: error.message,
      recorded: false
    };
  }
}

async setMeetingLink(
  doctorId: string,
  appointmentId: string,
  { meetingLink }: SetMeetingLinkDto,
) {
  const appointment = await this.appointmentRepo.findOne({
    where: { 
      id: appointmentId, 
      doctor: { id: doctorId }, 
      status: AppointmentStatus.PAID 
    },
    relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
  });

  if (!appointment) {
    throw new HttpException(
      'Paid appointment not found',
      HttpStatus.NOT_FOUND,
    );
  }

  if (!meetingLink) {
    throw new HttpException(
      'Meeting link is required',
      HttpStatus.BAD_REQUEST,
    );
  }

  // Get meeting link expiry hours from config
  const meetingLinkExpiryHours = this.configService.get<number>('app.meetingLinkExpiryHours') || 24;
  
  // Calculate expiry date properly
  const now = new Date();
  const expiryDate = new Date(now.getTime() + (meetingLinkExpiryHours * 60 * 60 * 1000));

  try {
    // Update appointment with meeting link and dates, and change status
    appointment.meeting_link = meetingLink;
    appointment.link_sent_at = now;
    appointment.meeting_link_expired = expiryDate;
    appointment.status = AppointmentStatus.AWAITING_JOIN_LINK; // New status

    const savedAppointment = await this.appointmentRepo.save(appointment);
    
    // Send email with meeting link
    try {
      await this.emailService.sendMeetingLink(savedAppointment);
    } catch (emailError) {
      this.logger.error(`Failed to send meeting link email: ${emailError.message}`, emailError.stack);
    }

    return savedAppointment;
  } catch (error) {
    this.logger.error('Error setting meeting link:', error);
    throw new HttpException(
      'Failed to set meeting link',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


async recordPresence(
  appointmentId: string,
  userId: string,
  userType: 'doctor' | 'patient',
) {
  const appointment = await this.appointmentRepo.findOne({
    where: { id: appointmentId },
    relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
  });

  if (!appointment) {
    throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
  }

  if (userType === 'doctor' && appointment.doctor.user.id !== userId) {
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }
  if (userType === 'patient' && appointment.patient.user.id !== userId) {
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

  const now = new Date();

  if (userType === 'doctor') {
    appointment.is_doctor_present = true;
    appointment.doctor_join_time = now;
  } else {
    appointment.is_patient_present = true;
    appointment.patient_join_time = now;
  }

  if (appointment.is_doctor_present && appointment.is_patient_present) {
    appointment.status = AppointmentStatus.IN_PROGRESS;
    appointment.started_at = now; // Track when consultation actually starts
  }

  return this.appointmentRepo.save(appointment);
}


@Cron('*/5 * * * *')
async sendMeetingReminders() {
  try {
    const now = new Date();
    const wibDate = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const thirtyMinutesFromNow = new Date(wibDate.getTime() + (30 * 60 * 1000));
    
    this.logger.log(`Running meeting reminders check at: ${wibDate.toISOString()} (WIB)`);

    const upcomingAppointments = await this.appointmentRepo.find({
      where: {
        status: AppointmentStatus.AWAITING_JOIN_LINK, // Updated status check
        schedule: Between(wibDate, thirtyMinutesFromNow),
        meeting_link: Not(IsNull()),
      },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user']
    });

    this.logger.log(`Found ${upcomingAppointments.length} upcoming appointments`);

    for (const appointment of upcomingAppointments) {
      try {
        const appointmentTime = new Date(appointment.schedule);
        const timeToAppointment = Math.floor(
          (appointmentTime.getTime() - wibDate.getTime()) / (1000 * 60)
        );

        // Send reminder if it's between 25-30 minutes before appointment
        if (timeToAppointment >= 25 && timeToAppointment <= 30) {
          this.logger.log(`Sending reminder for appointment ${appointment.id}`);
          await this.emailService.sendMeetingReminder(appointment);
        }
      } catch (error) {
        this.logger.error(`Failed to process reminder for appointment ${appointment.id}:`, error);
      }
    }
  } catch (error) {
    this.logger.error('Error in sendMeetingReminders cron job:', error);
  }
}

// Add new method to auto-complete appointments after 35 minutes
@Cron('*/1 * * * *')
async autoCompleteAppointments() {
  try {
    const now = new Date();
    
    const activeAppointments = await this.appointmentRepo.find({
      where: {
        status: AppointmentStatus.IN_PROGRESS,
        started_at: Not(IsNull()),
      },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user']
    });

    for (const appointment of activeAppointments) {
      const startTime = new Date(appointment.started_at);
      const durationMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));

      if (durationMinutes >= 35) {
        this.logger.log(`Auto-completing appointment ${appointment.id} after ${durationMinutes} minutes`);
        
        // Update appointment status
        appointment.status = AppointmentStatus.COMPLETED;
        appointment.completed_at = now;
        
        await this.appointmentRepo.save(appointment);
        
        // Send completion notification
        try {
          await this.emailService.sendAppointmentCompletionNotification(appointment);
        } catch (error) {
          this.logger.error(`Failed to send completion notification for appointment ${appointment.id}:`, error);
        }
      }
    }
  } catch (error) {
    this.logger.error('Error in autoCompleteAppointments cron job:', error);
  }
}
  @Cron('*/1 * * * *')
  async handleTimeouts() {
    try {
      const now = new Date();
      
      // 1. Handle pending appointments that have passed their scheduled time
      const expiredPendingAppointments = await this.appointmentRepo.find({
        where: {
          status: AppointmentStatus.PENDING,
          schedule: LessThan(now),
        },
        relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
      });
  
      for (const appointment of expiredPendingAppointments) {
        this.logger.log(`Cancelling expired pending appointment ${appointment.id}`);
        appointment.status = AppointmentStatus.CANCELLED;
      
        await this.appointmentRepo.save(appointment);
        
        try {
          await this.emailService.sendAppointmentCancellation(
            appointment,
            'Your appointment has been cancelled as the doctor did not respond before the scheduled time.'
          );
        } catch (error) {
          this.logger.error(`Failed to send cancellation notification for appointment ${appointment.id}:`, error);
        }
      }

      // 2. Handle unpaid appointments that have passed their scheduled time
      const unpaidAppointments = await this.appointmentRepo.find({
        where: {
          status: AppointmentStatus.AWAITING_PAYMENT,
          schedule: LessThan(now),
        },
        relations: ['doctor', 'doctor.user', 'patient', 'patient.user', 'transaction'],
      });

      for (const appointment of unpaidAppointments) {
        this.logger.log(`Cancelling unpaid appointment ${appointment.id} that passed schedule time`);
        
        // Update appointment status
        appointment.status = AppointmentStatus.CANCELLED;
        
        // Update associated transaction if it exists
        if (appointment.transaction) {
          appointment.transaction.status = PaymentStatus.EXPIRE;
          await this.transactionRepo.save(appointment.transaction);
        }
        
        await this.appointmentRepo.save(appointment);
        
        try {
          await this.emailService.sendAppointmentCancellation(
            appointment,
            'Your appointment has been cancelled as payment was not received before the scheduled time.'
          );
        } catch (error) {
          this.logger.error(`Failed to send cancellation notification for unpaid appointment ${appointment.id}:`, error);
        }
      }
  
      // 3. Handle paid appointments without meeting links
      const paidAppointmentsWithoutLink = await this.appointmentRepo.find({
        where: {
          status: AppointmentStatus.PAID,
          meeting_link: IsNull(),
        },
        relations: ['transaction', 'doctor', 'doctor.user', 'patient', 'patient.user'],
      });
  
      for (const appointment of paidAppointmentsWithoutLink) {
        const appointmentTime = new Date(appointment.schedule);
        const timeUntilAppointment = appointmentTime.getTime() - now.getTime();
        const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);
        
        if (hoursUntilAppointment <= 24) {
          try {
            await this.emailService.sendMeetingLinkReminder(appointment);
            this.logger.log(`Sent meeting link reminder for appointment ${appointment.id}`);
          } catch (error) {
            this.logger.error(`Failed to send meeting link reminder for appointment ${appointment.id}:`, error);
          }
        }
        
        if (hoursUntilAppointment <= 0) {
          this.logger.log(`Processing refund for appointment ${appointment.id} due to no meeting link`);
          
          appointment.status = AppointmentStatus.CANCELLED;
          appointment.transaction.status = PaymentStatus.REFUND;
          
          await this.appointmentRepo.save(appointment);
          await this.transactionRepo.save(appointment.transaction);
          
          try {
            await this.midtransService.processRefund(appointment.transaction);
            await this.emailService.sendRefundNotification(appointment);
          } catch (error) {
            this.logger.error(`Failed to process refund for appointment ${appointment.id}:`, error);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in handleTimeouts:', error);
    }
  }
  
  async getAppointmentsByStatus(
    userId: string,
    userType: peran.DOCTOR | peran.PATIENT,
    statusGroup: 'waiting' | 'failed' | 'completed',
    page: number = 1, // Default page
    limit: number = 10 // Default items per page
  ) {
    const offset = (page - 1) * limit; // Calculate offset for pagination
  
    const baseQuery = this.appointmentRepo.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.transaction', 'transaction')
      .select([
        'appointment',
        'doctor',
        'doctorUser.name',
        'doctorUser.photo_profile',
        'patient',
        'patientUser.name', 
        'patientUser.photo_profile',
        'transaction'
      ]);
  
    // Tambahkan kondisi berdasarkan tipe pengguna (doctor atau patient)
    if (userType === peran.DOCTOR) {
      baseQuery.where('doctor.user.id = :userId', { userId });
    } else if (userType === peran.PATIENT) {
      baseQuery.where('patient.user.id = :userId', { userId });
    }
  
    // Tambahkan kondisi status berdasarkan status group
    switch (statusGroup) {
      case 'waiting':
        baseQuery.andWhere('appointment.status IN (:...statuses)', {
          statuses: [
            AppointmentStatus.PENDING,
            AppointmentStatus.APPROVED,
            AppointmentStatus.AWAITING_PAYMENT,
            AppointmentStatus.PAID,
            AppointmentStatus.IN_PROGRESS
          ]
        });
        break;
      case 'failed':
        baseQuery.andWhere(
          '(appointment.status IN (:...appointmentStatuses) OR transaction.status = :transactionStatus)', 
          {
            appointmentStatuses: [
              AppointmentStatus.CANCELLED,
              AppointmentStatus.REJECTED
            ],
            transactionStatus: PaymentStatus.REFUND
          }
        );
        break;
      case 'completed':
        baseQuery.andWhere('appointment.status = :status', {
          status: AppointmentStatus.COMPLETED
        });
        break;
    }
  
    // Urutkan berdasarkan jadwal
    baseQuery.orderBy('appointment.schedule', 'DESC');
  
    // Tambahkan pagination
    baseQuery.skip(offset).take(limit);
  
    // Jalankan query dan hitung total data
    const [appointments, total] = await baseQuery.getManyAndCount();
  
    const baseUrl = 'http://localhost:8000';
    const transformedAppointments = appointments.map(appointment => {
      // Transform doctor's photo_profile jika ada
      if (appointment.doctor?.user?.photo_profile) {
        appointment.doctor.user.photo_profile = `${baseUrl}/uploads/doctors/${appointment.doctor.user.photo_profile}`;
      }
      // Transform patient's photo_profile jika ada
      if (appointment.patient?.user?.photo_profile) {
        appointment.patient.user.photo_profile = `${baseUrl}/uploads/patients/${appointment.patient.user.photo_profile}`;
      }
  
      return appointment;
    });
  
    // Return hasil dengan metadata pagination
    return {
      data: transformedAppointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }  
}