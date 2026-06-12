
export type Language = 'en' | 'th';

export interface IconOverlay {
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface IconItem {
  id: string;
  file: File;
  src: string; // Object URL
  x: number;
  y: number;
  scale: number;
  originalWidth: number;
  originalHeight: number;
  overlay?: IconOverlay;
}

export type IconCommandMode = 'one' | 'multi' | 'all';
export type IconSortOrder = 'original' | 'name_asc' | 'name_desc' | 'newest' | 'oldest';

export interface IconAdjusterData {
  items: IconItem[];
  selectedItemIds: string[]; // Array for multi-select
  commandMode: IconCommandMode;
  sortOrder: IconSortOrder;
  searchTerm: string; // New: Filter items by name
  canvasWidth: number;
  canvasHeight: number;
  background: 'transparent' | 'white' | 'black' | 'custom';
  backgroundColor: string;
  checkeredMode: 'dark' | 'light'; // New: Toggle for transparency pattern
  strokeEnabled: boolean;
  strokeColor: string;
  strokeThickness: number;
  strokeSmoothness: number;
  strokeBlur: number;
  stroke2Enabled: boolean;
  stroke2Color: string;
  stroke2Thickness: number;
  stroke2Smoothness: number;
  stroke2Blur: number;
  maskEnabled: boolean; // New: Clipping mask toggle
  maskRadius: number; // New: Rounded corner radius
  maskInset: number; // New: Shrink mask inwards
  maskFeather: number; // New: Soft edge/AA for mask
  moveStep: number;
  scaleStep: number;
  fitPadding: number;
  cropThreshold: number; // 0-255
  gridColumns: number; // New: Grid preview size
  overlayFolderUrl: string;
  overlayLibrary: string[];
}

export type CoreMode = 'idea' | 'variant' | 'edit' | 'render' | 'tools';
export type ToolMode = 'texture_grid' | 'icon_adjuster' | 'bg_remover' | 'image_editor' | 'audio_editor';
export type Category = 'character' | 'creatures' | 'environment' | 'game_props' | 'user_interface' | 'ui_asset' | 'icon_design' | 'logo_design' | 'sound_effect';
export type ModelType = 'gemini-2.5-flash-image' | 'gemini-2.5-pro-preview' | 'gemini-3-pro-image-preview' | 'gemini-2.5-flash';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type ImageSize = '1K' | '2K' | '4K';
export type ArtStyle = 'none' | 'realistic' | 'anime' | 'digital_art' | '3d_render' | 'pixel_art' | 'oil_painting' | 'watercolor' | 'sketch' | 'cyberpunk' | 'fantasy' | 'scifi' | 'cartoon' | 'flat_design' | 'isometric' | 'low_poly' | 'claymation' | 'cel_shaded' | 'zen_brush' | 'japanese_trad' | 'manga' | 'manhwa' | 'webtoon_low' | 'webtoon_high' | 'concept_art' | 'middle_age' | 'child_scribble' | 'sculpture';
export type ItemCount = 1 | 2 | 4 | 8;
export type HarmonyType = 'primary' | 'analogous' | 'complementary' | 'split_complementary' | 'double_split_complementary' | 'triadic' | 'square' | 'tetradic';

export interface SelectOption {
  value: string;
  label: { en: string; th: string };
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  mode: CoreMode;
  category: Category;
  model: string;
  aspectRatio: string;
  artStyle: string;
}

export interface CharacterData {
  name: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  species: string;
  customSpecies: string;
  bodyBuild: string;
  customBodyBuild: string;
  hairStyle: string;
  customHairStyle: string;
  hairReferenceImage: string | null;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  attireMode: 'preset' | 'detailed';
  clothingStyle: string;
  headwear: string;
  eyewear: string;
  torso: string;
  bottom: string;
  footwear: string;
  gloves: string;
  accessories: string;
}

export interface CreatureMix {
  id: string;
  name: string;
  percentage: number;
  bodyParts?: string;
}

export interface CreatureAdvancedData {
  primaryShape: string;
  exaggeratedPart: string;
  scaleComparison: string;
  habitat: string;
  diet: string;
  evolutionaryTrait: string;
  skeletalStructure: string;
  locomotionMode: string;
  appendages: string;
  skinType: string;
  dominantColor: string;
  vfxPoints: string;
  clothing: string;
  accessories: string;
  weaponry: string;
  disposition: string;
}

export interface EnvironmentData {
  locationName: string;
  history: string;
  inhabitants: string;
  civilizationLevel: string;
  mood: string;
  timeOfDay: string;
  weather: string;
  lighting: string;
  cameraView: string;
  focalPoint: string;
  scale: string;
}

export interface GamePropsData {
  category: string;
  subCategory: string;
  theme: string;
  materials: string[];
  primaryColor: string;
  shape: string;
  age: number;
  damage: string[];
  cameraView: string;
  lighting: string;
  backgroundColor: string;
  influence: number;
  structureWeight: number;
  styleWeight: number;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeThickness: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowOpacity: number;
  shadowDistance: number;
  shadowAngle: number;
  glowEnabled: boolean;
  glowColor: string;
  glowIntensity: number;
}

export interface UserInterfaceData {
  screenType: string;
  uiStyle: string;
  materials: string[];
  shape: string;
  platform: string;
  techTags: string[];
}

export interface UIAssetData {
  assetType: string;
  theme: string;
  colorTheme: string;
  useColorTheme: boolean;
  backgroundColor: string;
  assetTags: string[];
  matchShape: number;
  matchColor: number;
  matchStyle: number;
  matchTexture: number;
}

export interface IconDesignData {
  iconStyle: string;
  backgroundShape: string;
  fillColorType: 'solid' | 'gradient';
  fillColor: string;
  fillGradientStart: string;
  fillGradientEnd: string;
  bgColorType: 'solid' | 'gradient';
  bgColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  cameraView: string;
  alignment: string;
  innerIconShape: string;
}

export interface SoundEffectData {
  soundAction: string;
  soundEnvironment: string;
  soundStyle: string;
  durationSeconds: number;
  promptInfluence: number;
  keyMode: 'default' | 'custom';
  apiKey: string;
}

export interface VariantData {
  matchShape: number;
  matchColor: number;
  matchStyle: number;
  matchTexture: number;
  colorStrategy: string;
  useColorHarmony: boolean;
  harmonyType: HarmonyType;
  baseColor: string;
  autoHarmony: boolean;
  generatedPalette: string[];
}

export interface TextureSlot {
  id: string;
  type: 'solid' | 'gradient';
  colors: string[];
  angle: number;
  stops?: number[];
  locked?: boolean;
}

export interface BgRemoverData {
  imageSrc: string | null;
  history: ImageData[];
  historyIndex: number;
  selectionMode: 'add' | 'remove';
  tolerance: number;
  brushSize: number;
  feather: number;
  expand: number;
  previewBg: string;
}

export interface EditorLayer {
  id: string;
  name: string;
  type: 'image' | 'solid' | 'shape' | 'frame';
  visible: boolean;
  locked: boolean;
  opacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  src?: string;
  color?: string; // for solid or shape
  fillType?: 'solid' | 'gradient' | 'none';
  gradientStops?: string[];
  gradientStopPositions?: number[];
  gradientAngle?: number;
  strokeColor?: string;
  strokeWidth?: number;
  shapeType?: string; // from SHAPE_LIBRARY
  cornerRadius?: number;
  cornerRadii?: number[];
  frameImage?: {
      src: string;
      x: number;
      y: number;
      scale: number;
      rotation: number;
      originalWidth: number;
      originalHeight: number;
  } | null;
  filters?: {
      brightness: number;
      contrast: number;
      saturation: number;
      blur: number;
      hue: number;
      sepia: number;
      grayscale: number;
  };
  tintColor?: string | null;
  groupId?: string | null;
}

export interface ImageEditorData {
  canvasWidth: number;
  canvasHeight: number;
  layers: EditorLayer[];
  selectedLayerIds: string[];
  zoom: number;
  activeTool: 'move' | 'crop' | 'select';
  lockAspectRatio?: boolean;
  viewX?: number;
  viewY?: number;
  cropRect?: { x: number, y: number, w: number, h: number };
  fitPadding?: number;
}

export interface VolumePoint {
  id: string;
  time: number;
  value: number; // 0 to 1
}

export interface AudioClip {
  id: string;
  trackId: string;
  name: string;
  src: string;
  startTime: number; // Position on timeline
  duration: number; // Duration on timeline
  offset: number; // Start offset in source file
  totalSourceDuration: number;
  volumePoints: VolumePoint[];
  color?: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  color?: string;
}

export interface AudioEditorData {
  tracks: AudioTrack[];
  clips: AudioClip[];
  currentTime: number;
  totalDuration: number;
  zoom: number; // pixels per second
  isPlaying: boolean;
  selectedClipId: string | null;
  selectedPointId: string | null;
  draggingPointId: string | null;
  editingClipId: string | null; // For precision editor
  tool: 'select' | 'volume' | 'split';
}

export type EditModelMode = 'fast' | 'pro';

export interface MaskPath {
    points: {x:number, y:number}[];
    brushSize: number;
    isEraser: boolean;
}

export interface FixData {
    maskHistory: MaskPath[];
    brushSize: number;
    selectionFeather: number;
    maskOpacity: number;
    maskColor: string;
    prompt: string;
}

export interface ExpandData {
    resizeFactor: number;
    placementX: number;
    placementY: number;
    prompt: string;
}

export interface UpscaleData {
    scale: '2k' | '4k';
    creativity: number;
}

export interface EditState {
    activeMode: EditModelMode;
    prompts: {
        fast: string;
        pro: string;
    };
    settings: {
        fast: {
            aspectRatio: AspectRatio;
            batchSize: number;
        };
        pro: {
            aspectRatio: AspectRatio;
            batchSize: number;
            resolution: ImageSize;
        };
    };
    fixData: FixData;
    expandData: ExpandData;
    upscaleData: UpscaleData;
}

export interface Tool {
  id: string;
  title: string;
  description?: string;
  url: string;
  iconType: 'language' | 'roblox' | 'planet';
}

export interface AppState {
  language: Language;
  selectedModel: ModelType;
  mode: CoreMode;
  category: Category;
  prompt: string;
  negativePrompt: string;
  referenceImage: string | null;
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  selectedImage: GeneratedImage | null;
  batchSize: number;
  aspectRatio: AspectRatio;
  showRenderSettings: boolean;
  itemCount: ItemCount;
  imageSize: ImageSize;
  isSidebarExpanded: boolean;
  artStyle: ArtStyle;
  completedCount: number;
  totalBatchCount: number;
  generationStatus: string;
  
  // Data Sections
  characterData: CharacterData;
  creatureMixes: CreatureMix[];
  creatureAdvanced: CreatureAdvancedData;
  showCreatureAdvanced: boolean;
  environmentData: EnvironmentData;
  gamePropsData: GamePropsData;
  userInterfaceData: UserInterfaceData;
  uiAssetData: UIAssetData;
  iconDesignData: IconDesignData;
  soundEffectData: SoundEffectData;
  variantData: VariantData;
  
  isAutoFilling: boolean;
  
  // Edit Mode
  editState: EditState;
  
  // Gallery
  galleryViewMode: 'featured' | 'grid5' | 'grid3' | 'grid2';
  galleryActiveImageId: string | null;
  
  // Tools
  activeTool: ToolMode | 'texture_grid';
  textureGeneratorData: {
      rows: number;
      cols: number;
      slots: TextureSlot[];
      selectedSlotId: string | null;
      texturePrompt?: string;
  };
  
  iconAdjusterData: IconAdjusterData;
  bgRemoverData: BgRemoverData;
  imageEditorData: ImageEditorData;
  audioEditorData: AudioEditorData;
}
