"use client";

import React from "react";
import {
  X,
  Plus,
  Trash2,
  Shield,
  Clock,
  Zap,
  Users,
  Activity,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Eye,
  Flame,
  CheckCircle2,
  HeartPulse,
  Target,
  Award,
  BarChart2,
} from "lucide-react";
import {
  LibraryMetricCard,
  LibraryKeyInsightItem,
  CanvasBadgeStrip,
  CanvasBadgeItem,
  PaletteRamp,
} from "@/lib/redux/slices/reportModuleSlice";
import { BADGE_COLOR_PALETTES, BADGE_AVAILABLE_ICONS } from "./CanvasBlockRenderer";
import { PALETTE_RAMPS } from "./constants/chartTypes";

// ================= MODAL 1: EDIT SECTION HEADER =================
interface EditSectionHeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  eyebrow: string;
  setEyebrow: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onSave: () => void;
}

export function EditSectionHeaderModal({
  isOpen,
  onClose,
  name,
  setName,
  eyebrow,
  setEyebrow,
  description,
  setDescription,
  onSave,
}: EditSectionHeaderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold">Edit Section Header</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Section Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Eyebrow Label (Small-caps report tag)
            </label>
            <input
              type="text"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono uppercase focus:outline-none focus:border-[#9D61FF]"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Description / Audit Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-xl bg-[#9D61FF] text-white text-xs font-bold cursor-pointer"
          >
            Save Header
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= MODAL 2: ADD / EDIT METRIC CARD =================
interface MetricCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCard: LibraryMetricCard | null;
  label: string;
  setLabel: (v: string) => void;
  value: string;
  setValue: (v: string) => void;
  tint: PaletteRamp;
  setTint: (v: PaletteRamp) => void;
  trendDir: "up" | "down" | "no-change";
  setTrendDir: (v: "up" | "down" | "no-change") => void;
  trendVal: string;
  setTrendVal: (v: string) => void;
  onSave: () => void;
}

export function MetricCardModal({
  isOpen,
  onClose,
  editingCard,
  label,
  setLabel,
  value,
  setValue,
  tint,
  setTint,
  trendDir,
  setTrendDir,
  trendVal,
  setTrendVal,
  onSave,
}: MetricCardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold">
            {editingCard ? "Edit Pastel Metric Card" : "Add Pastel Metric Card"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300">
                Card Metric Label *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Attendance Adherence"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300">
                Metric Value *
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 98.7% or 14,280 hrs"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono font-bold focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
          </div>

          {/* Pastel Color Swatches (9 Ramps) */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Card Pastel Tint (9 Harmonious Ramps)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1.5">
              {PALETTE_RAMPS.map((ramp) => (
                <button
                  key={ramp.id}
                  type="button"
                  onClick={() => setTint(ramp.id)}
                  className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    tint === ramp.id
                      ? "border-[#9D61FF] ring-2 ring-purple-500/30 font-bold"
                      : "border-slate-200 dark:border-zinc-800 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ramp.accent }}
                  />
                  <span className="text-[10px] truncate">{ramp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trend controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300">
                Trend Indicator
              </label>
              <select
                value={trendDir}
                onChange={(e) => setTrendDir(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
              >
                <option value="up">↑ Favorable / Upward Trend</option>
                <option value="down">↓ Downward Trend</option>
                <option value="no-change">— Stable / Neutral</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300">
                Trend Value / Comparison Text
              </label>
              <input
                type="text"
                value={trendVal}
                onChange={(e) => setTrendVal(e.target.value)}
                placeholder="e.g. +2.4% vs last cycle"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!label.trim() || !value.trim()}
            className="px-4 py-2 rounded-xl bg-[#9D61FF] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
          >
            Save Card
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= MODAL 3: ADD / EDIT KEY INSIGHT =================
interface KeyInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingInsight: LibraryKeyInsightItem | null;
  text: string;
  setText: (v: string) => void;
  onSave: () => void;
}

export function KeyInsightModal({
  isOpen,
  onClose,
  editingInsight,
  text,
  setText,
  onSave,
}: KeyInsightModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold">
            {editingInsight ? "Edit Key Insight Item" : "Add Key Insight Item"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Insight Sentence / Formatted Observation *
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Peak biometric check-in occurred between 08:30 AM and 08:50 AM with zero optical gate latency."
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!text.trim()}
            className="px-4 py-2 rounded-xl bg-[#9D61FF] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
          >
            Save Insight
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= MODAL 4: EDIT BADGE STRIP =================
interface BadgeStripModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeStrip: CanvasBadgeStrip | null;
  onSave: (updatedStrip: CanvasBadgeStrip) => void;
}

export function BadgeStripModal({
  isOpen,
  onClose,
  badgeStrip,
  onSave,
}: BadgeStripModalProps) {
  const [badges, setBadges] = React.useState<CanvasBadgeItem[]>([]);
  const [activeTabIdx, setActiveTabIdx] = React.useState(0);

  React.useEffect(() => {
    if (badgeStrip) {
      setBadges(JSON.parse(JSON.stringify(badgeStrip.badges)));
      setActiveTabIdx(0);
    }
  }, [badgeStrip, isOpen]);

  if (!isOpen || !badgeStrip) return null;

  const currentBadge = badges[activeTabIdx] || badges[0];

  const updateCurrentBadge = (patch: Partial<CanvasBadgeItem>) => {
    setBadges((prev) =>
      prev.map((b, idx) => (idx === activeTabIdx ? { ...b, ...patch } : b))
    );
  };

  const handleAddBadge = () => {
    if (badges.length >= 6) return;
    const colors: Array<"blue" | "green" | "purple" | "amber" | "rose" | "cyan"> = [
      "blue", "green", "purple", "amber", "rose", "cyan"
    ];
    const newB: CanvasBadgeItem = {
      id: `badge-${Date.now()}`,
      label: "New KPI Indicator",
      value: "100%",
      color: colors[badges.length % colors.length],
      icon: "Shield",
    };
    setBadges((prev) => [...prev, newB]);
    setActiveTabIdx(badges.length);
  };

  const handleDeleteBadge = (idx: number) => {
    if (badges.length <= 1) return;
    setBadges((prev) => prev.filter((_, i) => i !== idx));
    setActiveTabIdx((prev) => Math.max(0, Math.min(prev, badges.length - 2)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#9D61FF]/15 text-[#9D61FF] flex items-center justify-center font-bold text-xs">
              4B
            </div>
            <div>
              <h3 className="text-sm font-bold">Edit 4-Badge Metric Strip</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Configure all indicators or customize each single badge
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badge Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 dark:border-zinc-800">
          {badges.map((b, idx) => (
            <button
              key={b.id || idx}
              type="button"
              onClick={() => setActiveTabIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTabIdx === idx
                  ? "bg-[#9D61FF] text-white shadow-sm"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>Badge #{idx + 1}:</span>
              <span className="truncate max-w-[80px] font-mono">{b.value}</span>
            </button>
          ))}

          {badges.length < 6 && (
            <button
              type="button"
              onClick={handleAddBadge}
              className="px-2.5 py-1.5 rounded-xl border border-dashed border-[#9D61FF]/40 text-[#9D61FF] hover:bg-[#9D61FF]/10 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>

        {/* Current Active Badge Settings */}
        {currentBadge && (
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Metric Value *
                </label>
                <input
                  type="text"
                  value={currentBadge.value}
                  onChange={(e) => updateCurrentBadge({ value: e.target.value })}
                  placeholder="e.g. 98.7%, < 4m, 14k"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Badge Label / Title *
                </label>
                <input
                  type="text"
                  value={currentBadge.label}
                  onChange={(e) => updateCurrentBadge({ label: e.target.value })}
                  placeholder="e.g. Attendance, PPE Compliance"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            {/* Color Ramp */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Badge Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {BADGE_COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => updateCurrentBadge({ color: pal.id as any })}
                    className={`h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${pal.bg} ${pal.border} ${
                      currentBadge.color === pal.id ? "ring-2 ring-[#9D61FF] scale-105 shadow-sm" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${pal.dot} shadow-xs`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Grid */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Icon Symbol
              </label>
              <div className="grid grid-cols-8 gap-1.5 p-1.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 max-h-24 overflow-y-auto">
                {BADGE_AVAILABLE_ICONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = (currentBadge.icon || "Activity") === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateCurrentBadge({ icon: opt.id })}
                      className={`h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#9D61FF] text-white shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800"
                      }`}
                      title={opt.label}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delete button if > 1 badge */}
            {badges.length > 1 && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleDeleteBadge(activeTabIdx)}
                  className="text-xs text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Badge #{activeTabIdx + 1}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({
                ...badgeStrip,
                badges,
              });
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Save All Badges
          </button>
        </div>
      </div>
    </div>
  );
}
