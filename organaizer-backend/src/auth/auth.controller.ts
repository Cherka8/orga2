import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Importer AuthGuard
import { AuthService } from './auth.service';
import { RegisterIndividualDto } from './dto/register-individual.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto'; // Importer LoginDto
import { Account } from './entities/account.entity';

@Controller('auth') // Préfixe de route pour toutes les méthodes de ce contrôleur
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/individual') // Route: POST /auth/register
  @HttpCode(HttpStatus.CREATED) // Code de statut HTTP pour une création réussie
  async register(@Body() registerIndividualDto: RegisterIndividualDto): Promise<Account> {
    return this.authService.registerIndividual(registerIndividualDto);
  }

  @Post('register/company') // Route: POST /auth/register/company
  @HttpCode(HttpStatus.CREATED)
  async registerCompany(@Body() registerCompanyDto: RegisterCompanyDto): Promise<Account> {
    return this.authService.registerCompany(registerCompanyDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Login réussi retourne 200 OK
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // Protéger cette route avec la stratégie JWT
  getProfile(@Req() req): { id: number; email: string } {
    // req.user est populé par JwtStrategy après validation du token
    return req.user;
  }
}
