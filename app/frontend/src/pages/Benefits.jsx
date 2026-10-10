import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const benefits = [
  {
    icon: 'speed',
    title: 'Faster Vehicle Resolution',
    description: 'CallMyCar helps users quickly resolve blocked vehicle situations by connecting drivers and vehicle owners through a secure notification system, reducing unnecessary waiting and searching.',
  },
  {
    icon: 'location_on',
    title: 'Location-Based Assistance',
    description: 'With vehicle location sharing, owners can easily identify where their vehicle is causing an obstruction, making the resolution process faster and more convenient.',
  },
  {
    icon: 'shield',
    title: 'Privacy-Focused Communication',
    description: 'CallMyCar enables communication between drivers and vehicle owners without exposing personal phone numbers, ensuring a safer and more respectful interaction.',
  },
  {
    icon: 'track_changes',
    title: 'Transparent Resolution Tracking',
    description: 'Track the complete journey of a request — from reporting the issue to owner notification and final resolution — creating a clear and reliable experience for users.',
  },
  {
    icon: 'forum',
    title: 'Multiple Communication Channels',
    description: 'Users can receive updates through integrated communication methods like AI voice calls, WhatsApp, or Telegram, ensuring better accessibility and faster responses.',
  },
  {
    icon: 'domain',
    title: 'Scalable for Multiple Environments',
    description: 'CallMyCar can be adapted for campuses, residential communities, offices, hospitals, and parking facilities to improve vehicle management and reduce access-related conflicts.',
  },
];

export default function Benefits() {
  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      <Header />
      <main id="benefits" className="scroll-mt-24 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-36">
        <div className="mx-auto max-w-[1200px]">
          <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            <span className="inline-flex rounded-full bg-secondary-fixed px-4 py-2 font-label-md text-label-md text-on-secondary-fixed">Why CallMyCar</span>
            <h1 className="mt-5 font-display-hero text-4xl leading-tight text-on-surface sm:text-5xl">Benefits</h1>
            <p className="mt-5 font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              CallMyCar provides a faster, safer, and privacy-focused way to resolve blocked vehicle issues. With location assistance, multi-channel notifications, and transparent resolution tracking, it simplifies communication between drivers and vehicle owners while creating a smoother parking experience.
            </p>
          </header>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon, title, description }, index) => (
              <article key={title} className="rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-6 shadow-[4px_4px_0px_#141b2b] sm:p-7">
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${index % 3 === 1 ? 'bg-secondary-fixed text-on-secondary-fixed' : index % 3 === 2 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-container text-on-primary-container'}`}>
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
