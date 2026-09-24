import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t-2 border-on-surface/5">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-[18px]">
                  directions_car
                </span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface">
                CallMy<span className="text-secondary">Car</span>
              </span>
            </Link>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Gentle, immediate, and courteous vehicle owner notifications to resolve parking and
              street hiccups before the tow truck arrives.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
              Civic Platform
            </h3>
            <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <a className="hover:text-on-surface transition-colors" href="#benefits">
                  Civic Responsibility
                </a>
              </li>
              <li>
                <a className="hover:text-on-surface transition-colors" href="#how-it-works">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a className="hover:text-on-surface transition-colors" href="#neighborhood-watch">
                  Neighborhood Watch
                </a>
              </li>
              <li>
                <a className="hover:text-on-surface transition-colors" href="#report-tow">
                  Report Tow Incident
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
              Safety & Legal
            </h3>
            <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <a className="hover:text-on-surface transition-colors" href="#safety-and-privacy">
                  Privacy Shield
                </a>
              </li>
              <li>
                <a className="hover:text-on-surface transition-colors" href="#encrypted-relay">
                  Encrypted Relay
                </a>
              </li>
              <li>
                <a className="hover:text-on-surface transition-colors" href="#terms">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="hover:text-on-surface transition-colors" href="#anonymity">
                  Anonymity Rules
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider">
              Stay Connected
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Empowering drivers, neighbors, and cities with respectful real-time connectivity.
            </p>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[24px]">
                verified_user
              </span>
              <span className="font-label-md text-label-md text-on-surface">Zero Spam Guarantee</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant border-t border-on-surface/10">
          <p>© 2025 CallMyCar Technologies Inc. All civic rights reserved.</p>
          <div className="flex items-center gap-6">
            <a className="hover:text-on-surface transition-colors" href="#privacy">
              Privacy Policy
            </a>
            <a className="hover:text-on-surface transition-colors" href="#help">
              Help Center
            </a>
            <a className="hover:text-on-surface transition-colors" href="#fleet">
              Fleet Accounts
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
