import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState('DL');
  const [plateError, setPlateError] = useState('');

  React.useEffect(() => {
    const targetId = location.hash.slice(1);
    if (!targetId) return;

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.hash]);

  const [plateSegments, setPlateSegments] = useState({
    state: 'DL',
    district: '',
    series: '',
    number: '',
  });

  const handleStateChange = (newState) => {
    setState(newState);
    setPlateSegments((prev) => ({ ...prev, state: newState }));
    setPlateError('');
    document.getElementById('plate-district')?.focus();
  };

  const updateSegment = (segment, value) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let maxLength = 2;
    if (segment === 'series') maxLength = 2;
    if (segment === 'number') maxLength = 4;
    const nextField = { district: 'plate-series', series: 'plate-number' }[segment];
    setPlateSegments((prev) => ({ ...prev, [segment]: cleaned.slice(0, maxLength) }));
    if (cleaned.length >= maxLength && nextField) document.getElementById(nextField)?.focus();
    setPlateError('');
  };

  const getPlateString = () => {
    const { state, district, series, number } = plateSegments;
    return `${state} ${district} ${series} ${number}`.trim();
  };

  const handleProceedToContact = (e) => {
    if (e) e.preventDefault();
    const { district, series, number } = plateSegments;
    if (!district || !series || !number) {
      setPlateError('Please enter a valid vehicle number plate.');
      return;
    }
    setPlateError('');
    const pl = getPlateString();
    navigate(`/contact/${encodeURIComponent(pl.trim())}?state=${state}`);
  };

  return (
    <div className="bg-background min-h-screen font-body-md text-on-surface">
      <Header currentPath="how-it-works" />

      <main className="w-full pt-16 sm:pt-20 bg-background overflow-x-hidden">
        <div className="flex flex-col w-full">
          {/* HERO SECTION: Lavender neo-brutalist playground */}
          <section className="relative w-full bg-secondary-fixed py-12 sm:pt-16 sm:pb-24 overflow-hidden">
            {/* Playful Background Doodles / Ambient Grid Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dot-grid" patternUnits="userSpaceOnUse" width="36" height="36" x="0" y="0">
                    <circle className="fill-on-surface" cx="2" cy="2" r="2"></circle>
                  </pattern>
                </defs>
                <rect fill="url(#dot-grid)" width="100%" height="100%"></rect>
              </svg>
            </div>

            <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 z-10">
              <div className="grid grid-cols-1 gap-8 lg:gap-12 items-center">
                {/* Hero Text Content */}
                <div className="w-full max-w-4xl space-y-6">
                  <h1 className="font-display-hero text-[44px] leading-tight sm:text-display-hero text-[#1d4ed8] tracking-tight">
                    CallMyCar
                  </h1>

                  <p className="font-headline-md text-headline-md text-on-surface max-w-xl leading-snug">
                    A simple way to contact a vehicle owner when their car needs attention.
                  </p>

                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 justify-center px-8 py-4 rounded-full bg-secondary text-on-secondary font-headline-md text-headline-md shadow-[4px_4px_0px_#141b2b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#141b2b] transition-all"
                    >
                      <span className="material-symbols-outlined text-[22px]">app_registration</span>
                      Register Your Car
                    </Link>
                    <a
                      href="#plate-lookup"
                      className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-surface-container-lowest text-on-surface font-title-md text-title-md shadow-[4px_4px_0px_#141b2b] hover:bg-tertiary-fixed transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">search</span>
                      Look up a Vehicle
                    </a>
                  </div>

                  <div className="pt-6 grid grid-cols-1 min-[380px]:grid-cols-3 gap-3 sm:gap-4 max-w-lg">
                    <div className="p-3 bg-surface-container-lowest rounded-xl shadow-[3px_3px_0px_#141b2b] text-center">
                      <div className="font-headline-md text-headline-md text-secondary">0 sec</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">Phone privacy revealed</div>
                    </div>
                    <div className="p-3 bg-surface-container-lowest rounded-xl shadow-[3px_3px_0px_#141b2b] text-center">
                      <div className="font-headline-md text-headline-md text-tertiary">94.8%</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">Towing avoided</div>
                    </div>
                    <div className="p-3 bg-surface-container-lowest rounded-xl shadow-[3px_3px_0px_#141b2b] text-center">
                      <div className="font-headline-md text-headline-md text-primary">120k+</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">Civic drivers enrolled</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Organic Neo-Brutalist Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
              <svg
                className="relative block w-full h-14 lg:h-24 text-primary-container"
                preserveAspectRatio="none"
                viewBox="0 0 1200 120"
              >
                <path
                  d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </section>

          {/* SUNNY YELLOW ACTION DECK */}
          <section className="relative w-full bg-primary-container pt-8 pb-20">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
              {/* Split Showcase: Isometric Parking Scene + Editorial Story */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Parking example image supplied by the user */}
                <div className="lg:col-span-7">
                  <img
                    className="block h-auto w-full"
                    alt="Parking example showing cars in a neighborhood lot and a private contact message"
                    src="/parking-example.jpg"
                  />
                </div>

                {/* Editorial Feature Copy */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-[3px_3px_0px_#141b2b]">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      handshake
                    </span>
                    <span>Respectful Resolution</span>
                  </div>

                  <h2 className="font-display-hero text-headline-lg text-on-surface drop-shadow-[2px_2px_0px_#ffffff] leading-tight">
                    A simple way to reach a driver
                  </h2>

                  <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                    If a parked car is blocking you or needs attention, use{' '}
                    <strong className="font-title-md text-on-surface">CallMyCar</strong> to send its
                    owner a message. Your phone number is not shown to them.
                  </p>

                  {/* Core Value Cards */}
                  <div className="space-y-3 pt-2">
                    <div className="p-4 bg-surface-container-lowest rounded-xl shadow-[4px_4px_0px_#141b2b] flex items-start gap-4 hover:translate-x-1 transition-transform">
                      <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-on-tertiary-container text-[22px]">
                          lock
                        </span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface">
                          Keep your number private
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          The person receiving your alert does not see your phone number.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-surface-container-lowest rounded-xl shadow-[4px_4px_0px_#141b2b] flex items-start gap-4 hover:translate-x-1 transition-transform">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-on-secondary-container text-[22px]">
                          notification_important
                        </span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface">
                          Suggested messages
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Choose a message for a blocked driveway, lights left on, or a nearby street cleaning.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE VEHICLE LOOKUP TOOL */}
              <div className="mt-20 pt-10" id="plate-lookup">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="font-display-hero text-headline-lg text-on-surface drop-shadow-[2px_2px_0px_#ffffff]">
                      Enter Vehicle Number Plate:
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
                      Enter a plate to see whether the vehicle is registered and send its owner a message.
                    </p>
                  </div>

                  {/* Embossed Plate Style Input Wrapper */}
                  <div className="bg-surface-container-lowest p-5 sm:p-8 rounded-2xl shadow-[6px_6px_0px_#141b2b] text-left">
                    <form
                      id="vehicle-form"
                      onSubmit={handleProceedToContact}
                      className="space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* State / Region Picker */}
                        <div className="sm:w-40 relative">
                          <label className="sr-only" htmlFor="state-selector">
                            Jurisdiction
                          </label>
                          <select
                            id="state-selector"
                            value={state}
                            onChange={(e) => handleStateChange(e.target.value)}
                            className="w-full h-16 px-4 rounded-xl bg-surface-container font-title-md text-title-md text-on-surface shadow-[3px_3px_0px_#141b2b] cursor-pointer focus:outline-none focus:bg-tertiary-fixed transition-colors"
                          >
                            <option value="AN">AN - Andaman & Nicobar Islands</option>
                            <option value="AP">AP - Andhra Pradesh</option>
                            <option value="AR">AR - Arunachal Pradesh</option>
                            <option value="AS">AS - Assam</option>
                            <option value="BR">BR - Bihar</option>
                            <option value="CH">CH - Chandigarh</option>
                            <option value="CG">CG - Chhattisgarh</option>
                            <option value="DN">DN - Dadra & Nagar Haveli</option>
                            <option value="DD">DD - Daman & Diu</option>
                            <option value="DL">DL - Delhi</option>
                            <option value="GA">GA - Goa</option>
                            <option value="GJ">GJ - Gujarat</option>
                            <option value="HR">HR - Haryana</option>
                            <option value="HP">HP - Himachal Pradesh</option>
                            <option value="JH">JH - Jharkhand</option>
                            <option value="JK">JK - Jammu & Kashmir</option>
                            <option value="KA">KA - Karnataka</option>
                            <option value="KL">KL - Kerala</option>
                            <option value="LA">LA - Ladakh</option>
                            <option value="LD">LD - Lakshadweep</option>
                            <option value="MP">MP - Madhya Pradesh</option>
                            <option value="MH">MH - Maharashtra</option>
                            <option value="MN">MN - Manipur</option>
                            <option value="ML">ML - Meghalaya</option>
                            <option value="MZ">MZ - Mizoram</option>
                            <option value="NL">NL - Nagaland</option>
                            <option value="OD">OD - Odisha</option>
                            <option value="PB">PB - Punjab</option>
                            <option value="PY">PY - Puducherry</option>
                            <option value="RJ">RJ - Rajasthan</option>
                            <option value="SK">SK - Sikkim</option>
                            <option value="TN">TN - Tamil Nadu</option>
                            <option value="TS">TS - Telangana</option>
                            <option value="TR">TR - Tripura</option>
                            <option value="UP">UP - Uttar Pradesh</option>
                            <option value="UK">UK - Uttarakhand</option>
                            <option value="WB">WB - West Bengal</option>
                          </select>
                        </div>

                        {/* License Plate Input Field - Segmented */}
                        <div className="relative flex-1">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none opacity-40">
                            <span className="material-symbols-outlined text-[24px]">pin</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 pl-10 sm:pl-12 pr-2 sm:pr-4 h-16 min-w-0">
                            <input
                              id="plate-state"
                              type="text"
                              maxLength={2}
                              value={plateSegments.state}
                              onChange={(e) => updateSegment('state', e.target.value)}
                              readOnly
                              className="w-10 sm:w-14 h-12 shrink-0 text-center bg-surface-container font-code-plate text-[18px] sm:text-code-plate text-on-surface uppercase tracking-wider sm:tracking-widest shadow-[2px_2px_0px_#141b2b] rounded-lg focus:outline-none"
                            />
                            <span className="text-on-surface-variant text-lg font-bold"> </span>
                            <input
                              id="plate-district"
                              type="text"
                              maxLength={2}
                              value={plateSegments.district}
                              onChange={(e) => updateSegment('district', e.target.value)}
                              placeholder="01"
                              className="w-10 sm:w-14 h-12 shrink-0 text-center bg-surface-bright font-code-plate text-[18px] sm:text-code-plate text-on-surface uppercase tracking-wider sm:tracking-widest shadow-[2px_2px_0px_#141b2b] rounded-lg focus:outline-none focus:bg-surface-container-low transition-colors"
                            />
                            <span className="text-on-surface-variant text-lg font-bold"> </span>
                            <input
                              id="plate-series"
                              type="text"
                              maxLength={2}
                              value={plateSegments.series}
                              onChange={(e) => updateSegment('series', e.target.value)}
                              placeholder="AB"
                              className="w-10 sm:w-14 h-12 shrink-0 text-center bg-surface-bright font-code-plate text-[18px] sm:text-code-plate text-on-surface uppercase tracking-wider sm:tracking-widest shadow-[2px_2px_0px_#141b2b] rounded-lg focus:outline-none focus:bg-surface-container-low transition-colors"
                            />
                            <span className="text-on-surface-variant text-lg font-bold"> </span>
                            <input
                              id="plate-number"
                              type="text"
                              maxLength={4}
                              value={plateSegments.number}
                              onChange={(e) => updateSegment('number', e.target.value)}
                              placeholder="1234"
                              className="w-[68px] sm:w-24 h-12 shrink-0 text-center bg-surface-bright font-code-plate text-[18px] sm:text-code-plate text-on-surface uppercase tracking-wider sm:tracking-widest shadow-[2px_2px_0px_#141b2b] rounded-lg focus:outline-none focus:bg-surface-container-low transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Inline validation error */}
                      {plateError && (
                        <p className="font-body-sm text-body-sm text-error -mt-2">
                          {plateError}
                        </p>
                      )}

                      {/* Big Tactile Proceed Action Button */}
                      <div className="pt-3">
                        <button
                          id="proceed-btn"
                          type="submit"
                          className="w-full py-4 px-8 rounded-xl bg-secondary text-on-secondary font-headline-md text-headline-md shadow-[4px_4px_0px_#141b2b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#141b2b] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <span>Proceed to Contact Owner</span>
                          <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS BENTO GRID */}
          <section className="w-full bg-surface-container-low py-12 sm:py-20" id="how-it-works">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
              <div className="text-center space-y-3 mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md shadow-[2px_2px_0px_#141b2b]">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Three Simple Steps</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  How it works
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
                  Look up a plate, choose what to say, and send the owner a message.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[4px_4px_0px_#141b2b] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-display-hero text-headline-md shadow-[2px_2px_0px_#141b2b]">
                      01
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Look up by Plate
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Notice a problem with a parked car? Type their license plate into CallMyCar.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-on-surface/10 flex items-center gap-2 text-tertiary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                    <span>Check the plate</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[4px_4px_0px_#141b2b] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-display-hero text-headline-md shadow-[2px_2px_0px_#141b2b]">
                      02
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Pick Pre-Made Notice
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Choose a suggested message or write your own.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-on-surface/10 flex items-center gap-2 text-secondary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Keep it polite</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[4px_4px_0px_#141b2b] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-display-hero text-headline-md shadow-[2px_2px_0px_#141b2b]">
                      03
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      The owner gets an alert
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      The owner receives your message using the contact method available for their vehicle.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-on-surface/10 flex items-center gap-2 text-primary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                    <span>Message sent to the owner</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="benefits" className="scroll-mt-24 w-full bg-surface-container-low py-14 sm:py-20">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Benefits</h2>
                <p className="mt-3 font-body-lg text-body-lg text-on-surface-variant">CallMyCar provides a faster, safer, and privacy-focused way to resolve blocked vehicle issues. With location assistance, multi-channel notifications, and transparent resolution tracking, it simplifies communication between drivers and vehicle owners while creating a smoother parking experience.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['speed', 'Faster Vehicle Resolution', 'CallMyCar helps users quickly resolve blocked vehicle situations by connecting drivers and vehicle owners through a secure notification system, reducing unnecessary waiting and searching.'],
                  ['location_on', 'Location-Based Assistance', 'With vehicle location sharing, owners can easily identify where their vehicle is causing an obstruction, making the resolution process faster and more convenient.'],
                  ['shield', 'Privacy-Focused Communication', 'CallMyCar enables communication between drivers and vehicle owners without exposing personal phone numbers, ensuring a safer and more respectful interaction.'],
                  ['track_changes', 'Transparent Resolution Tracking', 'Track the complete journey of a request — from reporting the issue to owner notification and final resolution — creating a clear and reliable experience for users.'],
                  ['forum', 'Multiple Communication Channels', 'Users can receive updates through integrated communication methods like AI voice calls, WhatsApp, or Telegram, ensuring better accessibility and faster responses.'],
                  ['domain', 'Scalable for Multiple Environments', 'CallMyCar can be adapted for campuses, residential communities, offices, hospitals, and parking facilities to improve vehicle management and reduce access-related conflicts.'],
                ].map(([icon, title, description]) => (
                  <article key={title} className="rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-6 shadow-[4px_4px_0px_#141b2b]">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
                      <span aria-hidden="true" className="material-symbols-outlined text-2xl">{icon}</span>
                    </div>
                    <h3 className="font-title-lg text-title-lg text-on-surface">{title}</h3>
                    <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="safety-and-privacy" className="scroll-mt-24 w-full bg-background py-14 sm:py-20">
            <div className="mx-auto grid max-w-[1200px] gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-10 lg:items-center">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Safety &amp; Privacy</h2>
                <p className="mt-4 max-w-xl font-body-lg text-body-lg text-on-surface-variant">CallMyCar is designed to help people resolve everyday vehicle issues with a private, considerate message.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl bg-surface-container-low p-5">
                  <h3 className="font-title-lg text-title-lg text-on-surface">Your phone number stays private</h3>
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Alerts are relayed without displaying the sender’s number to the vehicle owner.</p>
                </article>
                <article className="rounded-2xl bg-surface-container-low p-5">
                  <h3 className="font-title-lg text-title-lg text-on-surface">Use the service responsibly</h3>
                  <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Send relevant, respectful alerts. Call emergency services directly when someone is in immediate danger.</p>
                </article>
              </div>
            </div>
          </section>

          {/* CIVIC COMMUNITY PLEDGE BANNER */}
          <section className="w-full bg-on-surface py-14">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-on-surface shadow-[3px_3px_0px_#141b2b] shrink-0">
                  <span className="material-symbols-outlined text-tertiary text-[32px]">favorite</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-white">
                    Need to reach a vehicle owner?
                  </h3>
                  <p className="font-body-sm text-body-sm text-white/75">
                    Look up the plate and send a clear message about the issue.
                  </p>
                </div>
              </div>
              <a
                href="#plate-lookup"
                className="shrink-0 px-8 py-3.5 rounded-full bg-surface-container-lowest text-on-surface font-title-md text-title-md shadow-[4px_4px_0px_#141b2b] hover:bg-surface-container transition-colors"
              >
                Try Plate Lookup Now
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
