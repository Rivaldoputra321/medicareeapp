import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, ParseIntPipe, InternalServerErrorException } from '@nestjs/common';
import { SpesialistService } from './spesialist.service';
import { CreateSpesialistDto } from './dto/create-spesialist.dto';
import { UpdateSpesialistDto } from './dto/update-spesialist.dto';

@Controller('spesialist')
export class SpesialistController {
  constructor(private readonly spesialistService: SpesialistService) {}

  @Post()
  async create(@Body() createSpesialistDto: CreateSpesialistDto) {
    return this.spesialistService.create(createSpesialistDto);
  }

  @Get()
  async findAll() {
    return this.spesialistService.findAll();
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





  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return this.spesialistService.findOne(id);
  // }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSpesialistDto: UpdateSpesialistDto) {
    return this.spesialistService.update(id, updateSpesialistDto);
  }
  
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.spesialistService.remove(id);
  }

  @Patch('restore/:id')
  async restore(@Param('id') id: string) {
    return this.spesialistService.restore(id);
  }
}
