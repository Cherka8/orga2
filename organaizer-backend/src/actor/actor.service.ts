import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Actor } from './entities/actor.entity';
import { CreateActorDto } from './dto/create-actor.dto';
import { Account } from '../auth/entities/account.entity';
import { Express } from 'express';

@Injectable()
export class ActorService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
  ) {}

  async create(createActorDto: CreateActorDto, userId: number): Promise<Actor> {
    console.log('ActorService.create called with:', { createActorDto, userId });
    
    const actorData = {
      ...createActorDto,
      account: { id: userId }, // Associate the actor with the logged-in user's account ID
    };

    console.log('Creating actor with data:', actorData);
    const actor = this.actorRepository.create(actorData);
    return this.actorRepository.save(actor);
  }

  async update(id: number, updateActorDto: CreateActorDto, userId: number): Promise<Actor> {
    console.log('ActorService.update called with:', { id, updateActorDto, userId });
    
    // Vérifier que l'acteur existe et appartient à l'utilisateur
    const existingActor = await this.actorRepository.findOne({
      where: { id, account: { id: userId } }
    });
    
    if (!existingActor) {
      throw new Error('Actor not found or access denied');
    }
    
    // Préparer les données de mise à jour
    const updateData = {
      ...updateActorDto,
    };
    
    console.log('Update data:', updateData);
    
    // Mettre à jour l'acteur
    await this.actorRepository.update(id, updateData);
    
    // Retourner l'acteur mis à jour
    const updatedActor = await this.actorRepository.findOne({
      where: { id },
      relations: ['account']
    });
    
    if (!updatedActor) {
      throw new Error('Failed to retrieve updated actor');
    }
    
    console.log('Updated actor result:', updatedActor);
    return updatedActor;
  }

  async findAll(userId: number, filters: any): Promise<{ data: Actor[], total: number, page: number, limit: number }> {
    console.log('ActorService.findAll called with:', { userId, filters });
    
    const { page, limit, type, search, sortBy, order } = filters;
    
    // Construction de la requête de base
    const queryBuilder = this.actorRepository.createQueryBuilder('actor')
      .where('actor.account_id = :userId', { userId });
    
    // Filtrage par type si spécifié
    if (type && (type === 'human' || type === 'location')) {
      queryBuilder.andWhere('actor.type = :type', { type });
    }
    
    // Recherche textuelle
    if (search && search.trim()) {
      queryBuilder.andWhere(
        '(actor.first_name LIKE :search OR actor.last_name LIKE :search OR actor.location_name LIKE :search OR actor.email LIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }
    
    // Tri
    const validSortFields = ['createdAt', 'firstName', 'lastName', 'locationName', 'type'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    
    // Mapping des champs pour la base de données
    const dbSortField = sortField === 'firstName' ? 'first_name' 
                      : sortField === 'lastName' ? 'last_name'
                      : sortField === 'locationName' ? 'location_name'
                      : sortField === 'createdAt' ? 'created_at'
                      : sortField;
    
    queryBuilder.orderBy(`actor.${dbSortField}`, sortOrder);
    
    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    // Exécution de la requête
    const [data, total] = await queryBuilder.getManyAndCount();
    
    console.log(`Found ${data.length} actors out of ${total} total`);
    
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async remove(id: number, userId: number): Promise<{ message: string, id: number }> {
    console.log('ActorService.remove called with:', { id, userId });
    
    // Vérifier que l'acteur existe et appartient à l'utilisateur
    const existingActor = await this.actorRepository.findOne({
      where: { id, account: { id: userId } }
    });
    
    if (!existingActor) {
      throw new NotFoundException('Actor not found or access denied');
    }
    
    console.log('Actor to delete:', existingActor);
    
    // Supprimer l'acteur
    await this.actorRepository.remove(existingActor);
    
    console.log(`Actor ${id} successfully deleted`);
    
    return {
      message: 'Actor successfully deleted',
      id
    };
  }

  // We will add other methods here later.
}
