import { Injectable, InternalServerErrorException, HttpException, HttpStatus, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Importer JwtService
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Account, AccountType } from './entities/account.entity';
import { RegisterIndividualDto } from './dto/register-individual.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto'; // Importer LoginDto
import { Company } from '../company/entities/company.entity'; // Nous créerons ce DTO bientôt

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Company) // Injecter CompanyRepository
    private companyRepository: Repository<Company>,
    private jwtService: JwtService, // Injecter JwtService
  ) {}

  async registerIndividual(registerIndividualDto: RegisterIndividualDto): Promise<Account> {
    const { email, password, firstName, lastName, country, phone, address, city, postalCode, birthDate, occupation } = registerIndividualDto;

    // Vérifier si l'utilisateur existe déjà
    const existingAccount = await this.accountRepository.findOne({ where: { email } });
    if (existingAccount) {
      throw new ConflictException('Un compte avec cet email existe déjà.');
    }

    // Hacher le mot de passe
    const saltRounds = 10;
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors du hachage du mot de passe.');
    }
    
    // Créer une nouvelle instance de compte
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
      isActive: true, // Activer le compte par défaut
    });

    // Sauvegarder le compte en base de données
    try {
      await this.accountRepository.save(account);
    } catch (error) {
      // Gérer les erreurs potentielles de base de données (ex: contraintes uniques non gérées plus tôt)
      if (error.code === 'ER_DUP_ENTRY') { // Code d'erreur spécifique à MySQL pour entrée dupliquée
        throw new ConflictException('Un compte avec cet email existe déjà.');
      }
      throw new InternalServerErrorException('Erreur lors de la création du compte.');
    }

    // TODO: Gérer d'autres types de compte si nécessaire
    const { passwordHash, ...result } = account;
    return result as Account; // On peut caster en Account si on est sûr que le reste correspond
  }

  async registerCompany(registerCompanyDto: RegisterCompanyDto): Promise<Account> {
    const { companyInformation, primaryContact } = registerCompanyDto;
    const { email, password, firstName, lastName, contactPosition } = primaryContact;

    // Vérifier si l'utilisateur (contact principal) existe déjà
    const existingAccount = await this.accountRepository.findOne({ where: { email } });
    if (existingAccount) {
      throw new HttpException('Un compte avec cet email existe déjà.', HttpStatus.CONFLICT);
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'entité Account pour le contact principal
    const newAccount = this.accountRepository.create({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      contactPosition, // Position du contact dans l'entreprise
      accountType: AccountType.COMPANY, // Important
      isActive: true, // Activer le compte par défaut
      // Les champs d'adresse de l'Account peuvent être ceux du siège ou du contact, à clarifier.
      // Pour l'instant, on les laisse vides ou on utilise ceux de l'entreprise si pertinent.
      // country: companyInformation.companyCountry, // Exemple si on veut dupliquer
    });

    const savedAccount = await this.accountRepository.save(newAccount);

    // Créer l'entité Company
    const newCompany = this.companyRepository.create({
      ...companyInformation, // companyName, industry, companyPhone, companyAddress, etc.
      account: savedAccount, // Lier la compagnie au compte créé
    });

    await this.companyRepository.save(newCompany);

    // Retourner l'objet Account sans le mot de passe haché
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...accountResult } = savedAccount;
    return accountResult as Account;
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;

    const account = await this.accountRepository.findOne({ where: { email } });

    if (!account) {
      throw new UnauthorizedException('Identifiants invalides.'); // Message générique
    }

    const isPasswordMatching = await bcrypt.compare(password, account.passwordHash);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Identifiants invalides.'); // Message générique
    }

    // Si les identifiants sont corrects, retourner le compte sans le hash du mot de passe
    // Plus tard, nous générerons et retournerons un JWT ici.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...accountDetails } = account;

    const payload = {
      sub: accountDetails.id, // 'sub' est la convention pour l'ID de l'utilisateur (subject)
      email: accountDetails.email,
      // Vous pouvez ajouter d'autres données au payload si nécessaire (ex: roles)
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
