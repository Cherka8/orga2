import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PreferencesService } from './preferences.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Controller('preferences') // Préfixe 'api' pour la cohérence
@UseGuards(AuthGuard('jwt')) // Sécurise toutes les routes en utilisant la stratégie JWT
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  /**
   * GET /api/preferences
   * Récupère les préférences de l'utilisateur authentifié.
   * Crée des préférences par défaut si elles n'existent pas.
   */
  @Get()
  async getPreferences(@Request() req) {
    // req.user is populated by Passport. We convert the numeric ID to a string to match the schema.
    const userId = String(req.user.id);
    return this.preferencesService.findOrCreate(userId);
  }

  /**
   * PUT /api/preferences
   * Met à jour les préférences de l'utilisateur authentifié.
   */
  @Put()
  async updatePreferences(@Request() req, @Body() updatePreferenceDto: UpdatePreferenceDto) {
    const userId = String(req.user.id);
    return this.preferencesService.update(userId, updatePreferenceDto);
  }
}
