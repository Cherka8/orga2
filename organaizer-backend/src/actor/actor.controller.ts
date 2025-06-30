import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Put,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ActorService } from './actor.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QueryHoursDto } from './dto/query-hours.dto';

@ApiTags('actors')
@ApiBearerAuth()
@Controller('actors')
@UseGuards(AuthGuard('jwt'))
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() createActorDto: CreateActorDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    console.log('=== CREATE ACTOR REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('User from JWT:', req.user);
    console.log('Body:', createActorDto);
    console.log('File:', file ? { filename: file.filename, mimetype: file.mimetype } : 'No file');
    
    if (file) {
      createActorDto.photoUrl = `/uploads/${file.filename}`;
    }
    
    const result = await this.actorService.create(createActorDto, req.user.id);
    console.log('Created actor:', result);
    return result;
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('order') order: string = 'desc',
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    console.log('=== GET ACTORS REQUEST ===');
    console.log('User from JWT:', req.user);
    console.log('Query params:', { page, limit, type, search, sortBy, order });
    
    const filters = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      type,
      search,
      sortBy,
      order: order.toLowerCase() === 'asc' ? 'ASC' : 'DESC',
    };
    
    const result = await this.actorService.findAll(req.user.id, filters);
    console.log('Found actors:', result);
    return result;
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
  }))
  async update(
    @Param('id') id: string,
    @Body() updateActorDto: CreateActorDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    console.log('=== UPDATE ACTOR REQUEST ===');
    console.log('ID:', id);
    console.log('Headers:', req.headers);
    console.log('User from JWT:', req.user);
    console.log('Body:', updateActorDto);
    console.log('File:', file ? { filename: file.filename, mimetype: file.mimetype } : 'No file');
    
    if (file) {
      updateActorDto.photoUrl = `/uploads/${file.filename}`;
    }
    
    const result = await this.actorService.update(+id, updateActorDto, req.user.id);
    console.log('Updated actor:', result);
    return result;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Request() req) {
    console.log('=== DELETE ACTOR REQUEST ===');
    console.log('ID:', id);
    console.log('User from JWT:', req.user);
    
    const result = await this.actorService.remove(+id, req.user.id);
    console.log('Deleted actor result:', result);
    return result;
  }

  @Post('hours/query')
  @UseGuards(AuthGuard('jwt'))
  async getActorHours(@Body() queryHoursDto: QueryHoursDto, @Request() req) {
    return this.actorService.getActorHours(queryHoursDto, req.user.id);
  }
}
