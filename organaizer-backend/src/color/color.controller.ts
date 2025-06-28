import { Controller, Get } from '@nestjs/common';
import { COLOR_PALETTE, getPaletteColorNames, getPaletteHexCodes } from '../utils/color.utils';

@Controller('colors')
export class ColorController {
  
  /**
   * Obtient la palette complète des couleurs disponibles
   */
  @Get('palette')
  getPalette() {
    return {
      colors: COLOR_PALETTE,
      message: 'Palette de couleurs disponibles'
    };
  }

  /**
   * Obtient uniquement les noms des couleurs
   */
  @Get('names')
  getColorNames() {
    return {
      names: getPaletteColorNames(),
      message: 'Noms des couleurs disponibles'
    };
  }

  /**
   * Obtient uniquement les codes hexadécimaux
   */
  @Get('hex-codes')
  getHexCodes() {
    return {
      hexCodes: getPaletteHexCodes(),
      message: 'Codes hexadécimaux des couleurs disponibles'
    };
  }
}
