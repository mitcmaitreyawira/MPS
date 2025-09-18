import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';


@ApiTags('classes')
@Controller('classes')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'Class with this name already exists.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get all classes with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async findAll(@Query() query: QueryClassesDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'teacher', 'student')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiResponse({ status: 200, description: 'Class retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  async findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({ status: 200, description: 'Class updated successfully.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  @ApiResponse({ status: 409, description: 'Class with this name already exists.' })
  async update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a class' })
  @ApiResponse({ status: 204, description: 'Class deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}