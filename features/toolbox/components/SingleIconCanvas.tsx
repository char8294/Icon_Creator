import React, { useRef, useEffect } from 'react';
import { IconItem, IconAdjusterData } from '../../../types';
import { CloseIcon, SaveIcon } from '../../../components/Icons';

interface Props {
  item: IconItem; 
  data: IconAdjusterData; 
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

// Helper to draw rounded rectangle path
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

export const SingleIconCanvas: React.FC<Props> = ({ item, data, isSelected, onSelect, onDelete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleDownloadSingle = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = item.file.name.replace(/\.[^/.]+$/, "") + ".png";
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const loadImg = (src: string) => new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn("Failed to load image:", src);
                resolve(null);
            };
            img.src = src;
        });

        const render = async () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (data.background === 'white') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (data.background === 'black') {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (data.background === 'custom') {
                ctx.fillStyle = data.backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            try {
                const [img, overlayImg] = await Promise.all([
                    loadImg(item.src),
                    item.overlay ? loadImg(item.overlay.src) : Promise.resolve(null)
                ]);

                if (!img) return;

                const centerX = canvas.width / 2 + item.x;
                const centerY = canvas.height / 2 + item.y;
                const dw = img.naturalWidth * item.scale;
                const dh = img.naturalHeight * item.scale;
                const dx = centerX - dw / 2;
                const dy = centerY - dh / 2;

                if (data.maskEnabled) {
                     // === MASK MODE (Compositing for AA/Feather) ===
                     const inset = data.maskInset || 0;
                     const mx = inset;
                     const my = inset;
                     const mw = canvas.width - (inset * 2);
                     const mh = canvas.height - (inset * 2);

                      if (mw > 0 && mh > 0) {
                        // Create offscreen canvas for content
                        const offCanvas = document.createElement('canvas');
                        offCanvas.width = canvas.width;
                        offCanvas.height = canvas.height;
                        const offCtx = offCanvas.getContext('2d');
                        if (!offCtx) return;

                        // 1. Draw Content (Image + Strokes) to Offscreen
                        
                        // Draw Stroke 2 (Outer)
                        if (data.stroke2Enabled && data.stroke2Thickness > 0) {
                              offCtx.save();
                              const thick = data.stroke2Thickness;
                              const steps = data.stroke2Smoothness || 8;
                              offCtx.shadowColor = data.stroke2Color;
                              offCtx.shadowBlur = data.stroke2Blur || 0;
                              const offsets = [];
                              for (let i = 0; i < steps; i++) {
                                  const angle = (i / steps) * 2 * Math.PI;
                                  offsets.push([Math.cos(angle) * thick, Math.sin(angle) * thick]);
                              }
                              offsets.forEach(([ox, oy]) => {
                                 offCtx.shadowOffsetX = ox;
                                 offCtx.shadowOffsetY = oy;
                                 offCtx.drawImage(img, dx, dy, dw, dh);
                              });
                              offCtx.restore();
                        }

                        // Draw Stroke 1 (Inner)
                        if (data.strokeEnabled && data.strokeThickness > 0) {
                              offCtx.save();
                              const thick = data.strokeThickness;
                              const steps = data.strokeSmoothness || 8;
                              offCtx.shadowColor = data.strokeColor;
                              offCtx.shadowBlur = data.strokeBlur || 0;
                              const offsets = [];
                              for (let i = 0; i < steps; i++) {
                                  const angle = (i / steps) * 2 * Math.PI;
                                  offsets.push([Math.cos(angle) * thick, Math.sin(angle) * thick]);
                              }
                              offsets.forEach(([ox, oy]) => {
                                 offCtx.shadowOffsetX = ox;
                                 offCtx.shadowOffsetY = oy;
                                 offCtx.drawImage(img, dx, dy, dw, dh);
                              });
                              offCtx.restore();
                         }
                         offCtx.drawImage(img, dx, dy, dw, dh);

                        // 2. Apply Mask using Composite Operation (Destination-In)
                        offCtx.globalCompositeOperation = 'destination-in';
                        offCtx.fillStyle = '#000000';
                        
                        // Apply AA/Feather via filter
                        if (data.maskFeather && data.maskFeather > 0) {
                            offCtx.filter = `blur(${data.maskFeather}px)`;
                        }

                        drawRoundedRect(offCtx, mx, my, mw, mh, data.maskRadius);
                        offCtx.fill();
                        
                        // Reset filter
                        offCtx.filter = 'none';

                        // 3. Draw Result to Main Canvas
                        ctx.drawImage(offCanvas, 0, 0);

                        // 4. UI Guide (dashed line)
                        ctx.save();
                        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
                        ctx.lineWidth = 1.5;
                        ctx.setLineDash([5, 3]); 
                        drawRoundedRect(ctx, mx, my, mw, mh, data.maskRadius);
                        ctx.stroke();
                        ctx.restore();
                      }
                } else {
                     // === STANDARD MODE (Shadow based on alpha) ===
                    
                    // Draw Stroke 2 (Outer)
                    if (data.stroke2Enabled && data.stroke2Thickness > 0) {
                        ctx.save();
                        const thick = data.stroke2Thickness;
                        const steps = data.stroke2Smoothness || 8;
                        ctx.shadowColor = data.stroke2Color;
                        ctx.shadowBlur = data.stroke2Blur || 0;
                        const offsets = [];
                        for (let i = 0; i < steps; i++) {
                            const angle = (i / steps) * 2 * Math.PI;
                            offsets.push([Math.cos(angle) * thick, Math.sin(angle) * thick]);
                        }
                        offsets.forEach(([ox, oy]) => {
                           ctx.shadowOffsetX = ox; ctx.shadowOffsetY = oy;
                           ctx.drawImage(img, dx, dy, dw, dh);
                        });
                        ctx.restore();
                    }

                    // Draw Stroke 1 (Inner)
                    if (data.strokeEnabled && data.strokeThickness > 0) {
                        ctx.save();
                        const thick = data.strokeThickness;
                        const steps = data.strokeSmoothness || 8;
                        
                        ctx.shadowColor = data.strokeColor;
                        ctx.shadowBlur = data.strokeBlur || 0;
                        
                        const offsets = [];
                        for (let i = 0; i < steps; i++) {
                            const angle = (i / steps) * 2 * Math.PI;
                            offsets.push([Math.cos(angle) * thick, Math.sin(angle) * thick]);
                        }
                        
                        offsets.forEach(([ox, oy]) => {
                           ctx.shadowOffsetX = ox;
                           ctx.shadowOffsetY = oy;
                           ctx.drawImage(img, dx, dy, dw, dh);
                        });
                        
                        ctx.restore();
                    }
                    ctx.drawImage(img, dx, dy, dw, dh);
                }

                if (overlayImg && item.overlay) {
                    ctx.save();
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.translate(item.overlay.x, item.overlay.y);
                    ctx.rotate((item.overlay.rotation || 0) * Math.PI / 180);
                    ctx.scale(item.overlay.scale, item.overlay.scale);
                    ctx.drawImage(overlayImg, -overlayImg.naturalWidth / 2, -overlayImg.naturalHeight / 2);
                    ctx.restore();
                }

                if (data.fitPadding > 0) {
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    const p = data.fitPadding;
                    ctx.strokeRect(p, p, canvas.width - p * 2, canvas.height - p * 2);
                    ctx.restore();
                }

            } catch (e) {
                console.error("Render error", e);
            }
        };

        render();

    }, [item, data]); 

    const checkerColor = data.checkeredMode === 'light' ? '#e4e4e7' : '#1f1f22';
    const checkerBg = data.checkeredMode === 'light' ? '#ffffff' : 'transparent';

    return (
        <div 
            className={`relative group flex flex-col gap-2 p-1 border-2 rounded-xl overflow-hidden transition-all duration-300 ${isSelected ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500 scale-[1.02] bg-indigo-500/5' : 'border-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800/20'}`}
            onClick={onSelect}
        >
            <div className="relative aspect-square overflow-hidden rounded-lg">
                <canvas 
                    ref={canvasRef} 
                    width={data.canvasWidth} 
                    height={data.canvasHeight} 
                    className="w-full h-auto"
                    style={{
                        backgroundColor: data.background === 'transparent' ? checkerBg : 'transparent',
                        backgroundImage: data.background === 'transparent' ? `linear-gradient(45deg, ${checkerColor} 25%, transparent 25%), linear-gradient(-45deg, ${checkerColor} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${checkerColor} 75%), linear-gradient(-45deg, transparent 75%, ${checkerColor} 75%)` : 'none',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                    }}
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition z-10">
                    <button onClick={(e) => { e.stopPropagation(); handleDownloadSingle(); }} className="bg-black/60 hover:bg-teal-500 text-white rounded-full p-1.5 shadow-lg" title="Save image"><SaveIcon className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="bg-black/60 hover:bg-red-500 text-white rounded-full p-1.5 shadow-lg" title="Delete"><CloseIcon className="w-3.5 h-3.5" /></button>
                </div>
            </div>
            <div className={`px-2 pb-1 text-[10px] font-medium text-center truncate ${isSelected ? 'text-indigo-300' : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors duration-300`}>
                {item.file.name}
            </div>
        </div>
    );
};
