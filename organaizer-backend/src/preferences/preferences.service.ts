import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preference } from './schemas/preference.schema';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectModel(Preference.name) private preferenceModel: Model<Preference>,
  ) {}

  /**
   * Finds preferences for a user. If not found, creates them with default values.
   * @param userId - The ID of the user.
   * @returns The user's preferences.
   */
  async findOrCreate(userId: string): Promise<Preference> {
    try {
      const preference = await this.preferenceModel.findOne({ userId }).exec();

      if (preference) {
        return preference;
      }

      // Si aucune préférence n'est trouvée, on en crée une nouvelle avec les valeurs par défaut
            // Correction : on assigne la variable 'userId' au champ 'userId' du modèle.
      const newPreference = new this.preferenceModel({ userId: userId });
      return await newPreference.save();

    } catch (error) {
      // En cas d'erreur (ex: problème de connexion DB), on ne plante pas.
      // On retourne un objet de préférences par défaut non sauvegardé.
      // Cela garantit que le frontend a toujours une structure de données valide.
      console.error('Error in findOrCreate preferences, returning default object.', error);
      return {
        userId,
        language: 'fr',
        visibleDays: 7,
        businessHours: { start: '09:00', end: '18:00' },
      } as unknown as Preference;
    }
  }

  /**
   * Updates a user's preferences.
   * @param userId - The ID of the user.
   * @param updatePreferenceDto - The data to update.
   * @returns The updated preferences.
   */
  async update(userId: string, updatePreferenceDto: UpdatePreferenceDto): Promise<Preference> {
    const updatedPreferences = await this.preferenceModel.findOneAndUpdate(
      { userId },
      { $set: updatePreferenceDto },
      { new: true, upsert: true, setDefaultsOnInsert: true }, // new: return updated doc, upsert: create if not found
    ).exec();

    if (!updatedPreferences) {
      // This case should theoretically not be reached due to `upsert: true`
      throw new NotFoundException(`Preferences for user with ID "${userId}" not found.`);
    }

    return updatedPreferences;
  }
}
