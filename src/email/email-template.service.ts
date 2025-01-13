import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { Appointment } from 'src/entities/appoinments.entity';

@Injectable()
export class EmailTemplateService {
  constructor(private configService: ConfigService) {}

  getAppointmentRequestTemplate(appointment: Appointment): string {
    const frontendUrl = this.configService.get('app.frontendUrl');
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Appointment Request</h2>
        <p>Dear Dr. ${appointment.doctor.user.name},</p>
        <p>You have received a new appointment request with the following details:</p>
        <ul>
          <li>Patient: ${appointment.patient.user.name}</li>
          <li>Date: ${new Date(appointment.schedule).toLocaleDateString()}</li>
          <li>Time: ${new Date(appointment.schedule).toLocaleTimeString()}</li>
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
          <li>Amount: ${appointment.total_price}</li>
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
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Refund Notification</h2>
        <p>Dear ${appointment.patient.user.name},</p>
        <p>We're processing a refund for your appointment:</p>
        <ul>
          <li>Doctor: Dr. ${appointment.doctor.user.name}</li>
          <li>Date: ${new Date(appointment.schedule).toLocaleDateString()}</li>
          <li>Time: ${new Date(appointment.schedule).toLocaleTimeString()}</li>
          <li>Amount: ${appointment.total_price}</li>
        </ul>
        <p>The refund will be processed to your original payment method within 3-5 business days.</p>
      </div>
    `;
  }
}
