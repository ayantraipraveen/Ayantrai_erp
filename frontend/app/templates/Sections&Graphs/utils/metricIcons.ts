import React from "react";
import {
  // Safety & Compliance
  Shield,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  HardHat,
  Lock,
  Unlock,
  Key,
  Eye,
  CheckCircle2,
  // KPI & Analytics
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  BarChart3,
  PieChart,
  LineChart,
  Percent,
  DollarSign,
  Target,
  Award,
  Sparkles,
  // Time & Operations
  Clock,
  Timer,
  Gauge,
  History,
  Calendar,
  Zap,
  Flame,
  Cpu,
  Layers,
  Settings,
  Wrench,
  // People & Site
  User,
  Users,
  UserCheck,
  UserPlus,
  Building,
  Building2,
  Factory,
  Truck,
  Briefcase,
  // Status, Health & System
  Package,
  Box,
  FileText,
  CheckSquare,
  Bell,
  Sun,
  Moon,
  Compass,
  MapPin,
  Search,
  Share2,
  Tag,
  Wifi,
  Battery,
  Terminal,
  HeartPulse,
  Heart,
  Lightbulb,
  ThumbsUp,
  Star,
} from "lucide-react";

export interface MetricIconOption {
  id: string;
  label: string;
  category: "Safety" | "KPI" | "Operations" | "People" | "General";
  icon: React.ElementType;
}

export const DYNAMIC_METRIC_ICONS: MetricIconOption[] = [
  // Safety
  { id: "Shield", label: "Shield", category: "Safety", icon: Shield },
  { id: "ShieldCheck", label: "Shield Check", category: "Safety", icon: ShieldCheck },
  { id: "HardHat", label: "Hard Hat", category: "Safety", icon: HardHat },
  { id: "AlertTriangle", label: "Warning", category: "Safety", icon: AlertTriangle },
  { id: "AlertCircle", label: "Alert", category: "Safety", icon: AlertCircle },
  { id: "Lock", label: "Lock", category: "Safety", icon: Lock },
  { id: "Unlock", label: "Unlock", category: "Safety", icon: Unlock },
  { id: "Key", label: "Key", category: "Safety", icon: Key },
  { id: "Eye", label: "Vision", category: "Safety", icon: Eye },
  { id: "CheckCircle2", label: "Verified", category: "Safety", icon: CheckCircle2 },

  // KPI & Analytics
  { id: "TrendingUp", label: "Trend Up", category: "KPI", icon: TrendingUp },
  { id: "TrendingDown", label: "Trend Down", category: "KPI", icon: TrendingDown },
  { id: "Activity", label: "Activity", category: "KPI", icon: Activity },
  { id: "Target", label: "Target", category: "KPI", icon: Target },
  { id: "Award", label: "Award", category: "KPI", icon: Award },
  { id: "Sparkles", label: "Highlight", category: "KPI", icon: Sparkles },
  { id: "BarChart2", label: "Bar Chart", category: "KPI", icon: BarChart2 },
  { id: "BarChart3", label: "Columns", category: "KPI", icon: BarChart3 },
  { id: "PieChart", label: "Pie Chart", category: "KPI", icon: PieChart },
  { id: "LineChart", label: "Line Chart", category: "KPI", icon: LineChart },
  { id: "Percent", label: "Percent", category: "KPI", icon: Percent },
  { id: "DollarSign", label: "Financial", category: "KPI", icon: DollarSign },

  // Operations
  { id: "Clock", label: "Clock", category: "Operations", icon: Clock },
  { id: "Timer", label: "Timer", category: "Operations", icon: Timer },
  { id: "Gauge", label: "Speed Gauge", category: "Operations", icon: Gauge },
  { id: "Zap", label: "Fast / Zap", category: "Operations", icon: Zap },
  { id: "Flame", label: "Flame / Fire", category: "Operations", icon: Flame },
  { id: "History", label: "History", category: "Operations", icon: History },
  { id: "Calendar", label: "Calendar", category: "Operations", icon: Calendar },
  { id: "Cpu", label: "Telemetry CPU", category: "Operations", icon: Cpu },
  { id: "Layers", label: "Layers", category: "Operations", icon: Layers },
  { id: "Settings", label: "Settings", category: "Operations", icon: Settings },
  { id: "Wrench", label: "Maintenance", category: "Operations", icon: Wrench },

  // People & Site
  { id: "User", label: "Single Worker", category: "People", icon: User },
  { id: "Users", label: "Team / Users", category: "People", icon: Users },
  { id: "UserCheck", label: "User Check", category: "People", icon: UserCheck },
  { id: "UserPlus", label: "New User", category: "People", icon: UserPlus },
  { id: "Building", label: "Building", category: "People", icon: Building },
  { id: "Building2", label: "Site / HQ", category: "People", icon: Building2 },
  { id: "Factory", label: "Plant / Factory", category: "People", icon: Factory },
  { id: "Truck", label: "Fleet / Logistics", category: "People", icon: Truck },
  { id: "Briefcase", label: "Executive", category: "People", icon: Briefcase },

  // General & System
  { id: "Package", label: "Package", category: "General", icon: Package },
  { id: "Box", label: "Inventory Box", category: "General", icon: Box },
  { id: "FileText", label: "Report Document", category: "General", icon: FileText },
  { id: "CheckSquare", label: "Audit Task", category: "General", icon: CheckSquare },
  { id: "Bell", label: "Notification", category: "General", icon: Bell },
  { id: "Sun", label: "Day Shift", category: "General", icon: Sun },
  { id: "Moon", label: "Night Shift", category: "General", icon: Moon },
  { id: "Compass", label: "Location", category: "General", icon: Compass },
  { id: "MapPin", label: "Geo Station", category: "General", icon: MapPin },
  { id: "Search", label: "Inspection", category: "General", icon: Search },
  { id: "Share2", label: "Integration", category: "General", icon: Share2 },
  { id: "Tag", label: "Asset Tag", category: "General", icon: Tag },
  { id: "Wifi", label: "IoT Online", category: "General", icon: Wifi },
  { id: "Battery", label: "Battery Level", category: "General", icon: Battery },
  { id: "Terminal", label: "System Console", category: "General", icon: Terminal },
  { id: "HeartPulse", label: "Health Vitals", category: "General", icon: HeartPulse },
  { id: "Heart", label: "Wellness", category: "General", icon: Heart },
  { id: "Lightbulb", label: "Insight", category: "General", icon: Lightbulb },
  { id: "ThumbsUp", label: "Approved", category: "General", icon: ThumbsUp },
  { id: "Star", label: "Priority Star", category: "General", icon: Star },
];

export const DYNAMIC_METRIC_ICON_MAP: Record<string, React.ElementType> = DYNAMIC_METRIC_ICONS.reduce(
  (acc, item) => {
    acc[item.id] = item.icon;
    return acc;
  },
  {} as Record<string, React.ElementType>
);

export function getMetricIconComponent(name?: string): React.ElementType {
  if (!name) return Activity;
  return DYNAMIC_METRIC_ICON_MAP[name] || Activity;
}
