import React from 'react';
import { IconAdjusterData, IconItem } from '../../../types';
import { CloseIcon, FileIcon, DeleteIcon } from '../../../components/Icons';

interface Props {
  data: IconAdjusterData;
  t: any;
  updateIconAdjusterData: (updates: Partial<IconAdjusterData>) => void;
  gridPercent: number;
  zipName: string;
  setZipName: (name: string) => void;
  handleSaveZip: () => void;
  handleClearAll: () => void;
}

export const AdjusterToolbar: React.FC<Props> = ({
  data,
  t,
  updateIconAdjusterData,
  gridPercent,
  zipName,
  setZipName,
  handleSaveZip,
  handleClearAll
}) => {
  const allSelected = data.items.length > 0 && data.selectedItemIds.length === data.items.length;
  const someSelected = data.selectedItemIds.length > 0 && data.selectedItemIds.length < data.items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      updateIconAdjusterData({ selectedItemIds: [] });
    } else {
      // Select all
      updateIconAdjusterData({ selectedItemIds: data.items.map(i => i.id) });
    }
  };

  return (
    <div className="h-14 px-4 md:px-6 border-b border-zinc-800/50 flex items-center gap-3 shrink-0 bg-zinc-900/30">
      {/* Select All Checkbox + Item Count */}
      <div className="flex items-center gap-2 shrink-0">
        {data.items.length > 0 && (
          <label className="flex items-center gap-1.5 cursor-pointer group select-none" title="Select All (Ctrl+A)">
            <div
              onClick={handleSelectAll}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                allSelected
                  ? 'bg-indigo-500 border-indigo-500'
                  : someSelected
                  ? 'bg-indigo-500/30 border-indigo-500'
                  : 'border-zinc-600 hover:border-zinc-400 bg-transparent'
              }`}
            >
              {allSelected && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {someSelected && !allSelected && (
                <div className="w-2 h-0.5 bg-white rounded-full" />
              )}
            </div>
          </label>
        )}
        <div className="flex items-center gap-1.5 bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Items</span>
          <span className="text-xs text-white font-bold">{data.items.length}</span>
          {data.selectedItemIds.length > 0 && (
            <span className="text-[10px] text-indigo-400 font-bold ml-1">
              ({data.selectedItemIds.length} selected)
            </span>
          )}
        </div>
      </div>

      {/* Search Bar - center, flexible */}
      <div className="flex-1 max-w-xs shrink-0">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <span className="text-zinc-500 group-focus-within:text-blue-400 transition-colors text-xs">🔍</span>
          </div>
          <input
            type="text"
            value={data.searchTerm}
            onChange={(e) => updateIconAdjusterData({ searchTerm: e.target.value })}
            placeholder={t.iconAdjuster.searchPlaceholder}
            className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-full py-1.5 pl-8 pr-3 text-[10px] text-zinc-300 focus:border-blue-500/50 focus:bg-zinc-950 outline-none transition-all placeholder-zinc-600"
          />
          {data.searchTerm && (
            <button
              onClick={() => updateIconAdjusterData({ searchTerm: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <CloseIcon className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sort - compact */}
      <select
        value={data.sortOrder}
        onChange={(e) => updateIconAdjusterData({ sortOrder: e.target.value as any })}
        className="bg-zinc-950/50 border border-zinc-800/50 rounded-full px-3 py-1.5 text-[10px] font-bold text-zinc-300 outline-none cursor-pointer hover:text-white transition backdrop-blur-md shrink-0"
      >
        <option value="original" className="bg-zinc-900">{t.iconAdjuster.sortOriginal}</option>
        <option value="name_asc" className="bg-zinc-900">{t.iconAdjuster.sortNameAsc}</option>
        <option value="name_desc" className="bg-zinc-900">{t.iconAdjuster.sortNameDesc}</option>
        <option value="newest" className="bg-zinc-900">{t.iconAdjuster.sortNewest}</option>
        <option value="oldest" className="bg-zinc-900">{t.iconAdjuster.sortOldest}</option>
      </select>

      {/* Grid Zoom - compact */}
      <div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-800/50 backdrop-blur-md shrink-0">
        <span className="text-[10px] text-zinc-500" title="Zoom">🔍</span>
        <input
          type="range"
          min="2"
          max="10"
          step="1"
          value={12 - (data.gridColumns || 5)}
          onChange={(e) => updateIconAdjusterData({ gridColumns: 12 - parseInt(e.target.value) })}
          className="w-16 md:w-20 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-[10px] font-mono text-blue-400 w-6 text-right">{gridPercent}%</span>
      </div>

      {/* Export Section (moved from bottom left) */}
      <div className="flex-1 flex justify-end items-center gap-2">
        <input 
          type="text" 
          value={zipName} 
          onChange={(e) => setZipName(e.target.value)} 
          placeholder={t.iconAdjuster.zipNamePlaceholder}
          className="w-24 md:w-32 bg-zinc-950/50 border border-zinc-800/50 rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 focus:border-teal-500/50 outline-none placeholder-zinc-600 transition" 
        />
        <button 
          onClick={handleSaveZip} 
          disabled={data.items.length === 0}
          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg shadow-teal-900/20 transition flex items-center justify-center gap-1.5 text-[10px]"
        >
          <FileIcon className="w-3 h-3" /> {t.iconAdjuster.saveZip}
        </button>
        {data.items.length > 0 && (
          <button 
            type="button" 
            onClick={handleClearAll}
            className="px-2 py-1.5 border border-red-900/50 text-red-400 hover:bg-red-900/20 rounded-lg text-[10px] font-medium transition flex items-center justify-center gap-1"
            title={t.iconAdjuster.clearAll}
          >
            <DeleteIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

