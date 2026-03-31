declare module "lucide-react" {
  import type { ComponentType, SVGProps } from "react";

  export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

  export const ArrowRight: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Building2: LucideIcon;
  export const BarChart3: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronsLeft: LucideIcon;
  export const ChevronsRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Circle: LucideIcon;
  export const Clock: LucideIcon;
  export const Code: LucideIcon;
  export const Cog: LucideIcon;
  export const CreditCard: LucideIcon;
  export const Globe: LucideIcon;
  export const HeadphonesIcon: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Loader2: LucideIcon;
  export const Moon: LucideIcon;
  export const Package: LucideIcon;
  export const Play: LucideIcon;
  export const Quote: LucideIcon;
  export const Search: LucideIcon;
  export const Shield: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Sun: LucideIcon;
  export const ThumbsDown: LucideIcon;
  export const ThumbsUp: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const UserCheck: LucideIcon;
  export const Users: LucideIcon;
  export const Wrench: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;

  export const createLucideIcon: (...args: unknown[]) => LucideIcon;
  export const icons: Record<string, LucideIcon>;
  const defaultExport: Record<string, LucideIcon>;
  export default defaultExport;
}
