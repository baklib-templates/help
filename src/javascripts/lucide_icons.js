import { createIcons } from "lucide"
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleX,
  Image,
  Info,
  Layers,
  LayoutGrid,
  Menu,
  Search,
  Tag,
  ThumbsUp,
  TriangleAlert,
  User,
} from "lucide"

export const lucideIcons = {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleX,
  Image,
  Info,
  Layers,
  LayoutGrid,
  Menu,
  Search,
  Tag,
  ThumbsUp,
  TriangleAlert,
  User,
}

export function initLucideIcons() {
  createIcons({ icons: lucideIcons })
}
