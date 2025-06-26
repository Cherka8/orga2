import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, accountId: number): Promise<Event> {
    const { title, start, end, event_color, description } = createEventDto;

    const newEvent = this.eventRepository.create({
      title,
      startTime: start ? new Date(start) : undefined,
      endTime: end ? new Date(end) : undefined,
      eventColor: event_color, // Mapper snake_case (DTO) vers camelCase (Entity)
      description,
      account: { id: accountId }, // On lie l'événement au compte
    });
    return this.eventRepository.save(newEvent);
  }

  async findAll(accountId: number): Promise<Event[]> {
    return this.eventRepository.find({
      where: { account: { id: accountId } },
    });
  }
}
