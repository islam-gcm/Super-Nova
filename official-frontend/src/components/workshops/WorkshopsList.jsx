import { useEffect, useRef, useState } from 'react';
import WorkshopCard from './WorkshopCard';
import { endpoints } from '../../services/Endpoints';

const WorkshopsList = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -360,
      behavior: 'smooth',
    });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 360,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await endpoints.public.workshops({
          signal: controller.signal,
        });

        const candidates = [
          response,
          response?.events,
          response?.data?.events,
          response?.data?.items,
          response?.data,
        ];

        const list = candidates.find(Array.isArray) || [];

        const filteredWorkshops = list.filter((item) => {
          const type = String(item?.type ?? '').toLowerCase();

          return !type || type === 'workshop';
        });

        setWorkshops(filteredWorkshops);
      } catch (err) {
        if (err.name === 'AbortError') return;

        console.error('Error fetching workshops:', err);
        setError('Workshops are temporarily unavailable. Please try again.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [retryKey]);

  if (loading) {
    return (
      <section className="py-16 text-center">
        <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-300">
          Loading Workshops...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 text-center">
        <p className="font-medium text-red-500">{error}</p>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            setRetryKey((value) => value + 1);
          }}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
        >
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-6">
      {workshops.length > 0 && (
        <div className="mb-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={scrollLeft}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-md transition-all duration-300 hover:bg-blue-500 hover:text-white active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-blue-600"
            aria-label="Scroll workshops left"
          >
            &lt;
          </button>

          <button
            type="button"
            onClick={scrollRight}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-md transition-all duration-300 hover:bg-blue-500 hover:text-white active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-blue-600"
            aria-label="Scroll workshops right"
          >
            &gt;
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex flex-nowrap snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-8 -mx-4 scroll-smooth scrollbar-none sm:gap-6 sm:px-6 sm:py-10 sm:-mx-6"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {workshops.length > 0 ? (
          workshops.map((item, index) => (
            <WorkshopCard
              key={item._id || item.id || index}
              Tag={item.tag || item.Tag}
              Title={item.title || item.Title}
              Subtitle={
                item.subtitle ||
                item.presenterName ||
                item.Subtitle
              }
              Description={item.description || item.Description}
              ImageUrl={
                item.coverImage ||
                item.imageUrl ||
                item.ImageUrl
              }
              StartsAt={item.startsAt || item.date}
              Location={item.location || item.Location}
              Link={item.link || item.Link}
            />
          ))
        ) : (
          <p className="w-full text-center text-gray-500 dark:text-gray-400">
            No workshops available at the moment.
          </p>
        )}
      </div>
    </section>
  );
};

export default WorkshopsList;