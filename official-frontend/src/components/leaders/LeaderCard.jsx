import { isSafeImageUrl } from '../../services/image';

const LeaderCard = ({
  fullName,
  imageUrl,
  description,
  roleTag,
  subtitleRole,
  offset = 0,
  onClick,
}) => {
  const safeImageUrl = isSafeImageUrl(imageUrl) ? imageUrl : null;
  const absOffset = Math.abs(offset);
  const translateX = offset * 175;
  const rotateY = offset * -25;
  const scale = 1 - absOffset * 0.15;
  const zIndex = 10 - absOffset;
  const opacity = 1 - absOffset * 0.25;
  const role = roleTag || subtitleRole || 'Lead';

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${fullName || 'leader'}`}
      style={{
        transform: `
          translate3d(${translateX}px, 0, 0)
          rotateY(${rotateY}deg)
          scale(${scale})
        `,
        zIndex,
        opacity,
        transformOrigin: 'center center',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
      className="
        absolute flex h-[360px] w-60 cursor-pointer select-none
        flex-col items-center justify-between overflow-hidden rounded-[1.7rem]
        border-2 border-blue-500/60 bg-white p-5 text-center
        shadow-[0_12px_30px_rgba(37,99,235,0.20)]
        transition-[transform,opacity,box-shadow,border-color] duration-500 ease-out
        [backface-visibility:hidden] [transform-style:preserve-3d]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        dark:border-blue-500/70 dark:bg-[#111827]
        dark:shadow-[0_16px_35px_rgba(37,99,235,0.25)]
        md:w-64
      "
    >
      <div className="relative z-10 mt-1 flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-pink-400 p-[3px] shadow-[0_0_15px_rgba(236,72,153,0.35)] dark:bg-pink-500">
          {safeImageUrl ? (
            <img
              src={safeImageUrl}
              alt={fullName || 'Leader profile'}
              loading="lazy"
              decoding="async"
              className="h-full w-full rounded-full bg-blue-50 object-cover dark:bg-slate-900"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#EC6AA5] text-xl font-bold text-white">
              {fullName ? fullName.charAt(0).toUpperCase() : 'L'}
            </div>
          )}
        </div>

        <span className="mt-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold tracking-wide text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          {role}
        </span>
      </div>

      <div className="relative z-10 my-auto flex w-full flex-col items-center px-2">
        <h3 className="mb-2 line-clamp-1 text-lg font-extrabold leading-snug tracking-tight text-slate-900 dark:text-white">
          {fullName || 'Unnamed Lead'}
        </h3>

        {description && (
          <p className="line-clamp-4 text-center text-[11px] font-normal leading-relaxed text-slate-600 dark:text-slate-300/90">
            {description}
          </p>
        )}
      </div>

      <div className="relative z-10 mb-1 h-1 w-10 rounded-full bg-gradient-to-r from-blue-500 to-pink-500" />
    </div>
  );
};

export default LeaderCard;
