import { useEffect } from 'react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

import HeroSection from '../components/sections/HeroSection';
import AchievementsList from '../components/achievements/AchievementsList';
import LeadersList from '../components/leaders/LeadersList';
import EventsList from '../components/events/EventsList';
import WorkshopsList from '../components/workshops/WorkshopsList';
import DepartmentsList from '../components/departments/DepartmentsList';
import AboutSection from '../components/sections/AboutSection';

const SectionHeading = ({ eyebrow, title, description, direction = 'left',}) => {
  return (
    <div
      className={`
        scroll-reveal
        ${direction === 'left' ? 'from-left' : 'from-right'}
        relative
        flex
        items-center
        w-full
        max-w-6xl
        mx-auto
        text-left
        py-4
        sm:py-6
      `}
    >
      <div
        className="
          absolute
          left-0
          top-1/2
          -translate-y-1/2
          h-[75px]
          sm:h-[105px]
          w-[4px]
          sm:w-[5px]
          rounded-full
          bg-gradient-to-b from-yellow-400 to-pink-500
          shadow-[0_0_18px_rgba(236,72,153,0.20)]
        "
      />

      <div className="pl-5 sm:pl-8 md:pl-10">
        <div
          className="
            mb-1.5
            sm:mb-3
            text-[9px]
            sm:text-xs
            font-black
            uppercase
            tracking-[0.2em]
            sm:tracking-[0.25em]
            text-pink-600
            dark:text-pink-300
          "
        >
          {eyebrow}
        </div>

        <h2
          className="
            text-3xl
            xs:text-4xl
            sm:text-6xl
            lg:text-7xl
            font-black
            tracking-tight
            uppercase
            leading-[0.95]
            text-slate-900
            dark:text-white
            break-words
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-2
            sm:mt-4
            text-xs
            sm:text-sm
            font-medium
            text-slate-500
            dark:text-slate-400
            max-w-xl
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
};

const LandingPage = () => {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="
        min-h-screen
        w-full
        overflow-x-clip
        font-sans
        relative
        selection:bg-blue-600
        selection:text-white
        bg-slate-50
        text-slate-900
        dark:bg-[#030712]
        dark:text-slate-100
      "
    >
      <style>{`
        @keyframes floatSlow {
          0%,
          100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes slideFromLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideFromRight {
          from {
            opacity: 0;
            transform: translateX(60px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float-slow {
          animation: floatSlow 4s ease-in-out infinite;
        }

        .scroll-reveal {
          opacity: 0;
          transition:
            opacity 0.9s ease-out,
            transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }

        .scroll-reveal.from-left {
          transform: translateX(-50px);
        }

        .scroll-reveal.from-right {
          transform: translateX(50px);
        }

        @media (min-width: 640px) {
          .scroll-reveal.from-left {
            transform: translateX(-120px);
          }

          .scroll-reveal.from-right {
            transform: translateX(120px);
          }
        }

        .scroll-reveal.is-visible {
          opacity: 1;
          transform: translateX(0);
        }

        .reveal-left {
          animation: slideFromLeft 0.8s ease-out forwards;
        }

        .reveal-right {
          animation: slideFromRight 0.8s ease-out forwards;
        }

        .reveal-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <Header />

      {/* Hero */}

      <HeroSection />

      {/* About */}

      <AboutSection/>

      {/* Main content */}

      <main
        className="
          relative
          z-10
          bg-slate-50
          dark:bg-[#030712]
          max-w-7xl
          mx-auto
          px-4
          sm:px-8
          space-y-16
          sm:space-y-36
          py-12
          sm:py-20
          w-full
          overflow-hidden
        "
      >
        {/* Leaders */}

        <section
          id="leaders"
          className="space-y-6 sm:space-y-10"
        >
          <SectionHeading
            eyebrow="The Minds Behind Supernova"
            title="Leaders"
            description="Guiding vision, empowering talent, and steering innovation."
            direction="left"
          />

          <div className="w-full overflow-x-auto">
            <LeadersList />
          </div>
        </section>

        {/* Departments */}

        <section
          id="departments"
          className="space-y-6 sm:space-y-10"
        >
          <SectionHeading
            eyebrow="Find Your Orbit"
            title="Departments"
            description="Every scientific passion has a home here — where's yours?"
            direction="right"
          />

          <div className="reveal-up w-full overflow-x-auto">
            <DepartmentsList />
          </div>
        </section>

        {/* Workshops */}

        <section
          id="workshops"
          className="space-y-6 sm:space-y-10"
        >
          <SectionHeading
            eyebrow="Learn By Doing"
            title="Workshops"
            description="From theory to hands-on experiments."
            direction="left"
          />

          <div className="reveal-up w-full overflow-x-auto">
            <WorkshopsList />
          </div>
        </section>

        {/* Events */}

        <section
          id="events"
          className="space-y-6 sm:space-y-10 overflow-visible"
        >
          <SectionHeading
            eyebrow="Don't Miss Out"
            title="Events"
            description="Where science comes alive — see what's coming up."
            direction="right"
          />

          <div className="reveal-up w-full overflow-visible">
            <EventsList />
          </div>
        </section>


        <section
          id="Achievments"
          className="space-y-6 sm:space-y-10" >
          <div className="mb-10 text-center"
        >
          <p
            className="
              mb-3
              text-xs
              font-bold
              uppercase
              tracking-[0.3em]
              text-blue-600
              dark:text-blue-400
            "
          >
            Our Achievements
          </p>

          <h2
            className="
              text-3xl
              md:text-4xl
              lg:text-5xl
              font-black
              tracking-tight
              text-gray-900
              dark:text-white
            "
          >
            What we have accomplished
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              md:text-base
              leading-relaxed
              text-gray-600
              dark:text-gray-400
            "
          >
            Discover the milestones and achievements
            that shaped our journey.
          </p>
        </div>
          <div className="reveal-up w-full">
             <AchievementsList />
         </div>
        </section>

        {/* Join CTA */}

        <section
          id="join"
          className="
            relative
            text-center
            w-full
            max-w-4xl
            mx-auto
            border-t
            border-slate-200
            dark:border-slate-800
            text-center
            py-12
            sm:py-20
            reveal-up
          "
        >
          <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-blue-600 to-pink-500" />

          <span
            className="
              text-[9px]
              sm:text-xs
              font-black
              uppercase
              tracking-[0.25em]
              sm:tracking-[0.35em]
              text-pink-600
              dark:text-pink-300
            "
          >
            Join The Mission
          </span>

          <h2
            className="
              text-xl
              xs:text-2xl
              sm:text-4xl
              font-black
              uppercase
              tracking-wider
              sm:tracking-widest
              text-slate-900
              dark:text-white
            "
          >
            Ready to Join?
          </h2>

          <p
            className="
              text-xs
              sm:text-base
              font-medium
              text-slate-600
              dark:text-slate-300
            "
          >
            No experience needed — just curiosity.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
