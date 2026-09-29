import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { lookupVehicle } from '../api/client';

export default function Home() {
  const navigate = useNavigate();
  const [state, setState] = useState('DL');
  const [isVerified, setIsVerified] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [plateError, setPlateError] = useState('');

  const [plateSegments, setPlateSegments] = useState({
    state: 'DL',
    district: '',
    series: '',
    number: '',
  });

  const handleStateChange = (newState) => {
    setState(newState);
    setPlateSegments((prev) => ({ ...prev, state: newState }));
    setIsVerified(false);
    setPlateError('');
  };

  const updateSegment = (segment, value) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let maxLength = 2;
    if (segment === 'series') maxLength = 2;
    if (segment === 'number') maxLength = 4;
    setPlateSegments((prev) => ({ ...prev, [segment]: cleaned.slice(0, maxLength) }));
    setIsVerified(false);
    setPlateError('');
  };

  const getPlateString = () => {
    const { state, district, series, number } = plateSegments;
    return `${state} ${district} ${series} ${number}`.trim();
  };

  const triggerLookup = async (st = state) => {
    const pl = getPlateString();
    if (!pl.trim()) return;
    await lookupVehicle(pl, st);
    setIsVerified(true);
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

  const handleQuickAlert = (issueName) => {
    const cleanPlate = plate.trim() || 'AA 1234';
    setToastMessage(`Civic alert dispatched to ${cleanPlate}: "${issueName}"`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };

  return (
    <div className="bg-background min-h-screen font-body-md text-on-surface">
      <Header currentPath="how-it-works" />

      <main className="w-full pt-20 bg-background">
        <div className="flex flex-col w-full">
          {/* HERO SECTION: Lavender neo-brutalist playground */}
          <section className="relative w-full bg-secondary-fixed pt-16 pb-24 overflow-hidden">
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

            <div className="relative max-w-[1200px] mx-auto px-6 lg:px-10 z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Hero Text Content */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest text-on-surface shadow-[3px_3px_0px_#141b2b]">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container animate-ping"></span>
                    <span className="font-label-md text-label-md uppercase tracking-wider">
                      Civic Accountability 2.0
                    </span>
                  </div>

                  <h1 className="font-display-hero text-display-hero text-surface-container-lowest drop-shadow-[4px_4px_0px_#141b2b] tracking-tight">
                    CallMyCar
                  </h1>

                  <p className="font-headline-md text-headline-md text-on-surface max-w-xl leading-snug">
                    A civic-minded vehicle management platform. Improving communication and accountability on the roads.
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

                  {/* Micro Metric Highlights */}
                  <div className="pt-6 grid grid-cols-3 gap-4 max-w-lg">
                    <div className="p-3 bg-surface-container-lowest rounded-xl shadow-[3px_3px_0px_#141b2b]">
                      <div className="font-headline-md text-headline-md text-secondary">0 sec</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        Phone privacy revealed
                      </div>
                    </div>
                    <div className="p-3 bg-surface-container-lowest rounded-xl shadow-[3px_3px_0px_#141b2b]">
                      <div className="font-headline-md text-headline-md text-tertiary">94.8%</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        Towing avoided
                      </div>
                    </div>
                    <div className="p-3 bg-surface-container-lowest rounded-xl shadow-[3px_3px_0px_#141b2b]">
                      <div className="font-headline-md text-headline-md text-primary">120k+</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        Civic drivers enrolled
                      </div>
                    </div>
                  </div>
                </div>

                {/* Robot / Civic Companion Illustration Module */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-[6px_6px_0px_#141b2b] overflow-hidden">
                    <div className="flex items-center justify-between pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-error"></span>
                        <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                        <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                        Civic Bot Sentinel v2.4
                      </span>
                    </div>

                    <div className="relative w-full h-80 rounded-xl overflow-hidden bg-secondary-container flex items-center justify-center">
                      <img
                        className="w-full h-full object-cover"
                        alt="Retro-futuristic isometric 3D robot guardian"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0xQ0OhtjPcdhTYip_0upExooZoWYxQH26W-qhJAx2pXmdTlJvwoEtdPbTQfRZ3o_db0JoqUXLRPNiw-EruZ1UxOi3F4ljL3cJ94Ub0ENS_9eIBmoZxHUceoGA31b04aVjFDYIk7a74dvYS_6Pxb_WAWZRhtCidE5ynYlfwYW1dElFJ2Z2lRRpNKcaFkDiXXYbwwtHyhxFh1C98eG4CAvEm16GYpjK7PTq00dJgH6ojQlEshmz2Ww"
                      />
                      {/* Floating Tag */}
                      <div className="absolute bottom-3 left-3 right-3 bg-surface-container-lowest/95 backdrop-blur-sm p-3 rounded-lg shadow-[3px_3px_0px_#141b2b] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[22px]">
                            smart_toy
                          </span>
                          <span className="font-title-md text-title-md text-on-surface">
                            Auto-Relay Guardian
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md">
                          ACTIVE
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          check_circle
                        </span>{' '}
                        End-to-end encrypted
                      </span>
                      <span>Civic Guard Ready</span>
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
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
              {/* Split Showcase: Isometric Parking Scene + Editorial Story */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Isometric Visual Canvas */}
                <div className="lg:col-span-7">
                  <div className="relative bg-surface-container-lowest rounded-2xl p-6 shadow-[6px_6px_0px_#141b2b]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-md text-title-md">
                          P
                        </span>
                        <div>
                          <div className="font-headline-md text-title-md text-on-surface leading-none">
                            Elm Street Bay #4
                          </div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant">
                            Live civic monitoring zone
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md">
                        OCCUPIED
                      </span>
                    </div>

                    {/* Isometric Scene Visual */}
                    <div className="relative w-full h-96 rounded-xl overflow-hidden bg-surface-container">
                      <img
                        className="w-full h-full object-cover"
                        alt="Isometric retro-tech urban parking lot"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA4PpfRVgFHVrdEv1wCMyEIxnHwDNTviFaATBK4oUpTi9fj_-gqRJPt1fpsFbOg5Bvh5C0HZSC0NZrrHZo4EquMdc8CCwMl9qBXO_WoINwAxfdNk-XuqU9pYd3usCqAkTs8BOZXwdU0gGY8rgiPW7lT7OH2ZThfHC3FlzSs8XQbndqJ_yrsn2PQl5yi8tVzsEOuQiPB6KqYrQ2taOalxmb_ZT6Sq0sfHZ1lrKa5M6OdjjPFZCGvjE"
                      />
                      {/* Tactical Interactive Overlay Markers */}
                      <div className="absolute top-8 left-8 bg-surface-container-lowest p-2.5 rounded-xl shadow-[3px_3px_0px_#141b2b] flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-error animate-pulse"></span>
                        <span className="font-label-md text-label-md text-on-surface">
                          Hazard lights blinking
                        </span>
                      </div>
                      <div className="absolute bottom-6 right-6 bg-surface-container-lowest p-3 rounded-xl shadow-[3px_3px_0px_#141b2b] max-w-xs">
                        <div className="flex items-center gap-2 text-tertiary mb-1">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          <span className="font-label-md text-label-md uppercase">
                            1-Tap Neighbor Prompt
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface">
                          "Hey neighbor, your sunroof is cracked open and heavy rain is incoming!"
                        </p>
                      </div>
                    </div>

                    {/* Footnote Action Strip */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-md text-label-md">
                          PARKING ZONE A-12
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Tow-Free Neighborhood Certified
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface font-title-md text-label-lg">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">
                          shield
                        </span>{' '}
                        Identity 100% Masked
                      </div>
                    </div>
                  </div>
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
                    The future of <br className="hidden sm:inline" />
                    civic sense
                  </h2>

                  <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                    Connect with vehicle owners responsibly. Found a car blocking your way or in need
                    of immediate attention? With{' '}
                    <strong className="font-title-md text-on-surface">CallMyCar</strong>, you can
                    send anonymous, courteous notifications for better civic management. Make a
                    difference in your community before calling enforcement.
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
                          Zero Personal Data Exchange
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Neither driver nor notifier ever views phone numbers, email addresses, or
                          home registration info.
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
                          Curated Civic Templates
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Select from anti-harassment pre-approved prompts: blocking driveway,
                          headlights left on, or street sweeper warning.
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
                      Look up any enrolled vehicle to broadcast a safe, standardized civic alert in under 30 seconds.
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
                          <div className="flex items-center gap-2 pl-12 pr-4 h-16">
                            <input
                              id="plate-state"
                              type="text"
                              maxLength={2}
                              value={plateSegments.state}
                              onChange={(e) => updateSegment('state', e.target.value)}
                              readOnly
                              className="w-14 h-12 text-center bg-surface-container font-code-plate text-code-plate text-on-surface uppercase tracking-widest shadow-[2px_2px_0px_#141b2b] rounded-lg focus:outline-none"
                            />
                            <span className="text-on-surface-variant text-lg font-bold"> </span>
                            <input
                              id="plate-district"
                              type="text"
                              maxLength={2}
                              value={plateSegments.district}
                              onChange={(e) => updateSegment('district', e.target.value)}
                              placeholder="01"
                              className="w-14 h-12 text-center bg-surface-bright font-code-plate text-code-plate text-on-surface uppercase tracking-widest shadow-[2px_2px_0px_#141b2b] rounded-lg focus:outline-none focus:bg-surface-container-low transition-colors"
                            />
                            <span className="text-on-surface-variant text-lg font-bold"> </span>
                            <input
                              id="plate-series"
                              type="text"
                              maxLength={2}
                              value={plateSegments.series}
                              onChange={(e) => updateSegment('series', e.target.value)}
                              placeholder="AB"
                              className="w-14 h-12 text-center bg-surface-bright font-code-plate text-code-plate text-on-surface uppercase tracking-widest shadow-[2px_2px_0px_#141b2b] rounded-lg focus:outline-none focus:bg-surface-container-low transition-colors"
                            />
                            <span className="text-on-surface-variant text-lg font-bold"> </span>
                            <input
                              id="plate-number"
                              type="text"
                              maxLength={4}
                              value={plateSegments.number}
                              onChange={(e) => updateSegment('number', e.target.value)}
                              placeholder="1234"
                              className="w-24 h-12 text-center bg-surface-bright font-code-plate text-code-plate text-on-surface uppercase tracking-widest shadow-[2px_2px_0px_#141b2b] rounded-lg focus:outline-none focus:bg-surface-container-low transition-colors"
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

                      {/* Fast Suggestion Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                          Try demo plates:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectDemoPlate('DL', 'DL 01 AB 1234')}
                          className="px-3 py-1 rounded-full bg-surface-container font-label-md text-label-md text-on-surface shadow-[2px_2px_0px_#141b2b] hover:bg-secondary-fixed transition-colors"
                        >
                          DL • DL 01 AB 1234
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectDemoPlate('MH', 'MH 02 CZ 9999')}
                          className="px-3 py-1 rounded-full bg-surface-container font-label-md text-label-md text-on-surface shadow-[2px_2px_0px_#141b2b] hover:bg-secondary-fixed transition-colors"
                        >
                          MH • MH 02 CZ 9999
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectDemoPlate('KA', 'KA 03 MX 4020')}
                          className="px-3 py-1 rounded-full bg-surface-container font-label-md text-label-md text-on-surface shadow-[2px_2px_0px_#141b2b] hover:bg-secondary-fixed transition-colors"
                        >
                          KA • KA 03 MX 4020
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectDemoPlate('HR', 'HR 26 DK 8888')}
                          className="px-3 py-1 rounded-full bg-surface-container font-label-md text-label-md text-on-surface shadow-[2px_2px_0px_#141b2b] hover:bg-secondary-fixed transition-colors"
                        >
                          HR • HR 26 DK 8888
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectDemoPlate('UP', 'UP 16 BK 5555')}
                          className="px-3 py-1 rounded-full bg-surface-container font-label-md text-label-md text-on-surface shadow-[2px_2px_0px_#141b2b] hover:bg-secondary-fixed transition-colors"
                        >
                          UP • UP 16 BK 5555
                        </button>
                      </div>

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

                    {/* Quick Civic Notice Selector (Triggered State) */}
                    <div
                      id="notice-modal"
                      className={`mt-6 pt-6 border-t border-on-surface/10 space-y-4 ${
                        isVerified ? 'block animate-in fade-in duration-300' : 'hidden'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                          <span className="font-title-md text-title-md text-on-surface">
                            Vehicle Verified:{' '}
                            <span id="active-plate-preview" className="font-code-plate text-[20px] text-secondary">
                              {getPlateString()}
                            </span>
                          </span>
                        </div>
                        <span className="text-tertiary font-label-md text-label-md uppercase">
                          Owner Registered
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleQuickAlert('Driveway Blocked')}
                          className="p-3 rounded-xl bg-surface-container hover:bg-secondary-container text-left shadow-[2px_2px_0px_#141b2b] transition-all flex items-center gap-3 group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[20px] text-error">
                              block
                            </span>
                          </div>
                          <div>
                            <div className="font-title-md text-body-md text-on-surface font-semibold">
                              Driveway Blocked
                            </div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">
                              Request gentle repositioning
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickAlert('Lights Left On')}
                          className="p-3 rounded-xl bg-surface-container hover:bg-primary-container text-left shadow-[2px_2px_0px_#141b2b] transition-all flex items-center gap-3 group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[20px] text-primary">
                              lightbulb
                            </span>
                          </div>
                          <div>
                            <div className="font-title-md text-body-md text-on-surface font-semibold">
                              Lights / Hazard On
                            </div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">
                              Battery drain alert
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickAlert('Window Open')}
                          className="p-3 rounded-xl bg-surface-container hover:bg-tertiary-container text-left shadow-[2px_2px_0px_#141b2b] transition-all flex items-center gap-3 group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[20px] text-tertiary">
                              sensor_window
                            </span>
                          </div>
                          <div>
                            <div className="font-title-md text-body-md text-on-surface font-semibold">
                              Window Rolled Down
                            </div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">
                              Rain or security risk
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickAlert('Street Sweeper Alert')}
                          className="p-3 rounded-xl bg-surface-container hover:bg-secondary-fixed text-left shadow-[2px_2px_0px_#141b2b] transition-all flex items-center gap-3 group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-[20px] text-secondary">
                              cleaning_services
                            </span>
                          </div>
                          <div>
                            <div className="font-title-md text-body-md text-on-surface font-semibold">
                              Street Sweeper Impending
                            </div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">
                              Avoid municipality ticket
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Toast indicator */}
                      {showToast && (
                        <div
                          id="status-toast"
                          className="p-4 rounded-xl bg-tertiary-container text-on-tertiary-container font-title-md text-title-md flex items-center justify-between shadow-[3px_3px_0px_#141b2b] animate-in fade-in slide-in-from-top-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[24px]">send</span>
                            <span id="status-message">{toastMessage}</span>
                          </div>
                          <span className="font-label-md text-label-md uppercase bg-surface-container-lowest px-2.5 py-1 rounded-md text-on-surface">
                            Delivered
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS BENTO GRID */}
          <section className="w-full bg-surface-container-low py-20" id="how-it-works">
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
              <div className="text-center space-y-3 mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md shadow-[2px_2px_0px_#141b2b]">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Three Simple Steps</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  How CallMyCar Bridges The Neighborhood
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
                  Replacing angry notes under wiper blades with safe, modern digital civility.
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
                    <span>Instant recognition</span>
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
                      Select an automated courtesy prompt. Our strict community guardrails eliminate
                      hostility, harassment, or verbal street conflicts.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-on-surface/10 flex items-center gap-2 text-secondary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Toxicity-free protocol</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[4px_4px_0px_#141b2b] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-display-hero text-headline-md shadow-[2px_2px_0px_#141b2b]">
                      03
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Immediate Push Alert
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      The driver receives an instant push, voice call, or SMS ping. They can tap "On my
                      way! 2 mins" to resolve the situation before fines or tows happen.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-on-surface/10 flex items-center gap-2 text-primary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                    <span>Under 60s response</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CIVIC COMMUNITY PLEDGE BANNER */}
          <section className="w-full bg-tertiary-container py-14">
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-on-surface shadow-[3px_3px_0px_#141b2b] shrink-0">
                  <span className="material-symbols-outlined text-tertiary text-[32px]">favorite</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-tertiary-container">
                    Join Over 120,000 Neighborly Drivers
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-tertiary-container/80">
                    Every alert sent is one fewer towing invoice, fewer disputes, and a safer street
                    for everybody.
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
