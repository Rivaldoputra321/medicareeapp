import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Appointment } from 'src/entities/appoinments.entity';

@Injectable()
export class EmailTemplateService {
  constructor(private configService: ConfigService) {}

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  }

  getAppointmentRequestTemplate(appointment: Appointment): string {
    const frontendUrl = 'http://localhost:3000';
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Appointment Request</h2>
        <p>Dear Dr. ${appointment.doctor.user.name},</p>
        <p>You have received a new appointment request with the following details:</p>
        <ul>
          <li>Patient: ${appointment.patient.user.name}</li>
          <li>Date: ${new Date(appointment.schedule).toLocaleDateString()}</li>
          <li>Time: ${new Date(appointment.schedule).toLocaleTimeString()}</li>
          <li>Consultation Fee: ${appointment.doctor.price}</li>
        </ul>
        <p>Please login to your dashboard to respond to this request:</p>
        <a href="${frontendUrl}/doctor/appointments" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Appointment
        </a>
      </div>
    `;
  }

  getPaymentLinkTemplate(appointment: Appointment, paymentLink: string): string {
    const expiryHours = this.configService.get('app.paymentExpiryHours');
    const transaction = appointment.transaction;

    if (!appointment) {
      throw new BadRequestException('Appointment is required');
    }
    
    if (!appointment.transaction) {
      throw new BadRequestException('Transaction is not initialized');
    }
    
    if (!appointment.transaction.amount) {
      throw new BadRequestException('Transaction amount is required');
    }
    const amount = this.formatCurrency(Number(appointment.transaction.amount));
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Complete Your Payment</h2>
        <p>Dear ${appointment.patient.user.name},</p>
        <p>Your appointment has been approved. Please complete the payment within ${expiryHours} hours.</p>
        <p>Appointment Details:</p>
        <ul>
          <li>Doctor: Dr. ${appointment.doctor.user.name}</li>
          <li>Date: ${new Date(appointment.schedule).toLocaleDateString()}</li>
          <li>Time: ${new Date(appointment.schedule).toLocaleTimeString()}</li>
          <li>Amount: ${transaction.amount}</li>
        </ul>
        <a href="${paymentLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Pay Now
        </a>
        <p style="color: #666; font-size: 12px;">
          This payment link will expire in ${expiryHours} hours.
        </p>
      </div>
    `;
  }

  getMeetingLinkTemplate(appointment: Appointment): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Meeting Link is Ready</h2>
        <p>Dear ${appointment.patient.user.name},</p>
        <p>Here's your meeting link for the upcoming appointment:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p>Appointment Details:</p>
          <ul>
            <li>Doctor: Dr. ${appointment.doctor.user.name}</li>
            <li>Date: ${new Date(appointment.schedule).toLocaleDateString()}</li>
            <li>Time: ${new Date(appointment.schedule).toLocaleTimeString()}</li>
          </ul>
          <a href="${appointment.meeting_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Join Meeting
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">
          Please join the meeting 5 minutes before the scheduled time.
        </p>
      </div>
    `;
  }

  getRefundNotificationTemplate(appointment: Appointment): string {
    const transaction = appointment.transaction;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Refund Notification</h2>
        <p>Dear ${appointment.patient.user.name},</p>
        <p>We're processing a refund for your appointment:</p>
        <ul>
          <li>Doctor: Dr. ${appointment.doctor.user.name}</li>
          <li>Date: ${new Date(appointment.schedule).toLocaleDateString()}</li>
          <li>Time: ${new Date(appointment.schedule).toLocaleTimeString()}</li>
          <li>Refund Amount: ${transaction.amount}</li>
        </ul>
        <p>The refund will be processed to your original payment method within 3-5 business days.</p>
      </div>
    `;
  }

  getMeetingReminderTemplate(appointment: Appointment): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Reminder</h2>
        <p>Dear ${appointment.patient.user.name},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <ul>
            <li>Doctor: Dr. ${appointment.doctor.user.name}</li>
            <li>Date: ${new Date(appointment.schedule).toLocaleDateString()}</li>
            <li>Time: ${new Date(appointment.schedule).toLocaleTimeString()}</li>
          </ul>
          <p><strong>Your appointment starts in 30 minutes!</strong></p>
          <a href="${appointment.meeting_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
            Join Meeting Now
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">
          Please join 5 minutes before the scheduled time to ensure a smooth start.
          If you're unable to attend, please notify us as soon as possible.
        </p>
      </div>
    `;
  }
}