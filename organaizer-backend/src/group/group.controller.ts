import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Configuration du stockage pour les photos de groupe
const groupsStorage = diskStorage({
  destination: (req, file, cb) => {
    const path = './public/uploads/groups';
    // S'assurer que le dossier de destination existe
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique pour éviter les conflits
    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('groups')
@UseGuards(AuthGuard('jwt'))
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', { storage: groupsStorage }))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createGroupDto: CreateGroupDto, 
    @Req() req: any
  ) {
    console.log('=== CREATE GROUP REQUEST ===');
    console.log('File received:', file ? { filename: file.filename, mimetype: file.mimetype, size: file.size } : 'No file');
    console.log('Body received:', createGroupDto);
    console.log('User from JWT:', req.user);
    
    return this.groupService.create(createGroupDto, req.user.id, file);
  }

  @Get()
  findAll(@Req() req) {
    return this.groupService.findAll(req.user.id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', { storage: groupsStorage }))
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateGroupDto: UpdateGroupDto, 
    @Req() req,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.groupService.update(id, updateGroupDto, req.user.id, file);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.groupService.remove(id, req.user.id);
  }

  @Post(':groupId/members/:actorId')
  addMember(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('actorId', ParseIntPipe) actorId: number,
    @Req() req,
  ) {
    return this.groupService.addMember(groupId, actorId, req.user.id);
  }

  @Delete(':groupId/members/:actorId')
  removeMember(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('actorId', ParseIntPipe) actorId: number,
    @Req() req,
  ) {
    return this.groupService.removeMember(groupId, actorId, req.user.id);
  }
}
