import { Controller, Post, Body, UseGuards, Request, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    const accountId = req.user.id;
    return this.eventService.create(createEventDto, accountId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const accountId = req.user.id;
    return this.eventService.findAll(accountId, startDate, endDate);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const accountId = req.user.id;
    return this.eventService.findOne(id, accountId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEventDto: UpdateEventDto, @Request() req) {
    const accountId = req.user.id;
    return this.eventService.update(id, updateEventDto, accountId);
  }
}

