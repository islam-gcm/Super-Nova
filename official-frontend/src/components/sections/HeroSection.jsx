import rocketSvg from '../../assets/rocket.svg';

const stars = [
  { top: '11%', left: '9%', size: '2px', delay: '0s', duration: '4.4s' },
  { top: '19%', left: '82%', size: '3px', delay: '1.1s', duration: '5.2s' },
  { top: '29%', left: '18%', size: '2px', delay: '2.2s', duration: '4.8s' },
  { top: '34%', left: '72%', size: '2px', delay: '0.7s', duration: '5.8s' },
  { top: '47%', left: '6%', size: '3px', delay: '1.8s', duration: '4.9s' },
  { top: '54%', left: '91%', size: '2px', delay: '3s', duration: '5.5s' },
  { top: '67%', left: '14%', size: '2px', delay: '0.4s', duration: '5.1s' },
  { top: '72%', left: '79%', size: '3px', delay: '2.7s', duration: '4.6s' },
  { top: '84%', left: '28%', size: '2px', delay: '1.5s', duration: '5.7s' },
  { top: '88%', left: '63%', size: '2px', delay: '3.4s', duration: '4.3s' },

  { top: '8%', left: '24%', size: '2px', delay: '0.8s', duration: '5.1s' },
  { top: '13%', left: '64%', size: '2px', delay: '2.6s', duration: '4.7s' },
  { top: '23%', left: '42%', size: '3px', delay: '1.4s', duration: '5.6s' },
  { top: '27%', left: '93%', size: '2px', delay: '3.8s', duration: '4.5s' },
  { top: '38%', left: '31%', size: '2px', delay: '0.2s', duration: '5.4s' },
  { top: '42%', left: '58%', size: '2px', delay: '2.1s', duration: '4.9s' },
  { top: '51%', left: '23%', size: '3px', delay: '3.2s', duration: '5.8s' },
  { top: '58%', left: '76%', size: '2px', delay: '1.7s', duration: '4.4s' },
  { top: '63%', left: '47%', size: '2px', delay: '0.9s', duration: '5.2s' },
  { top: '69%', left: '88%', size: '2px', delay: '2.9s', duration: '4.6s' },
  { top: '76%', left: '5%', size: '3px', delay: '1.2s', duration: '5.5s' },
  { top: '81%', left: '72%', size: '2px', delay: '3.6s', duration: '4.8s' },
  { top: '92%', left: '42%', size: '2px', delay: '0.5s', duration: '5.3s' },
  { top: '16%', left: '49%', size: '2px', delay: '2.4s', duration: '4.2s' },
  { top: '33%', left: '86%', size: '2px', delay: '1.9s', duration: '5.9s' },
  { top: '46%', left: '37%', size: '2px', delay: '3.1s', duration: '4.6s' },
  { top: '61%', left: '8%', size: '2px', delay: '0.6s', duration: '5.7s' },
  { top: '73%', left: '55%', size: '3px', delay: '2.8s', duration: '4.5s' },
  { top: '86%', left: '94%', size: '2px', delay: '1.6s', duration: '5.1s' },
  { top: '96%', left: '18%', size: '2px', delay: '3.5s', duration: '4.3s' },
];

