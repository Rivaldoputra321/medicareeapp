import { Controller, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentService } from './appointment.service';
import { JwtGuard } from 'src/auth/guard/authenticated.guard';
import { RoleGuard, Roles } from 'src/auth/guard/role.guard';
import { peran } from 'src/entities/roles.entity';
import { SetMeetingLinkDto, UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { PaymentStatus } from 'src/entities/transactions.entity';


@Controller('appointments')
@UseGuards(JwtGuard, RoleGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(peran.PATIENT)
  async createAppointment(
    @Request() req,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    console.log('User object:', req.user);  // Add this
  console.log('Patient ID:', req.user.sub); // Add this
  console.log('DTO:', createAppointmentDto); // Add this
    return this.appointmentService.createAppointment(
      req.user.sub,
      createAppointmentDto,
    );
  }

  @Put(':id/status')
  @Roles(peran.DOCTOR)
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentService.updateAppointmentStatus(
      req.user.id,
      id,
      updateStatusDto,
    );
  }

  @Put(':id/meeting-link')
  @Roles(peran.DOCTOR)
  async setMeetingLink(
    @Request() req,
    @Param('id') id: string,
    @Body() setMeetingLinkDto: SetMeetingLinkDto,
  ) {
    return this.appointmentService.setMeetingLink(
      req.user.id,
      id,
      setMeetingLinkDto,
    );
  }

  @Post(':id/presence')
  @Roles(peran.DOCTOR, peran.PATIENT)
  async recordPresence(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.appointmentService.recordPresence(
      id,
      req.user.id,
      req.user.role,
    );
  }

  // Midtrans webhook handler
  @Post('payment-callback')
  async handlePaymentCallback(@Body() payload: any) {
    const orderId = payload.order_id;
    const transactionStatus = payload.transaction_status;
    
    // Map Midtrans status to our PaymentStatus enum
    const statusMapping = {
      settlement: PaymentStatus.SETTLEMENT,
      capture: PaymentStatus.CAPTURE,
      deny: PaymentStatus.DENY,
      cancel: PaymentStatus.CANCEL,
      expire: PaymentStatus.EXPIRE,
      failure: PaymentStatus.FAILURE,
      pending: PaymentStatus.PENDING,
      refund: PaymentStatus.REFUND,
      partial_refund: PaymentStatus.PARTIAL_REFUND,
      chargeback: PaymentStatus.CHARGEBACK,
      partial_chargeback: PaymentStatus.PARTIAL_CHARGEBACK,
    };

    return this.appointmentService.handlePaymentCallback(
      orderId,
      statusMapping[transactionStatus],
    );
  }
}
