export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: "", lastName: "" };

  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: "" };
  }

  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1).trim(),
  };
}

export function joinFullName(firstName: string, lastName?: string | null): string {
  return [firstName.trim(), (lastName ?? "").trim()].filter(Boolean).join(" ");
}

export type ProfileNameSource = {
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

export function resolveProfileFullName(source: ProfileNameSource): string {
  const fromParts = joinFullName(source.first_name ?? "", source.last_name);
  if (fromParts) return fromParts;
  return (source.display_name ?? "").trim();
}

export function resolveProfileNameParts(source: ProfileNameSource): {
  firstName: string;
  lastName: string;
} {
  if ((source.first_name ?? "").trim()) {
    return {
      firstName: source.first_name!.trim(),
      lastName: (source.last_name ?? "").trim(),
    };
  }

  return splitFullName(source.display_name ?? "");
}
