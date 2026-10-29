
const AboutSection = () => {
  return (
    <section
      id="about"
      className="
        relative z-10 flex min-h-screen flex-col items-center justify-between
        border-t border-blue-200/50 bg-slate-50 px-4 pb-12 pt-16 text-center
        shadow-[0_-30px_60px_rgba(0,0,0,0.35)]
        dark:border-blue-900/40 dark:bg-[#030712]
        dark:shadow-[0_-30px_60px_rgba(0,0,0,0.9)]
        sm:rounded-t-[5rem] sm:px-12 sm:pb-16 sm:pt-24
      "
    >
      <div className="my-auto w-full max-w-4xl space-y-6 sm:space-y-8 reveal-up">
        <div className="space-y-3">
          <span className="inline-block rounded-lg border border-blue-300/40 bg-blue-100 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-300 sm:px-4 sm:text-xs">
            Who We Are
          </span>

          <h2 className="pt-2 text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white sm:text-5xl">
            Driven by Science.
            <br />
            Powered by Curiosity.
          </h2>
        </div>

        <p className="mx-auto max-w-3xl px-2 text-sm font-normal leading-relaxed text-slate-700 dark:text-slate-200 sm:text-lg md:text-xl">
          <span className="font-bold text-blue-700 dark:text-blue-300">
            SuperNova Scientific Club
          </span>{' '}
          of the Faculty of Sciences at the University of Boumerdes was founded
          in 2024 by students passionate about science and innovation. Our
          mission is to enrich student life by creating a space for learning,
          exchange, and knowledge sharing across various scientific and
          technological fields. Committed to stimulating intellectual curiosity,
          the club organizes conferences, hands-on workshops, and educational
          competitions in a friendly atmosphere.
        </p>
      </div>

      <div className="w-full pt-8 reveal-up sm:pt-12">
        <div className="inline-flex max-w-full items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 shadow-lg shadow-blue-600/10 dark:border-blue-800 dark:bg-blue-950/60 sm:gap-3 sm:px-6 sm:py-3">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-pink-500 motion-safe:animate-ping"
            aria-hidden="true"
          />

          <p className="text-left text-[11px] font-extrabold italic tracking-wide text-pink-700 dark:text-pink-300 sm:text-center sm:text-sm">
            “But a club is only as strong as the people who lead it. Meet them
            below.”
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;