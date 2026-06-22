"use client";

import { useMemo } from "react";
import { QuickAccessCard } from "@/components/shared/QuickAccessCard";
import { useAuth } from "@/contexts/AuthProvider";
import { quickAccessIcons } from "@/lib/data/mock/home";
import type { QuickAccessItem } from "@/lib/domain/home";

const GESTION_DATOS_TITLE = "Gestión de Datos";

function isGestionDatosItem(item: QuickAccessItem): boolean {
  return item.title === GESTION_DATOS_TITLE;
}

type HomeQuickAccessProps = {
  items: QuickAccessItem[];
};

export function HomeQuickAccess({ items }: HomeQuickAccessProps) {
  const { session, ready } = useAuth();

  const visibleItems = useMemo(() => {
    const esAutoridad = ready && session?.rol === "autoridad";
    return items.filter(
      (item) => !isGestionDatosItem(item) || esAutoridad,
    );
  }, [items, ready, session?.rol]);

  return (
    <div className="space-y-3">
      {visibleItems.map((item) => (
        <QuickAccessCard
          key={item.title}
          icon={quickAccessIcons[item.iconKey]}
          title={item.title}
          description={item.description}
          href={item.href}
          highlighted={item.highlighted}
        />
      ))}
    </div>
  );
}
