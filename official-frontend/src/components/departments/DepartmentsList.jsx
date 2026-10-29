import { useEffect, useState } from 'react';
import DepartmentCard from './DepartmentCard';
import { endpoints } from '../../services/Endpoints';

const extractList = (response) => {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.departments,
    response?.data,
    response?.data?.departments,
    response?.data?.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await endpoints.public.departments({
          signal: controller.signal,
        });

        setDepartments(extractList(response));
      } catch (err) {
        if (err.name === 'AbortError') return;

        console.error('Error fetching departments:', err);
        setError(
          'Departments are temporarily unavailable. Please try again.'
        );
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
          Loading Departments...
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

  if (departments.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="font-medium text-gray-500 dark:text-gray-400">
          No departments to display yet.
        </p>
      </section>
    );
  }

  return (
  <section className="mx-auto max-w-7xl px-6 py-12">
    <div className="ml-auto flex w-full max-w-2xl flex-col items-end gap-4">
      {departments.map((item, index) => (
        <DepartmentCard
          key={item._id || item.id || index}
          Title={item.name || item.Title}
          Description={item.description || item.Description}
          ImageUrl={item.imageUrl || item.ImageUrl}
          heads={item.heads}
          isOpen={openIndex === index}
          onToggle={() =>
            setOpenIndex(openIndex === index ? null : index)
          }
        />
      ))}
    </div>
  </section>
);
};

export default DepartmentsList;