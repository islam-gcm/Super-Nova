import  { useEffect, useState } from 'react';
import LeaderCard from './LeaderCard';
import { endpoints } from '../../services/Endpoints';

const extractList = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.data,
    response?.content,
    response?.items,
    response?.leaders,
    response?.leads,
    response?.data?.content,
    response?.data?.items,
    response?.data?.leaders,
    response?.data?.leads,
    response?.data?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const LeadersList = () => {
  const [leaders, setLeaders] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await endpoints.public.leaders({
          signal: controller.signal,
        });

        const list = extractList(response);

        setLeaders(list);

        if (list.length > 0) {
          setActiveIndex(Math.floor(list.length / 2));
        }
      } catch (err) {
        if (err.name === 'AbortError') return;

        console.error('Error fetching leaders:', err);
        setError('Leaders are temporarily unavailable. Please try again.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [retryKey]);

  const safeLeaders = Array.isArray(leaders) ? leaders : [];

  const handlePrev = () => {
    setActiveIndex((previous) =>
      previous > 0 ? previous - 1 : safeLeaders.length - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((previous) =>
      previous < safeLeaders.length - 1 ? previous + 1 : 0
    );
  };

  if (loading) {
    return (
      <section className="py-16 text-center">
        <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-300">
          Loading Leaders...
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

  if (safeLeaders.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="font-medium text-gray-500 dark:text-gray-400">
          No leaders to display yet.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-12">
      <div
        className="
          relative flex h-[460px] w-full max-w-5xl items-center justify-center
          [perspective:1000px] [transform-style:preserve-3d]
        "
      >
        {safeLeaders.map((item, index) => {
          const offset = index - activeIndex;

          if (Math.abs(offset) > 3) return null;

          return (
            <LeaderCard
              key={item._id || item.id || index}
              fullName={item.fullName}
              imageUrl={item.imageUrl}
              description={item.description}
              roleTag={item.roleTag}
              subtitleRole={item.subtitleRole}
              offset={offset}
              onClick={() => setActiveIndex(index)}
            />
          );
        })}
      </div>

      <div className="z-20 mt-8 flex items-center gap-4 rounded-full border border-slate-200 bg-white px-6 py-2.5 shadow-[0_10px_25px_rgba(15,23,42,0.10)] dark:border-slate-700 dark:bg-[#111827] dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
        <button
          type="button"
          onClick={handlePrev}
          className="rounded-full p-2 text-slate-800 transition hover:bg-blue-50 active:scale-95 dark:text-white dark:hover:bg-blue-950/70"
          aria-label="Show previous leader"
        >
          ←
        </button>

        <div className="px-4 text-center">
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {safeLeaders[activeIndex]?.fullName ||
              safeLeaders[activeIndex]?.title ||
              `Leader #${activeIndex + 1}`}
          </div>

          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            {activeIndex + 1} / {safeLeaders.length}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="rounded-full p-2 text-slate-800 transition hover:bg-blue-50 active:scale-95 dark:text-white dark:hover:bg-blue-950/70"
          aria-label="Show next leader"
        >
          →
        </button>
      </div>
    </section>
  );
};

export default LeadersList;