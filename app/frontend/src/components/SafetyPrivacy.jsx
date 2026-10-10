import React from 'react';

export default function SafetyPrivacy() {
  const privacyPillars = [
    {
      id: '01',
      title: '100% Anonymous Communication',
      description:
        "Your phone number is never exposed. When someone enters your vehicle's number plate, our automated system handles the WhatsApp messages and voice calls securely in the background.",
      icon: 'visibility_off',
      badge: 'Zero Phone Exposure',
      colorClass: 'bg-secondary-container text-on-secondary-container',
      chipClass: 'bg-secondary-fixed text-secondary',
      badgeIcon: 'phonelink_erase',
    },
    {
      id: '02',
      title: 'Secure Data Storage',
      description:
        'Your vehicle registration and personal contact details are encrypted and securely stored on our servers. We never sell or share your data with third parties.',
      icon: 'lock',
      badge: 'Encrypted & Private',
      colorClass: 'bg-primary-container text-on-primary-container',
      chipClass: 'bg-primary-fixed text-primary',
      badgeIcon: 'enhanced_encryption',
    },
    {
      id: '03',
      title: 'Anti-Spam Protection',
      description:
        'To prevent harassment or misuse of the platform, CallMyCar limits the number of alerts that can be sent to a single vehicle within a specific timeframe.',
      icon: 'shield',
      badge: 'Rate-Limit Shield',
      colorClass: 'bg-tertiary-container text-on-tertiary-container',
      chipClass: 'bg-tertiary-fixed text-tertiary',
      badgeIcon: 'gpp_good',
    },
    {
      id: '04',
      title: 'No Location Tracking',
      description:
        'We respect your privacy. CallMyCar does not track your location or vehicle movements. Alerts are strictly incident-based, triggered only when a license plate is manually searched',
      icon: 'location_off',
      badge: 'Incident-Only Lookup',
      colorClass: 'bg-secondary-fixed text-secondary',
      chipClass: 'bg-secondary-container text-on-secondary-container',
      badgeIcon: 'wrong_location',
    },
  ];

  return (
    <section
      id="safety-and-privacy"
      className="relative w-full bg-background py-20 lg:py-28 overflow-hidden border-t-2 border-b-2 border-on-surface/10"
      aria-label="Safety & Privacy"
    >
      {/* Decorative dot matrix ambient background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="privacy-dots" patternUnits="userSpaceOnUse" width="32" height="32" x="0" y="0">
              <circle className="fill-on-surface" cx="2" cy="2" r="2"></circle>
            </pattern>
          </defs>
          <rect fill="url(#privacy-dots)" width="100%" height="100%"></rect>
        </svg>
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10 z-10">
        {/* Intro / Hero Section */}
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest text-on-surface border-2 border-[#141b2b] shadow-[3px_3px_0px_#141b2b]">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container animate-pulse"></span>
            <span className="font-label-md text-label-md uppercase tracking-wider">
              Civic Privacy & Security Shield
            </span>
          </div>

          <h2 className="font-display-hero text-headline-lg lg:text-[44px] text-on-surface tracking-tight drop-shadow-[2px_2px_0px_#ffffff] leading-tight">
            Safety & Privacy <span className="text-secondary">Guaranteed</span>
          </h2>

          {/* Intro Text Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border-2 border-[#141b2b] shadow-[6px_6px_0px_#141b2b] text-left sm:text-center">
            <p className="font-body-lg text-body-lg text-on-surface leading-relaxed font-medium">
              At CallMyCar, your security is our priority. We designed our number plate lookup system to resolve parking issues instantly while keeping your personal data completely hidden and protected.
            </p>

            {/* Quick trust metrics matching navbar accents (yellow, pink, dark ink) */}
            <div className="mt-6 pt-5 border-t border-on-surface/10 flex flex-wrap items-center justify-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md border border-[#141b2b] shadow-[2px_2px_0px_#141b2b]">
                <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                Zero Personal Data Shared
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md border border-[#141b2b] shadow-[2px_2px_0px_#141b2b]">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                256-Bit Data Encryption
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-md text-label-md border border-[#141b2b] shadow-[2px_2px_0px_#141b2b]">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                Zero Spam Guarantee
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Privacy Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {privacyPillars.map((pillar) => (
            <div
              key={pillar.id}
              className="group bg-surface-container-lowest rounded-2xl p-7 sm:p-8 border-2 border-[#141b2b] shadow-[4px_4px_0px_#141b2b] hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_#141b2b] transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Row: Trust Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-[#141b2b] shadow-[2px_2px_0px_#141b2b] group-hover:rotate-3 transition-transform ${pillar.colorClass}`}
                  >
                    <span className="material-symbols-outlined text-[28px]">
                      {pillar.icon}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-md text-label-md border border-[#141b2b] shadow-[1.5px_1.5px_0px_#141b2b] ${pillar.chipClass}`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{pillar.badgeIcon}</span>
                      {pillar.badge}
                    </span>
                  </div>
                </div>

                {/* Pillar Title */}
                <h3 className="font-headline-md text-headline-md text-on-surface pt-2 leading-snug">
                  {pillar.title}
                </h3>

                {/* Pillar Exact Description */}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              {/* Bottom Footer Info Strip */}
              <div className="mt-8 pt-4 border-t border-on-surface/10 flex items-center justify-between">
                <span className="font-code-plate text-xs text-on-surface-variant font-bold tracking-wider">
                  PILLAR #{pillar.id}
                </span>
                <span className="flex items-center gap-1.5 font-label-md text-label-md text-tertiary">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                  Active Shield Protection
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Assurance Banner linking to Look up / Register */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-secondary-container border-2 border-[#141b2b] shadow-[6px_6px_0px_#141b2b] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="material-symbols-outlined text-secondary text-[24px]">verified_user</span>
              <h4 className="font-headline-md text-headline-md text-on-secondary-container">
                Rest Easy with Civic Privacy
              </h4>
            </div>
            <p className="font-body-sm text-body-sm text-on-secondary-container/90">
              Enjoy peace of mind knowing your vehicle notifications are 100% masked, encrypted, and respectful.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="#plate-lookup"
              className="px-6 py-3 rounded-full bg-surface-container-lowest text-on-surface font-title-md text-title-md border-2 border-[#141b2b] shadow-[3px_3px_0px_#141b2b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_#141b2b] transition-all"
            >
              Look up a Vehicle
            </a>
            <a
              href="/register"
              className="px-6 py-3 rounded-full bg-secondary text-on-secondary font-title-md text-title-md border-2 border-[#141b2b] shadow-[3px_3px_0px_#141b2b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_#141b2b] transition-all"
            >
              + Register Your Car
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
