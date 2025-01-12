import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, HttpCode, HttpStatus, Query, UseGuards, Put } from '@nestjs/common';
import { DoctorService } from './doctor.service'
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { error } from 'console';
import { extname, join } from 'path';
import * as fs from 'fs';
import { RoleGuard, Roles } from 'src/auth/guard/role.guard';
import { peran } from 'src/entities/roles.entity';
import { JwtGuard } from 'src/auth/guard/authenticated.guard';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  // @UseGuards(JwtGuard, RoleGuard)
  // @Roles(peran.ADMIN)
  @UseInterceptors(FileInterceptor('photo_profile', {
    storage: diskStorage({
      destination: './uploads/doctors', // Ubah folder penyimpanan
      filename: (req, file, cb) => {
        const name = file.originalname.split('.')[0];
        const fileExtension = file.originalname.split('.')[1];
        const newFileName = name.split(' ').join('-') + '-' + Date.now() + '.' + fileExtension;
        cb(null, newFileName);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(null, false);
      }
      cb(null, true);
    }
  }))
  async create(@Body() createDoctorDto: CreateDoctorDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Photo Profile is required');
    }
  
    try {
      createDoctorDto.photo_profile = file.filename; // Set file name to DTO
      return await this.doctorService.create(createDoctorDto);
    } catch (error) {
      // Hapus file jika terjadi error
      const filePath = join(__dirname, '..', '..', 'uploads', 'doctors', file.filename); // Path file diperbarui
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Hapus file dari sistem
      }
      throw error; // Lanjutkan error handling
    }
  }

  @Get('by/:id')
  async getDoctorById(@Param('id') id: string) {
    try {
      const doctor = await this.doctorService.getDoctorById(id);
      return { doctor};
    } catch (error) {
      return{'error': error}
  }
  }

  @Put('update/:id')
  // @UseGuards(JwtGuard, RoleGuard)
  // @Roles(peran.ADMIN)
  @UseInterceptors(
    FileInterceptor('photo_profile', {
      storage: diskStorage({
        destination: './uploads/doctors',
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
  async updateDoctor(
    @Param('doctorId',) doctorId: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try{
      return await this.doctorService.updateDoctor(doctorId, updateDoctorDto, file);
    }catch (error) {
      // Hapus file jika terjadi error
      const filePath = join(__dirname, '..', '..', 'uploads', 'doctors', file.filename); // Path file diperbarui
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Hapus file dari sistem
      }
      throw error; // Lanjutkan error handling
    }
 
  }
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(peran.DOCTOR)
  @Patch('profile/:id')
  @UseInterceptors(
    FileInterceptor('photo_profile', {
      storage: diskStorage({
        destination: './uploads/doctors',
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
    @Body() updateDoctorDto: UpdateDoctorDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.doctorService.updateProfile(id, updateDoctorDto, file);
  }
  

  @Get('deleted')

  async findDeletedDoctors(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('search') search?: string,
  ) {
    return await this.doctorService.findDeletedDoctors(page, limit, search);
  }


  // @UseGuards(JwtGuard, RoleGuard)
  @Delete('delete/:id')
  // @Roles(peran.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.doctorService.delete(id);
    return{message :'delete success'};
  }


  // @UseGuards(JwtGuard, RoleGuard)
  @Patch('restore/:id')
  // @Roles(peran.ADMIN)
  async restore(@Param('id') id: string) {
    await this.doctorService.restore(id);
    return{message :'restore success'};
  }
}