const HeroSection = () => {
  return (
    <>
      <div className="sticky top-0 z-0 flex min-h-screen w-full items-center justify-center overflow-hidden py-12 sm:py-0">
        <section
          id="hero"
          className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-8"
        >
          <div
            className="pointer-events-none absolute inset-0 z-0 hidden dark:block"
            aria-hidden="true"
          >
            {stars.map((star, index) => (
              <span
                key={index}
                className="hero-star absolute rounded-full bg-white"
                style={{
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay,
                  animationDuration: star.duration,
                }}
              />
            ))}
          </div>

          <div
            className="pointer-events-none absolute z-20 animate-[rocketFly_6s_linear_infinite]"
            aria-hidden="true"
          >
            <div className="relative h-12 w-12 md:h-16 md:w-16">
              <div className="rocket-exhaust" aria-hidden="true">
                <span className="rocket-flame rocket-flame-outer" />
                <span className="rocket-flame rocket-flame-inner" />

                <span className="rocket-smoke rocket-smoke-one" />
                <span className="rocket-smoke rocket-smoke-two" />
                <span className="rocket-smoke rocket-smoke-three" />
                <span className="rocket-smoke rocket-smoke-four" />
                <span className="rocket-smoke rocket-smoke-five" />
                <span className="rocket-smoke rocket-smoke-six" />
                <span className="rocket-smoke rocket-smoke-seven" />
                <span className="rocket-smoke rocket-smoke-eight" />
              </div>

              <img
                src={rocketSvg}
                alt=""
                className="relative z-10 h-full w-full drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
              />
            </div>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center space-y-4 px-2 text-center sm:space-y-6">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,0.3)] dark:text-pink-400 sm:text-base md:text-lg">
              Welcome To
            </span>

            <h1 className="w-full break-words text-center text-3xl font-black uppercase leading-none tracking-tight text-slate-900 drop-shadow-[0_0_20px_rgba(37,99,235,0.22)] dark:text-white dark:drop-shadow-[0_0_20px_rgba(59,130,246,0.55)] sm:text-7xl sm:tracking-normal md:text-8xl md:tracking-wide lg:text-[8.5rem]">
              Supernova
            </h1>

            <div className="w-full pt-1 sm:pt-2">
              <p className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[10px] font-extrabold uppercase leading-relaxed tracking-[0.12em] text-slate-600 dark:text-slate-400 sm:text-xs sm:tracking-[0.22em] md:text-sm">
                <span>Scientific Club</span>
                <span className="text-pink-500">•</span>
                <span>Faculty of Sciences</span>
                <span className="text-pink-500">•</span>
                <span>University of Boumerdes</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes starShimmer {
          0%,
          100% {
            opacity: 0.35;
            transform: translate3d(0, 0, 0) scale(0.8);
            box-shadow:
              0 0 3px rgba(255, 255, 255, 0.5),
              0 0 7px rgba(96, 165, 250, 0.35);
          }

          50% {
            opacity: 1;
            transform: translate3d(4px, -6px, 0) scale(1.25);
            box-shadow:
              0 0 5px rgba(255, 255, 255, 0.95),
              0 0 14px rgba(96, 165, 250, 0.85),
              0 0 22px rgba(236, 72, 153, 0.35);
          }
        }

        .hero-star {
          animation-name: starShimmer;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity, box-shadow;
        }

        .rocket-exhaust {
          position: absolute;
          top: calc(100% - 5px);
          left: 50%;
          z-index: 0;
          width: 34px;
          height: 86px;
          pointer-events: none;
          transform: translateX(-50%);
          transform-origin: top center;
          filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.75));
          animation: rocketExhaust 0.16s ease-in-out infinite alternate;
        }

        .rocket-flame {
          position: absolute;
          top: 0;
          left: 50%;
          display: block;
          transform: translateX(-50%);
          transform-origin: top center;
          clip-path: polygon(
            28% 0%,
            72% 0%,
            100% 60%,
            72% 100%,
            50% 78%,
            28% 100%,
            0% 60%
          );
        }

        .rocket-flame-outer {
          width: 32px;
          height: 70px;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(216, 180, 254, 0.95) 22%,
            rgba(168, 85, 247, 0.95) 55%,
            rgba(126, 34, 206, 0.72) 82%,
            rgba(126, 34, 206, 0) 100%
          );
        }

        .rocket-flame-inner {
          width: 15px;
          height: 56px;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 1) 0%,
            rgba(254, 249, 195, 0.98) 26%,
            rgba(192, 132, 252, 0.95) 65%,
            rgba(168, 85, 247, 0) 100%
          );
        }

        .rocket-smoke {
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
          background: radial-gradient(
            circle,
            rgba(226, 232, 240, 0.78) 0%,
            rgba(148, 163, 184, 0.42) 45%,
            rgba(148, 163, 184, 0) 76%
          );
          filter: blur(1.5px);
          animation: rocketSmoke 1.1s ease-out infinite;
        }

        .rocket-smoke-one {
          top: 49px;
          left: 50%;
          width: 13px;
          height: 13px;
          transform: translateX(-50%);
          animation-delay: 0s;
        }

        .rocket-smoke-two {
          top: 59px;
          left: 34%;
          width: 11px;
          height: 11px;
          animation-delay: 0.14s;
        }

        .rocket-smoke-three {
          top: 61px;
          left: 61%;
          width: 12px;
          height: 12px;
          animation-delay: 0.28s;
        }

        .rocket-smoke-four {
          top: 70px;
          left: 18%;
          width: 10px;
          height: 10px;
          animation-delay: 0.4s;
        }

        .rocket-smoke-five {
          top: 73px;
          left: 70%;
          width: 13px;
          height: 13px;
          animation-delay: 0.52s;
        }

        .rocket-smoke-six {
          top: 80px;
          left: 38%;
          width: 9px;
          height: 9px;
          animation-delay: 0.66s;
        }

        .rocket-smoke-seven {
          top: 84px;
          left: 57%;
          width: 8px;
          height: 8px;
          animation-delay: 0.78s;
        }

        .rocket-smoke-eight {
          top: 88px;
          left: 25%;
          width: 7px;
          height: 7px;
          animation-delay: 0.9s;
        }

        @keyframes rocketExhaust {
          from {
            opacity: 0.82;
            transform: translateX(-50%) scaleX(0.88) scaleY(0.94);
          }

          to {
            opacity: 1;
            transform: translateX(-50%) scaleX(1.08) scaleY(1.06);
          }
        }

        @keyframes rocketSmoke {
          0% {
            opacity: 0;
            transform: translate3d(0, -3px, 0) scale(0.5);
          }

          20% {
            opacity: 0.68;
          }

          100% {
            opacity: 0;
            transform: translate3d(-5px, 18px, 0) scale(1.55);
          }
        }

        @keyframes rocketFly {
          0% {
            transform: translate(-55vw, 45vh) rotate(45deg);
            opacity: 1;
          }

          100% {
            transform: translate(55vw, -45vh) rotate(45deg);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default HeroSection;