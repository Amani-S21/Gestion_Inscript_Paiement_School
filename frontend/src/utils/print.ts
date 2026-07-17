type PrintColumn<T> = {
  label: string;
  value: (item: T) => string | number | null | undefined;
};

export function printTable<T>(title: string, columns: PrintColumn<T>[], items: T[]) {
  const escapeHtml = (value: string | number | null | undefined) =>
    String(value ?? "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const rows = items
    .map(
      (item) =>
        `<tr>${columns.map((column) => `<td>${escapeHtml(column.value(item))}</td>`).join("")}</tr>`,
    )
    .join("");

  const popup = window.open("", "_blank", "width=1100,height=800");
  if (!popup) return;

  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 28px; }
          h1 { font-size: 22px; margin: 0 0 6px; }
          .meta { color: #64748b; margin-bottom: 22px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #102a2b; color: white; text-align: left; }
          th, td { border: 1px solid #dbe3ea; padding: 8px; vertical-align: top; }
          tr:nth-child(even) td { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Institut NENGAPETA - document généré le ${new Date().toLocaleDateString("fr-FR")}</div>
        <table>
          <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
          <tbody>${rows || `<tr><td colspan="${columns.length}">Aucune donnée.</td></tr>`}</tbody>
        </table>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}
