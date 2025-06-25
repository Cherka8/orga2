import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req, Query, Res, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Importer AuthGuard
import { AuthService, RegistrationResponse, UserDetails } from './auth.service'; // Import RegistrationResponse
import { RegisterIndividualDto } from './dto/register-individual.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
// import { Response } from 'express'; // Plus besoin pour verifyEmail
// import { Account } from './entities/account.entity'; // Semble non utilisé ici

@Controller('auth') // Préfixe de route pour toutes les méthodes de ce contrôleur
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
  async getProfile(@Req() req): Promise<UserDetails> {
    // req.user est populé par JwtStrategy après validation du token
    return this.authService.getProfile(req.user.id);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res) {
    console.log(`[AUTH CONTROLLER] verifyEmail - Token reçu: ${token}`);
    try {
      const result = await this.authService.verifyEmail(token);
      console.log(`[AUTH CONTROLLER] verifyEmail - Résultat du service:`, result);
      // Rediriger vers le frontend avec un paramètre de succès
      return res.redirect(`http://localhost:3000/email-verification?status=success`);
    } catch (error) {
      console.error(`[AUTH CONTROLLER] verifyEmail - Erreur du service:`, error);
      // Rediriger vers le frontend avec un paramètre d'erreur
      return res.redirect(`http://localhost:3000/email-verification?status=error&message=${encodeURIComponent(error.message)}`);
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

  @Put('profile')
  @UseGuards(AuthGuard('jwt')) // Protéger cette route avec la stratégie JWT
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto): Promise<UserDetails> {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }
}
