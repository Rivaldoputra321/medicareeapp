import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtGuard } from 'src/auth/guard/authenticated.guard';
import { RoleGuard, Roles } from 'src/auth/guard/role.guard';
import { peran } from 'src/entities/roles.entity';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
async findAllPatient(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('search') search?: string, // Tambahkan spesialistId sebagai query parameter opsional
) {
  return await this.patientService.findAllPatient(page, limit, search);
}


  @Get('deleted')
    async findDeletedPatients(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
    ) {
      return await this.patientService.findDeletedPatients(page, limit, search);
    }
  
  
    @UseGuards(JwtGuard, RoleGuard)
    @Delete('delete/:id')
    @Roles(peran.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string) {
      await this.patientService.delete(id);
      return{message :'delete success'};
    }
  
  
    @UseGuards(JwtGuard, RoleGuard)
    @Patch('restore/:id')
    @Roles(peran.ADMIN)
    async restore(@Param('id') id: string) {
      await this.patientService.restore(id);
      return{message :'restore success'};
    }
}
