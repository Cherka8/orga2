import { Injectable, InternalServerErrorException, HttpException, HttpStatus, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt'; // Importer JwtService
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { Account, AccountType } from './entities/account.entity';
import { RegisterIndividualDto } from './dto/register-individual.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto'; // Importer LoginDto
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Company } from '../company/entities/company.entity';

// Define a type for the user details to be returned
export interface UserDetails {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: AccountType;
  phone?: string;
  profilePicture?: string;
  // Add other fields if necessary, e.g., roles, specific profile info
}

// Define a type for the registration response
export interface RegistrationResponse {
  message: string;
} // Nous créerons ce DTO bientôt

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Company) // Injecter CompanyRepository
    private companyRepository: Repository<Company>,
    private jwtService: JwtService, // Injecter JwtService
    private configService: ConfigService, // Injecter ConfigService
    private readonly mailerService: MailerService,
  ) {}

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const account = await this.accountRepository.findOne({ where: { email } });

    if (account && account.isActive) {
      try {
        account.resetPasswordToken = uuidv4();
        account.resetPasswordTokenExpires = new Date(Date.now() + 15 * 60 * 1000); 
        await this.accountRepository.save(account);
        await this.sendPasswordResetEmail(account);
      } catch (error) {
        console.error('Erreur lors de la génération du token de réinitialisation:', error);
      }
    }
    
    return { message: 'Si votre adresse e-mail est enregistrée chez nous, vous recevrez un lien pour réinitialiser votre mot de passe.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password, confirmPassword } = resetPasswordDto;

    if (password !== confirmPassword) {
      throw new HttpException('Les mots de passe ne correspondent pas.', HttpStatus.BAD_REQUEST); //Utilisation de HttpException
    }

    const account = await this.accountRepository.findOne({ 
      where: { 
        resetPasswordToken: token,
      } 
    });

    if (!account) {
      throw new HttpException('Token de réinitialisation invalide ou expiré.', HttpStatus.BAD_REQUEST);
    }
    
    if (!account.resetPasswordTokenExpires || account.resetPasswordTokenExpires < new Date()) {
        throw new HttpException('Token de réinitialisation invalide ou expiré.', HttpStatus.BAD_REQUEST);
    }

    account.passwordHash = await bcrypt.hash(password, 10);
    account.resetPasswordToken = null;
    account.resetPasswordTokenExpires = null;

    try {
      await this.accountRepository.save(account);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw new InternalServerErrorException('Erreur lors de la mise à jour du mot de passe.');
    }

    return { message: 'Votre mot de passe a été réinitialisé avec succès.' };
  }

  private async sendPasswordResetEmail(account: Account) {
    const { email, firstName, resetPasswordToken } = account;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const url = `${frontendUrl}/reset-password?token=${resetPasswordToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Réinitialisation de votre mot de passe OrganAIzer',
        template: './password-reset',
        context: {
          name: firstName,
          url,
        },
      });
      console.log(`E-mail de réinitialisation envoyé à ${email} avec le token ${resetPasswordToken}`);
    } catch (error) {
      console.error('Échec de l\'envoi de l\'e-mail de réinitialisation de mot de passe', error);
    }
  }

    async registerIndividual(registerIndividualDto: RegisterIndividualDto): Promise<RegistrationResponse> {
    const { email, password, firstName, lastName, country, phone, address, city, postalCode, birthDate, occupation } = registerIndividualDto;

    const existingAccount = await this.accountRepository.findOne({ where: { email } });
    if (existingAccount) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const account = this.accountRepository.create({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      country,
      accountType: AccountType.INDIVIDUAL,
      phone,
      address,
      city,
      postalCode,
      birthDate,
      occupation,
      isActive: false, // Le compte est inactif jusqu'à la vérification de l'e-mail
      emailVerificationToken,
      emailVerificationTokenExpires,
    });

    try {
      const savedAccount = await this.accountRepository.save(account);
      console.log('[REGISTER INDIVIDUAL] Token généré pour', savedAccount.email, ':', savedAccount.emailVerificationToken);
      await this.sendVerificationEmail(savedAccount);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Un utilisateur avec cet email existe déjà.');
      }
      throw new InternalServerErrorException('Erreur lors de la création du compte.');
    }

    return {
      message: 'Inscription réussie. Veuillez consulter votre e-mail pour vérifier votre compte.',
    };
  }

    async registerCompany(registerCompanyDto: RegisterCompanyDto): Promise<RegistrationResponse> {
    const { companyInformation, primaryContact } = registerCompanyDto;
    const { email, password, firstName, lastName, contactPosition, country } = primaryContact;

    const existingAccount = await this.accountRepository.findOne({ where: { email } });
    if (existingAccount) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    const newAccount = this.accountRepository.create({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      contactPosition,
      accountType: AccountType.COMPANY,
      isActive: false, // Le compte est inactif jusqu'à la vérification de l'e-mail
      emailVerificationToken,
      emailVerificationTokenExpires,
      country, // En supposant que le pays provient du contact principal
    });

    const savedAccount = await this.accountRepository.save(newAccount);

    const newCompany = this.companyRepository.create({
      ...companyInformation,
      account: savedAccount,
    });

    await this.companyRepository.save(newCompany);

    await this.sendVerificationEmail(savedAccount);

    return {
      message: 'Inscription réussie. Veuillez consulter votre e-mail pour vérifier votre compte.',
    };
  }

    async login(loginDto: LoginDto): Promise<{ accessToken: string; user: UserDetails }> {
    const { email, password, rememberMe } = loginDto;

    const account = await this.accountRepository.findOne({ where: { email } });

    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    if (!account.emailVerifiedAt) {
      throw new UnauthorizedException('Veuillez vérifier votre adresse e-mail avant de vous connecter.');
    }

    if (!account.isActive) {
      throw new UnauthorizedException('Votre compte est inactif. Veuillez contacter le support.');
    }

    const payload = { sub: account.id, email: account.email };
    const defaultExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN');
    const rememberMeExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN_REMEMBER_ME') || defaultExpiresIn;
    const expiresIn = rememberMe ? rememberMeExpiresIn : defaultExpiresIn;
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    const userDetails: UserDetails = {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      accountType: account.accountType,
    };

    return {
      accessToken,
      user: userDetails,
    };
  }

    async verifyEmail(token: string): Promise<{ message: string }> {
    console.log('[VERIFY] Token reçu en paramètre:', token);
    const account = await this.accountRepository.findOne({ where: { emailVerificationToken: token } });
    console.log('[VERIFY] Résultat recherche DB pour token', token, ':', account ? 'TROUVÉ - Compte ID: ' + account.id : 'NON TROUVÉ');

    if (!account) {
      throw new NotFoundException('Le token de vérification est invalide.');
    }

    if (!account.emailVerificationTokenExpires || account.emailVerificationTokenExpires < new Date()) {
      throw new UnauthorizedException('Le token de vérification a expiré.');
    }

    account.emailVerifiedAt = new Date();
    account.isActive = true;
    account.emailVerificationToken = null;
    account.emailVerificationTokenExpires = null;

    console.log('[VERIFY] Avant sauvegarde du compte ID:', account.id, 'avec emailVerifiedAt:', account.emailVerifiedAt);
    try {
      await this.accountRepository.save(account);
      console.log('[VERIFY] Après sauvegarde du compte ID:', account.id, 'avec succès.');
    } catch (dbError) {
      console.error('[VERIFY] ERREUR lors de la sauvegarde du compte ID:', account.id, dbError);
      throw new InternalServerErrorException('Erreur de base de données lors de la mise à jour du compte.');
    }

    return { message: 'Votre e-mail a été vérifié avec succès. Vous pouvez maintenant vous connecter.' };
  }

    async resendVerificationEmail(resendDto: ResendVerificationEmailDto): Promise<{ message: string }> {
    const { email } = resendDto;
    const account = await this.accountRepository.findOne({ where: { email } });

    if (!account) {
      // Ne pas révéler si l'e-mail existe ou non pour des raisons de sécurité
      return { message: 'Si un compte avec cet e-mail existe, un nouveau lien de vérification a été envoyé.' };
    }

    if (account.emailVerifiedAt) {
      throw new ConflictException('Cet e-mail est déjà vérifié.');
    }

    // Mettre à jour le token et l'expiration
    account.emailVerificationToken = uuidv4();
    account.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    await this.accountRepository.save(account);
    await this.sendVerificationEmail(account);

    return { message: 'Si un compte avec cet e-mail existe, un nouveau lien de vérification a été envoyé.' };
  }

  private async sendVerificationEmail(account: Account) {
    const { email, firstName, emailVerificationToken } = account;
    const url = `http://localhost:3001/api/auth/verify-email?token=${emailVerificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bienvenue sur OrganAIzer ! Confirmez votre e-mail',
        template: './email-verification',
        context: {
          name: firstName,
          url,
        },
      });
    } catch (error) {
      console.error('Échec de l\'envoi de l\'e-mail de vérification', error);
    }
  }

  async getProfile(userId: number): Promise<UserDetails> {
    const account = await this.accountRepository.findOne({ where: { id: userId } });
    
    if (!account) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    console.log('Account data from database:', {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      phone: account.phone,
      profilePicture: account.profilePicture,
    });

    return {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      accountType: account.accountType,
      phone: account.phone,
      profilePicture: account.profilePicture,
    };
  }

  async updateProfile(userId: number, updateData: Partial<{ firstName: string; lastName: string; email: string; phone: string; profilePicture: string }>): Promise<UserDetails> {
    const account = await this.accountRepository.findOne({ where: { id: userId } });
    
    if (!account) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Mettre à jour les champs fournis
    Object.assign(account, updateData);

    try {
      const updatedAccount = await this.accountRepository.save(account);
      
      return {
        id: updatedAccount.id,
        email: updatedAccount.email,
        firstName: updatedAccount.firstName,
        lastName: updatedAccount.lastName,
        accountType: updatedAccount.accountType,
        phone: updatedAccount.phone,
        profilePicture: updatedAccount.profilePicture,
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Un utilisateur avec cet email existe déjà.');
      }
      throw new InternalServerErrorException('Erreur lors de la mise à jour du profil.');
    }
  }
}
