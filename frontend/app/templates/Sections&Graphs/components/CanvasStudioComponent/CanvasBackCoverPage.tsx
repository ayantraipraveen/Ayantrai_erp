"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Globe,
  Mail,
  MapPin,
  ShieldCheck,
  BarChart3,
  Users,
  Leaf,
  Cpu,
  Cloud,
  TrendingUp,
  HardHat,
  ArrowRight,
  Scan,
  Heart,
  Settings,
  Edit3,
} from "lucide-react";
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
    setEditing({ field, value: String(data[field] ?? "") });
  };

  const commitEdit = () => {
    if (!editing) return;
    onUpdate?.({ [editing.field]: editing.value });
    setEditing(null);
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const val = (field: keyof BackCoverData) =>
    editing?.field === field ? editing.value : data[field];

  const EditableText = ({
    field,
    className = "",
    placeholder = "",
    multiline = false,
    as = "span",
    style,
  }: {
    field: keyof BackCoverData;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
    as?: "span" | "div" | "h1" | "p";
    style?: React.CSSProperties;
  }) => {
    const isEditing = editing?.field === field;
    const Tag = as;
    const currentValue = String(data[field] ?? placeholder);
    const elementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      if (isEditing && elementRef.current) {
        elementRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(elementRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, [isEditing]);

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
      if (!isEditing) return;
      const text = e.currentTarget.innerText;
      onUpdate?.({ [field]: text });
      setEditing(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (elementRef.current) {
          elementRef.current.innerText = currentValue;
        }
        setEditing(null);
      } else if (!multiline && e.key === "Enter") {
        e.preventDefault();
        e.currentTarget.blur();
      } else if (multiline && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.currentTarget.blur();
      }
    };

    return (
      <Tag
        ref={elementRef as any}
        contentEditable={isEditing && !activeIsPreview}
        suppressContentEditableWarning
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!activeIsPreview) startEdit(field);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} ${
          isEditing
            ? "outline-none ring-1.5 ring-cyan-400 bg-cyan-400/10 rounded-xs px-0.5 cursor-text select-text"
            : !activeIsPreview
            ? "hover:ring-1 hover:ring-cyan-300/40 hover:bg-white/10 rounded-xs px-0.5 cursor-text"
            : ""
        }`}
        style={style}
        title={activeIsPreview ? undefined : "Double-click to edit"}
      >
        {currentValue}
      </Tag>
    );
  };

  return (
    <div
      className="relative bg-white overflow-hidden flex flex-col justify-between select-none shadow-2xl mx-auto"
      style={{
        width: "595px",
        height: "842px",
        minHeight: "842px",
        maxHeight: "842px",
        boxSizing: "border-box",
      }}
    >
      {/* ── 1. TOP HERO SECTION (Height = 356px, Worker + Sunset BG + Real Text) ── */}
      <div className="relative w-full h-[356px] flex-shrink-0 overflow-hidden text-white">
        {/* Background Image: Construction worker at sunset, cranes, dark gradient on left */}
        <Image
          src="/images/back-cover-hero-bg.jpg"
          alt="AyantrAI Workforce Safety"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Subtle Dark Navy Gradient Overlay on Left to ensure 100% text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#041228] via-[#041228]/85 via-50% to-transparent pointer-events-none" />

        {/* Content on Top of Hero */}
        <div className="relative z-10 h-full w-full p-6 flex flex-col justify-between">
          {/* Top Brand Bar: Logo & Tagline on Left, BUILD MONITOR PREVENT on Right */}
          <div className="flex items-start justify-between">
            {/* Left: Official AyantrAI Logo & Tagline */}
            <div className="flex flex-col items-start">
              <div className="relative h-6 w-36 flex items-center">
                <Image
                  src="/images/ayantrai-horizontal-dark.png"
                  alt="AyantrAI"
                  width={144}
                  height={25}
                  className="object-contain object-left max-h-6 w-auto"
                  priority
                />
              </div>
              <EditableText
                field="heroBrandTagline"
                className="text-[6.5px] font-bold tracking-[0.22em] text-[#38BDF8] uppercase mt-0.5"
                placeholder="AI FOR A SAFER TOMORROW"
              />
            </div>

            {/* Right: BUILD MONITOR PREVENT with vertical divider */}
            <div className="flex items-center gap-2.5 text-right">
              <div className="h-8 w-px bg-white/40" />
              <div className="text-[7.5px] font-bold text-slate-200 uppercase tracking-widest leading-tight text-right">
                BUILD<br />MONITOR<br />PREVENT
              </div>
            </div>
          </div>

          {/* Middle Headline Block */}
          <div className="max-w-[310px] mt-1">
            {/* Eyebrow */}
            <EditableText
              field="heroEyebrow"
              multiline
              rows={2}
              as="div"
              className="text-[7.5px] font-bold text-slate-300 tracking-[0.16em] uppercase leading-tight mb-1 whitespace-pre-line block"
              placeholder={"TECHNOLOGY THAT PROTECTS\nTHE PEOPLE WHO BUILD OUR TOMORROW"}
            />

            {/* Main Title */}
            <EditableText
              field="heroTitle"
              multiline
              rows={2}
              as="h1"
              className="text-[27px] font-black text-white leading-[0.98] tracking-tight whitespace-pre-line block"
              placeholder={"Safer People\nStronger Industries"}
            />

            {/* Description */}
            <EditableText
              field="heroDescription"
              multiline
              rows={3}
              as="p"
              className="text-[8px] text-slate-300 leading-snug mt-2 block"
              placeholder={
                "At AyantrAI, we build AI and IoT solutions that make workplaces safer, smarter and more productive. Our flagship product, Sitesafe, helps organisations ensure PPE compliance, monitor workforce safety and enable data-driven decisions across industrial environments."
              }
            />
          </div>

          {/* Bottom 4 Feature Badges (Horizontal Row) */}
          <div className="flex items-center gap-4 pt-1">
            {/* Badge 1: Prevent Accidents */}
            <div className="flex flex-col items-center text-center">
              <div className="w-6 h-6 rounded-full border border-sky-400/50 bg-sky-500/15 flex items-center justify-center text-sky-400 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[7px] font-semibold text-slate-200 mt-1 leading-tight text-center">
                Prevent<br />Accidents
              </span>
            </div>

            {/* Badge 2: Improve Productivity */}
            <div className="flex flex-col items-center text-center">
              <div className="w-6 h-6 rounded-full border border-sky-400/50 bg-sky-500/15 flex items-center justify-center text-sky-400 shadow-xs">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[7px] font-semibold text-slate-200 mt-1 leading-tight text-center">
                Improve<br />Productivity
              </span>
            </div>

            {/* Badge 3: Empower Workforce */}
            <div className="flex flex-col items-center text-center">
              <div className="w-6 h-6 rounded-full border border-sky-400/50 bg-sky-500/15 flex items-center justify-center text-sky-400 shadow-xs">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-[7px] font-semibold text-slate-200 mt-1 leading-tight text-center">
                Empower<br />Workforce
              </span>
            </div>

            {/* Badge 4: Build a Safer Tomorrow */}
            <div className="flex flex-col items-center text-center">
              <div className="w-6 h-6 rounded-full border border-sky-400/50 bg-sky-500/15 flex items-center justify-center text-sky-400 shadow-xs">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <span className="text-[7px] font-semibold text-slate-200 mt-1 leading-tight text-center">
                Build a<br />Safer Tomorrow
              </span>
            </div>
          </div>
        </div>

        {/* Script Quote on Right (Over worker/sunset) — in pure white real text */}
        <div className="absolute right-6 bottom-6 pointer-events-none select-none text-right drop-shadow-md">
          <div
            className="text-white font-bold text-[14px] leading-snug tracking-tight italic"
            style={{
              fontFamily: "'Segoe Script', 'Brush Script MT', 'Caveat', cursive, sans-serif",
              transform: "rotate(-6deg)",
              transformOrigin: "bottom right",
            }}
          >
            Every Worker<br />Returns Home Safe
            <div className="h-[2px] w-24 bg-white/80 ml-auto mt-0.5 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── 2. MIDDLE SECTION: CARDS & CAPABILITIES (Height = 265px) ── */}
      <div className="w-full h-[265px] px-6 py-3 bg-[#FAFBFD] grid grid-cols-[1.58fr_1fr] gap-3.5 items-stretch box-border">
        {/* Left Column: Our Products & Our Capabilities */}
        <div className="flex flex-col justify-between py-0.5">
          {/* Top: Our Products */}
          <div>
            <div className="text-[10px] font-black text-[#0B1546] mb-1">
              Our Products
            </div>
            <div className="bg-white rounded-xl border border-blue-100/80 shadow-xs p-2.5 flex items-center justify-between gap-2.5">
              {/* Left: Yellow 3D Helmet & Brand */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-9 h-8 relative flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/images/sitesafe-helmet-3d.png"
                    alt="Sitesafe Helmet"
                    width={38}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <EditableText
                    field="productTitle"
                    className="text-[13px] font-black text-[#0B1546] leading-none block"
                    placeholder="Sitesafe"
                  />
                  <EditableText
                    field="productTagline"
                    className="text-[6.8px] font-semibold text-slate-500 mt-0.5 block"
                    placeholder="Smart PPE. Safer Sites."
                  />
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-7 w-px bg-slate-200 flex-shrink-0" />

              {/* Center: Description */}
              <div className="flex-1 min-w-0">
                <EditableText
                  field="productDescription"
                  multiline
                  as="p"
                  className="text-[6.8px] text-slate-600 leading-snug block"
                  placeholder="AI + IoT powered safety and workforce management platform for construction, manufacturing, mining and industrial sites."
                />
              </div>

              {/* Right: Blue Arrow */}
              <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          {/* Bottom: Our Capabilities */}
          <div>
            <div className="text-[10px] font-black text-[#0B1546] mb-1">
              Our Capabilities
            </div>
            <div className="flex items-center justify-between pt-0.5">
              {/* Cap 1: AI & IoT Solutions */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="text-[#1A56DB] mb-1 flex items-center justify-center h-4">
                  <svg className="w-4 h-4 text-[#1A56DB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M2 9h2M2 15h2M20 9h2M20 15h2M9 2v2M15 2v2M9 20v2M15 20v2" />
                    <text x="12" y="14.5" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="currentColor" stroke="none">AI</text>
                  </svg>
                </div>
                <span className="text-[6.8px] font-bold text-slate-700 leading-tight">
                  AI & IoT<br />Solutions
                </span>
              </div>

              <div className="h-6 w-px bg-slate-200" />

              {/* Cap 2: Real-time Insights */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="text-[#1A56DB] mb-1 flex items-center justify-center h-4">
                  <Cloud className="w-4 h-4 stroke-[1.8]" />
                </div>
                <span className="text-[6.8px] font-bold text-slate-700 leading-tight">
                  Real-time Insights<br /><span className="text-slate-400 font-normal">(2–5 min delay)</span>
                </span>
              </div>

              <div className="h-6 w-px bg-slate-200" />

              {/* Cap 3: Scalable Platform */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="text-[#1A56DB] mb-1 flex items-center justify-center h-4">
                  <TrendingUp className="w-4 h-4 stroke-[1.8]" />
                </div>
                <span className="text-[6.8px] font-bold text-slate-700 leading-tight">
                  Scalable<br />Platform
                </span>
              </div>

              <div className="h-6 w-px bg-slate-200" />

              {/* Cap 4: Built for Real-World */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="text-[#1A56DB] mb-1 flex items-center justify-center h-4">
                  <HardHat className="w-4 h-4 stroke-[1.8]" />
                </div>
                <span className="text-[6.8px] font-bold text-slate-700 leading-tight">
                  Built for<br />Real-World Environments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: View the Full Report Online Card (Spans full height!) */}
        <div className="bg-[#EEF4FF] rounded-2xl border border-blue-200/60 p-3 flex flex-col items-center text-center justify-between shadow-xs">
          <div>
            <EditableText
              field="qrHeading"
              className="text-[10px] font-black text-[#0B1546] leading-tight block"
              placeholder="View the Full Report Online"
            />
            <EditableText
              field="qrSubtext"
              multiline
              as="p"
              className="text-[6.8px] text-slate-500 leading-tight mt-1 block max-w-[150px] mx-auto"
              placeholder="Scan the QR code to access the digital version of this report."
            />
          </div>

          {/* QR Code Graphic Card with official AyantrAI purple mark */}
          <div className="relative w-20 h-20 bg-white p-1.5 rounded-xl border border-blue-100 shadow-xs my-1">
            <Image
              src="/images/ayantrai-back-cover-qr.png"
              alt="Scan to View Report"
              fill
              priority
              className="object-contain p-0.5"
            />
          </div>

          {/* Scan Button Pill */}
          <div className="bg-[#0B1A48] text-white px-3 py-1 rounded-full flex items-center gap-1.5 text-[7px] font-bold tracking-wider uppercase shadow-xs">
            <Scan className="w-2.5 h-2.5 text-cyan-400" />
            <span>SCAN TO VIEW REPORT</span>
          </div>

          {/* Link Text */}
          <div className="text-[6.8px] text-slate-500 leading-tight">
            Or visit{" "}
            <EditableText
              field="qrUrl"
              className="text-[#1A38D6] font-bold hover:underline"
              placeholder="https://reports.sitesafe.ai"
            />
          </div>
        </div>
      </div>

      {/* ── 3. BOTTOM HERO: "THANK YOU" BANNER (Height = 153px, Mountains + Skyline + Real Text) ── */}
      <div className="relative w-full h-[153px] flex-shrink-0 overflow-hidden text-white">
        {/* Background Image: Twilight mountain ridges & glowing sunset city cranes */}
        <Image
          src="/images/back-cover-thankyou-bg.jpg"
          alt="Thank You Safety Journey"
          fill
          priority
          className="object-cover object-bottom"
        />

        {/* Subtle Dark Vignette for Crisp Contrast */}
        <div className="absolute inset-0 bg-[#0A1A3C]/40 pointer-events-none" />

        {/* Banner Content (Pure HTML/CSS Real Text) */}
        <div className="relative z-10 h-full w-full px-6 py-3.5 flex items-center justify-between">
          {/* Left: Thank You & Messages */}
          <div className="flex flex-col justify-center max-w-[250px]">
            <EditableText
              field="thankYouTitle"
              className="text-[25px] font-black text-white leading-none block"
              placeholder="Thank You"
            />
            <EditableText
              field="thankYouMessage"
              className="text-[10px] font-medium text-slate-200 mt-0.5 leading-snug block"
              placeholder="for being a part of our safety journey."
            />
            <div className="h-[2px] w-8 bg-[#1A38D6] rounded-full my-1.5" />
            <EditableText
              field="thankYouSubtext"
              multiline
              rows={2}
              className="text-[7.5px] text-slate-300 leading-tight block"
              placeholder="Together, we can create workplaces where every worker returns home safe, every day."
            />
          </div>

          {/* Center: 3 Safety Badges in Vertical Stack */}
          <div className="flex flex-col gap-1.5 pl-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-sky-400/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                <Heart className="w-2.5 h-2.5 fill-sky-300/30" />
              </div>
              <span className="text-[8px] font-semibold text-slate-200">Safer People</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-sky-400/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                <Settings className="w-2.5 h-2.5" />
              </div>
              <span className="text-[8px] font-semibold text-slate-200">Smarter Sites</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-sky-400/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                <Leaf className="w-2.5 h-2.5" />
              </div>
              <span className="text-[8px] font-semibold text-slate-200">Stronger India</span>
            </div>
          </div>

          {/* Right: INNOVATION FOR A SAFER TOMORROW + Flag Tricolor */}
          <div className="flex items-center gap-3 pr-2">
            <div className="h-14 w-px bg-white/30" />
            <div className="flex flex-col">
              <EditableText
                field="flagHeading"
                multiline
                rows={3}
                className="text-[8px] font-black uppercase tracking-widest text-white leading-tight block"
                placeholder={"INNOVATION\nFOR A SAFER\nTOMORROW"}
              />
              {/* Indian Tricolor Bar */}
              <div className="flex h-[3px] w-12 rounded-full overflow-hidden mt-2">
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#138808]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM CONTACT FOOTER (Height = 68px, Pure HTML/CSS Real Text & Icons) ── */}
      <footer className="w-full h-[68px] px-6 bg-white border-t border-slate-200/80 flex items-center justify-between flex-shrink-0 text-slate-800">
        {/* Left: Company & Websites */}
        <div className="flex flex-col justify-center min-w-0 pr-4">
          <EditableText
            field="companyName"
            className="text-[10px] font-black text-[#0B1546] tracking-wider uppercase leading-tight block"
            placeholder="AyantrAI Private Limited"
          />
          <EditableText
            field="footerTagline"
            className="text-[7.5px] font-medium text-slate-500 leading-tight mt-0.5 block"
            placeholder="People  |  Technology  |  Safer Tomorrow"
          />
        </div>

        {/* Divider 1 */}
        <div className="h-7 w-px bg-slate-200 flex-shrink-0" />

        {/* Center: Contact Info */}
        <div className="flex flex-col gap-0.5 px-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[7.5px] font-medium text-slate-600">
            <Globe className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
            <EditableText field="websiteUrl" placeholder="www.ayantrai.com" />
          </div>
          <div className="flex items-center gap-1.5 text-[7.5px] font-medium text-slate-600">
            <Mail className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
            <EditableText field="email" placeholder="hello@ayantrai.com" />
          </div>
          <div className="flex items-center gap-1.5 text-[7.5px] font-medium text-slate-600">
            <MapPin className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
            <EditableText field="location" placeholder="Noida, Uttar Pradesh, India" />
          </div>
        </div>

        {/* Divider 2 */}
        <div className="h-7 w-px bg-slate-200 flex-shrink-0" />

        {/* Right: Follow Us & Social Icons */}
        <div className="flex flex-col items-end flex-shrink-0 pl-4">
          <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Follow Us
          </span>
          <div className="flex items-center gap-1.5">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-5 h-5 rounded-md bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              title="LinkedIn"
            >
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.8v8.37h-2.8V10.9M7.86 6.54a1.63 1.63 0 0 0-1.63 1.63 1.63 1.63 0 0 0 1.63 1.63 1.63 1.63 0 0 0 1.63-1.63 1.63 1.63 0 0 0-1.63-1.63Z" />
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              title="X"
            >
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-5 h-5 rounded-md bg-[#CD201F] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              title="YouTube"
            >
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              title="Instagram"
            >
              <svg
                className="w-2.5 h-2.5 stroke-current stroke-[2.2] fill-none"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
