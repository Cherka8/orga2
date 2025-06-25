import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupMember } from '../group-member/entities/group-member.entity';
import { Actor } from '../actor/entities/actor.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
  ) {}

  async create(createGroupDto: CreateGroupDto, accountId: number, file?: Express.Multer.File): Promise<Group> {
    const group = this.groupRepository.create({
      ...createGroupDto,
      account: { id: accountId },
    });

    if (file) {
      // Assurez-vous que le chemin est accessible par le frontend
      // Par exemple, si vos fichiers sont servis sous /uploads
      group.photo = `/uploads/groups/${file.filename}`;
    }

    return this.groupRepository.save(group);
  }

  async findAll(accountId: number): Promise<any[]> {
    const groups = await this.groupRepository.find({
      where: { accountId },
      relations: ['members'],
      order: {
        createdAt: 'DESC',
      },
    });

    return groups.map(group => ({
      ...group,
      members: group.members.map(member => member.actorId),
    }));
  }

  async update(id: number, updateGroupDto: UpdateGroupDto, accountId: number, file?: Express.Multer.File): Promise<any> {
    const group = await this.getGroupAndVerifyOwnership(id, accountId);

    // Si un nouveau fichier est téléchargé, mettez à jour le chemin de la photo
    if (file) {
      // Note : vous pourriez envisager de supprimer l'ancien fichier ici pour nettoyer le stockage
      group.photo = `/uploads/groups/${file.filename}`;
    }

    // Fusionner les autres données du DTO
    this.groupRepository.merge(group, updateGroupDto);
    const updatedGroup = await this.groupRepository.save(group);

    const members = await this.groupMemberRepository.find({ where: { groupId: id } });
    return {
      ...updatedGroup,
      members: members.map(m => m.actorId),
    };
  }

  async remove(id: number, accountId: number): Promise<void> {
    await this.getGroupAndVerifyOwnership(id, accountId);
    const result = await this.groupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Group with ID ${id} not found.`);
    }
  }

  async addMember(groupId: number, actorId: number, accountId: number): Promise<{ groupId: number; members: number[] }> {
    await this.getGroupAndVerifyOwnership(groupId, accountId);
    await this.verifyActorOwnership(actorId, accountId);

    const existingMember = await this.groupMemberRepository.findOne({ where: { groupId, actorId } });
    if (!existingMember) {
      const newMember = this.groupMemberRepository.create({ groupId, actorId });
      await this.groupMemberRepository.save(newMember);
    }

    const updatedMembers = await this.groupMemberRepository.find({ where: { groupId } });
    return {
      groupId,
      members: updatedMembers.map(m => m.actorId),
    };
  }

  async removeMember(groupId: number, actorId: number, accountId: number): Promise<{ groupId: number; members: number[] }> {
    await this.getGroupAndVerifyOwnership(groupId, accountId);

    await this.groupMemberRepository.delete({ groupId, actorId });

    const updatedMembers = await this.groupMemberRepository.find({ where: { groupId } });
    return {
      groupId,
      members: updatedMembers.map(m => m.actorId),
    };
  }

  private async getGroupAndVerifyOwnership(id: number, accountId: number): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id, accountId } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found or you don't have permission to access it.`);
    }
    return group;
  }

  private async verifyActorOwnership(actorId: number, accountId: number): Promise<void> {
    const actor = await this.actorRepository.findOne({ where: { id: actorId, account: { id: accountId } } });
    if (!actor) {
      throw new NotFoundException(`Actor with ID ${actorId} not found or you don't have permission to use it.`);
    }
  }
}
