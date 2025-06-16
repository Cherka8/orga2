import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Importer AuthGuard
import { AuthService, RegistrationResponse, UserDetails } from './auth.service'; // Import RegistrationResponse
import { RegisterIndividualDto } from './dto/register-individual.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
// import { Response } from 'express'; // Plus besoin pour verifyEmail
// import { Account } from './entities/account.entity'; // Semble non utilisé ici

@Controller('api/auth') // Préfixe de route pour toutes les méthodes de ce contrôleur
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/individual') // Route: POST /auth/register
  @HttpCode(HttpStatus.CREATED) // Code de statut HTTP pour une création réussie
  async register(@Body() registerIndividualDto: RegisterIndividualDto): Promise<RegistrationResponse> {
    return this.authService.registerIndividual(registerIndividualDto);
  }

  @Post('register/company') // Route: POST /auth/register/company
  @HttpCode(HttpStatus.CREATED)
  async registerCompany(@Body() registerCompanyDto: RegisterCompanyDto): Promise<RegistrationResponse> {
    return this.authService.registerCompany(registerCompanyDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Login réussi retourne 200 OK
  async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string; user: UserDetails }> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // Protéger cette route avec la stratégie JWT
  getProfile(@Req() req): { id: number; email: string } {
    // req.user est populé par JwtStrategy après validation du token
    return req.user;
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) { // @Res() res: Response est supprimé
    console.log(`[AUTH CONTROLLER] verifyEmail - Token reçu: ${token}`);
    try {
      const result = await this.authService.verifyEmail(token);
      console.log(`[AUTH CONTROLLER] verifyEmail - Résultat du service:`, result);
      // Retourner une réponse JSON de succès
      // Le frontend utilisera ce message ou un statut pour savoir que c'est OK
      return result; // Le service retourne déjà { message: '...' }
    } catch (error) {
      console.error(`[AUTH CONTROLLER] verifyEmail - Erreur du service:`, error);
      // Laisser NestJS gérer la transformation de l'exception en réponse HTTP
      throw error;
    }
  }

  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(@Body() resendDto: ResendVerificationEmailDto) {
    return this.authService.resendVerificationEmail(resendDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
