import { Link, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo nova.svg';
import { LINKS } from '../../constants/Links';

const Footer = () => {
  const sectionPrefix = useLocation().pathname === '/' ? '' : '/';
  return (
    <footer className="relative z-20 isolate w-full bg-[#ffffff] text-gray-900 opacity-100 shadow-[0_-10px_25px_rgba(15,23,42,0.08)] dark:bg-[#0b1220] dark:text-white pt-8 pb-6 border-t border-slate-200 dark:border-slate-800 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="flex items-center">
              <img 
                src={logoImg} 
                alt="SuperNova Logo" 
                className="h-12 w-12 object-contain transition-transform duration-300 hover:scale-110"
              />
            </div>
           
            <nav className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <a href={`${sectionPrefix}#about`} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hover:-translate-y-0.5 transform">About us</a>
              <a href={`${sectionPrefix}#leaders`} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hover:-translate-y-0.5 transform">Leaders</a>
              <a href={`${sectionPrefix}#departments`} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hover:-translate-y-0.5 transform">Departments</a>
              <a href={`${sectionPrefix}#workshops`} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hover:-translate-y-0.5 transform">Workshops</a>
              <a href={`${sectionPrefix}#events`} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hover:-translate-y-0.5 transform">Events</a>
              <a href={`${sectionPrefix}#Achievments`} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 hover:-translate-y-0.5 transform">Achievements</a>
            </nav>
          </div>

          <a
            href={`${LINKS.virtualClub}/join`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center justify-center
              bg-[#EC6AA5] hover:bg-[#E45B98]
              text-[#151525] font-semibold
              px-6 py-2 rounded-lg
              transition-all duration-300
              hover:scale-105 hover:-translate-y-0.5
              shadow-md shadow-pink-500/15
            "
          >
            Join us
          </a>
        </div>

        {/* Social media */}
        <div className="w-full flex flex-col items-center my-4">
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-3 text-sm">Follow us</p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {/* Instagram */}
            <a 
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2.5 bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full border dark:border-slate-700 dark:text-slate-200 dark:hover:text-pink-400 transition-all duration-300 hover:-translate-y-1 hover:scale-110 flex items-center justify-center shadow-sm"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a 
              href={LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full border dark:border-slate-700 dark:text-slate-200 dark:hover:text-blue-400 transition-all duration-300 hover:-translate-y-1 hover:scale-110 flex items-center justify-center shadow-sm"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="w-full border-t border-gray-200 dark:border-gray-800/80 pt-4 mt-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            &copy; Copyright 2026 SuperNovaSC - All rights reserved.
          </p>
          <Link to="/privacy" className="mt-2 inline-block text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300">Privacy Policy</Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
