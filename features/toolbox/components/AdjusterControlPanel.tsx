import React, { useState } from 'react';
import { IconAdjusterData, IconItem, IconOverlay } from '../../../types';
import { UploadIcon, DeleteIcon, FileIcon } from '../../../components/Icons';

interface Props {
  data: IconAdjusterData;
  t: any;
  updateIconAdjusterData: (updates: Partial<IconAdjusterData>) => void;
  updateIconItem: (idOrIds: string | string[], updates: Partial<IconItem>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  overlayInputRef: React.RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  isDraggingOverlay: boolean;
  setIsDraggingOverlay: (val: boolean) => void;
  zipName: string;
  setZipName: (val: string) => void;
  overlayOriginalSize: { w: number; h: number } | null;
  primarySelectedItem: IconItem | undefined;
  handleIconUpload: (files: FileList) => void;
  handleOverlayUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeOverlay: () => void;
  updateOverlayProp: (key: keyof IconOverlay, value: number) => void;
  handleSaveZip: () => void;
  getTargetIds: () => string[];
  setShowSettings: (val: boolean) => void;
  handleAutoCrop: () => void;
}

// Collapsible Section Component
const Section: React.FC<{
  title: string;
  icon: string;
  defaultOpen?: boolean;
  badge?: string;
  accentColor?: string;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, badge, accentColor = 'blue', children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    teal: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    zinc: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  };
  const color = colors[accentColor] || colors.blue;

