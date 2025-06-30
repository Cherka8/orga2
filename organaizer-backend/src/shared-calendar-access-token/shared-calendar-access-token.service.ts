import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharedCalendarAccessToken } from './entities/shared-calendar-access-token.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuidv4 } from 'uuid';
import { Actor } from '../actor/entities/actor.entity';
import { Account } from '../auth/entities/account.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SharedCalendarAccessTokenService {
  constructor(
    @InjectRepository(SharedCalendarAccessToken)
    private readonly tokenRepository: Repository<SharedCalendarAccessToken>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async createShareLink(actor: Actor, account: Account): Promise<SharedCalendarAccessToken> {
    if (!actor.email) {
      throw new BadRequestException(`Actor ${actor.firstName} ${actor.lastName} does not have an email address.`);
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Token valid for 30 days

    const newAccessToken = this.tokenRepository.create({
      token,
      expiresAt,
      permissions: ['read:calendar'], // Default permission
      account: account,
      actorContext: actor,
    });

    await this.tokenRepository.save(newAccessToken);

    await this.sendShareLinkEmail(actor, token);

    return newAccessToken;
  }

  private async sendShareLinkEmail(actor: Actor, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const url = `${frontendUrl}/shared-calendar?token=${token}`;

    await this.mailerService.sendMail({
      to: actor.email,
      subject: 'Un calendrier a été partagé avec vous',
      template: './share-calendar', // We will create this template later
      context: {
        name: actor.firstName,
        url,
      },
    });
  }

  async validateTokenAndGetActor(token: string): Promise<Actor> {
    const accessToken = await this.tokenRepository.findOne({
      where: { token },
      relations: ['actorContext'],
    });

    if (!accessToken || accessToken.expiresAt < new Date()) {
      throw new NotFoundException('Token is invalid or has expired.');
    }

    accessToken.lastUsedAt = new Date();
    await this.tokenRepository.save(accessToken);

    if (!accessToken.actorContext) {
        throw new NotFoundException('No actor is associated with this token.');
    }

    return accessToken.actorContext;
  }
}
