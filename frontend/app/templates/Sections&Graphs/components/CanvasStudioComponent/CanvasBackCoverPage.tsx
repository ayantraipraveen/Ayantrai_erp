"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Globe, Mail, MapPin,Edit3, CheckCircle } from "lucide-react";
import {
  BackCoverData,
  DEFAULT_BACK_COVER_DATA,
} from "@/lib/redux/types/reportModuleTypes";

export interface CanvasBackCoverPageProps {
  backCoverData?: Partial<BackCoverData>;
  activeIsPreview?: boolean;
  onUpdate?: (data: Partial<BackCoverData>) => void;
}

interface EditingField {
  field: keyof BackCoverData;
  value: string;
}

export function CanvasBackCoverPage({
  backCoverData,
  activeIsPreview = false,
  onUpdate,
}: CanvasBackCoverPageProps) {
  const data: BackCoverData = { ...DEFAULT_BACK_COVER_DATA, ...backCoverData };
  const [editing, setEditing] = useState<EditingField | null>(null);

  const startEdit = (field: keyof BackCoverData) => {
    if (activeIsPreview) return;
    setEditing({ field, value: data[field] });
  };

  const commitEdit = () => {
    if (!editing) return;
    onUpdate?.({ [editing.field]: editing.value });
    setEditing(null);
  };

  const val = (field: keyof BackCoverData) =>
    editing?.field === field ? editing.value : data[field];

  const EditableText = ({
    field,
    className,
    placeholder,
    multiline = false,
  }: {
    field: keyof BackCoverData;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
  }) => {
    const isActive = editing?.field === field;
    if (isActive) {
      return multiline ? (
        <textarea
          autoFocus
          rows={2}
          value={editing!.value}
          onChange={(e) => setEditing({ field, value: e.target.value })}
          onBlur={commitEdit}
          className={`bg-white/10 border border-white/30 rounded px-1 outline-none resize-none w-full ${className}`}
          placeholder={placeholder}
        />
      ) : (
        <input
          autoFocus
          value={editing!.value}
          onChange={(e) => setEditing({ field, value: e.target.value })}
          onBlur={commitEdit}
          className={`bg-white/10 border border-white/30 rounded px-1 outline-none w-full ${className}`}
          placeholder={placeholder}
        />
      );
    }
    return (
      <span
        className={`${!activeIsPreview ? "hover:bg-white/10 rounded px-0.5 cursor-text transition-colors" : ""} ${className}`}
        onDoubleClick={() => startEdit(field)}
        title={activeIsPreview ? undefined : "Double-click to edit"}
      >
        {val(field) || placeholder}
      </span>
    );
  };

  const bullets = ["Safer People", "Smarter Sites", "Stronger India"];

  return (
    <div
      className="relative bg-white overflow-hidden flex flex-col select-none"
      style={{ width: "595px", minHeight: "842px" }}
    >
      {/* ── DARK TOP BAND ── */}
      <div
        className="relative bg-[#0f2044] text-white flex-1 overflow-hidden"
        style={{ minHeight: "520px", padding: "36px 32px 28px" }}
      >
        {/* Background image */}
        <Image
          src="/logo-stacked.png"
          alt="bg"
          fill
          className="object-cover opacity-10"
        />

        {/* Wave bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-white"
          style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }}
        />

        {/* Content */}
        <div className="relative z-10 flex gap-6 h-full">
          {/* LEFT — Thank You + contact */}
          <div className="flex-1 flex flex-col">
            {/* Thank You */}
            <div className="mb-6">
              <div className="text-[8px] font-mono text-white/30 tracking-widest uppercase mb-2">
                AyantrAI&nbsp;|&nbsp;Sitesafe
              </div>
              <EditableText
                field="thankYouTitle"
                className="text-[38px] font-black text-white leading-none block"
                placeholder="Thank You"
              />
              <div className="w-10 h-0.5 bg-[#1836a0] mt-2 mb-3" />
              <EditableText
                field="thankYouMessage"
                multiline
                className="text-[12px] font-medium text-white/70 leading-relaxed"
                placeholder="for being a part of our safety journey."
              />
            </div>

            {/* Together message */}
            <div className="mt-auto mb-4 text-[10px] text-white/50 leading-relaxed max-w-[260px]">
              Together, we can create workplaces where every worker returns home safe, every day.
            </div>

            {/* Bullet pills */}
            <div className="flex flex-col gap-1.5">
              {bullets.map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#4a90e2] flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-white/70">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Innovation box */}
          <div
            className="flex-shrink-0 bg-white/10 border border-white/20 rounded-xl flex flex-col items-center justify-center text-center"
            style={{ width: 130, padding: "20px 14px" }}
          >
            <div className="w-8 h-0.5 bg-[#4a90e2] mb-3" />
            <div className="text-[9px] font-black text-white uppercase tracking-widest leading-tight">
              INNOVATION<br />FOR A SAFER<br />TOMORROW
            </div>
            <div className="w-8 h-0.5 bg-[#4a90e2] mt-3" />
            <div className="mt-3 text-[7px] text-white/40 font-mono tracking-wider">
              AYANTRAI.COM
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTACT FOOTER ── */}
      <div
        className="bg-white border-t border-slate-100"
        style={{ padding: "14px 32px" }}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Company */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/logo.png" alt="AyantrAI" width={64} height={22} className="object-contain" />
            </div>
            <EditableText
              field="companyName"
              className="text-[8px] font-black text-[#0f2044] uppercase tracking-widest block"
              placeholder="AyantrAI Private Limited"
            />
            <div className="text-[6.5px] text-slate-400 mt-0.5">People | Technology | Safer Tomorrow</div>
          </div>

          {/* Contact details */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Globe className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
              <EditableText
                field="websiteUrl"
                className="text-[7px] text-slate-500"
                placeholder="www.ayantrai.com"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
              <EditableText
                field="email"
                className="text-[7px] text-slate-500"
                placeholder="hello@ayantrai.com"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
              <EditableText
                field="location"
                className="text-[7px] text-slate-500"
                placeholder="Noida, Uttar Pradesh, India"
              />
            </div>
          </div>

          {/* Follow Us */}
          <div className="flex-shrink-0 text-right">
            <div className="text-[7px] text-slate-400 mb-1.5">Follow Us</div>
            <div className="flex items-center gap-1.5">
              {["in", "𝕏", "▶"].map((s) => (
                <div
                  key={s}
                  className="w-5 h-5 rounded-full bg-[#0f2044] text-white flex items-center justify-center text-[6px] font-bold"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit badge */}
      {!activeIsPreview && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white/95 backdrop-blur text-[#0f2044] text-[8px] font-bold px-2.5 py-1 rounded-full shadow border border-slate-200 pointer-events-none">
          <Edit3 className="w-2.5 h-2.5" />
          BACK COVER — double-click any text to edit
        </div>
      )}
    </div>
  );
}
