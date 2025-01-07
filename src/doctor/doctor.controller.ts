import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { error } from 'console';
import { join } from 'path';
import * as fs from 'fs';
import { RoleGuard, Roles } from 'src/auth/guard/role.guard';
import { peran } from 'src/entities/roles.entity';
import { JwtGuard } from 'src/auth/guard/authenticated.guard';

@Controller('doctors')
@UseGuards(JwtGuard, RoleGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @Roles(peran.ADMIN)
  @UseInterceptors(FileInterceptor('photo_profile', {
    storage: diskStorage({
      destination: './uploads',
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
      const filePath = join(__dirname, '..', '..', 'uploads', file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Hapus file dari sistem
      }
      throw error; // Lanjutkan error handling
    }
  }

  @Get('deleted')
  async findDeletedDoctors(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
      @Query('search') search?: string,
  ) {
    return await this.doctorService.findDeletedDoctors(page, limit, search);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.doctorService.delete(id);
    return{message :'delete success'};
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: string) {
    await this.doctorService.restore(id);
    return{message :'restore success'};
  }
}
