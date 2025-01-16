import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, UseGuards, UploadedFile, BadRequestException, UseInterceptors } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtGuard } from 'src/auth/guard/authenticated.guard';
import { RoleGuard, Roles } from 'src/auth/guard/role.guard';
import { peran } from 'src/entities/roles.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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

@Get('by/:id')
async getPatientById(@Param('id') id: string) {
  try {
    const doctor = await this.patientService.getpatientById(id);
    return { doctor};
  } catch (error) {
    return{'error': error}
}
}


  @UseGuards(JwtGuard, RoleGuard)
  @Roles(peran.PATIENT)
  @Patch('profile/:id')
  @UseInterceptors(
    FileInterceptor('photo_profile', {
      storage: diskStorage({
        destination: './uploads/patient',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.originalname.split('.')[0]}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only image files are allowed (jpg, jpeg, png)!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateProfile(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.patientService.updatePatientProfile(id, updatePatientDto, file);
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
