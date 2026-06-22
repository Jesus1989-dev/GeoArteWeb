import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Database,
  FileText,
  FlaskConical,
  HelpCircle,
  Home,
  Landmark,
  Layers,
  LifeBuoy,
  Map,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { RolPerfil } from "@/lib/data/mock/perfil";

export type NavItem = {
  label: string;
  /** Texto más corto en pantallas medianas (barra superior). */
  shortLabel?: string;
  href: string;
  icon?: LucideIcon;
};

/** Navegación principal — orden y estilo según barra superior del diseño. */
export const mainNav: NavItem[] = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Proyecto", shortLabel: "Proy.", href: "/sobre-el-proyecto", icon: Layers },
  { label: "Mapa", href: "/mapa", icon: Map },
  {
    label: "Administración",
    shortLabel: "Admin",
    href: "/admin",
    icon: Shield,
  },
  { label: "Dashboard", shortLabel: "Dash.", href: "/dashboard", icon: BarChart3 },
  { label: "Cuestionario", shortLabel: "Cuest.", href: "/cuestionario", icon: ClipboardList },
  { label: "Reportes", shortLabel: "Rep.", href: "/reportes", icon: FileText },
  {
    label: "Investigación",
    shortLabel: "Investig.",
    href: "/investigacion",
    icon: FlaskConical,
  },
  { label: "Políticas", shortLabel: "Polít.", href: "/politicas", icon: Landmark },
  { label: "Soporte", href: "/contacto", icon: LifeBuoy },
];

const ADMIN_HREF = "/admin";

/** Navegación filtrada por rol — Admin solo visible para Autoridad. */
export function getMainNavForRole(rol: RolPerfil | null | undefined): NavItem[] {
  if (rol === "autoridad") return [...mainNav];
  return mainNav.filter((item) => item.href !== ADMIN_HREF);
}

export type FooterNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const footerExplore: FooterNavItem[] = [
  { label: "Mapa GIS", href: "/mapa", icon: Map },
  { label: "Estadísticas", href: "/dashboard", icon: BarChart3 },
  { label: "Cuestionario", href: "/cuestionario", icon: ClipboardList },
  { label: "Investigación", href: "/investigacion", icon: FlaskConical },
  { label: "Recomendaciones", href: "/politicas", icon: Landmark },
];

export const footerResources: FooterNavItem[] = [
  { label: "Proyecto", href: "/sobre-el-proyecto", icon: Layers },
  { label: "Datos Abiertos (API)", href: "/contacto", icon: Database },
  { label: "Documentación", href: "/contacto", icon: BookOpen },
  { label: "Preguntas Frecuentes", href: "/contacto", icon: HelpCircle },
];
