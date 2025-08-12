import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Ajoute createdAt et updatedAt automatiquement
export class Preference extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId: string; // Lien vers l'ID de l'utilisateur dans MySQL

  @Prop({ type: String, default: 'fr' })
  language: string;

  @Prop({ type: Number, default: 7 })
  visibleDays: number;

  @Prop({ type: { start: String, end: String }, default: { start: '09:00', end: '17:00' } })
  businessHours: { start: string; end: string; };
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);
