import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ currentPath = 'how-it-works' }) {
  const location = useLocation();
  const isContact = location.pathname.startsWith('/contact');

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-[1200px] mx-auto px-6 lg:px-10 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[22px]">
              directions_car
            </span>
          </div>
          <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
            CallMy<span className="text-secondary">Car</span>
          </span>
        </Link>

        {/* Navigation items */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/#benefits"
            className="px-4 py-2 rounded-full font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Benefits
          </Link>
          <Link
            to="/#how-it-works"
            className={`px-4 py-2 rounded-full transition-colors ${
              !isContact
                ? 'bg-surface-container-high text-on-surface font-title-md'
                : 'font-title-md text-title-md text-on-surface-variant hover:text-on-surface'
            }`}
          >
            How it works
          </Link>
          <a
            href="#safety-and-privacy"
            className="px-4 py-2 rounded-full font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Safety & Privacy
          </a>
          <Link
            to="/register"
            className={`px-4 py-2 rounded-full transition-colors ${
              location.pathname === '/register'
                ? 'bg-secondary text-on-secondary font-title-md shadow-[2px_2px_0px_#141b2b]'
                : 'font-title-md text-title-md text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Register Vehicle
          </Link>
          <a
            href="#faqs"
            className="px-4 py-2 rounded-full font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            FAQs
          </a>
        </nav>

        {/* CTA and User Avatar */}
        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-secondary-container text-on-secondary-container font-label-lg text-label-lg hover:bg-secondary-fixed transition-colors shadow-[2px_2px_0px_#141b2b]"
          >
            + Register Your Car
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[1.5px_1.5px_0px_#141b2b]">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
