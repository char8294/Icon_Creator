
import React, { useState } from 'react';
import IconAdjuster from './features/toolbox/IconAdjuster';
import { AppState, IconItem, IconAdjusterData } from './types';

// Enhanced Minimal Background
const MinimalBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-zinc-950">
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black" />
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-60" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen opacity-60" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
  </div>
);

const INITIAL_STATE: AppState = {
  language: 'en',
  selectedModel: 'gemini-2.5-flash-image',
  mode: 'tools', // Default to Tools mode
  category: 'character',
  prompt: '',
  negativePrompt: '',
  referenceImage: null,
  isGenerating: false,
  generatedImages: [],
  selectedImage: null,
  batchSize: 1,
  aspectRatio: '1:1',
  showRenderSettings: false,
  itemCount: 1,
  imageSize: '1K',
  isSidebarExpanded: true,
  artStyle: 'none',
  completedCount: 0,
  totalBatchCount: 0,
  generationStatus: '',
  characterData: {
    name: '', gender: 'Female', age: 20, height: 165, weight: 55,
    species: 'Human', customSpecies: '', bodyBuild: 'Average', customBodyBuild: '',
    hairStyle: 'Long Wavy', customHairStyle: '', hairReferenceImage: null, hairColor: '#000000',
    eyeColor: '#000000', skinTone: '#ffe0bd',
    attireMode: 'preset', clothingStyle: 'Modern Casual',
    headwear: '', eyewear: '', torso: '', bottom: '', footwear: '', gloves: '', accessories: ''
  },
  creatureMixes: [{ id: '1', name: '', percentage: 50 }],
  creatureAdvanced: {
    primaryShape: '', exaggeratedPart: '', scaleComparison: '', habitat: '', diet: '', evolutionaryTrait: '',
    skeletalStructure: '', locomotionMode: '', appendages: '', skinType: '', dominantColor: '', vfxPoints: '',
    clothing: '', accessories: '', weaponry: '', disposition: ''
  },
  showCreatureAdvanced: false,
  environmentData: {
    locationName: '', history: '', inhabitants: '', civilizationLevel: 'Modern / Contemporary',
    mood: '', timeOfDay: 'Noon / Daylight', weather: 'Clear / Sunny', lighting: '',
    cameraView: 'Cinematic Wide', focalPoint: '', scale: 'Vast Landscape'
  },
  gamePropsData: {
    category: 'Weapon', subCategory: '', theme: '', materials: [], primaryColor: '#ffffff', shape: 'Realistic',
    age: 0, damage: [], cameraView: 'Isometric', lighting: 'Studio', backgroundColor: '#333333',
    influence: 50, structureWeight: 50, styleWeight: 50,
    strokeEnabled: false, strokeColor: '#000000', strokeThickness: 2,
    shadowEnabled: false, shadowColor: '#000000', shadowOpacity: 50, shadowDistance: 10, shadowAngle: 45,
    glowEnabled: false, glowColor: '#ffffff', glowIntensity: 50
  },
  userInterfaceData: {
    screenType: 'Main Menu', uiStyle: 'Flat / Minimalist', materials: [], shape: 'Rounded Corners',
    platform: 'PC / Console', techTags: []
  },
  uiAssetData: {
    assetType: 'Single Item Slot', theme: 'Fantasy', colorTheme: '#ffffff', useColorTheme: false,
    backgroundColor: '#333333', assetTags: [],
    matchShape: 50, matchColor: 50, matchStyle: 50, matchTexture: 50
  },
  iconDesignData: {
    iconStyle: 'Vector', backgroundShape: 'None', fillColorType: 'solid', fillColor: '#ffffff',
    fillGradientStart: '#ffffff', fillGradientEnd: '#000000', bgColorType: 'solid', bgColor: '#000000',
    bgGradientStart: '#ffffff', bgGradientEnd: '#000000', cameraView: 'Front', alignment: 'Center', innerIconShape: 'None'
  },
  soundEffectData: {
    soundAction: 'normal', soundEnvironment: 'studio', soundStyle: 'cinematic',
    durationSeconds: 2, promptInfluence: 0.5, keyMode: 'default', apiKey: ''
  },
  variantData: {
    matchShape: 50, matchColor: 50, matchStyle: 50, matchTexture: 50, colorStrategy: 'similar',
    useColorHarmony: false, harmonyType: 'complementary', baseColor: '#3b82f6', autoHarmony: true, generatedPalette: []
  },
  isAutoFilling: false,
  editState: {
      activeMode: 'fast',
      prompts: {
          fast: '',
          pro: ''
      },
      settings: {
          fast: {
              aspectRatio: '1:1',
              batchSize: 1
          },
          pro: {
              aspectRatio: '1:1',
              batchSize: 1,
              resolution: '2K'
          }
      },
      fixData: {
          maskHistory: [],
          brushSize: 20,
          selectionFeather: 0,
          maskOpacity: 50,
          maskColor: '#ef4444',
          prompt: ''
      },
      expandData: {
          resizeFactor: 1.5,
          placementX: 0,
          placementY: 0,
          prompt: ''
      },
      upscaleData: {
          scale: '2k',
          creativity: 0
      }
  },
  galleryViewMode: 'grid5',
  galleryActiveImageId: null,
  activeTool: 'icon_adjuster', // Default to Icon Adjuster
  textureGeneratorData: {
    rows: 2, cols: 2, slots: Array.from({length: 4}).map((_, i) => ({ id: i.toString(), type: 'solid' as const, colors: ['#ffffff'], angle: 0 })),
    selectedSlotId: null
  },
  bgRemoverData: {
    imageSrc: null, history: [], historyIndex: -1, selectionMode: 'add', tolerance: 20, brushSize: 20, feather: 2, expand: 0, previewBg: 'transparent'
  },
  imageEditorData: {
    canvasWidth: 800, canvasHeight: 600, layers: [], selectedLayerIds: [], zoom: 1, activeTool: 'move', lockAspectRatio: true
  },
  audioEditorData: {
    tracks: [{ id: '1', name: 'Track 1', muted: false, solo: false, volume: 1.0, color: '#ef4444' }],
    clips: [], currentTime: 0, totalDuration: 30, zoom: 100, isPlaying: false,
    selectedClipId: null, selectedPointId: null, draggingPointId: null, editingClipId: null, tool: 'select'
  },
  iconAdjusterData: {
    items: [], 
    selectedItemIds: [], 
    commandMode: 'all', // Set default selection mode to 'all'
    sortOrder: 'original',
    searchTerm: '',
    canvasWidth: 512, 
    canvasHeight: 512,
    background: 'transparent', 
    backgroundColor: '#ffffff', 
    checkeredMode: 'light', // Changed to light pattern by default
    strokeEnabled: true, // Updated default to true
    strokeColor: '#000000',
    strokeThickness: 10, // Updated default to 10px
    strokeSmoothness: 20, // Updated default to 20
    strokeBlur: 1, // Updated default to 1px
    stroke2Enabled: false,
    stroke2Color: '#ffffff',
    stroke2Thickness: 5,
    stroke2Smoothness: 20,
    stroke2Blur: 1,
    maskEnabled: true, // DEFAULT: Enabled
    maskRadius: 149,   // DEFAULT: 149px
    maskInset: 2,      // DEFAULT: 2px
    maskFeather: 0.5,  // DEFAULT: 0.5px
    moveStep: 10, 
    scaleStep: 0.01, // Updated default to 0.01 (min value)
    fitPadding: 50, // Updated default to 50
    cropThreshold: 10, 
    gridColumns: 5,
    overlayFolderUrl: '',
    overlayLibrary: []
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const updateState = (updates: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => {
    setState(prev => {
        const newUpdates = typeof updates === 'function' ? updates(prev) : updates;
        return { ...prev, ...newUpdates };
    });
  };

  const updateIconAdjusterData = (updates: Partial<IconAdjusterData>) => {
    updateState(prev => ({
        iconAdjusterData: { ...prev.iconAdjusterData, ...updates }
    }));
  };

  const updateIconItem = (idOrIds: string | string[], updates: Partial<IconItem>) => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      updateIconAdjusterData({
          items: state.iconAdjusterData.items.map(item => ids.includes(item.id) ? { ...item, ...updates } : item)
      });
  };

  const handleIconUpload = (files: FileList) => {
      const newItems: IconItem[] = Array.from(files).map(file => ({
          id: Date.now().toString() + Math.random(),
          file,
          src: URL.createObjectURL(file),
          x: 0, y: 0, scale: 1,
          originalWidth: 512, originalHeight: 512
      }));
      
      newItems.forEach(item => {
          const img = new Image();
          img.onload = () => {
              item.originalWidth = img.naturalWidth;
              item.originalHeight = img.naturalHeight;
          };
          img.src = item.src;
      });

      updateIconAdjusterData({
          items: [...state.iconAdjusterData.items, ...newItems]
      });
  };

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden flex flex-col">
      <MinimalBackground />
      
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
        <div className="flex items-center gap-2 cursor-pointer group">
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                ICON CREATOR
            </h1>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 select-none">
                v1.0.0
            </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full h-[calc(100vh-88px)] p-4 md:p-6 pb-0">
          <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-t-3xl overflow-hidden shadow-2xl relative">
              <IconAdjuster 
                  state={state} 
                  handleIconUpload={handleIconUpload}
                  updateIconAdjusterData={updateIconAdjusterData}
                  updateIconItem={updateIconItem}
              />
          </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(9,9,11,0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(63,63,70,0.5); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(161,161,170,0.5); }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default App;
