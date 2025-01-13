import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, IsNull, In } from 'typeorm';
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

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);
  
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
  ) {}

  async createAppointment(
    userId: string, 
    createAppointmentDto: CreateAppointmentDto
  ) {
    // Validate patient ID
  
    const { doctorId, schedule } = createAppointmentDto;
  
    // Validate doctor ID
    if (!doctorId) {
      throw new HttpException(
        'Doctor ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }
  
    // Validate schedule
    if (!schedule) {
      throw new HttpException(
        'Schedule is required',
        HttpStatus.BAD_REQUEST,
      );
    }
  
    if (new Date(schedule) <= new Date()) {
      throw new HttpException(
        'Schedule must be in future',
        HttpStatus.BAD_REQUEST,
      );
    }
  
    // Verify patient exists
    const patient = await this.patientRepo.findOne({
      where: { user: { id: userId } } // Look up patient by user ID
    });

  
    if (!patient) {
      throw new HttpException(
        'Patient not found',
        HttpStatus.NOT_FOUND,
      );
    }
  
    // Verify doctor exists
    const doctor = await this.doctorRepo.findOne({
      where: { id: doctorId }
    });
  
    if (!doctor) {
      throw new HttpException(
        'Doctor not found',
        HttpStatus.NOT_FOUND,
      );
    }
  
    // Check for existing appointments
    const existingAppointment = await this.appointmentRepo.findOne({
      where: {
        doctorId,
        schedule,
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
        'Doctor already has appointment at this time',
        HttpStatus.CONFLICT,
      );
    }
  
    // Create appointment with explicit values
    const appointment = new Appointment();
    appointment.doctorId = doctorId;
    appointment.patientId = patient.id;
    appointment.schedule = new Date(schedule);
    appointment.status = AppointmentStatus.PENDING;
    appointment.total_price = createAppointmentDto.total_price || 0;

    
  
    try {
      const savedAppointment = await this.appointmentRepo.save(appointment);
      
      // Load relations for email
      try {
        const fullAppointment = await this.appointmentRepo.findOne({
          where: { id: savedAppointment.id },
          relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
        });

        await this.emailService.sendAppointmentRequestToDoctor(fullAppointment);
      } catch (emailError) {
        // Log the email error but don't throw it
        this.logger.error(`Failed to send appointment email: ${emailError.message}`, emailError.stack);
        
        // You might want to implement a retry mechanism or queue here
        // For now, we'll just continue without throwing the error
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
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId, doctor: { id: doctorId } },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    switch (updateDto.action) {
      case 'approve':
        if (appointment.reschedule_count > 3) {
          throw new HttpException(
            'Maximum reschedule attempts exceeded',
            HttpStatus.BAD_REQUEST,
          );
        }
        
        appointment.status = AppointmentStatus.AWAITING_PAYMENT;
        
        // Create transaction
        const transaction = this.transactionRepo.create({
          appointment,
          amount: appointment.total_price,
          adminFee: appointment.total_price * 0.1,
          doctorFee: appointment.total_price * 0.9,
          status: PaymentStatus.PENDING,
          midtransOrderId: `ORDER-${Date.now()}-${appointment.id}`,
        });

        await this.transactionRepo.save(transaction);
        
        // Generate payment link
        const paymentLink = await this.midtransService.createPaymentLink(transaction);
        await this.emailService.sendPaymentLink(appointment, paymentLink);
        break;

      case 'reject':
        appointment.status = AppointmentStatus.REJECTED;
        appointment.rejection_reason = updateDto.rejectionReason;
        break;

      case 'reschedule':
        if (appointment.reschedule_count >= 3) {
          throw new HttpException(
            'Maximum reschedule attempts exceeded',
            HttpStatus.BAD_REQUEST,
          );
        }
        appointment.status = AppointmentStatus.RESCHEDULED;
        appointment.reschedule_count += 1;
        break;
    }

    return this.appointmentRepo.save(appointment);
  }

  async handlePaymentCallback(orderId: string, paymentStatus: PaymentStatus) {
    const transaction = await this.transactionRepo.findOne({
      where: { midtransOrderId: orderId },
      relations: ['appointment', 'appointment.doctor', 'appointment.doctor.user', 
                 'appointment.patient', 'appointment.patient.user'],
    });

    if (!transaction) {
      throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    }

    transaction.status = paymentStatus;
    
    if (paymentStatus === PaymentStatus.SETTLEMENT || 
        paymentStatus === PaymentStatus.CAPTURE) {
      transaction.paidAt = new Date();
      transaction.appointment.status = AppointmentStatus.PAID;
    }

    await this.transactionRepo.save(transaction);
    return transaction;
  }

  async setMeetingLink(
    doctorId: string,
    appointmentId: string,
    { meetingLink }: SetMeetingLinkDto,
  ) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId, doctor: { id: doctorId }, status: AppointmentStatus.PAID },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
    });

    if (!appointment) {
      throw new HttpException(
        'Paid appointment not found',
        HttpStatus.NOT_FOUND,
      );
    }

    appointment.meeting_link = meetingLink;
    appointment.link_sent_at = new Date();
    appointment.meeting_link_expired = new Date(
      Date.now() + 
      this.configService.get('app.meetingLinkExpiryHours') * 60 * 60 * 1000
    );

    await this.appointmentRepo.save(appointment);
    await this.emailService.sendMeetingLink(appointment);

    return appointment;
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

    // Verify user is part of appointment
    if (userType === 'doctor' && appointment.doctor.user.id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (userType === 'patient' && appointment.patient.user.id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // Record presence
    if (userType === 'doctor') {
      appointment.is_doctor_present = true;
    } else {
      appointment.is_patient_present = true;
    }

    // If both present, update status
    if (appointment.is_doctor_present && appointment.is_patient_present) {
      appointment.status = AppointmentStatus.IN_PROGRESS;
    }

    return this.appointmentRepo.save(appointment);
  }

  @Cron('*/5 * * * *') // Every 5 minutes
  async handleTimeouts() {
    const now = new Date();
    const paymentExpiryHours = this.configService.get('app.paymentExpiryHours');
    const meetingLinkExpiryHours = this.configService.get('app.meetingLinkExpiryHours');

    // Cancel unpaid appointments
    const unpaidAppointments = await this.appointmentRepo.find({
      where: {
        status: AppointmentStatus.AWAITING_PAYMENT,
        created_at: MoreThanOrEqual(
          new Date(now.getTime() - paymentExpiryHours * 60 * 60 * 1000)
        ),
      },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
    });

    for (const appointment of unpaidAppointments) {
      appointment.status = AppointmentStatus.CANCELLED;
      await this.appointmentRepo.save(appointment);
    }

    // Handle missing meeting links
    const paidAppointments = await this.appointmentRepo.find({
      where: {
        status: AppointmentStatus.PAID,
        meeting_link: IsNull(),
        created_at: MoreThanOrEqual(
          new Date(now.getTime() - meetingLinkExpiryHours * 60 * 60 * 1000)
        ),
      },
      relations: ['transaction', 'doctor', 'doctor.user', 'patient', 'patient.user'],
    });

    for (const appointment of paidAppointments) {
      appointment.status = AppointmentStatus.CANCELLED;
      appointment.transaction.status = PaymentStatus.REFUND;
      
      await this.appointmentRepo.save(appointment);
      await this.transactionRepo.save(appointment.transaction);
      
      await this.midtransService.processRefund(appointment.transaction);
      await this.emailService.sendRefundNotification(appointment);
    }
  }
}