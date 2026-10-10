import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const privacyPillars = [
  {
    icon: 'visibility_off',
    title: '100% Anonymous Communication',
    description: "Your phone number is never exposed. When someone enters your vehicle's number plate, our automated system handles the WhatsApp messages and voice calls securely in the background.",
  },
  {
    icon: 'lock',
    title: 'Secure Data Storage',
    description: 'Your vehicle registration and personal contact details are encrypted and securely stored on our servers. We never sell or share your data with third parties.',
  },
  {
    icon: 'shield',
    title: 'Anti-Spam Protection',
    description: 'To prevent harassment or misuse of the platform, CallMyCar limits the number of alerts that can be sent to a single vehicle within a specific timeframe.',
  },
  {
    icon: 'location_disabled',
    title: 'No Location Tracking',
    description: 'We respect your privacy. CallMyCar does not track your location or vehicle movements. Alerts are strictly incident-based, triggered only when a license plate is manually searched',
  },
];

export default function SafetyPrivacy() {
  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      <Header />
      <main id="safety-and-privacy" className="scroll-mt-24 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
        <div className="mx-auto max-w-[1200px]">
          <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <span className="inline-flex rounded-full bg-secondary-fixed px-4 py-2 font-label-md text-label-md text-on-secondary-fixed">Your privacy matters</span>
            <h1 className="mt-5 font-display-hero text-4xl leading-tight text-on-surface sm:text-5xl">Safety &amp; Privacy</h1>
            <p className="mt-5 font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              At CallMyCar, your security is our priority. We designed our number plate lookup system to resolve parking issues instantly while keeping your personal data completely hidden and protected.
            </p>
          </header>

          <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2">
            {privacyPillars.map(({ icon, title, description }, index) => (
              <article key={title} className="rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-6 shadow-[4px_4px_0px_#141b2b] sm:p-8">
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${index % 2 === 0 ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-fixed text-on-secondary-fixed'}`}>
                  <span aria-hidden="true" className="material-symbols-outlined text-2xl">{icon}</span>
                </div>
                <h2 className="font-title-lg text-title-lg text-on-surface">{title}</h2>
                <p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
