import { History, Plus } from "lucide-react";
import { Button } from "@/components/shared/Button";
import type { AdminPageData } from "@/lib/services/admin.service";

type AdminPageHeaderProps = {
  header: AdminPageData["adminHeader"];
  onNuevoEspacio: () => void;
  onLogs: () => void;
};

export function AdminPageHeader({ header, onNuevoEspacio, onLogs }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-geo-navy sm:text-3xl">
          {header.titulo}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-geo-muted">
          {header.subtitulo}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onLogs}
          className="border border-geo-border bg-geo-card text-geo-navy shadow-sm hover:bg-geo-surface"
        >
          <History className="h-4 w-4" strokeWidth={2} aria-hidden />
          {header.btnLogs}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          className="gap-2"
          onClick={onNuevoEspacio}
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          {header.btnNuevoEspacio}
        </Button>
      </div>
    </div>
  );
}
