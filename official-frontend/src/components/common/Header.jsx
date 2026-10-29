import { useState, useRef, useEffect } from 'react';
import logoImg from '../../assets/logo nova.svg';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import { LINKS } from '../../constants/Links';
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);

  const handleJoinClick = () => {
    window.open(`${LINKS.virtualClub}/join`, '_blank', 'noopener,noreferrer');
  };

  const toggleMenu = () => setIsOpen((open) => !open);

  const handleClose = () => {
    setIsOpen(false);
    toggleButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 md:px-8 py-3 bg-white/95 dark:bg-[#0b1220]/95 backdrop-blur-md transition-colors duration-300 border-b border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:shadow-[0_4px_20px_rgba(0,0,0,0.28)]">
        <div className="flex items-center">
          <img
            src={logoImg} 
            alt="Supernova Logo" 
            className="w-10 h-10 object-contain" 
            width="40"
            height="40"
            decoding="async"
          />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">About us</a>
          <a href="#leaders" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Leaders</a>
          <a href="#departments" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Departments</a>
          <a href="#workshops" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Workshops</a>
          <a href="#events" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Events</a>
          <a href="#Achievments" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Achievements</a>
          
          <Button onClick={handleJoinClick}>Join us</Button>
        </nav>

        <div className="flex items-center space-x-3">
          <ThemeToggle />

          <button 
            ref={toggleButtonRef}
            type="button"
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={handleClose}
        />
      )}

      <div 
        ref={drawerRef}
        id="mobile-navigation" 
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white dark:bg-[#0b1220] p-6 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-8">
          <span className="font-bold text-lg text-slate-800 dark:text-slate-200">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Close menu"
            className="p-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col space-y-5 text-base font-semibold text-slate-800 dark:text-slate-200">
          <a href="#about" onClick={handleClose} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">About us</a>
          <a href="#leaders" onClick={handleClose} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Leaders</a>
          <a href="#departments" onClick={handleClose} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Departments</a>
          <a href="#workshops" onClick={handleClose} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Workshops</a>
          <a href="#events" onClick={handleClose} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Events</a>
          <a href="#Achievments" onClick={handleClose} className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Achievments</a>

          <div className="pt-4">
            <Button onClick={() => {
              handleJoinClick();
              handleClose();
            }}>
              Join us
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
