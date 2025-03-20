import { Controller, Post, Body, Param, Put, UseGuards, Request, Logger, Get, ParseEnumPipe, BadRequestException, UnauthorizedException, Query, Patch, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentService } from './appointment.service';
import { JwtGuard } from 'src/auth/guard/authenticated.guard';
import { RoleGuard, Roles } from 'src/auth/guard/role.guard';
import { peran } from 'src/entities/roles.entity';
import { completeDto, RescheduleDto, SetMeetingLinkDto, UpdateAppointmentStatusDto } from './dto/update-appointment.dto';
import { PaymentStatus } from 'src/entities/transactions.entity';
import { User } from 'src/entities/users.entity';
import { AppointmentStatus } from 'src/entities/appoinments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/entities/doctors.entity';
import { Repository } from 'typeorm';


@Controller('appointments')

export class AppointmentController {
  private readonly logger = new Logger(AppointmentController.name);
  constructor(private readonly appointmentService: AppointmentService,  
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,) {}

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
      const result = await this.appointmentService.updateAppointmentStatus(
        req.user.id,
        id,
        updateStatusDto,
      );

      this.logger.log(`Successfully updated appointment status for ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating appointment status for ID: ${id}`);
      this.logger.error('Error details:', error);
      this.logger.error('Stack trace:', error.stack);
      throw error;
    }
  }

  @Put('reschedule/:id')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(peran.PATIENT)
  async rescheduleAppointment(
    @Request() req,
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleDto,
  ) {
    try {
      const result = await this.appointmentService.rescheduleAppointment(
        req.user.id,
        id,
        rescheduleDto,
      );

      this.logger.log(`Successfully rescheduled appointment ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error rescheduling appointment ID: ${id}`);
      this.logger.error('Error details:', error);
      this.logger.error('Stack trace:', error.stack);
      throw error;
    }
  }

  @Put('meeting-link/:id')
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

  @Post('presence/:id')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(peran.DOCTOR, peran.PATIENT)
  async recordPresence(
    @Param('id') appointmentId: string,
    @Request() req
  ) {
    console.log('Request object:', {
      user: req.user,
      appointmentId,
      headers: req.headers
    });
  
    const userId = req.user?.sub;
    const userRole = req.user?.role; // Directly use the role from payload
  
    if (!userId || !userRole) {
      console.error('Validation failed:', {
        hasUserId: !!userId,
        hasRole: !!userRole,
        userId,
        userRole
      });
      
      throw new HttpException(
        `Invalid user information. UserId: ${!!userId}, Role: ${!!userRole}`,
        HttpStatus.BAD_REQUEST
      );
    }
  
    try {
      const result = await this.appointmentService.recordPresence(
        appointmentId,
        userId,
        userRole
      );
      
      console.log('Successfully recorded presence:', result);
      
      return {
        status: 'success',
        message: `${userRole} presence recorded successfully`,
        data: {
          appointment_id: result.id,
          is_doctor_present: result.is_doctor_present,
          is_patient_present: result.is_patient_present,
          status: result.status
        }
      };
    } catch (error) {
      console.error('Error in recordPresence:', {
        error: error.message,
        stack: error.stack,
        userId,
        userRole,
        appointmentId
      });
      
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to record presence: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
    @Query('page') page: number = 1, // Default halaman pertama
    @Query('limit') limit: number = 10, // Default jumlah item per halaman
    @Request() req
  ) {
    // Get user ID dari JWT token
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid user token');
    }
    
    // Pastikan user memiliki properti role
    if (!req.user?.role) {
      throw new UnauthorizedException('User role not found');
    }
  
    // Validate status group
    const validStatusGroups = ['waiting', 'failed', 'completed'];
    if (!validStatusGroups.includes(statusGroup)) {
      throw new BadRequestException('Invalid status group');
    }
  
    // Tentukan tipe user berdasarkan role (sebagai string)
    const userType = req.user.role as peran.DOCTOR | peran.PATIENT;
  
    // Panggil service untuk mendapatkan data janji temu
    return await this.appointmentService.getAppointmentsByStatus(
      userId,
      userType,
      statusGroup as 'waiting' | 'failed' | 'completed',
      page,
      limit
    );
  }
  

@Patch('diagnosis/:id')
@UseGuards(JwtGuard, RoleGuard)
@Roles(peran.DOCTOR)  // Add role guard to ensure only doctors can set diagnosis
async setDiagnosis(
  @Request() req,
  @Param('id') id: string,
  @Body() diagnosisDto: completeDto
) {
  console.log('Request usear:', {
    id: req.user.sub,
    role: req.user.role
  });
  
  if (!req.user || !req.user.sub) {
    throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
  }
  
  return this.appointmentService.setDiagnosis(req.user.sub, id, diagnosisDto);
}

@Get('doctor/consultations')
@UseGuards(JwtGuard, RoleGuard)
@Roles(peran.DOCTOR)
async getDoctorConsultations(
  @Request() req,
  @Query('search') search?: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10
) {
  const userId = req.user?.sub;
  if (!userId) {
    throw new UnauthorizedException('Invalid user token');
  }

  // Ambil doctorId berdasarkan userId
  const doctor = await this.doctorRepo.findOne({ where: { user: { id: userId } } });
  return this.appointmentService.getDoctorConsultationHistory(
    doctor.id,
    page,
    limit,
    search
  );
}

@Get('admin/report')
@UseGuards(JwtGuard, RoleGuard)
@Roles(peran.ADMIN)
async getAdminAppointmentReport(
  @Query('status') status?: AppointmentStatus[],
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10
) {

  return this.appointmentService.getAdminAppointmentReport(
    status,
    page,
    limit
  );
}

@Get('admin/list')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(peran.ADMIN)
  async getAdminTransactionList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.appointmentService.getAdminTransactionList(
      page,
      limit,
      search,
      start,
      end
    );
  }

  @Get('doctor/list')
@UseGuards(JwtGuard, RoleGuard)
@Roles(peran.DOCTOR)
async getDoctorTransactionList(
  @Request() req,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('search') search?: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string
) {
  const userId = req.user?.sub;
  if (!userId) {
    throw new UnauthorizedException('Invalid user token');
  }

  //  Ambil doctorId berdasarkan userId
  const doctor = await this.doctorRepo.findOne({ where: { user: { id: userId } } });

  if (!doctor) {
    throw new NotFoundException('Doctor not found');
  }

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  return this.appointmentService.getDoctorTransactionList(
    doctor.id, //  Gunakan doctor.id, bukan userId
    page,
    limit,
    search,
    start,
    end
  );
}


}
