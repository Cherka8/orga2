import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from './entities/actor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actor])],
  controllers: [], // Nous ajouterons les contrôleurs ici plus tard
  providers: [],   // Nous ajouterons les services ici plus tard
  exports: []      // Si d'autres modules ont besoin des services/repositories de ce module
})
export class ActorModule {}
