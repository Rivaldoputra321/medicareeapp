import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull, In, DataSource, QueryRunner, Between, Not, LessThan, Brackets } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { Appointment, AppointmentStatus } from 'src/entities/appoinments.entity';
import { PaymentStatus, Transaction } from 'src/entities/transactions.entity';
import { MidtransService } from 'src/midtrans/midtrans.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { completeDto, RescheduleDto, SetMeetingLinkDto, UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { Doctor } from 'src/entities/doctors.entity';
import { Patient } from 'src/entities/patients.entity';
import { peran } from 'src/entities/roles.entity';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);
  private readonly WIB_TIMEZONE = 'Asia/Jakarta';
  private readonly baseUrl = 'http://localhost:8000';
  
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
            midtransOrderId: null
          });
          
          // Simpan transaction dulu untuk mendapatkan ID
          const savedTransaction = await queryRunner.manager.save(transaction);
          
          // Dapatkan payment link dari Midtrans
          const paymentLink = await this.midtransService.createPaymentLink(savedTransaction);
          
          // Update transaction dengan payment link
          savedTransaction.payment_link = paymentLink;
          await queryRunner.manager.save(Transaction, savedTransaction);
          
          // Update appointment dengan transaction yang sudah memiliki payment link
          savedAppointment.transaction = savedTransaction;
          await queryRunner.manager.save(Appointment, savedAppointment);
      
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
    rescheduleDto: RescheduleDto,
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
          doctor: {
            user: true, // Include `doctor.user`
          },
          patient: {
            user: true,
          },
        },
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
      appointment.schedule = rescheduleDto.reschedule;
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
  
  // Calculate expiry date in WIB timezone
  const nowUTC = new Date();
  const nowWIB = this.convertToWIB(nowUTC);
  const expiryDateWIB = new Date(nowWIB.getTime() + (meetingLinkExpiryHours * 60 * 60 * 1000));

  try {
    // Update appointment with meeting link and dates, and change status
    appointment.meeting_link = meetingLink;
    appointment.link_sent_at = nowWIB;
    appointment.meeting_link_expired = expiryDateWIB;
    appointment.status = AppointmentStatus.AWAITING_JOIN_LINK;

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
  userType: peran.DOCTOR | peran.PATIENT,
) {
  console.log('recordPresence called with:', {
    appointmentId,
    userId,
    userType
  });
  
  const appointment = await this.appointmentRepo.findOne({
    where: { 
      id: appointmentId,
      status: AppointmentStatus.AWAITING_JOIN_LINK
    },
    relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
  });

  console.log('Found appointment:', {
    appointmentExists: !!appointment,
    appointmentStatus: appointment?.status,
    doctorId: appointment?.doctor?.user?.id,
    patientId: appointment?.patient?.user?.id
  });

  if (!appointment) {
    throw new HttpException(
      'Appointment not found or not in awaiting join link status',
      HttpStatus.NOT_FOUND
    );
  }

  const doctorUserId = appointment.doctor?.user?.id;
  const patientUserId = appointment.patient?.user?.id;

  console.log('User IDs comparison:', {
    requestUserId: userId,
    doctorUserId,
    patientUserId,
    userType
  });

  if (!doctorUserId || !patientUserId) {
    console.error('Missing user relations:', {
      doctorUserId,
      patientUserId,
      appointmentId
    });
    throw new HttpException(
      'Invalid appointment data: missing user relations',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  // Convert IDs to strings for comparison
  const stringDoctorId = String(doctorUserId);
  const stringPatientId = String(patientUserId);
  const stringUserId = String(userId);

  console.log('String ID comparison:', {
    stringUserId,
    stringDoctorId,
    stringPatientId,
    userType
  });

  if (userType === peran.DOCTOR && stringDoctorId !== stringUserId) {
    console.error('Doctor authorization failed:', {
      appointmentDoctorId: stringDoctorId,
      requestUserId: stringUserId
    });
    throw new HttpException('Unauthorized: Doctor ID mismatch', HttpStatus.UNAUTHORIZED);
  }
  
  if (userType === peran.PATIENT && stringPatientId !== stringUserId) {
    console.error('Patient authorization failed:', {
      appointmentPatientId: stringPatientId,
      requestUserId: stringUserId
    });
    throw new HttpException('Unauthorized: Patient ID mismatch', HttpStatus.UNAUTHORIZED);
  }

  const now = new Date();
  if (userType === peran.DOCTOR) {
    appointment.is_doctor_present = true;
    appointment.doctor_join_time = now;
  } else {
    appointment.is_patient_present = true;
    appointment.patient_joint_time = now;
  }

  if (appointment.is_doctor_present && appointment.is_patient_present) {
    appointment.status = AppointmentStatus.IN_PROGRESS;
    appointment.started_at = now;
  }

  console.log('Saving appointment with updates:', {
    isDoctorPresent: appointment.is_doctor_present,
    isPatientPresent: appointment.is_patient_present,
    status: appointment.status
  });

  return this.appointmentRepo.save(appointment);
}

@Cron('*/1 * * * *')
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

async setDiagnosis(
  doctorId: string,
  appointmentId: string,
  completeDto: completeDto,
) {
  const appointment = await this.appointmentRepo.findOne({
    where: { 
      id: appointmentId,
      status: AppointmentStatus.IN_PROGRESS
    },
    relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
  });

  if (!appointment) {
    throw new HttpException(
      'Active appointment not found',
      HttpStatus.NOT_FOUND,
    );
  }

  // Check if the doctor making the request matches the appointment's doctor
  if (appointment.doctor.user.id !== doctorId) {
    this.logger.error(`Authorization failed: Doctor ${doctorId} attempted to modify appointment ${appointmentId} belonging to doctor ${appointment.doctor.user.id}`);
    throw new HttpException(
      'You are not authorized to modify this appointment',
      HttpStatus.UNAUTHORIZED,
    );
  }

  if (!completeDto.diagnosis || !completeDto.note) {
    throw new HttpException(
      'Both diagnosis and note are required',
      HttpStatus.BAD_REQUEST,
    );
  }

  try {
    appointment.diagnosis = completeDto.diagnosis;
    appointment.note = completeDto.note;
    appointment.status = AppointmentStatus.COMPLETED;
    appointment.completed_at = new Date();

    const savedAppointment = await this.appointmentRepo.save(appointment);
    
    // Send completion notification
    try {
      await this.emailService.sendAppointmentCompletionNotification(savedAppointment);
    } catch (error) {
      this.logger.error(`Failed to send completion notification for appointment ${appointment.id}:`, error);
    }

    return savedAppointment;
  } catch (error) {
    this.logger.error('Error setting diagnosis:', {
      error: error.message,
      stack: error.stack,
      appointmentId,
      doctorId
    });
    throw new HttpException(
      'Failed to set diagnosis and complete appointment',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

// Replace the old autoCompleteAppointments with a diagnosis check
@Cron('*/5 * * * *') // Run every 5 minutes
async checkIncompleteAppointments() {
  try {
    const now = new Date();
    
    // Find IN_PROGRESS appointments that have been inactive for too long
    const inactiveAppointments = await this.appointmentRepo.find({
      where: {
        status: AppointmentStatus.IN_PROGRESS,
        started_at: LessThan(new Date(now.getTime() - 60 * 60 * 1000)), // 1 hour old
        diagnosis: IsNull(),
        note: IsNull()
      },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user']
    });

    for (const appointment of inactiveAppointments) {
      this.logger.log(`Found inactive appointment ${appointment.id} without diagnosis/note`);
      
      try {
        await this.emailService.sendDiagnosisReminder(appointment);
      } catch (error) {
        this.logger.error(`Failed to send diagnosis reminder for appointment ${appointment.id}:`, error);
      }
    }
  } catch (error) {
    this.logger.error('Error in checkIncompleteAppointments:', error);
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

    // 2. Handle appointments where no one has joined within 15 minutes
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    const noShowAppointments = await this.appointmentRepo.find({
      where: {
        status: AppointmentStatus.AWAITING_JOIN_LINK,
        schedule: LessThan(fifteenMinutesAgo),
        is_doctor_present: false,
        is_patient_present: false
      },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user', 'transaction'],
    });

    for (const appointment of noShowAppointments) {
      this.logger.log(`Cancelling appointment ${appointment.id} due to no participants within 15 minutes`);
      
      appointment.status = AppointmentStatus.CANCELLED;
      
      // If there's a transaction, mark it for refund
      if (appointment.transaction) {
        appointment.transaction.status = PaymentStatus.REFUND;
        await this.transactionRepo.save(appointment.transaction);
        
        try {
          await this.midtransService.processRefund(appointment.transaction);
          await this.emailService.sendRefundNotification(appointment);
        } catch (error) {
          this.logger.error(`Failed to process refund for appointment ${appointment.id}:`, error);
        }
      }
      
      await this.appointmentRepo.save(appointment);
      
      try {
        await this.emailService.sendAppointmentCancellation(
          appointment,
          'Your appointment has been cancelled as no participants joined within 15 minutes of the scheduled time.'
        );
      } catch (error) {
        this.logger.error(`Failed to send cancellation notification for appointment ${appointment.id}:`, error);
      }
    }

    // 3. Handle unpaid appointments that have passed their scheduled time
    const unpaidAppointments = await this.appointmentRepo.find({
      where: {
        status: AppointmentStatus.AWAITING_PAYMENT,
        schedule: LessThan(now),
      },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user', 'transaction'],
    });

    for (const appointment of unpaidAppointments) {
      this.logger.log(`Cancelling unpaid appointment ${appointment.id} that passed schedule time`);
      
      appointment.status = AppointmentStatus.CANCELLED;
      
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

    // 4. Handle paid appointments without meeting links
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
        
        if (appointment.transaction) {
          appointment.transaction.status = PaymentStatus.REFUND;
          await this.transactionRepo.save(appointment.transaction);
          
          try {
            await this.midtransService.processRefund(appointment.transaction);
            await this.emailService.sendRefundNotification(appointment);
          } catch (error) {
            this.logger.error(`Failed to process refund for appointment ${appointment.id}:`, error);
          }
        }
        
        await this.appointmentRepo.save(appointment);
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
    page: number = 1,
    limit: number = 10
  ) {
    const offset = (page - 1) * limit;
  
    const baseQuery = this.appointmentRepo.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .innerJoin('doctor.user', 'doctorUser')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .innerJoin('patient.user', 'patientUser')
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
      ])
      .where(new Brackets(qb => {
        qb.where('doctorUser.id = :userId', { userId })
          .orWhere('patientUser.id = :userId', { userId });
      }));

    switch (statusGroup) {
      case 'waiting':
        baseQuery.andWhere('appointment.status IN (:...statuses)', {
          statuses: [
            AppointmentStatus.AWAITING_JOIN_LINK,
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
  
    baseQuery.orderBy('appointment.schedule', 'DESC');
    baseQuery.skip(offset).take(limit);
  
    const [appointments, total] = await baseQuery.getManyAndCount();
  

    const transformedAppointments = appointments.map(appointment => {
      if (appointment.doctor?.user?.photo_profile) {
        appointment.doctor.user.photo_profile = `${this.baseUrl}/uploads/doctors/${appointment.doctor.user.photo_profile}`;
      }
      if (appointment.patient?.user?.photo_profile) {
        appointment.patient.user.photo_profile = `${this.baseUrl}/uploads/patients/${appointment.patient.user.photo_profile}`;
      }
      return appointment;
    });
  
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
  

  async getDoctorConsultationHistory(
    doctorId: string,
    page: number = 1,
    limit: number = 10,
    search: string
  ) {
    const offset = (page - 1) * limit;
  
    let query = this.appointmentRepo.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.status = :status', {
        status: AppointmentStatus.COMPLETED
      })
      .select([
        'appointment.id',
        'appointment.schedule',
        'appointment.completed_at',
        'appointment.diagnosis',
        'appointment.note',
        'patient',
        'patientUser.name',
        'patientUser.photo_profile'
      ])
      .orderBy('appointment.completed_at', 'DESC')
      .skip(offset)
      .take(limit);
  
    if (search) {
      query = query.andWhere('LOWER(patientUser.name) LIKE LOWER(:search)', {
        search: `%${search}%`
      });
    }
  
    const [consultations, total] = await query.getManyAndCount();
  
    // Transform photo URLs
  
    const transformedConsultations = consultations.map(consultation => ({
      ...consultation,
      patient: {
        ...consultation.patient,
        user: {
          ...consultation.patient.user,
          photo_profile: consultation.patient.user.photo_profile
            ? `${this.baseUrl}/uploads/patients/${consultation.patient.user.photo_profile}`
            : null
        }
      }
    }));
  
    return {
      data: transformedConsultations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  
  async getAdminAppointmentReport(
    statusFilter?: AppointmentStatus[],
    page: number = 1,
    limit: number = 10
  ) {
    const offset = (page - 1) * limit;
  
    const query = this.appointmentRepo.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .select([
        'appointment.id',
        'appointment.schedule',
        
        'appointment.status',
        'doctor',
        'doctorUser.name',
        'doctorUser.photo_profile',
        'patient',
        'patientUser.name',
        'patientUser.photo_profile',
      ]);
  
    // Filter status
    if (statusFilter && statusFilter.length > 0) {
      query.andWhere('appointment.status IN (:...statuses)', { statuses: statusFilter });
    }
  
    
  
    const [appointments, total] = await query
      .orderBy('appointment.schedule', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  
    // Transform photo URLs

    const transformedAppointments = appointments.map(appointment => ({
      ...appointment,
      doctor: {
        ...appointment.doctor,
        user: {
          ...appointment.doctor.user,
          photo_profile: appointment.doctor.user.photo_profile
            ? `${this.baseUrl}/uploads/doctors/${appointment.doctor.user.photo_profile}`
            : null
        }
      },
      patient: {
        ...appointment.patient,
        user: {
          ...appointment.patient.user,
          photo_profile: appointment.patient.user.photo_profile
            ? `${this.baseUrl}/uploads/patients/${appointment.patient.user.photo_profile}`
            : null
        }
      }
    }));
  
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
  
  
  async getAdminTransactionList(
    page: number = 1,
    limit: number = 10,
    search?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const offset = (page - 1) * limit;

    const query = this.appointmentRepo.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .innerJoin('doctor.user', 'doctorUser')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .innerJoin('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.transaction', 'transaction')
      .select([
        'appointment.id',
        'appointment.completed_at',
        'appointment.schedule',
        'doctor',
        'doctorUser.name',
        'doctorUser.photo_profile',
        'patient',
        'patientUser.name',
        'patientUser.photo_profile',
        'transaction'
      ])
      .where('appointment.status = :status', {
        status: AppointmentStatus.COMPLETED
      })
      .andWhere('transaction.status = :transactionStatus', {
        transactionStatus: PaymentStatus.SETTLEMENT
      });

    if (search) {
      query.andWhere(new Brackets(qb => {
        qb.where('doctorUser.name ILIKE :search', { search: `%${search}%` })
          .orWhere('patientUser.name ILIKE :search', { search: `%${search}%` });
      }));
    }

    if (startDate && endDate) {
      query.andWhere('appointment.completed_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    query.orderBy('appointment.completed_at', 'DESC')
      .skip(offset)
      .take(limit);

    const [transactions, total] = await query.getManyAndCount();

    // Calculate monthly total for admin
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const monthlyTotal = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.transaction', 'transaction')
      .where('appointment.status = :status', {
        status: AppointmentStatus.COMPLETED
      })
      .andWhere('transaction.status = :transactionStatus', {
        transactionStatus: PaymentStatus.SETTLEMENT
      })
      .andWhere('appointment.completed_at BETWEEN :startDate AND :endDate', {
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth
      })
      .select('SUM(transaction.adminFee)', 'monthlyAdminTotal')
      .getRawOne();

    // Transform photo URLs
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      completedAt: transaction.completed_at,
      schedule: transaction.schedule,
      doctor: {
        ...transaction.doctor,
        user: {
          name: transaction.doctor.user.name,
          photo_profile: transaction.doctor.user.photo_profile
            ? `${this.baseUrl}/uploads/doctors/${transaction.doctor.user.photo_profile}`
            : null
        }
      },
      patient: {
        ...transaction.patient,
        user: {
          name: transaction.patient.user.name,
          photo_profile: transaction.patient.user.photo_profile
            ? `${this.baseUrl}/uploads/patients/${transaction.patient.user.photo_profile}`
            : null
        }
      },
      transaction: {
        amount: transaction.transaction.amount,
        adminFee: transaction.transaction.adminFee,
        doctorFee: transaction.transaction.doctorFee
      }
    }));

    return {
      data: transformedTransactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      monthlyAdminTotal: monthlyTotal.monthlyAdminTotal || 0
    };
  }

  async getDoctorTransactionList(
    doctorId: string, // Menggunakan userId dari JWT
    page: number = 1,
    limit: number = 10,
    search?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const offset = (page - 1) * limit;
  
    const query = this.appointmentRepo.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.transaction', 'transaction')
      .select([
        'appointment.id',
        'appointment.completed_at',
        'appointment.schedule',
        'patient.id',
        'patientUser.name',
        'patientUser.photo_profile',
        'transaction'
      ])
      .where('appointment.doctorId = :doctorId', { doctorId }) // Perbaikan: Gunakan userId, bukan doctorId
      .andWhere('appointment.status = :status', {
        status: AppointmentStatus.COMPLETED
      })
      .andWhere('transaction.status = :transactionStatus', {
        transactionStatus: PaymentStatus.SETTLEMENT
      });
  
    if (search) {
      query.andWhere('patientUser.name ILIKE :search', {
        search: `%${search}%`
      });
    }
  
    if (startDate && endDate) {
      query.andWhere('appointment.completed_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }
  
    query.orderBy('appointment.completed_at', 'DESC')
      .skip(offset)
      .take(limit);
  
    const [transactions, total] = await query.getManyAndCount();
  
    // Hitung total bulanan dokter
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
    const monthlyTotal = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.transaction', 'transaction')
      .where('appointment.doctorId = :doctorId', { doctorId }) // Perbaikan di sini juga
      .andWhere('appointment.status = :status', {
        status: AppointmentStatus.COMPLETED
      })
      .andWhere('transaction.status = :transactionStatus', {
        transactionStatus: PaymentStatus.SETTLEMENT
      })
      .andWhere('appointment.completed_at BETWEEN :startDate AND :endDate', {
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth
      })
      .select('SUM(transaction.doctorFee)', 'monthlyDoctorTotal')
      .getRawOne();
  
    // Transformasi URL foto

    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      completedAt: transaction.completed_at,
      schedule: transaction.schedule,
      patient: {
        id: transaction.patient.id,
        user: {
          ...transaction.patient.user,
          photo_profile: transaction.patient.user.photo_profile
            ? `${this.baseUrl}/uploads/patients/${transaction.patient.user.photo_profile}`
            : null
        }
       
      },
      transaction: {
        amount: transaction.transaction.amount,
        doctorFee: transaction.transaction.doctorFee
      }
    }));
  
    return {
      data: transformedTransactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      monthlyDoctorTotal: monthlyTotal?.monthlyDoctorTotal || 0
    };
  }  
}