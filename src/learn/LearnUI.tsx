// UI primitives for the Learn page — adapted from the Figma Make export.
// Uses lucide-react icons and public/learn/ image assets.

import type { ComponentType } from "react"
import {
  Map, Compass, Palette, SwatchBook, Type, LayoutGrid, Contrast, Boxes,
  Globe, Smartphone, Accessibility, Component, MousePointerClick, Workflow,
  Gauge, FlaskConical, Rocket, Hammer, Trophy, ShieldCheck, Columns3,
  BookMarked, TrendingUp, BookOpen, Library, Target, Bookmark, Search,
  Menu, X, Check as CheckIcon, ChevronRight, ChevronDown, ArrowRight,
  ArrowUpRight, CircleCheck, Circle, TriangleAlert, Info, Sparkles, Clock,
  Braces, Variable, Pointer, Code, Ruler, Users, Flag, BadgeCheck, Route,
  FileText, FilePen, PanelTop, Image as ImageIcon, Shapes, MousePointer2,
  Link, Layers, Keyboard, Focus, MessageSquare, Bug, Home, Blocks,
  ClipboardCheck, Monitor, PanelsTopLeft, Brush, ToggleLeft, Wrench,
  type LucideProps,
} from "lucide-react"

const registry: Record<string, ComponentType<LucideProps>> = {
  Map, Compass, Palette, SwatchBook, Type, LayoutGrid, Contrast, Boxes,
  Globe, Smartphone, Accessibility, Component, MousePointerClick, Workflow,
  Gauge, FlaskConical, Rocket, Hammer, Trophy, ShieldCheck, Columns3,
  BookMarked, TrendingUp, BookOpen, Library, Target, Bookmark, Search,
  Menu, X, ChevronRight, ChevronDown, ArrowRight, ArrowUpRight, CircleCheck,
  Circle, TriangleAlert, Info, Sparkles, Clock, Braces, Variable, Pointer,
  Code, Ruler, Users, Flag, BadgeCheck, Route, FileText, FilePen, PanelTop,
  Image: ImageIcon, Shapes, MousePointer2: MousePointer2, Link, Layers,
  Keyboard, Focus, MessageSquare, Bug, Home, Blocks, ClipboardCheck, Monitor,
  PanelsTopLeft, Brush, ToggleLeft, Wrench,
}

export function Icon({
  name,
  className = "",
  strokeWidth = 1.75,
}: {
  name: string
  className?: string
  strokeWidth?: number
}) {
  const Cmp = registry[name] ?? Boxes
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden="true" />
}

export function Check({ className = "" }: { className?: string }) {
  return <CheckIcon className={className} strokeWidth={2.5} aria-hidden="true" />
}

export function Logo({ className = "", markOnly = false }: { className?: string; markOnly?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src="/learn/Vector_2x.png" alt="" className="h-7 w-auto" />
      {!markOnly && <img src="/learn/HueSet_2x.png" alt="HueSet" className="h-[18px] w-auto" />}
    </div>
  )
}
