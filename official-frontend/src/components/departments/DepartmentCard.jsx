import { isSafeImageUrl } from '../../services/image';

const DepartmentCard = ({
  Title,
  Description,
  ImageUrl,
  heads,
  isOpen,
  onToggle,
}) => {
  const safeImageUrl = isSafeImageUrl(ImageUrl) ? ImageUrl : null;
  const title = Title || 'Untitled department';

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle?.();
    }
  };

  return (
    <div
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      className={`
        group relative w-full cursor-pointer overflow-hidden rounded-[1.7rem]
        border border-slate-200 bg-white
        shadow-[0_10px_28px_rgba(15,23,42,0.08)]
        transition-[height,transform,box-shadow,border-color] duration-300 ease-in-out
        hover:border-blue-400
        dark:border-slate-700 dark:bg-[#111827]
        dark:shadow-[0_14px_32px_rgba(0,0,0,0.25)]
        dark:hover:border-blue-500/70
        ${isOpen ? 'h-[260px] md:h-[280px]' : 'h-[75px]'}
      `}
    >
      {safeImageUrl && (
        <div
          className={`
            absolute inset-0 h-full w-full overflow-hidden
            transition-[opacity,transform] duration-500 ease-in-out
            ${isOpen ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}
          `}
        >
          <img
            src={safeImageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent" />
        </div>
      )}

      <div
        className={`
          relative z-10 flex h-full w-full flex-col justify-center px-5
          transition-[padding,justify-content] duration-500 md:px-6
          ${isOpen ? 'justify-end pb-7' : ''}
        `}
      >
        <div
          className={`
            flex items-center justify-between gap-4
            transition-[margin] duration-500
            ${isOpen ? 'mb-3' : ''}
          `}
        >
          <h3
            className={`
              font-extrabold leading-tight tracking-tight
              transition-[font-size,color] duration-500
              ${
                isOpen
                  ? safeImageUrl
                    ? 'text-2xl text-white md:text-3xl'
                    : 'text-2xl text-slate-900 dark:text-white md:text-3xl'
                  : 'text-xl text-gray-900 dark:text-white md:text-2xl'
              }
            `}
          >
            {title}
          </h3>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
            <span className="text-xl font-light leading-none">
              {isOpen ? '↑' : '→'}
            </span>
          </div>
        </div>

        <div
          className={`
            overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out
            ${isOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          {Description && (
            <p
              className={`
                mb-3 max-w-2xl line-clamp-4 text-sm leading-relaxed
                ${
                  safeImageUrl
                    ? 'text-slate-100'
                    : 'text-slate-700 dark:text-slate-200'
                }
              `}
            >
              {Description}
            </p>
          )}

          {Array.isArray(heads) && heads.length > 0 && (
            <div
              className={`text-xs font-medium ${
                safeImageUrl
                  ? 'text-blue-300'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              Heads:{' '}
              {heads
                .map((head) =>
                  typeof head === 'string'
                    ? head
                    : head?.fullName || head?.name
                )
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
        </div>

        <div
          className={`
            mt-3 h-1 rounded-full bg-gradient-to-r
            from-blue-500 via-pink-500 to-amber-400
            transition-[width,opacity] duration-500
            ${isOpen ? 'w-12 opacity-100' : 'w-8 opacity-50'}
          `}
        />
      </div>
    </div>
  );
};

export default DepartmentCard;
