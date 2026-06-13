import React, { useRef, useEffect, useState } from 'react';
import { AppState, IconAdjusterData, IconItem, IconOverlay } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { UploadIcon } from '../../components/Icons';
import JSZip from 'jszip';

// Import modular components
import { SingleIconCanvas } from './components/SingleIconCanvas';
import { AdjusterControlPanel } from './components/AdjusterControlPanel';
import { AdjusterToolbar } from './components/AdjusterToolbar';

interface Props {
  state: AppState;
  handleIconUpload: (files: FileList) => void;
  updateIconAdjusterData: (updates: Partial<IconAdjusterData>) => void;
  updateIconItem: (idOrIds: string | string[], updates: Partial<IconItem>) => void;
}

const IconAdjuster: React.FC<Props> = ({ state, handleIconUpload, updateIconAdjusterData, updateIconItem }) => {
  const data = state.iconAdjusterData;
  const t = TRANSLATIONS[state.language];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [zipName, setZipName] = useState("");
  const [overlayOriginalSize, setOverlayOriginalSize] = useState<{ w: number; h: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const getSortedItems = () => {
    let items = [...data.items];

    // Filter by name
    if (data.searchTerm) {
        const term = data.searchTerm.toLowerCase();
        items = items.filter(item => item.file.name.toLowerCase().includes(term));
    }

    switch (data.sortOrder) {
        case 'name_asc':
            return items.sort((a, b) => a.file.name.localeCompare(b.file.name));
        case 'name_desc':
            return items.sort((a, b) => b.file.name.localeCompare(a.file.name));
        case 'newest':
            return items.sort((a, b) => parseFloat(b.id) - parseFloat(a.id));
        case 'oldest':
            return items.sort((a, b) => parseFloat(a.id) - parseFloat(b.id));
        case 'original':
        default:
            return items;
    }
  };

  const sortedItems = getSortedItems();

  const getTargetIds = () => {
      return data.selectedItemIds;
  };

  const primarySelectedItem = data.items.find(i => i.id === data.selectedItemIds[0]);

  // Process overlay file helper
  const processOverlayFile = (file: File) => {
    const targetIds = getTargetIds();
    if (targetIds.length === 0) {
        alert("Select at least one item to add overlay.");
        return;
    }

    const url = URL.createObjectURL(file);
    const newOverlay: IconOverlay = {
        src: url,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0
    };

    updateIconItem(targetIds, { overlay: newOverlay });
  };

  const handleOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      processOverlayFile(file);
      e.target.value = '';
  };

  const updateOverlayProp = (key: keyof IconOverlay, value: number) => {
      const targetIds = getTargetIds();
      const newItems = data.items.map(item => {
          if (targetIds.includes(item.id) && item.overlay) {
              return {
                  ...item,
                  overlay: { ...item.overlay, [key]: value }
              };
          }
          return item;
      });
      updateIconAdjusterData({ items: newItems });
  };

  const removeOverlay = () => {
      const targetIds = getTargetIds();
      const newItems = data.items.map(item => {
          if (targetIds.includes(item.id)) {
              const { overlay, ...rest } = item;
              return rest;
          }
          return item;
      });
      updateIconAdjusterData({ items: newItems });
  };

  // Get dimensions of the overlay image when it changes
  useEffect(() => {
    if (primarySelectedItem?.overlay?.src) {
        const img = new Image();
        img.src = primarySelectedItem.overlay.src;
        img.onload = () => {
            setOverlayOriginalSize({ w: img.naturalWidth, h: img.naturalHeight });
        };
    } else {
        setOverlayOriginalSize(null);
    }
  }, [primarySelectedItem?.overlay?.src]);

  const calculateCrop = (item: IconItem): Promise<Partial<IconItem> | null> => {
      return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = item.src;
          img.onload = () => {
              const cvs = document.createElement('canvas');
              cvs.width = img.naturalWidth;
              cvs.height = img.naturalHeight;
              const ctx = cvs.getContext('2d');
              if(!ctx) { resolve(null); return; }
              ctx.drawImage(img, 0, 0);
              const pixels = ctx.getImageData(0,0, cvs.width, cvs.height).data;
              
              let minX = cvs.width, minY = cvs.height, maxX = 0, maxY = 0;
              let found = false;
              
              for(let y=0; y<cvs.height; y++) {
                  for(let x=0; x<cvs.width; x++) {
                      const alpha = pixels[(y*cvs.width + x)*4 + 3];
                      if(alpha > data.cropThreshold) {
                          if(x < minX) minX = x;
                          if(x > maxX) maxX = x;
                          if(y < minY) minY = y;
                          if(y > maxY) maxY = y;
                          found = true;
                      }
                  }
              }
              
              if(!found) { resolve(null); return; }
              
              const bw = maxX - minX + 1;
              const bh = maxY - minY + 1;
              const cx = minX + bw / 2;
              const cy = minY + bh / 2;
              
              const ox = img.naturalWidth / 2;
              const oy = img.naturalHeight / 2;
              const vx = cx - ox;
              const vy = cy - oy;
              
              const availableW = data.canvasWidth - (data.fitPadding * 2);
              const availableH = data.canvasHeight - (data.fitPadding * 2);
              const scaleW = availableW / bw;
              const scaleH = availableH / bh;
              const newScale = Math.min(scaleW, scaleH);
              
              resolve({
                  scale: newScale,
                  x: -vx * newScale,
                  y: -vy * newScale
              });
          };
          img.onerror = () => resolve(null);
      });
  };

  const handleAutoCrop = async () => {
       const targetIds = getTargetIds();
       if (targetIds.length === 0) return;
       const targetItems = data.items.filter(item => targetIds.includes(item.id));
       if (targetItems.length === 0) return;

       const results = await Promise.all(targetItems.map(async (item) => {
            const updates = await calculateCrop(item);
            return { id: item.id, updates };
       }));

       const newItems = data.items.map(item => {
            const res = results.find(r => r.id === item.id);
            if (res && res.updates) {
                return { ...item, ...res.updates };
            }
            return item;
       });
       updateIconAdjusterData({ items: newItems });
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
        // Prevent triggering controls when typing in input fields
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl+A: Select All
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            updateIconAdjusterData({ selectedItemIds: data.items.map(i => i.id) });
            return;
        }

        const targetIds = getTargetIds();
        if (targetIds.length === 0) return;

        const move = data.moveStep;
        const scaleStep = data.scaleStep;
        const key = e.key.toLowerCase();

        if (['w','a','s','d','q','e','r','z'].includes(key)) {
            e.preventDefault();
        }

        let hasChanges = false;
        let newItems = data.items.map(item => {
             if (targetIds.includes(item.id)) {
                  let updates: Partial<IconItem> | null = null;
                  switch(key) {
                     case 'w': updates = { y: item.y - move }; break;
                     case 's': updates = { y: item.y + move }; break;
                     case 'a': updates = { x: item.x - move }; break;
                     case 'd': updates = { x: item.x + move }; break;
                     case 'q': updates = { scale: Math.max(0.01, item.scale - scaleStep) }; break;
                     case 'e': updates = { scale: item.scale + scaleStep }; break;
                     case 'z': updates = { x: 0, y: 0, scale: 1 }; break; // Reset
                  }
                  if (updates) {
                      hasChanges = true;
                      return { ...item, ...updates };
                  }
             }
             return item;
        });

        if (key === 'r') {
             await handleAutoCrop();
        } else if (hasChanges) {
             updateIconAdjusterData({ items: newItems });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.selectedItemIds, data.items, data.moveStep, data.scaleStep, data.canvasWidth, data.canvasHeight, data.fitPadding, data.cropThreshold]);

  // Windows-style selection: Click=single, Shift+Click=range, Ctrl+Click=toggle
  const handleItemClick = (id: string, e: React.MouseEvent) => {
      if (e.shiftKey && lastClickedId) {
          // Shift+Click: range select from lastClickedId to current id
          const idx1 = sortedItems.findIndex(i => i.id === lastClickedId);
          const idx2 = sortedItems.findIndex(i => i.id === id);
          if (idx1 !== -1 && idx2 !== -1) {
              const start = Math.min(idx1, idx2);
              const end = Math.max(idx1, idx2);
              const rangeIds = sortedItems.slice(start, end + 1).map(i => i.id);
              updateIconAdjusterData({ selectedItemIds: rangeIds });
          }
          // Don't update lastClickedId on shift-click to allow extending range
      } else if (e.ctrlKey || e.metaKey) {
          // Ctrl+Click: toggle individual item
          if (data.selectedItemIds.includes(id)) {
              updateIconAdjusterData({ selectedItemIds: data.selectedItemIds.filter(sid => sid !== id) });
          } else {
              updateIconAdjusterData({ selectedItemIds: [...data.selectedItemIds, id] });
          }
          setLastClickedId(id);
      } else {
          // Plain click: select only this item
          updateIconAdjusterData({ selectedItemIds: [id] });
          setLastClickedId(id);
      }
  };

  const isItemSelected = (id: string) => {
      return data.selectedItemIds.includes(id);
  };

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const renderItemToCanvas = (item: IconItem, ctx: CanvasRenderingContext2D) => {
      return new Promise<void>(async (resolve) => {
          const loadImg = (src: string) => new Promise<HTMLImageElement | null>((resolve) => {
              const img = new Image();
              img.crossOrigin = "Anonymous";
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
              img.src = src;
          });

          ctx.clearRect(0, 0, data.canvasWidth, data.canvasHeight);
          
          if (data.background === 'white') {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, data.canvasWidth, data.canvasHeight);
          } else if (data.background === 'black') {
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, data.canvasWidth, data.canvasHeight);
          } else if (data.background === 'custom') {
              ctx.fillStyle = data.backgroundColor;
              ctx.fillRect(0, 0, data.canvasWidth, data.canvasHeight);
          }

          try {
              const [img, overlayImg] = await Promise.all([
                  loadImg(item.src),
                  item.overlay ? loadImg(item.overlay.src) : Promise.resolve(null)
              ]);

              if (!img) { resolve(); return; }

              const centerX = data.canvasWidth / 2 + item.x;
              const centerY = data.canvasHeight / 2 + item.y;
              const dw = img.naturalWidth * item.scale;
              const dh = img.naturalHeight * item.scale;
              const dx = centerX - dw / 2;
              const dy = centerY - dh / 2;

              if (data.maskEnabled) {
                   const inset = data.maskInset || 0;
                   const mx = inset;
                   const my = inset;
                   const mw = data.canvasWidth - (inset * 2);
                   const mh = data.canvasHeight - (inset * 2);

                   if (mw > 0 && mh > 0) {
                      const offCanvas = document.createElement('canvas');
                      offCanvas.width = data.canvasWidth;
                      offCanvas.height = data.canvasHeight;
                      const offCtx = offCanvas.getContext('2d');
                      
                      if (offCtx) {
                           // Draw Stroke 2 (Outer)
                           if (data.stroke2Enabled && data.stroke2Thickness > 0) {
                               offCtx.save();
                               const thick = data.stroke2Thickness;
                               offCtx.shadowColor = data.stroke2Color;
                               offCtx.shadowBlur = Math.max(data.stroke2Blur || 0, 2);
                               for (let r = thick; r >= 1; r -= 2) {
                                   const steps = Math.max(8, Math.ceil(Math.PI * r));
                                   for (let i = 0; i < steps; i++) {
                                       const angle = (i / steps) * 2 * Math.PI;
                                       offCtx.shadowOffsetX = Math.cos(angle) * r;
                                       offCtx.shadowOffsetY = Math.sin(angle) * r;
                                       offCtx.drawImage(img, dx, dy, dw, dh);
                                   }
                               }
                               offCtx.restore();
                           }

                           // Draw Stroke 1 (Inner)
                           if (data.strokeEnabled && data.strokeThickness > 0) {
                                offCtx.save();
                                const thick = data.strokeThickness;
                                offCtx.shadowColor = data.strokeColor;
                                offCtx.shadowBlur = Math.max(data.strokeBlur || 0, 2);
                                for (let r = thick; r >= 1; r -= 2) {
                                    const steps = Math.max(8, Math.ceil(Math.PI * r));
                                    for (let i = 0; i < steps; i++) {
                                        const angle = (i / steps) * 2 * Math.PI;
                                        offCtx.shadowOffsetX = Math.cos(angle) * r;
                                        offCtx.shadowOffsetY = Math.sin(angle) * r;
                                        offCtx.drawImage(img, dx, dy, dw, dh);
                                    }
                                }
                                offCtx.restore();
                           }
                           offCtx.drawImage(img, dx, dy, dw, dh);

                          // Apply Mask
                          offCtx.globalCompositeOperation = 'destination-in';
                          offCtx.fillStyle = '#000000';
                          if (data.maskFeather && data.maskFeather > 0) {
                              offCtx.filter = `blur(${data.maskFeather}px)`;
                          }
                          drawRoundedRect(offCtx, mx, my, mw, mh, data.maskRadius);
                          offCtx.fill();
                          offCtx.filter = 'none';

                          // Draw Result
                          ctx.drawImage(offCanvas, 0, 0);
                      }
                   }
              } else {
                  // Draw Stroke 2 (Outer)
                  if (data.stroke2Enabled && data.stroke2Thickness > 0) {
                      ctx.save();
                      const thick = data.stroke2Thickness;
                      ctx.shadowColor = data.stroke2Color;
                      ctx.shadowBlur = Math.max(data.stroke2Blur || 0, 2);
                      for (let r = thick; r >= 1; r -= 2) {
                          const steps = Math.max(8, Math.ceil(Math.PI * r));
                          for (let i = 0; i < steps; i++) {
                              const angle = (i / steps) * 2 * Math.PI;
                              ctx.shadowOffsetX = Math.cos(angle) * r;
                              ctx.shadowOffsetY = Math.sin(angle) * r;
                              ctx.drawImage(img, dx, dy, dw, dh);
                          }
                      }
                      ctx.restore();
                  }

                  // Draw Stroke 1 (Inner)
                  if (data.strokeEnabled && data.strokeThickness > 0) {
                      ctx.save();
                      const thick = data.strokeThickness;
                      ctx.shadowColor = data.strokeColor;
                      ctx.shadowBlur = Math.max(data.strokeBlur || 0, 2);
                      for (let r = thick; r >= 1; r -= 2) {
                          const steps = Math.max(8, Math.ceil(Math.PI * r));
                          for (let i = 0; i < steps; i++) {
                              const angle = (i / steps) * 2 * Math.PI;
                              ctx.shadowOffsetX = Math.cos(angle) * r;
                              ctx.shadowOffsetY = Math.sin(angle) * r;
                              ctx.drawImage(img, dx, dy, dw, dh);
                          }
                      }
                      ctx.restore();
                  }
                  ctx.drawImage(img, dx, dy, dw, dh);
              }

              if (overlayImg && item.overlay) {
                  ctx.save();
                  ctx.translate(data.canvasWidth / 2, data.canvasHeight / 2);
                  ctx.translate(item.overlay.x, item.overlay.y);
                  ctx.rotate((item.overlay.rotation || 0) * Math.PI / 180);
                  ctx.scale(item.overlay.scale, item.overlay.scale);
                  ctx.drawImage(overlayImg, -overlayImg.naturalWidth / 2, -overlayImg.naturalHeight / 2);
                  ctx.restore();
              }
              resolve();
          } catch (e) { resolve(); }
      });
  };

  const handleSaveZip = async () => {
      const zip = new JSZip();
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = data.canvasWidth;
      tempCanvas.height = data.canvasHeight;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      for (const item of data.items) {
          await renderItemToCanvas(item, ctx);
          const base64Data = tempCanvas.toDataURL('image/png').split(',')[1];
          const originalName = item.file.name.replace(/\.[^/.]+$/, "");
          zip.file(`${originalName}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      
      let fileName = zipName.trim();
      if (!fileName) {
          fileName = "icon_creator.zip";
      } else {
          if (!fileName.toLowerCase().endsWith('.zip')) {
              fileName += ".zip";
          }
      }

      link.download = fileName;
      link.click();
  };

  const handleClearAll = () => {
      updateIconAdjusterData({ items: [], selectedItemIds: [] });
  };

  const gridPercent = Math.round(((11 - data.gridColumns) / 9) * 100);

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden animate-fade-in-up">
      <AdjusterControlPanel
        data={data}
        t={t}
        updateIconAdjusterData={updateIconAdjusterData}
        updateIconItem={updateIconItem}
        fileInputRef={fileInputRef}
        overlayInputRef={overlayInputRef}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        isDraggingOverlay={isDraggingOverlay}
        setIsDraggingOverlay={setIsDraggingOverlay}
        zipName={zipName}
        setZipName={setZipName}
        overlayOriginalSize={overlayOriginalSize}
        primarySelectedItem={primarySelectedItem}
        handleIconUpload={handleIconUpload}
        handleOverlayUpload={handleOverlayUpload}
        removeOverlay={removeOverlay}
        updateOverlayProp={updateOverlayProp}
        handleSaveZip={handleSaveZip}
        handleClearAll={handleClearAll}
        getTargetIds={getTargetIds}
        setShowSettings={setShowSettings}
        handleAutoCrop={handleAutoCrop}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdjusterToolbar
          data={data}
          t={t}
          updateIconAdjusterData={updateIconAdjusterData}
          gridPercent={gridPercent}
          zipName={zipName}
          setZipName={setZipName}
          handleSaveZip={handleSaveZip}
          handleClearAll={handleClearAll}
        />

        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
          {data.items.length === 0 ? (
            <div 
              className={`h-full flex items-center justify-center flex-col gap-6 animate-fadeIn rounded-3xl transition-all cursor-pointer border-4 border-dashed ${
                isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-blue-500/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation(); setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleIconUpload(e.dataTransfer.files);
              }}
            >
              <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden"
                onChange={(e) => e.target.files && handleIconUpload(e.target.files)} />
              <div className={`w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl flex items-center justify-center shadow-2xl border border-zinc-700/30 transition-transform ${isDragging ? 'scale-110' : ''}`}>
                <UploadIcon className={`w-10 h-10 ${isDragging ? 'text-blue-400 opacity-100' : 'text-zinc-500 opacity-50'}`} />
              </div>
              <div className="text-center">
                <p className={`text-xl font-bold ${isDragging ? 'text-blue-300' : 'text-zinc-300'}`}>Start your project</p>
                <p className="text-sm text-zinc-500 mt-1">Upload images to begin adjusting</p>
                <p className="text-xs text-zinc-600 mt-2">(Drag & drop or click here)</p>
              </div>
            </div>
          ) : (
            <div
              className="grid gap-8 pb-32"
              style={{
                gridTemplateColumns: `repeat(${data.gridColumns || 5}, minmax(0, 1fr))`,
              }}
            >
              {sortedItems.map((item) => (
                <SingleIconCanvas
                  key={item.id}
                  item={item}
                  data={data}
                  isSelected={isItemSelected(item.id)}
                  onSelect={(e) => handleItemClick(item.id, e)}
                  onDelete={() => {
                    const newItems = data.items.filter((i) => i.id !== item.id);
                    updateIconAdjusterData({
                      items: newItems,
                      selectedItemIds: data.selectedItemIds.filter((sid) => sid !== item.id),
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/60 bg-zinc-950/50">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-zinc-400">⚙️</span> {t.iconAdjuster.controlsTitle || "Controls Setting"}
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white transition p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 flex justify-between">
                  <span>{t.iconAdjuster.cropThreshold || "Crop Threshold"}</span>
                  <span className="text-teal-400 font-mono">{data.cropThreshold}</span>
                </label>
                <input type="range" min="0" max="255" value={data.cropThreshold} onChange={(e) => updateIconAdjusterData({ cropThreshold: parseInt(e.target.value) })} className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-teal-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 flex justify-between">
                  <span>{t.iconAdjuster.moveStep || "Move Step"}</span>
                  <span className="text-blue-400 font-mono">{data.moveStep}px</span>
                </label>
                <input type="range" min="1" max="50" value={data.moveStep} onChange={(e) => updateIconAdjusterData({ moveStep: parseInt(e.target.value) })} className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 flex justify-between">
                  <span>{t.iconAdjuster.scaleStep || "Scale Step"}</span>
                  <span className="text-blue-400 font-mono">{data.scaleStep}</span>
                </label>
                <input type="range" min="0.01" max="1" step="0.01" value={data.scaleStep} onChange={(e) => updateIconAdjusterData({ scaleStep: parseFloat(e.target.value) })} className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500" />
              </div>
            </div>
            <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/30 flex justify-end">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconAdjuster;
