import { useState } from 'react';
import { isSafeImageUrl } from '../../services/image';

const AchievementCard = ({
  Tag,
  Title,
  Subtitle,
  Description,
  ImageUrl,
  StartsAt,
  Location,
  Link,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isSafeUrl = (value) => {
    if (!value || typeof value !== 'string') return false;

    try {
      const url = new URL(value, 'https://supernova.local');
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const safeImageUrl = isSafeImageUrl(ImageUrl) ? ImageUrl : null;
  const safeLink = isSafeUrl(Link) ? Link : null;
  const title = Title || 'Untitled achievement';
  const formattedDate = formatDate(StartsAt);

  return (
    <article
      className="
        group relative flex w-[calc(100vw-2rem)] max-w-[380px] shrink-0
        snap-start flex-col justify-between overflow-hidden rounded-2xl p-5
        border border-slate-200 bg-white text-slate-900
        shadow-[0_10px_28px_rgba(15,23,42,0.08)]
        transition-[transform,box-shadow,border-color] duration-300 ease-in-out
        hover:-translate-y-1.5 hover:border-blue-400
        hover:shadow-[0_16px_36px_rgba(37,99,235,0.16)]
        dark:border-slate-700 dark:bg-[#111827] dark:text-white
        dark:shadow-[0_14px_32px_rgba(0,0,0,0.28)]
        dark:hover:border-blue-500/70
        sm:w-[380px]
      "
    >
      <div className="relative z-10 mb-3 h-44 w-full overflow-hidden rounded-xl">
        {safeImageUrl && !imageFailed ? (
          <img
            src={safeImageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-blue-700 via-indigo-700 to-pink-600"
            role="img"
            aria-label="Achievement image unavailable"
          />
        )}

        {Tag && (
          <span className="absolute left-2.5 top-2.5 rounded-full border border-white/30 bg-slate-950/70 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            {Tag}
          </span>
        )}

        {formattedDate && (
          <span className="absolute bottom-2.5 right-2.5 rounded-lg border border-white/20 bg-slate-950/80 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
            📅 {formattedDate}
          </span>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="mb-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>

          {Subtitle && (
            <p className="mb-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              {Subtitle}
            </p>
          )}

          {Location && (
            <p className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              📍 {Location}
            </p>
          )}

          <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {Description || 'More information will be available soon.'}
          </p>
        </div>

        {safeLink ? (
          <a
            href={safeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-pink-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <span>View details</span>
            <span aria-hidden="true">→</span>
          </a>
        ) : (
          <span className="mt-4 inline-flex w-fit cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            Details unavailable
          </span>
        )}
      </div>
    </article>
  );
};

export default AchievementCard;
