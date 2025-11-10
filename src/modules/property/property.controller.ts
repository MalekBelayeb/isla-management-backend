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
import { PropertyService } from './property.service';
import {
  CreatePropertyDtoApiBody,
  createPropertyDtoSchema,
  type CreatePropertyDtoType,
} from './dto/create-property.dto';
import {
  updatePropertyDtoSchema,
  type UpdatePropertyDtoType,
} from './dto/update-property.dto';
import { ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth-guard';
import { ZodValidationPipe } from 'src/core/pipes/zod.validation.pipe';
import { defaultLimitValue } from 'src/shared/contants/constants';

@Controller('api/property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createPropertyDtoSchema))
  @ApiBody({ type: CreatePropertyDtoApiBody, description: 'Create property' })
  async create(@Body() createPropertyDto: CreatePropertyDtoType) {
    return await this.propertyService.create(createPropertyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('searchTerm') searchTerm?: string,
    @Query('limit', new DefaultValuePipe(defaultLimitValue), ParseIntPipe)
    limit?: number,
    @Query('page') page?: number,
  ) {
    return this.propertyService.findAll({ searchTerm, limit, page });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updatePropertyDtoSchema))
  @ApiBody({ type: CreatePropertyDtoApiBody, description: 'Update property' })
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDtoType,
  ) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
