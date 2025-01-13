import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, HttpCode, HttpStatus, Query, UseGuards, Put, UploadedFiles, HttpException } from '@nestjs/common';
import { DoctorService } from './doctor.service'
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
  
  @Get('by/:id')
  async getDoctorById(@Param('id') id: string) {
    try {
      const doctor = await this.doctorService.getDoctorById(id);
      return { doctor};
    } catch (error) {
      return{'error': error}
  }
  }

// doctor.controller.ts
@Post()
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'photo_profile', maxCount: 1 },
    { name: 'file_str', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const folder = file.fieldname === 'photo_profile' ? './uploads/doctors' : './uploads/doctors/files';
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const name = file.originalname.split('.')[0];
        const fileExtension = file.originalname.split('.')[1];
        const newFileName = name.split(' ').join('-') + '-' + Date.now() + '.' + fileExtension;
        cb(null, newFileName);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'photo_profile' && !file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Only image files are allowed for photo_profile'), false);
      }
      if (file.fieldname === 'file_str' && !file.originalname.match(/\.(pdf)$/)) {
        return cb(new BadRequestException('Only PDF files are allowed for file_str'), false);
      }
      cb(null, true);
    }
  })
)
async create(
  @Body() createDoctorDto: CreateDoctorDto,
  @UploadedFiles() files: { 
    photo_profile?: Express.Multer.File[], 
    file_str?: Express.Multer.File[] 
  }
) {
  try {
    if (!files.photo_profile || !files.file_str) {
      throw new BadRequestException('Both photo_profile and file_str are required');
    }

    createDoctorDto.photo_profile = files.photo_profile[0].filename;
    createDoctorDto.file_str = files.file_str[0].filename;

    return await this.doctorService.create(createDoctorDto);
  } catch (error) {
    // Clean up files if there's an error
    if (files.photo_profile?.[0]) {
      const photoFilePath = join(__dirname, '..', '..', 'uploads', 'doctors', files.photo_profile[0].filename);
      if (fs.existsSync(photoFilePath)) {
        fs.unlinkSync(photoFilePath);
      }
    }

    if (files.file_str?.[0]) {
      const pdfFilePath = join(__dirname, '..', '..', 'uploads', 'doctors', 'files', files.file_str[0].filename);
      if (fs.existsSync(pdfFilePath)) {
        fs.unlinkSync(pdfFilePath);
      }
    }

    throw error;
  }
}

@Put('update/:id')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'photo_profile', maxCount: 1 },
    { name: 'file_str', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const folder = file.fieldname === 'photo_profile' ? './uploads/doctors' : './uploads/doctors/files';
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${file.originalname.split('.')[0]}-${uniqueSuffix}${ext}`;
        cb(null, filename);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'photo_profile' && !file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Only image files are allowed for photo_profile'), false);
      }
      if (file.fieldname === 'file_str' && !file.originalname.match(/\.(pdf)$/)) {
        return cb(new BadRequestException('Only PDF files are allowed for file_str'), false);
      }
      cb(null, true);
    }
  })
)
async updateDoctor(
  @Param('id') doctorId: string,
  @Body() updateDoctorDto: UpdateDoctorDto,
  @UploadedFiles() files?: { 
    photo_profile?: Express.Multer.File[], 
    file_str?: Express.Multer.File[] 
  }
) {
  try {
    const photo = files?.photo_profile?.[0];
    const fileStr = files?.file_str?.[0];
    return await this.doctorService.updateDoctor(doctorId, updateDoctorDto, photo, fileStr);
  } catch (error) {
    // Clean up new files if there's an error
    if (files?.photo_profile?.[0]) {
      const photoFilePath = join(__dirname, '..', '..', 'uploads', 'doctors', files.photo_profile[0].filename);
      if (fs.existsSync(photoFilePath)) {
        fs.unlinkSync(photoFilePath);
      }
    }

    if (files?.file_str?.[0]) {
      const pdfFilePath = join(__dirname, '..', '..', 'uploads', 'doctors', 'files', files.file_str[0].filename);
      if (fs.existsSync(pdfFilePath)) {
        fs.unlinkSync(pdfFilePath);
      }
    }

    throw error;
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
