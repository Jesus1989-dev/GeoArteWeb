import { ArrowRight, Construction } from "lucide-react";
import { siteConfig } from "@/lib/constants/site";
import { Button } from "@/components/shared/Button";

type PlaceholderPageProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export function PlaceholderPage({
  title,
  description,
  backHref = "/",
  backLabel = "Volver al inicio",
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-geo-surface text-geo-navy">
        <Construction className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-geo-navy">{title}</h1>
      <p className="mt-4 text-geo-muted">{description}</p>
      <p className="mt-2 text-sm text-geo-muted">
        Esta sección se implementará en la siguiente fase del frontend.
      </p>
      <Button href={backHref} variant="outline" className="mt-8">
        {backLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function placeholderMetadata(title: string) {
  return {
    title: `${title} | ${siteConfig.name}`,
    description: siteConfig.description,
  };
}
