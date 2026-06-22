export function buildApiV1Url(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}

export function buildCurlExample(baseUrl: string, token: string): string {
  const url = buildApiV1Url(baseUrl, "/api/v1/espacios/geojson");
  return `curl -X GET "${url}" \\\n  -H "accept: application/json" \\\n  -H "Authorization: Bearer ${token}"`;
}
