import React from 'react';

export default function Benefits() {
  const benefitsList = [
    {
      id: '01',
      title: 'Faster Vehicle Resolution',
      description:
        'CallMyCar helps users quickly resolve blocked vehicle situations by connecting drivers and vehicle owners through a secure notification system, reducing unnecessary waiting and searching.',
      icon: 'bolt',
      tag: 'Instant Connect',
      colorClass: 'bg-primary-container text-on-primary-container',
      chipColor: 'bg-primary-fixed text-primary',
    },
    {
      id: '02',
      title: 'Location-Based Assistance',
      description:
        'With vehicle location sharing, owners can easily identify where their vehicle is causing an obstruction, making the resolution process faster and more convenient.',
      icon: 'pin_drop',
      tag: 'Pinpoint Location',
      colorClass: 'bg-secondary-container text-on-secondary-container',
      chipColor: 'bg-secondary-fixed text-secondary',
    },
    {
      id: '03',
      title: 'Privacy-Focused Communication',
      description:
        'CallMyCar enables communication between drivers and vehicle owners without exposing personal phone numbers, ensuring a safer and more respectful interaction.',
      icon: 'shield',
      tag: '100% Confidential',
      colorClass: 'bg-tertiary-container text-on-tertiary-container',
      chipColor: 'bg-tertiary-fixed text-tertiary',
    },
    {
      id: '04',
      title: 'Transparent Resolution Tracking',
      description:
        'Track the complete journey of a request — from reporting the issue to owner notification and final resolution — creating a clear and reliable experience for users.',
      icon: 'route',
      tag: 'Full Transparency',
      colorClass: 'bg-secondary-fixed text-secondary',
      chipColor: 'bg-secondary-container text-on-secondary-container',
    },
    {
      id: '05',
      title: 'Multiple Communication Channels',
      description:
        'Users can receive updates through integrated communication methods like AI voice calls, WhatsApp, or Telegram, ensuring better accessibility and faster responses.',
      icon: 'forum',
      tag: 'Multi-Channel Alert',
      colorClass: 'bg-primary-fixed text-primary',
      chipColor: 'bg-primary-container text-on-primary-container',
    },
    {
      id: '06',
      title: 'Scalable for Multiple Environments',
      description:
        'CallMyCar can be adapted for campuses, residential communities, offices, hospitals, and parking facilities to improve vehicle management and reduce access-related conflicts.',
      icon: 'domain',
      tag: 'Universal Fit',
      colorClass: 'bg-surface-container-high text-on-surface',
      chipColor: 'bg-surface-container text-on-surface-variant',
    },
  ];

  return (
    <section
      id="benefits"
      className="relative w-full bg-surface-container-low py-20 lg:py-28 overflow-hidden border-t-2 border-b-2 border-on-surface/10"
      aria-label="CallMyCar Benefits"
    >
      {/* Decorative dot matrix ambient background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="benefits-dots" patternUnits="userSpaceOnUse" width="32" height="32" x="0" y="0">
              <circle className="fill-on-surface" cx="2" cy="2" r="2"></circle>
            </pattern>
          </defs>
          <rect fill="url(#benefits-dots)" width="100%" height="100%"></rect>
        </svg>
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10 z-10">
        {/* Intro / Hero Section */}
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest text-on-surface border-2 border-[#141b2b] shadow-[3px_3px_0px_#141b2b]">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-ping"></span>
            <span className="font-label-md text-label-md uppercase tracking-wider">
              Core Platform Benefits
            </span>
          </div>

          <h2 className="font-display-hero text-headline-lg lg:text-[44px] text-on-surface tracking-tight drop-shadow-[2px_2px_0px_#ffffff] leading-tight">
            Why Drivers & Communities Rely on CallMy<span className="text-secondary">Car</span>
          </h2>

          {/* Short version intro text */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border-2 border-[#141b2b] shadow-[6px_6px_0px_#141b2b] text-left sm:text-center">
            <p className="font-body-lg text-body-lg text-on-surface leading-relaxed font-medium">
              CallMyCar provides a faster, safer, and privacy-focused way to resolve blocked vehicle issues. With location assistance, multi-channel notifications, and transparent resolution tracking, it simplifies communication between drivers and vehicle owners while creating a smoother parking experience.
            </p>

            {/* Quick highlight pills matching navbar accents (yellow, pink, dark) */}
            <div className="mt-6 pt-5 border-t border-on-surface/10 flex flex-wrap items-center justify-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md border border-[#141b2b] shadow-[2px_2px_0px_#141b2b]">
                <span className="material-symbols-outlined text-[16px]">speed</span>
                Zero Waiting Frictions
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md border border-[#141b2b] shadow-[2px_2px_0px_#141b2b]">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                100% Masked Phone Numbers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-md text-label-md border border-[#141b2b] shadow-[2px_2px_0px_#141b2b]">
                <span className="material-symbols-outlined text-[16px]">satellite_alt</span>
                Transparent Tracking
              </span>
            </div>
          </div>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefitsList.map((item) => (
            <div
              key={item.id}
              className="group bg-surface-container-lowest rounded-2xl p-7 border-2 border-[#141b2b] shadow-[4px_4px_0px_#141b2b] hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_#141b2b] transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header row: Icon & Order index */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-[#141b2b] shadow-[2px_2px_0px_#141b2b] group-hover:rotate-3 transition-transform ${item.colorClass}`}
                  >
                    <span className="material-symbols-outlined text-[26px]">
                      {item.icon}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full font-label-md text-label-md border border-[#141b2b] shadow-[1.5px_1.5px_0px_#141b2b] ${item.chipColor}`}
                  >
                    {item.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-headline-md text-headline-md text-on-surface pt-1 leading-snug">
                  {item.title}
                </h3>

                {/* Content description */}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom detail strip */}
              <div className="mt-6 pt-4 border-t border-on-surface/10 flex items-center justify-between text-on-surface-variant">
                <span className="font-code-plate text-xs text-on-surface-variant font-bold tracking-wider">
                  FEATURE #{item.id}
                </span>
                <span className="flex items-center gap-1 font-label-md text-label-md text-secondary group-hover:translate-x-1 transition-transform">
                  <span>Learn more</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Strip linking into app flows */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-primary-container border-2 border-[#141b2b] shadow-[6px_6px_0px_#141b2b] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-headline-md text-headline-md text-on-primary-container">
              Ready to create a smoother parking experience?
            </h4>
            <p className="font-body-sm text-body-sm text-on-primary-container/80">
              Join thousands of civic drivers enrolled in our respectful notification network.
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
