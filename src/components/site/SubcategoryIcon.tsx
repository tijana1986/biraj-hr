import {
  Sparkles, Mountain, Users, Waves, Castle, Droplets, Home, Leaf,
  Crown, Palmtree, Tent, Building2, Tag,
  Briefcase, UserSearch, Hammer, Code2, Truck, GraduationCap, PartyPopper,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Sparkles, Mountain, Users, Waves, Castle, Droplets, Home, Leaf,
  Crown, Palmtree, Tent, Building2,
  Briefcase, UserSearch, Hammer, Code2, Truck, GraduationCap, PartyPopper,
  Tag,
};

export function SubcategoryIcon({
  name,
  className = "h-5 w-5",
}: {
  name?: string;
  className?: string;
}) {
  const Icon = (name && MAP[name]) || Tag;
  return <Icon className={className} aria-hidden />;
}