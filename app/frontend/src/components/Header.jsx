import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ currentPath = 'how-it-works' }) {
  const location = useLocation();
  const isContact = location.pathname.startsWith('/contact');
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 sm:h-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-secondary text-[22px]">
              directions_car
            </span>
          </div>
          <span className="font-headline-md text-[20px] sm:text-headline-md text-on-surface tracking-tight">
            CallMy<span className="text-secondary">Car</span>
          </span>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 shrink-0">
          <Link
            to="/#benefits"
            className="px-2 lg:px-4 py-2 rounded-full font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Benefits
          </Link>
          <Link
            to="/#how-it-works"
            className={`px-2 lg:px-4 py-2 rounded-full transition-colors ${
              !isContact
                ? 'bg-surface-container-high text-on-surface font-title-md'
                : 'font-title-md text-title-md text-on-surface-variant hover:text-on-surface'
            }`}
          >
            How it works
          </Link>
          <Link
            to="/#safety-and-privacy"
            className="px-2 lg:px-4 py-2 rounded-full font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Safety & Privacy
          </Link>
        </nav>

        {/* CTA and mobile navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/register"
            className="hidden xl:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-secondary-container text-on-secondary-container font-label-lg text-label-lg hover:bg-secondary-fixed transition-colors shadow-[2px_2px_0px_#141b2b]"
          >
            + Register Your Car
          </Link>
          <div className="hidden lg:flex w-8 h-8 rounded-full bg-secondary items-center justify-center shadow-[1.5px_1.5px_0px_#141b2b]">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex w-10 h-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="md:hidden border-t border-on-surface/10 bg-surface px-4 py-3 shadow-lg" aria-label="Mobile navigation">
          <div className="mx-auto max-w-[1200px] flex flex-col gap-1">
            <Link onClick={closeMenu} to="/#benefits" className="rounded-xl px-4 py-3 font-title-md text-on-surface hover:bg-surface-container-high">Benefits</Link>
            <Link onClick={closeMenu} to="/#how-it-works" className="rounded-xl px-4 py-3 font-title-md text-on-surface hover:bg-surface-container-high">How it works</Link>
            <Link onClick={closeMenu} to="/#safety-and-privacy" className="rounded-xl px-4 py-3 font-title-md text-on-surface hover:bg-surface-container-high">Safety &amp; Privacy</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
