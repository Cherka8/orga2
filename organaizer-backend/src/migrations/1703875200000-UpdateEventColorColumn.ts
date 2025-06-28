import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEventColorColumn1703875200000 implements MigrationInterface {
  name = 'UpdateEventColorColumn1703875200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Modifier la colonne event_color pour accepter des noms de couleurs plus longs
    await queryRunner.query(`
      ALTER TABLE \`events\` 
      MODIFY COLUMN \`event_color\` VARCHAR(50) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revenir à la taille précédente (7 caractères pour les codes hex)
    await queryRunner.query(`
      ALTER TABLE \`events\` 
      MODIFY COLUMN \`event_color\` VARCHAR(7) NULL
    `);
  }
}
