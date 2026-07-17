type PaginationProps = {
  page: number;
  total: number;
  size?: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, total, size = 10, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const start = total === 0 ? 0 : (page - 1) * size + 1;
  const end = Math.min(page * size, total);

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        {start}-{end} sur {total} éléments
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-[8px] border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Précédent
        </button>
        <span className="min-w-20 text-center font-bold text-slate-700">
          Page {page}/{totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-[8px] border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
