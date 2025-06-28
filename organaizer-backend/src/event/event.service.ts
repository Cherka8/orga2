import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, LessThan, MoreThan, DeepPartial } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventParticipant } from '../event-participant/entities/event-participant.entity';
import { Actor } from '../actor/entities/actor.entity';
import { Group } from '../group/entities/group.entity';
import { getColorNameFromHex, getHexFromColorName, isValidColor } from '../utils/color.utils';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventParticipant)
    private readonly eventParticipantRepository: Repository<EventParticipant>,
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createEventDto: CreateEventDto, accountId: number): Promise<Event> {
    const { 
      title, 
      start, 
      end, 
      event_color, 
      description, 
      location_actor_id, 
      presenter_actor_id, 
      participant_ids 
    } = createEventDto;

    // Convertir la couleur en nom si c'est un code hexadécimal
    let processedColor = event_color;
    if (event_color && event_color.startsWith('#')) {
      processedColor = getColorNameFromHex(event_color);
    }

    const newEventData = this.eventRepository.create({
      title,
      startTime: new Date(start),
      endTime: new Date(end),
      eventColor: processedColor,
      description,
      account: { id: accountId },
      ...(location_actor_id && { locationActor: { id: location_actor_id } }),
      ...(presenter_actor_id && { presenterActor: { id: presenter_actor_id } }),
    });

    const savedEvent = await this.eventRepository.save(newEventData);

    if (participant_ids && participant_ids.length > 0) {
      await this._handleParticipants(savedEvent.id, participant_ids, accountId);
    }

    const finalEvent = await this.eventRepository.findOne({
      where: { id: savedEvent.id },
      relations: {
        locationActor: true,
        presenterActor: true,
        participants: {
          actor: true,
        },
      },
    });

    if (!finalEvent) {
      // This should theoretically never happen, but it's a safeguard.
      throw new InternalServerErrorException(`Could not retrieve event with id ${savedEvent.id} after creation.`);
    }

    return finalEvent;
  }

  async findAll(accountId: number, startDate?: string, endDate?: string): Promise<Event[]> {
    // La base de la requête est toujours le compte de l'utilisateur
    const where: any = { account: { id: accountId } };

    // Si les dates sont fournies, on ajoute la condition de chevauchement.
    // Un événement [E_start, E_end] chevauche une plage [R_start, R_end] si
    // E_start < R_end ET E_end > R_start.
    if (startDate && endDate) {
      where.startTime = LessThan(new Date(endDate));
      where.endTime = MoreThan(new Date(startDate));
    }

    return this.eventRepository.find({
      where, // On utilise notre clause "where" dynamique
      relations: {
        locationActor: true,
        presenterActor: true,
        participants: {
          actor: true,
        },
      },
    });
  }

  async findOne(id: number, accountId: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id, account: { id: accountId } },
      relations: {
        locationActor: true,
        presenterActor: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    // We need to manually load the participants relation as it's more complex
    const eventParticipants = await this.eventParticipantRepository.find({
      where: { eventId: id },
      relations: ['actor', 'group'],
    });

    event.participants = eventParticipants;

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto, accountId: number): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id, account: { id: accountId } } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found or you don't have access.`);
    }

    const { 
      participant_ids, 
      presenter_actor_id, 
      location_actor_id, 
      // Map DTO properties to a rest object
      start,
      end,
      event_color,
      ...otherEventData 
    } = updateEventDto;

    // 1. Update simple properties from the rest object
    Object.assign(event, otherEventData);
    // Manually map properties with different names
    if (start) event.startTime = new Date(start);
    if (end) event.endTime = new Date(end);
    if (typeof event_color !== 'undefined') {
      // Convertir la couleur en nom si c'est un code hexadécimal
      let processedColor = event_color;
      if (event_color && event_color.startsWith('#')) {
        processedColor = getColorNameFromHex(event_color);
      }
      event.eventColor = processedColor;
    }

    // 2. Handle presenter relation explicitly
    if (typeof presenter_actor_id !== 'undefined') {
      event.presenterActor = presenter_actor_id ? { id: presenter_actor_id } as Actor : null;
    }

    // 3. Handle location relation explicitly
    if (typeof location_actor_id !== 'undefined') {
      event.locationActor = location_actor_id ? { id: location_actor_id } as Actor : null;
    }

    // 4. Handle participants separately
    if (typeof participant_ids !== 'undefined') {
      await this._handleParticipants(id, participant_ids, accountId);
    }
    
    // 5. Save the updated event
    const savedEvent = await this.eventRepository.save(event);

    // 6. Return the fully loaded event to ensure frontend has fresh data
    return this.findOne(savedEvent.id, accountId);
  }

  private async _handleParticipants(eventId: number, participantIds: number[], accountId: number): Promise<void> {
    // 1. Clear existing participants for this event
    await this.eventParticipantRepository.delete({ eventId: eventId });

    if (!participantIds || participantIds.length === 0) {
      return; // No participants to add
    }

    // 2. Find which IDs belong to actors and which to groups
    const potentialActors = await this.actorRepository.find({
      where: { id: In(participantIds), account: { id: accountId } },
    });
    const directActorIds = new Set(potentialActors.map(a => a.id));

    const potentialGroups = await this.groupRepository.find({
      where: { id: In(participantIds), account: { id: accountId } },
      relations: ['members', 'members.actor'], // Load group members and their actor info
    });
    const groupIds = new Set(potentialGroups.map(g => g.id));

    // 3. Collect participant entities to save
    const participantEntities: DeepPartial<EventParticipant>[] = [];

    // 3a. Add direct actors (individually selected)
    directActorIds.forEach(actorId => {
      participantEntities.push(
        this.eventParticipantRepository.create({
          eventId: eventId,
          actorId: actorId,
          groupId: null,
        })
      );
    });

    // 3b. Add groups (and their members)
    potentialGroups.forEach(group => {
      // Add the group itself as a participant
      participantEntities.push(
        this.eventParticipantRepository.create({
          eventId: eventId,
          actorId: null,
          groupId: group.id,
        })
      );

      // Add each member of the group as individual participants
      if (group.members) {
        group.members.forEach(member => {
          if (member.actor) {
            participantEntities.push(
              this.eventParticipantRepository.create({
                eventId: eventId,
                actorId: member.actor.id,
                groupId: group.id, // Link to the group they belong to
              })
            );
          }
        });
      }
    });

    // 4. Save all participant entries
    if (participantEntities.length > 0) {
      await this.eventParticipantRepository.save(participantEntities);
    }
  }
}
