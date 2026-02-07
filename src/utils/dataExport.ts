interface ExportableRow {
  [key: string]: string | number | boolean | null | undefined;
}

export function exportCSV(data: ExportableRow[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          // Escape values containing commas or quotes
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(","),
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

export function exportGeoJSON(
  data: { latitude: number; longitude: number; [key: string]: unknown }[],
  filename: string,
): void {
  if (data.length === 0) return;

  const features = data.map((item) => {
    const { latitude, longitude, ...properties } = item;
    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [longitude, latitude],
      },
      properties,
    };
  });

  const geojson = {
    type: "FeatureCollection",
    features,
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
