/**
 * Script de migration pour convertir les couleurs des événements
 * de codes hexadécimaux vers des noms français
 */

import { DataSource, Not, IsNull } from 'typeorm';
import { Event } from '../event/entities/event.entity';
import { Account } from '../auth/entities/account.entity';
import { Actor } from '../actor/entities/actor.entity';
import { Company } from '../company/entities/company.entity';
import { EventParticipant } from '../event-participant/entities/event-participant.entity';
import { Group } from '../group/entities/group.entity';
import { GroupMember } from '../group-member/entities/group-member.entity';
import { SharedCalendarAccessToken } from '../shared-calendar-access-token/entities/shared-calendar-access-token.entity';
import { getColorNameFromHex } from '../utils/color.utils';

// Configuration de la base de données (à adapter selon votre configuration)
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'organaizer',
  entities: [
    Event,
    Account,
    Actor,
    Company,
    EventParticipant,
    Group,
    GroupMember,
    SharedCalendarAccessToken,
  ],
  synchronize: false,
});

async function migrateColors() {
  try {
    console.log('🚀 Démarrage de la migration des couleurs...');
    
    // Initialiser la connexion à la base de données
    await AppDataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    // Récupérer tous les événements avec des couleurs
    const eventRepository = AppDataSource.getRepository(Event);
    const events = await eventRepository.find({
      where: {
        eventColor: Not(IsNull()),
      },
    });

    console.log(`📊 ${events.length} événements trouvés avec des couleurs`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      const currentColor = event.eventColor;
      
      // Vérifier si la couleur existe et n'est pas null
      if (!currentColor) {
        console.log(`⏭️  Événement ${event.id}: pas de couleur définie`);
        skippedCount++;
        continue;
      }
      
      // Vérifier si c'est déjà un nom de couleur (ne commence pas par #)
      if (!currentColor.startsWith('#')) {
        console.log(`⏭️  Événement ${event.id}: couleur "${currentColor}" déjà au format nom`);
        skippedCount++;
        continue;
      }

      // Convertir le code hex en nom
      const colorName = getColorNameFromHex(currentColor);
      
      // Si la conversion a réussi (le nom n'est pas le même que le code hex)
      if (colorName !== currentColor) {
        event.eventColor = colorName;
        await eventRepository.save(event);
        console.log(`✅ Événement ${event.id}: "${currentColor}" → "${colorName}"`);
        migratedCount++;
      } else {
        console.log(`⚠️  Événement ${event.id}: couleur "${currentColor}" non reconnue dans la palette`);
        skippedCount++;
      }
    }

    console.log('\n📈 Résumé de la migration:');
    console.log(`   • ${migratedCount} événements migrés`);
    console.log(`   • ${skippedCount} événements ignorés`);
    console.log('✅ Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    // Fermer la connexion
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateColors();
}

export { migrateColors };
