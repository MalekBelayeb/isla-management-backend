import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseGuards,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import {
  CreateOwnerDtoApiBody,
  createOwnerDtoSchema,
  type CreateOwnerDtoType,
} from './dto/create-owner.dto';
import { ApiBody, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import {
  UpdateOwnerDtoApiBody,
  updateOwnerDtoSchema,
  type UpdateOwnerDtoType,
} from './dto/update-owner.dto';
import { ZodValidationPipe } from 'src/core/pipes/zod.validation.pipe';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth-guard';
import { defaultLimitValue } from 'src/shared/contants/constants';

@Controller('api/owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createOwnerDtoSchema))
  @ApiBody({ type: CreateOwnerDtoApiBody, description: 'Create owner' })
  create(@Body() createOwnerDto: CreateOwnerDtoType) {
    return this.ownerService.create(createOwnerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'searchTerm', required: false })
  findAll(
    @Query('searchTerm') searchTerm?: string,
    @Query('page') page?: number,
    @Query('limit', new DefaultValuePipe(defaultLimitValue), ParseIntPipe)
    limit?: number,
  ) {
    return this.ownerService.findAll({ searchTerm, limit, page });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ownerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateOwnerDtoSchema))
  @ApiBody({ type: UpdateOwnerDtoApiBody, description: 'Update owner' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateOwnerDto: UpdateOwnerDtoType,
  ) {
    return this.ownerService.update(id, updateOwnerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ownerService.remove(id);
  }
}
