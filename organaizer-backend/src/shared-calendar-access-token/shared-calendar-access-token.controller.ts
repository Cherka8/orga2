import { Controller, Post, UseGuards, Req, Param, ParseIntPipe, NotFoundException, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SharedCalendarAccessTokenService } from './shared-calendar-access-token.service';
import { ActorService } from '../actor/actor.service';
import { EventService } from '../event/event.service';
import { Account } from '../auth/entities/account.entity';
import { Request } from 'express';

@Controller('calendar-sharing') // Changed controller path to be more intuitive
export class SharedCalendarAccessTokenController {
  constructor(
    private readonly sharedCalendarAccessTokenService: SharedCalendarAccessTokenService,
    private readonly actorService: ActorService,
    private readonly eventService: EventService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('share/actor/:actorId')
  async shareWithActor(
    @Req() req: Request & { user: Account },
    @Param('actorId', ParseIntPipe) actorId: number,
  ) {
    const account = req.user;
    const actorToShareWith = await this.actorService.findOne(actorId, account.id);

    // findOne already throws NotFoundException if actor doesn't exist or belong to the user's account

    await this.sharedCalendarAccessTokenService.createShareLink(actorToShareWith, account);
    return { message: `Un lien de partage a été envoyé à ${actorToShareWith.firstName} ${actorToShareWith.lastName}.` };
  }

  @Get('shared')
  async getSharedCalendarData(@Query('token') token: string) {
    if (!token) {
      throw new NotFoundException('No token provided.');
    }
    // The service method handles validation, expiration checks, and returns the actor
    const actor = await this.sharedCalendarAccessTokenService.validateTokenAndGetActor(token);
    const events = await this.eventService.findAllForActor(actor.id);

    return { actor, events }; // For now, just return the actor data. We'll fetch events next.
  }
}
