export enum RoomTheme {
  CORPORATE_OFFICE = 'Corporate Office',
  MODERN = 'Modern',
  MINIMAL = 'Minimal',
  MEDIEVAL = 'Medieval',
  LUXURY = 'Luxury',
  SCANDINAVIAN = 'Scandinavian',
  INDUSTRIAL = 'Industrial',
  BOHEMIAN = 'Bohemian',
  JAPANDI = 'Japandi',
}

export enum RoomAddOn {
  TABLE = 'Table',
  RUG = 'Carpet / Rug',
  SOFA = 'Sofa',
  WALL_ART = 'Wall Art',
  PLANTS = 'Indoor Plants',
  LIGHTS = 'Ceiling Lights',
}

export interface TransformationConfig {
  theme: RoomTheme;
  intensity: number;
  preserveLayout: boolean;
  addOns: RoomAddOn[];
  customInstructions?: string;
}

export interface TransformationResult {
  originalImage: string;
  transformedImage: string;
}