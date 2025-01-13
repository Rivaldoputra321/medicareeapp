import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplateService } from './email-template.service';
import { Appointment } from '../entities/appoinments.entity';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private emailTemplateService: EmailTemplateService,
  ) {
    
  }

  async onModuleInit() {
    // Log config values untuk debugging
    const emailConfig = {
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE'),
      user: this.configService.get<string>('EMAIL_USER'),
      pass: this.configService.get<string>('EMAIL_PASSWORD'),
    };

    console.log('Loaded Email Configuration:', emailConfig);

    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });

    // Verifikasi koneksi saat startup
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
    } catch (error) {
      console.error('Email service configuration error:', error);
    }
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      const mailOptions = {
        from: this.configService.get('email.from'),
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendAppointmentRequestToDoctor(appointment: Appointment) {
    const html = this.emailTemplateService.getAppointmentRequestTemplate(appointment);
    return await this.sendMail(
      appointment.doctor.user.email,
      'New Appointment Request',
      html,
    );
  }

  async sendPaymentLink(appointment: Appointment, paymentLink: string) {
    const html = this.emailTemplateService.getPaymentLinkTemplate(appointment, paymentLink);
    return await this.sendMail(
      appointment.patient.user.email,
      'Complete Your Payment',
      html,
    );
  }

  async sendMeetingLink(appointment: Appointment) {
    const html = this.emailTemplateService.getMeetingLinkTemplate(appointment);
    return await this.sendMail(
      appointment.patient.user.email,
      'Your Meeting Link is Ready',
      html,
    );
  }

  async sendRefundNotification(appointment: Appointment) {
    const html = this.emailTemplateService.getRefundNotificationTemplate(appointment);
    return await this.sendMail(
      appointment.patient.user.email,
      'Refund Notification',
      html,
    );
  }
}
