import { Controller, Post, Body, Param, Put, UseGuards, Request, Logger, Get, ParseEnumPipe, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentService } from './appointment.service';
import { JwtGuard } from 'src/auth/guard/authenticated.guard';
import { RoleGuard, Roles } from 'src/auth/guard/role.guard';
import { peran } from 'src/entities/roles.entity';
import { SetMeetingLinkDto, UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { PaymentStatus } from 'src/entities/transactions.entity';
import { User } from 'src/entities/users.entity';


@Controller('appointments')

export class AppointmentController {
  private readonly logger = new Logger(AppointmentController.name);
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @UseGuards(JwtGuard, RoleGuard)
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

  @Put('status/:id')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(peran.DOCTOR)
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
  ) {
    try {
      // Log input parameters

      const result = await this.appointmentService.updateAppointmentStatus(
        req.user.id,
        id,
        updateStatusDto,
      );

      // Log success
      this.logger.log(`Successfully updated appointment status for ID: ${id}`);
      return result;

    } catch (error) {
      // Log error details
      this.logger.error(`Error updating appointment status for ID: ${id}`);
      this.logger.error('Error details:', error);
      this.logger.error('Stack trace:', error.stack);

      // Re-throw the error to be handled by global exception filter
      throw error;
    }
  }

  @Put(':id/meeting-link')
  @UseGuards(JwtGuard, RoleGuard)
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
  @UseGuards(JwtGuard, RoleGuard)
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
    try {
      this.logger.log('Received Midtrans callback:', JSON.stringify(payload, null, 2));
      
      const orderId = payload.order_id;
      const transactionStatus = payload.transaction_status?.toLowerCase();
      
      this.logger.log(`Processing order ${orderId} with status ${transactionStatus}`);

      // Map the status
      let paymentStatus: PaymentStatus;
      switch(transactionStatus) {
        case 'settlement':
          paymentStatus = PaymentStatus.SETTLEMENT;
          break;
        case 'capture':
          paymentStatus = PaymentStatus.CAPTURE;
          break;
        case 'pending':
          paymentStatus = PaymentStatus.PENDING;
          break;
        case 'deny':
          paymentStatus = PaymentStatus.DENY;
          break;
        case 'cancel':
          paymentStatus = PaymentStatus.CANCEL;
          break;
        case 'expire':
          paymentStatus = PaymentStatus.EXPIRE;
          break;
        default:
          paymentStatus = PaymentStatus.PENDING;
      }

      const result = await this.appointmentService.handlePaymentCallback(
        orderId,
        paymentStatus
      );

      // Always return 200 OK to Midtrans
      if (!result.recorded) {
        this.logger.warn('Payment callback processed but transaction was not found/updated', {
          orderId,
          status: paymentStatus
        });
      } else {
        this.logger.log('Payment callback successfully processed', {
          orderId,
          status: paymentStatus
        });
      }

      return { 
        status: "success",
        message: result.message || "Callback processed"
      };

    } catch (error) {
      this.logger.error('Error processing payment callback:', {
        error: error.message,
        stack: error.stack
      });
      
      // Always return success to Midtrans
      return {
        status: "success",
        message: "Callback received"
      };
    }
  }

  @Get('list/:statusGroup')
  @UseGuards(JwtGuard)
  async getAppointmentsByStatus(
    @Param('statusGroup') statusGroup: string,
    @Request() req,
    userType: peran.DOCTOR | peran.PATIENT
  ) {
    // Get user ID from JWT token
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid user token');
    }
  
    // Validate status group
    const validStatusGroups = ['waiting', 'failed', 'completed'];
    if (!validStatusGroups.includes(statusGroup)) {
      throw new BadRequestException('Invalid status group');
    }
  
    return await this.appointmentService.getAppointmentsByStatus(
      userId,
      userType,
      statusGroup as 'waiting' | 'failed' | 'completed'
    );
  }
  

}
