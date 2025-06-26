import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';

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
  findAll(@Request() req) {
    const accountId = req.user.id;
    return this.eventService.findAll(accountId);
  }
}