  return (
    <div className="border border-zinc-800/60 rounded-xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-zinc-800/40 transition-colors text-left"
      >
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm border ${color}`}>
          {icon}
        </span>
        <span className="text-xs font-bold text-zinc-300 flex-1 uppercase tracking-wide">{title}</span>
        {badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{badge}</span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-3.5 pb-4 pt-1 space-y-3 animate-fade-in border-t border-zinc-800/40">
          {children}
        </div>
      )}
    </div>
  );
};

export const AdjusterControlPanel: React.FC<Props> = ({
  data, t, updateIconAdjusterData, updateIconItem, fileInputRef, overlayInputRef,
  isDragging, setIsDragging, isDraggingOverlay, setIsDraggingOverlay,
  zipName, setZipName, overlayOriginalSize, primarySelectedItem,
  handleIconUpload, handleOverlayUpload, removeOverlay, updateOverlayProp,
  handleSaveZip, handleClearAll, getTargetIds, setShowSettings, handleAutoCrop
}) => {
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleIconUpload(e.dataTransfer.files);
  };

  const onOverlayDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOverlay(true); };
  const onOverlayDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOverlay(false); };
  const onOverlayDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingOverlay(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement('input'); input.type = 'file';
      const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files;
      handleOverlayUpload({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const currentOverlayW = (overlayOriginalSize && primarySelectedItem?.overlay) ? Math.round(overlayOriginalSize.w * primarySelectedItem.overlay.scale) : 0;
  const currentOverlayH = (overlayOriginalSize && primarySelectedItem?.overlay) ? Math.round(overlayOriginalSize.h * primarySelectedItem.overlay.scale) : 0;

  return (
    <div className="w-full md:w-80 bg-zinc-900/50 backdrop-blur-md border-r border-zinc-800 overflow-y-auto custom-scrollbar flex flex-col">
      {/* Top Fixed Area - Overlay Upload */}
      <div className="p-4 pb-3 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5"><span className="text-purple-400">🔲</span> {t.iconAdjuster.overlayTitle}</h3>
          {primarySelectedItem?.overlay && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">ON</span>
          )}
        </div>
        <div
          className={`flex gap-2 p-1 rounded-lg transition-all border ${isDraggingOverlay ? 'border-blue-500 bg-blue-500/10' : 'border-transparent'}`}
          onDragOver={onOverlayDragOver} onDragLeave={onOverlayDragLeave} onDrop={onOverlayDrop}>
          <button onClick={() => overlayInputRef.current?.click()}
            className={`flex-1 py-2 ${isDraggingOverlay ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'} rounded-lg text-xs font-medium transition flex items-center justify-center gap-2`}>
            <UploadIcon className="w-4 h-4" /> {t.iconAdjuster.overlayUpload}
          </button>
          <input type="file" ref={overlayInputRef} accept="image/*" className="hidden" onChange={handleOverlayUpload} />
          {primarySelectedItem?.overlay && (
            <button onClick={removeOverlay} className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition" title="Remove Overlay">
              <DeleteIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {primarySelectedItem?.overlay && (
          <div className="space-y-2.5 mt-4 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
            {overlayOriginalSize && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><label className="text-[10px] text-zinc-400">{t.iconAdjuster.overlayWidth}</label>
                  <input type="number" value={currentOverlayW} onChange={(e) => { const w = parseInt(e.target.value) || 0; if (overlayOriginalSize.w > 0) updateOverlayProp('scale', w / overlayOriginalSize.w); }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-zinc-200 focus:border-purple-500/50 outline-none" /></div>
                <div className="space-y-1"><label className="text-[10px] text-zinc-400">{t.iconAdjuster.overlayHeight}</label>
                  <input type="number" value={currentOverlayH} onChange={(e) => { const h = parseInt(e.target.value) || 0; if (overlayOriginalSize.h > 0) updateOverlayProp('scale', h / overlayOriginalSize.h); }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-zinc-200 focus:border-purple-500/50 outline-none" /></div>
              </div>
            )}
            <div className="space-y-1"><div className="flex justify-between"><label className="text-[10px] text-zinc-400">{t.iconAdjuster.overlayX}</label><span className="text-[10px] text-zinc-500 font-mono">{primarySelectedItem.overlay.x}</span></div>
              <input type="range" min="-200" max="200" value={primarySelectedItem.overlay.x} onChange={(e) => updateOverlayProp('x', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-purple-500" /></div>
            <div className="space-y-1"><div className="flex justify-between"><label className="text-[10px] text-zinc-400">{t.iconAdjuster.overlayY}</label><span className="text-[10px] text-zinc-500 font-mono">{primarySelectedItem.overlay.y}</span></div>
              <input type="range" min="-200" max="200" value={primarySelectedItem.overlay.y} onChange={(e) => updateOverlayProp('y', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-purple-500" /></div>
            <div className="space-y-1"><div className="flex justify-between"><label className="text-[10px] text-zinc-400">{t.iconAdjuster.overlayScale}</label><span className="text-[10px] text-zinc-500 font-mono">{primarySelectedItem.overlay.scale.toFixed(2)}</span></div>
              <input type="range" min="0.1" max="3" step="0.1" value={primarySelectedItem.overlay.scale} onChange={(e) => updateOverlayProp('scale', parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-purple-500" /></div>
            <div className="space-y-1"><div className="flex justify-between"><label className="text-[10px] text-zinc-400">{t.iconAdjuster.overlayRotate}</label><span className="text-[10px] text-zinc-500 font-mono">{primarySelectedItem.overlay.rotation}°</span></div>
              <input type="range" min="0" max="360" value={primarySelectedItem.overlay.rotation} onChange={(e) => updateOverlayProp('rotation', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-purple-500" /></div>
          </div>
        )}
      </div>

      {/* Collapsible Settings Sections */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">

        {/* Transform */}
        <Section title="Transform" icon="↔" defaultOpen={true} accentColor="blue"
          badge={data.selectedItemIds.length > 0 && data.items.length > 0 ? 'active' : undefined}>
          {data.selectedItemIds.length > 0 && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400">{t.iconAdjuster.posX}</label>
                  <input type="number"
                    value={primarySelectedItem ? Math.round(primarySelectedItem.x) : 0}
                    onChange={(e) => updateIconItem(getTargetIds(), { x: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 focus:border-blue-500/50 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400">{t.iconAdjuster.posY}</label>
                  <input type="number"
                    value={primarySelectedItem ? Math.round(primarySelectedItem.y) : 0}
                    onChange={(e) => updateIconItem(getTargetIds(), { y: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 focus:border-blue-500/50 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400">{t.iconAdjuster.posScale}</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0.01" max="5" step="0.01"
                    value={primarySelectedItem ? primarySelectedItem.scale : 1}
                    onChange={(e) => updateIconItem(getTargetIds(), { scale: parseFloat(e.target.value) || 0.01 })}
                    className="flex-1 h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-blue-500" />
                  <input type="number" step="0.01"
                    value={primarySelectedItem ? parseFloat(primarySelectedItem.scale.toFixed(2)) : 1}
                    onChange={(e) => updateIconItem(getTargetIds(), { scale: parseFloat(e.target.value) || 0.01 })}
                    className="w-16 bg-zinc-950 border border-zinc-800 rounded p-1 text-[10px] text-zinc-300 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400">{t.iconAdjuster.padding}</label>
                  <input type="number" value={data.fitPadding} onChange={(e) => updateIconAdjusterData({ fitPadding: parseInt(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 focus:border-blue-500/50 outline-none" />
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <button onClick={handleAutoCrop}
                    className="w-full py-1.5 bg-teal-900/30 hover:bg-teal-900/50 text-teal-400 rounded p-1.5 text-xs font-bold border border-teal-500/20 transition-all flex items-center justify-center gap-1">
                    <span className="text-[10px]">✂️</span> Auto Crop
                  </button>
                </div>
              </div>

              {/* Alignment Buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase font-bold">{t.iconAdjuster.pivotTitle}</label>
                <div className="grid grid-cols-3 gap-1">
                  <div />
                  <button onClick={() => { const ids = getTargetIds(); updateIconAdjusterData({ items: data.items.map(item => ids.includes(item.id) ? { ...item, y: -(data.canvasHeight / 2 - (item.originalHeight * item.scale) / 2 - data.fitPadding) } : item) }); }}
                    className="p-1.5 bg-zinc-950 border border-zinc-800 rounded hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white transition-all">{t.iconAdjuster.pivotTop}</button>
                  <div />
                  <button onClick={() => { const ids = getTargetIds(); updateIconAdjusterData({ items: data.items.map(item => ids.includes(item.id) ? { ...item, x: -(data.canvasWidth / 2 - (item.originalWidth * item.scale) / 2 - data.fitPadding) } : item) }); }}
                    className="p-1.5 bg-zinc-950 border border-zinc-800 rounded hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white transition-all">{t.iconAdjuster.pivotLeft}</button>
                  <button onClick={() => updateIconItem(getTargetIds(), { x: 0, y: 0 })}
                    className="p-1.5 bg-zinc-950 border border-zinc-800 rounded hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white transition-all">{t.iconAdjuster.pivotCenter}</button>
                  <button onClick={() => { const ids = getTargetIds(); updateIconAdjusterData({ items: data.items.map(item => ids.includes(item.id) ? { ...item, x: (data.canvasWidth / 2 - (item.originalWidth * item.scale) / 2 - data.fitPadding) } : item) }); }}
                    className="p-1.5 bg-zinc-950 border border-zinc-800 rounded hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white transition-all">{t.iconAdjuster.pivotRight}</button>
                  <div />
                  <button onClick={() => { const ids = getTargetIds(); updateIconAdjusterData({ items: data.items.map(item => ids.includes(item.id) ? { ...item, y: (data.canvasHeight / 2 - (item.originalHeight * item.scale) / 2 - data.fitPadding) } : item) }); }}
                    className="p-1.5 bg-zinc-950 border border-zinc-800 rounded hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white transition-all">{t.iconAdjuster.pivotBottom}</button>
                  <div />
                </div>
              </div>
              <div className="pt-3 mt-1 border-t border-zinc-800/50">
                 <p className="text-[9px] text-zinc-500 font-mono text-center flex items-center justify-center gap-2 mb-2">
                   <span><b className="text-zinc-300">WASD</b> Move</span>
                   <span><b className="text-zinc-300">Q/E</b> Scale</span>
                   <span><b className="text-teal-400">R</b> Crop</span>
                   <span><b className="text-rose-400">Z</b> Reset</span>
                 </p>
                 <button
                   onClick={() => setShowSettings(true)}
                   className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
                 >
                   ⚙️ {t.iconAdjuster.controlsTitle || "Controls Setting"}
                 </button>
              </div>
            </>
          ) : (
            <p className="text-[10px] text-zinc-600 italic">Select items to transform</p>
          )}
        </Section>

        {/* Canvas */}
        <Section title={t.iconAdjuster.canvasSettings} icon="📐" defaultOpen={false} accentColor="purple">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400">Width</label>
              <input type="number" value={data.canvasWidth} onChange={(e) => updateIconAdjusterData({ canvasWidth: parseInt(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-xs text-zinc-200" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400">Height</label>
              <input type="number" value={data.canvasHeight} onChange={(e) => updateIconAdjusterData({ canvasHeight: parseInt(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-xs text-zinc-200" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400">{t.iconAdjuster.bg}</label>
            <select value={data.background} onChange={(e) => updateIconAdjusterData({ background: e.target.value as any })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-xs outline-none text-zinc-200">
              <option value="transparent">{t.iconAdjuster.bgTransparent}</option>
              <option value="white">{t.iconAdjuster.bgWhite}</option>
              <option value="black">{t.iconAdjuster.bgBlack}</option>
              <option value="custom">{t.iconAdjuster.bgCustom}</option>
            </select>
            {data.background === 'transparent' && (
              <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 mt-1">
                <button onClick={() => updateIconAdjusterData({ checkeredMode: 'light' })}
                  className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${data.checkeredMode === 'light' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}>
                  {t.iconAdjuster.checkeredLight}</button>
                <button onClick={() => updateIconAdjusterData({ checkeredMode: 'dark' })}
                  className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${data.checkeredMode === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}>
                  {t.iconAdjuster.checkeredDark}</button>
              </div>
            )}
            {data.background === 'custom' && (
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={data.backgroundColor} onChange={(e) => updateIconAdjusterData({ backgroundColor: e.target.value })}
                  className="w-7 h-7 rounded border-none cursor-pointer" />
                <span className="text-[10px] text-zinc-400 font-mono">{data.backgroundColor}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Mask */}
        <Section title={t.iconAdjuster.maskTitle} icon="⬡" defaultOpen={false} accentColor="amber"
          badge={data.maskEnabled ? 'ON' : undefined}>
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input type="checkbox" checked={data.maskEnabled} onChange={(e) => updateIconAdjusterData({ maskEnabled: e.target.checked })}
              className="rounded bg-zinc-800 border-zinc-700 text-blue-500" />
            {t.iconAdjuster.enableMask}
          </label>
          {data.maskEnabled && (
            <div className="space-y-2 pl-3 border-l border-zinc-800">
              <div className="space-y-0.5">
                <div className="flex justify-between"><label className="text-[10px] text-zinc-400">{t.iconAdjuster.maskRadius}</label><span className="text-[10px] text-zinc-500 font-mono">{data.maskRadius}px</span></div>
                <input type="range" min="0" max="256" value={data.maskRadius} onChange={(e) => updateIconAdjusterData({ maskRadius: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500" />
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between"><label className="text-[10px] text-zinc-400">{t.iconAdjuster.maskInset}</label><span className="text-[10px] text-zinc-500 font-mono">{data.maskInset}px</span></div>
                <input type="range" min="0" max="100" value={data.maskInset} onChange={(e) => updateIconAdjusterData({ maskInset: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500" />
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between"><label className="text-[10px] text-zinc-400">{t.iconAdjuster.maskFeather}</label><span className="text-[10px] text-zinc-500 font-mono">{data.maskFeather}px</span></div>
                <input type="range" min="0" max="20" step="0.5" value={data.maskFeather} onChange={(e) => updateIconAdjusterData({ maskFeather: parseFloat(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500" />
              </div>
            </div>
          )}
        </Section>

        {/* Strokes */}
        <Section title="Strokes" icon="◎" defaultOpen={false} accentColor="blue"
          badge={data.strokeEnabled || data.stroke2Enabled ? 'ON' : undefined}>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs text-zinc-300 mb-2">
                <input type="checkbox" checked={data.strokeEnabled} onChange={(e) => updateIconAdjusterData({ strokeEnabled: e.target.checked })}
                  className="rounded bg-zinc-800 border-zinc-700 text-blue-500" />
                {t.iconAdjuster.enableStroke}
              </label>
              {data.strokeEnabled && (
                <div className="space-y-2 pl-3 border-l border-zinc-800">
                  <div className="flex items-center gap-2">
                    <input type="color" value={data.strokeColor} onChange={(e) => updateIconAdjusterData({ strokeColor: e.target.value })} className="w-6 h-6 rounded bg-transparent cursor-pointer" />
                    <span className="text-[10px] text-zinc-500 font-mono">{data.strokeColor}</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-zinc-400">{t.iconAdjuster.thickness}: {data.strokeThickness}px</label>
                    <input type="range" min="1" max="100" value={data.strokeThickness} onChange={(e) => updateIconAdjusterData({ strokeThickness: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-blue-500" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-zinc-400">{t.iconAdjuster.strokeSmoothness}: {data.strokeSmoothness}</label>
                    <input type="range" min="4" max="64" value={data.strokeSmoothness} onChange={(e) => updateIconAdjusterData({ strokeSmoothness: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-blue-500" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-zinc-400">{t.iconAdjuster.strokeBlur}: {data.strokeBlur}px</label>
                    <input type="range" min="0" max="20" value={data.strokeBlur} onChange={(e) => updateIconAdjusterData({ strokeBlur: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-blue-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-800/60 pt-3">
              <label className="flex items-center gap-2 text-xs text-zinc-300 mb-2">
                <input type="checkbox" checked={data.stroke2Enabled} onChange={(e) => updateIconAdjusterData({ stroke2Enabled: e.target.checked })}
                  className="rounded bg-zinc-800 border-zinc-700 text-teal-500" />
                {t.iconAdjuster.enableStroke2}
              </label>
              {data.stroke2Enabled && (
                <div className="space-y-2 pl-3 border-l border-zinc-800">
                  <div className="flex items-center gap-2">
                    <input type="color" value={data.stroke2Color} onChange={(e) => updateIconAdjusterData({ stroke2Color: e.target.value })} className="w-6 h-6 rounded bg-transparent cursor-pointer" />
                    <span className="text-[10px] text-zinc-500 font-mono">{data.stroke2Color}</span>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-zinc-400">{t.iconAdjuster.thickness}: {data.stroke2Thickness}px</label>
                    <input type="range" min="1" max="100" value={data.stroke2Thickness} onChange={(e) => updateIconAdjusterData({ stroke2Thickness: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-teal-500" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-zinc-400">{t.iconAdjuster.strokeSmoothness}: {data.stroke2Smoothness}</label>
                    <input type="range" min="4" max="64" value={data.stroke2Smoothness} onChange={(e) => updateIconAdjusterData({ stroke2Smoothness: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-teal-500" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-zinc-400">{t.iconAdjuster.strokeBlur}: {data.stroke2Blur}px</label>
                    <input type="range" min="0" max="20" value={data.stroke2Blur} onChange={(e) => updateIconAdjusterData({ stroke2Blur: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-teal-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>




      </div>


    </div>
  );
};
