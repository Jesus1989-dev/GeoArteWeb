export type EspacioSearchSuggestion = {
  id: string;
  label: string;
  subtitle: string;
  kind: "espacio" | "alcaldia";
  espacioId?: string;
};

export type EspacioSearchResponse = {
  suggestions: EspacioSearchSuggestion[];
  dataSource: "supabase" | "mock";
};
