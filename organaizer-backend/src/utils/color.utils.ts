/**
 * Utilitaires pour la gestion des couleurs
 * Palette de couleurs standard utilisée dans l'application
 */

export interface ColorPalette {
  hex: string;
  name: string;
}

export const COLOR_PALETTE: ColorPalette[] = [
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
 * Obtient le nom français d'une couleur à partir de son code hexadécimal.
 * @param hexColor - Le code hexadécimal de la couleur (ex: '#4f46e5').
 * @returns Le nom français de la couleur ou le code hexadécimal si non trouvé.
 */
export const getColorNameFromHex = (hexColor: string): string => {
  if (!hexColor) return '';
  const color = COLOR_PALETTE.find(c => c.hex.toLowerCase() === hexColor.toLowerCase());
  return color ? color.name : hexColor;
};

/**
 * Obtient le code hexadécimal d'une couleur à partir de son nom français.
 * @param colorName - Le nom français de la couleur (ex: 'Ambre').
 * @returns Le code hexadécimal de la couleur ou le nom si non trouvé.
 */
export const getHexFromColorName = (colorName: string): string => {
  if (!colorName) return '';
  const color = COLOR_PALETTE.find(c => c.name.toLowerCase() === colorName.toLowerCase());
  return color ? color.hex : colorName;
};

/**
 * Vérifie si une couleur (nom ou hex) existe dans la palette.
 * @param color - Le nom français ou code hexadécimal de la couleur.
 * @returns True si la couleur existe dans la palette.
 */
export const isValidColor = (color: string): boolean => {
  if (!color) return false;
  
  // Check if it's a hex code
  if (color.startsWith('#')) {
    return COLOR_PALETTE.some(c => c.hex.toLowerCase() === color.toLowerCase());
  }
  
  // Check if it's a color name
  return COLOR_PALETTE.some(c => c.name.toLowerCase() === color.toLowerCase());
};

/**
 * Obtient la liste des noms français de la palette.
 * @returns La liste des noms français.
 */
export const getPaletteColorNames = (): string[] => {
  return COLOR_PALETTE.map(color => color.name);
};

/**
 * Obtient la liste des codes hexadécimaux de la palette.
 * @returns La liste des codes hexadécimaux.
 */
export const getPaletteHexCodes = (): string[] => {
  return COLOR_PALETTE.map(color => color.hex);
};
