interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const start = Math.max(2, page - delta);
    const end = Math.min(pages - 1, page + delta);

    range.push(1);
    if (start > 2) range.push('…');
    for (let i = start; i <= end; i++) range.push(i);
    if (end < pages - 1) range.push('…');
    if (pages > 1) range.push(pages);

    return range;
  };

  const btnBase = 'px-3 py-1.5 text-sm rounded-md transition-colors';
  const btnActive = 'bg-indigo-600 text-white';
  const btnInactive = 'text-slate-600 hover:bg-slate-100';
  const btnDisabled = 'text-slate-300 cursor-not-allowed';

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${btnBase} ${page <= 1 ? btnDisabled : btnInactive}`}
      >
        上一页
      </button>
      {getPageNumbers().map((p, i) =>
        typeof p === 'string' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-slate-400">
            {p}
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className={`${btnBase} ${page >= pages ? btnDisabled : btnInactive}`}
      >
        下一页
      </button>
    </div>
  );
}
