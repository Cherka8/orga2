// src/utils/colorUtils.js

import { useTranslation } from 'react-i18next';

/**
 * Palette de couleurs standard utilisée dans l'application.
 * Chaque couleur est un objet avec sa valeur hexadécimale et son nom en français.
 */
export const COLOR_PALETTE = [
  { hex: '#4f46e5', name: 'Indigo' },
  { hex: '#ef4444', name: 'Rouge' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f59e0b', name: 'Ambre' },
  { hex: '#10b981', name: 'Émeraude' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#3b82f6', name: 'Bleu' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#ec4899', name: 'Rose' },
  { hex: '#6366f1', name: 'Indigo Clair' },
  { hex: '#14b8a6', name: 'Turquoise' },
  { hex: '#84cc16', name: 'Citron Vert' },
  { hex: '#a855f7', name: 'Pourpre' },
  { hex: '#000000', name: 'Noir' },
  { hex: '#64748b', name: 'Gris Ardoise' },
];

/**
 * Objet pour une recherche rapide de la clé de traduction par code hexadécimal.
 * Clé: code hexadécimal (ex: '#4f46e5')
 * Valeur: clé de traduction (ex: 'indigo')
 */
const colorTranslationKeyMap = COLOR_PALETTE.reduce((map, color) => {
  // Normalize to remove accents, convert to lowercase, replace spaces with hyphens
  const normalizedName = color.name
    .normalize("NFD") // Decompose combined characters (é -> e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
    .toLowerCase()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
  map[color.hex] = normalizedName; // e.g., 'indigo', 'emeraude', 'gris-ardoise'
  return map;
}, {});

/**
 * Obtient le nom traduit d'une couleur à partir de son code hexadécimal.
 * @param {string} hexColor - Le code hexadécimal de la couleur (ex: '#4f46e5').
 * @param {function} t - La fonction de traduction i18next.
 * @returns {string} Le nom traduit de la couleur ou le code hexadécimal si non trouvé.
 */
export const getColorName = (hexColor, t) => { // Accept t function
  if (!t) {
    console.warn("getColorName called without t function. Returning default name.");
    // Fallback to original behavior if t is not provided
    const originalColor = COLOR_PALETTE.find(c => c.hex === hexColor?.toLowerCase());
    return originalColor ? originalColor.name : hexColor; // Return original French name as fallback
  }
  const translationKeyBase = colorTranslationKeyMap[hexColor?.toLowerCase()];
  if (translationKeyBase) {
    // Construct the full translation key, e.g., 'colors.indigo', 'colors.gris-ardoise'
    return t(`colors.${translationKeyBase}`);
  }
  return hexColor; // Return hex code if no key found
};

/**
 * Obtient la liste des codes hexadécimaux de la palette.
 * @returns {string[]} La liste des codes hexadécimaux.
 */
export const getPaletteHexCodes = () => {
  return COLOR_PALETTE.map(color => color.hex);
};
