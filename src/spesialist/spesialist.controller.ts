import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, InternalServerErrorException, BadRequestException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { SpesialistService } from './spesialist.service';
import { CreateSpesialistDto } from './dto/create-spesialist.dto';
import { UpdateSpesialistDto } from './dto/update-spesialist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { JwtGuard } from 'src/auth/guard/authenticated.guard';
import { RoleGuard, Roles } from 'src/auth/guard/role.guard';
import * as fs from 'fs';

@Controller('spesialist')
export class SpesialistController {
  constructor(private readonly spesialistService: SpesialistService) {}

  @Post()
  //   @UseGuards(JwtGuard, RoleGuard)
  //   @Roles(peran.ADMIN)
    @UseInterceptors(FileInterceptor('gambar', {
      storage: diskStorage({
        destination: './uploads/spesialis', // Ubah folder penyimpanan
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
    async create(@Body() createSpesialistDto: CreateSpesialistDto, @UploadedFile() file: Express.Multer.File) {
      if (!file) {
        throw new BadRequestException('Photo Profile is required');
      }
    
      try {
        createSpesialistDto.gambar = file.filename; // Set file name to DTO
        return await this.spesialistService.create(createSpesialistDto);
      } catch (error) {
        // Hapus file jika terjadi error
        const filePath = join(__dirname, '..', '..', 'uploads', 'spesialis', file.filename); // Path file diperbarui
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Hapus file dari sistem
        }
        throw error; // Lanjutkan error handling
      }
    }


  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.spesialistService.findAll(page, limit, search);
  }

  @Get('by/:id') 
  async findSpesialistById(@Param('id') id: string) {
    try {
      const spesialist = await this.spesialistService.findOne(id);
      return { spesialist};
    } catch (error) {
      return{'error': error}
  }
  }

  @Get('patient')
  async findAllWithoutPagination(){
    try {
      return await this.spesialistService.findAllWithoutPagination();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('doctor')
async findDoctorOffline(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('search') search?: string,
  @Query('spesialistId') spesialistId?: string,  // Tambahkan spesialistId sebagai query parameter opsional
) {
  return await this.spesialistService.searchDoctorSpesialist(page, limit, search, spesialistId);
}



  @Put('update/:id')
  async update(@Param('id') id: string, @Body() updateSpesialistDto: UpdateSpesialistDto) {
    return this.spesialistService.update(id, updateSpesialistDto);
  }
  
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return this.spesialistService.delete(id);
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: string) {
    return this.spesialistService.restore(id);
  }

  @Get('deleted')
  async getDeletedSpesialis(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.spesialistService.getDeletedSpesialis(page, limit, search);
  }
}
