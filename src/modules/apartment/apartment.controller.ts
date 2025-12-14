import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import {
  CreateApartmentDtoApiBody,
  createApartmentDtoSchema,
  type CreateApartmentDtoType,
} from './dto/create-apartment.dto';
import {
  UpdateApartmentDtoApiBody,
  updateApartmentDtoSchema,
  type UpdateApartmentDtoType,
} from './dto/update-apartment.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth-guard';
import { ZodValidationPipe } from 'src/core/pipes/zod.validation.pipe';
import { ApiBody } from '@nestjs/swagger';
import { ApartmentType } from 'generated/prisma';
import { defaultLimitValue } from 'src/shared/contants/constants';

@Controller('api/apartment')
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createApartmentDtoSchema))
  @ApiBody({ type: CreateApartmentDtoApiBody, description: 'Create apartment' })
  create(@Body() createApartmentDto: CreateApartmentDtoType) {
    return this.apartmentService.create(createApartmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('searchTerm') searchTerm?: string,
    @Query('propertyMatricule') propertyMatricule?: number,
    @Query('matricule') matricule?: number,
    @Query('ownerId') ownerId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('rentStatus') rentStatus?: string,
    @Query('type') type?: ApartmentType,
    @Query('page') page?: number,
    @Query('limit', new DefaultValuePipe(defaultLimitValue), ParseIntPipe)
    limit?: number,
  ) {
    return this.apartmentService.findAll({
      searchTerm,
      propertyMatricule,
      matricule,
      ownerId,
      propertyId,
      type,
      rentStatus,
      limit,
      page,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apartmentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateApartmentDtoSchema))
  @ApiBody({ type: UpdateApartmentDtoApiBody, description: 'Update apartment' })
  update(
    @Param('id') id: string,
    @Body() updateApartmentDto: UpdateApartmentDtoType,
  ) {
    return this.apartmentService.update(id, updateApartmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.apartmentService.remove(id);
  }
}
