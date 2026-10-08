import React, { useState } from "react";
import { Search } from "lucide-react";
import { DYNAMIC_METRIC_ICONS } from "../common/blockConstants";

export interface MetricIconPickerProps {
  selectedIconId?: string;
  onSelectIcon: (iconId: string) => void;
  label?: string;
}

export function MetricIconPicker({
  selectedIconId,
  onSelectIcon,
  label = "Icon Symbol",
}: MetricIconPickerProps) {
  const [iconSearch, setIconSearch] = useState("");

  const filteredIcons = iconSearch
    ? DYNAMIC_METRIC_ICONS.filter(
        (i) =>
          i.id.toLowerCase().includes(iconSearch.toLowerCase()) ||
          i.label.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : DYNAMIC_METRIC_ICONS;

  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[9px]">
          {label}
        </label>
        <div className="relative w-28">
          <Search className="w-2.5 h-2.5 text-slate-400 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            placeholder="Search icons..."
            className="w-full pl-5 pr-1.5 py-0.2 text-[9px] rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:border-[#9D61FF]"
          />
        </div>
      </div>
      <div className="grid grid-cols-10 gap-0.5 p-1 bg-slate-50 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 max-h-16 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(157,97,255,0.3)_transparent]">
        {filteredIcons.map((opt) => {
          const IconComp = opt.icon;
          const isSelected = (selectedIconId || "Shield") === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectIcon(opt.id)}
              className={`h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#9D61FF] text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-[#9D61FF]"
              }`}
              title={opt.label}
            >
              <IconComp className="w-3 h-3" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
