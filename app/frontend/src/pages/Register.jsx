import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { registerVehicle } from '../api/client';
import { saveVehicleToFirebase } from '../firebase';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    plateSegments: {
      state: 'KA',
      district: '',
      series: '',
      number: '',
    },
    make: 'Hyundai',
    model: 'Ioniq 5',
    year: '2024',
    color: 'Gravity Gold',
    ownerPhone: '+91 98765 43210',
    ownerName: 'Alex Rivera',
    notifyCall: true,
    notifySms: true,
  });

  const handleStateChange = (newState) => {
    setFormData((prev) => ({
      ...prev,
      plateSegments: { ...prev.plateSegments, state: newState },
    }));
  };

  const updateSegment = (segment, value) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let maxLength = 2;
    if (segment === 'number') maxLength = 4;
    setFormData((prev) => ({
      ...prev,
      plateSegments: { ...prev.plateSegments, [segment]: cleaned.slice(0, maxLength) },
    }));
  };

  const getPlateString = () => {
    const { state, district, series, number } = formData.plateSegments;
    return `${state} ${district} ${series} ${number}`.trim();
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredResult, setRegisteredResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page refresh
    console.log("Submit button clicked! Processing registration...");

    const plate = getPlateString();
    if (!plate.trim()) {
      setErrorMsg('Please enter your license plate number.');
      return;
    }
    if (!formData.ownerPhone.trim()) {
      setErrorMsg('Please enter your phone number to receive automated AI calls/SMS.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    console.log("Processing registration for plate:", cleanPlate);

    try {
      console.log("Attempting to write to Firestore for plate:", cleanPlate);

      // Save to Firestore 'vehicles' collection
      await saveVehicleToFirebase(cleanPlate, {
        name: formData.ownerName || 'Test Owner',
        phone: formData.ownerPhone || '+918641040560',
        telegramChatId: formData.telegramChatId || ''
      });

      console.log("Firestore Write Success!");

      // Also call backend API
      const res = await registerVehicle({ ...formData, plate });
      if (res && res.success) {
        setRegisteredResult(res.vehicle);
        console.log("Backend API Success!");
      } else {
        setErrorMsg(res?.error || 'Registration failed. Please try again.');
      }
      
      console.log("Registration complete!");
      alert("Vehicle registered successfully!");
    } catch (error) {
      console.error("Firestore Error:", error);
      setErrorMsg('Could not register vehicle: ' + error.message);
      alert("Failed to register: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = `${formData.color} ${formData.make} ${formData.model} (${formData.year})`.trim();

  return (
    <div className="bg-background min-h-screen font-body-md text-on-surface">
      <Header currentPath="register" />

      <main className="w-full pt-20 bg-background">
        <div className="flex flex-col w-full">
          {/* Top Scallop Banner */}
          <div className="w-full bg-secondary-container relative">
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-8 pb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Step Tracker */}
              <div className="flex items-center flex-wrap gap-2 text-on-surface">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container shadow-[2px_2px_0px_#111827]">
                  <span className="material-symbols-outlined text-on-primary-container text-[18px]">
                    app_registration
                  </span>
                  <span className="font-label-md text-label-md text-on-primary-container uppercase">
                    1. Register Car
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-secondary-container text-[18px]">
                  arrow_forward
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-[2px_2px_0px_#111827]">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">shield</span>
                  <span className="font-label-md text-label-md text-on-surface uppercase">
                    2. Shield Active
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-secondary-container text-[18px] opacity-40">
                  arrow_forward
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/40 opacity-70">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                    3. Tow Protected
                  </span>
                </div>
              </div>

              {/* Zero Exposure Guarantee */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-tertiary font-label-md text-label-md shadow-[2px_2px_0px_#111827]">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Zero Phone Number Exposure</span>
              </div>
            </div>

            {/* Organic Scallop Wave SVG */}
            <div className="w-full overflow-hidden leading-none">
              <svg
                className="relative block w-full h-10 md:h-14 text-primary-container"
                preserveAspectRatio="none"
                viewBox="0 0 1200 120"
              >
                <path
                  d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,60 L1200,120 L0,120 Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </div>

          {/* Main Action Deck */}
          <div className="w-full bg-primary-container px-6 lg:px-10 pb-24 pt-2">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
              {/* Header Title */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <span className="inline-flex items-center gap-1.5 font-label-lg text-label-lg uppercase tracking-wider text-on-primary-fixed bg-primary-fixed px-3.5 py-1 rounded-full shadow-[2px_2px_0px_#111827]">
                    <span className="material-symbols-outlined text-[16px]">verified_user</span>
                    Civic Protection Onboarding
                  </span>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Register Your Vehicle Shield
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Prevent unexpected towing, dead batteries, and parking tickets. When neighbors
                    need you to reposition your car, our AI Butler contacts you privately without
                    ever exposing your phone number.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-2xl shadow-[3px_3px_0px_#111827]">
                  <span className="w-3 h-3 rounded-full bg-tertiary animate-pulse ml-2"></span>
                  <span className="font-label-md text-label-md text-on-surface pr-3">
                    Free Lifetime Civic Protection
                  </span>
                </div>
              </div>

              {/* Main Split Grid: Form & Live Shield Card */}
              {registeredResult ? (
                /* Success Activation Screen */
                <div className="bg-surface-container-lowest rounded-2xl p-8 lg:p-12 shadow-[6px_6px_0px_#111827] text-center space-y-8 animate-in fade-in duration-300">
                  <div className="w-20 h-20 mx-auto rounded-full bg-tertiary-container flex items-center justify-center shadow-[4px_4px_0px_#111827]">
                    <span className="material-symbols-outlined text-on-tertiary-container text-[44px]">
                      check_circle
                    </span>
                  </div>

                  <div className="space-y-2 max-w-lg mx-auto">
                    <span className="font-label-md text-label-md uppercase px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-[2px_2px_0px_#111827]">
                      Shield Activated & Live
                    </span>
                    <h2 className="font-display-hero text-headline-lg text-on-surface">
                      {registeredResult.plate} is Protected!
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Your vehicle <strong className="text-on-surface">{registeredResult.displayName}</strong> is
                      now enrolled in CallMyCar. When anyone looks up this plate, our AI Voice Butler
                      or encrypted SMS gateway will alert your phone automatically.
                    </p>
                  </div>

                  {/* Digital Civic Decal */}
                  <div className="max-w-md mx-auto p-6 rounded-2xl bg-surface-container-low border-2 border-dashed border-on-surface/20 shadow-[4px_4px_0px_#111827] space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-on-surface/10">
                      <span className="font-label-md text-label-md uppercase text-secondary">
                        CallMyCar Civic Decal
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-tertiary text-on-tertiary text-[11px] font-bold">
                        ACTIVE
                      </span>
                    </div>

                    <div className="py-2">
                      <span className="font-code-plate text-[32px] tracking-widest text-on-surface px-4 py-2 bg-surface-container-lowest rounded-xl shadow-[3px_3px_0px_#111827] inline-block">
                        {registeredResult.plate}
                      </span>
                    </div>

                    <div className="text-left text-on-surface-variant space-y-1 font-body-sm text-body-sm">
                      <p>• Masked Route: {registeredResult.ownerMaskedPhone}</p>
                      <p>• Relay Response: ~30-45s average</p>
                      <p>• Status: 100% Anonymized Civic Proxy</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Link
                      to={`/contact/${encodeURIComponent(registeredResult.plate)}`}
                      className="px-8 py-4 rounded-full bg-secondary text-on-secondary font-headline-md text-headline-md shadow-[4px_4px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                    >
                      Test AI Call to My Car
                    </Link>
                    <button
                      type="button"
                      onClick={() => setRegisteredResult(null)}
                      className="px-6 py-4 rounded-full bg-surface-container font-title-md text-title-md text-on-surface shadow-[4px_4px_0px_#111827] hover:bg-surface-container-high transition-colors"
                    >
                      Register Another Vehicle
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration Form + Preview */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Form Container */}
                  <div className="lg:col-span-7 bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_#111827] space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-on-surface/10">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-[2px_2px_0px_#111827]">
                        <span className="material-symbols-outlined text-[22px]">directions_car</span>
                      </div>
                      <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                          Vehicle & Contact Details
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Your phone number is strictly encrypted and never shared.
                        </p>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-error-container text-on-error-container rounded-xl font-label-md text-label-md">
                        {errorMsg}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Plate and State */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                          <label
                            htmlFor="state"
                            className="block font-label-md text-label-md uppercase text-on-surface-variant mb-1"
                          >
                            State / Region
                          </label>
                          <select
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={(e) => handleStateChange(e.target.value)}
                            className="w-full h-14 px-3 rounded-xl bg-surface-container font-title-md text-title-md text-on-surface shadow-[3px_3px_0px_#111827] focus:outline-none focus:bg-tertiary-fixed transition-colors"
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

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="plate"
                            className="block font-label-md text-label-md uppercase text-on-surface-variant mb-1"
                          >
                            License Plate Number *
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id="plate-state"
                              type="text"
                              maxLength={2}
                              value={formData.plateSegments.state}
                              readOnly
                              className="w-14 h-12 text-center bg-surface-container font-code-plate text-[22px] tracking-widest text-on-surface uppercase shadow-[2px_2px_0px_#111827] rounded-xl focus:outline-none"
                            />
                            <span className="text-on-surface-variant text-xl font-bold"> </span>
                            <input
                              id="plate-district"
                              type="text"
                              maxLength={2}
                              required
                              value={formData.plateSegments.district}
                              onChange={(e) => updateSegment('district', e.target.value)}
                              placeholder="01"
                              className="w-14 h-12 text-center bg-surface-bright font-code-plate text-[22px] tracking-widest text-on-surface uppercase shadow-[2px_2px_0px_#111827] rounded-xl focus:outline-none focus:bg-surface-container-low transition-colors"
                            />
                            <span className="text-on-surface-variant text-xl font-bold"> </span>
                            <input
                              id="plate-series"
                              type="text"
                              maxLength={2}
                              required
                              value={formData.plateSegments.series}
                              onChange={(e) => updateSegment('series', e.target.value)}
                              placeholder="AB"
                              className="w-14 h-12 text-center bg-surface-bright font-code-plate text-[22px] tracking-widest text-on-surface uppercase shadow-[2px_2px_0px_#111827] rounded-xl focus:outline-none focus:bg-surface-container-low transition-colors"
                            />
                            <span className="text-on-surface-variant text-xl font-bold"> </span>
                            <input
                              id="plate-number"
                              type="text"
                              maxLength={4}
                              required
                              value={formData.plateSegments.number}
                              onChange={(e) => updateSegment('number', e.target.value)}
                              placeholder="1234"
                              className="w-24 h-12 text-center bg-surface-bright font-code-plate text-[22px] tracking-widest text-on-surface uppercase shadow-[2px_2px_0px_#111827] rounded-xl focus:outline-none focus:bg-surface-container-low transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Make & Model */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="make"
                            className="block font-label-md text-label-md uppercase text-on-surface-variant mb-1"
                          >
                            Vehicle Make
                          </label>
                          <input
                            id="make"
                            name="make"
                            type="text"
                            value={formData.make}
                            onChange={handleChange}
                            placeholder="e.g., Hyundai, Honda, Tesla"
                            className="w-full h-12 px-4 rounded-xl bg-surface-container font-body-md text-body-md text-on-surface shadow-[2px_2px_0px_#111827] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="model"
                            className="block font-label-md text-label-md uppercase text-on-surface-variant mb-1"
                          >
                            Vehicle Model
                          </label>
                          <input
                            id="model"
                            name="model"
                            type="text"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="e.g., Ioniq 5, Civic, Model 3"
                            className="w-full h-12 px-4 rounded-xl bg-surface-container font-body-md text-body-md text-on-surface shadow-[2px_2px_0px_#111827] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Color & Year */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="color"
                            className="block font-label-md text-label-md uppercase text-on-surface-variant mb-1"
                          >
                            Exterior Color
                          </label>
                          <input
                            id="color"
                            name="color"
                            type="text"
                            value={formData.color}
                            onChange={handleChange}
                            placeholder="e.g., Gravity Gold, Sapphire Blue"
                            className="w-full h-12 px-4 rounded-xl bg-surface-container font-body-md text-body-md text-on-surface shadow-[2px_2px_0px_#111827] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="year"
                            className="block font-label-md text-label-md uppercase text-on-surface-variant mb-1"
                          >
                            Model Year
                          </label>
                          <input
                            id="year"
                            name="year"
                            type="text"
                            maxLength={4}
                            value={formData.year}
                            onChange={handleChange}
                            placeholder="e.g., 2024"
                            className="w-full h-12 px-4 rounded-xl bg-surface-container font-body-md text-body-md text-on-surface shadow-[2px_2px_0px_#111827] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Phone Number (Crucial for receiving calls/SMS) */}
                      <div className="p-4 rounded-xl bg-surface-container-low border border-on-surface/10 space-y-2">
                        <label
                          htmlFor="ownerPhone"
                          className="block font-label-md text-label-md uppercase text-on-surface"
                        >
                          Owner Phone Number (For AI Calls & SMS Relay) *
                        </label>
                        <input
                          id="ownerPhone"
                          name="ownerPhone"
                          type="tel"
                          required
                          value={formData.ownerPhone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000 or +91 98765 43210"
                          className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest font-headline-md text-title-md text-on-surface shadow-[2px_2px_0px_#111827] focus:outline-none"
                        />
                        <p className="font-body-sm text-[12px] text-tertiary flex items-center gap-1 pt-1">
                          <span className="material-symbols-outlined text-[15px]">lock</span>
                          Encrypted on backend. Neither reporters nor public lookups can ever view this.
                        </p>
                      </div>

                      {/* Relay Notification Toggles */}
                      <div className="space-y-2 pt-1">
                        <span className="font-label-md text-label-md uppercase text-on-surface-variant">
                          Relay Notification Channels
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer shadow-[2px_2px_0px_#111827]">
                            <input
                              type="checkbox"
                              name="notifyCall"
                              checked={formData.notifyCall}
                              onChange={handleChange}
                              className="w-4 h-4 text-tertiary accent-tertiary rounded"
                            />
                            <span className="font-label-md text-label-md text-on-surface">
                              Receive AI Voice Calls
                            </span>
                          </label>

                          <label className="flex items-center gap-3 p-3 bg-surface-container rounded-xl cursor-pointer shadow-[2px_2px_0px_#111827]">
                            <input
                              type="checkbox"
                              name="notifySms"
                              checked={formData.notifySms}
                              onChange={handleChange}
                              className="w-4 h-4 text-tertiary accent-tertiary rounded"
                            />
                            <span className="font-label-md text-label-md text-on-surface">
                              Receive Anonymous SMS
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 px-8 rounded-full bg-secondary text-on-secondary font-headline-md text-headline-md shadow-[4px_4px_0px_#111827] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[24px]">verified</span>
                          <span>
                            {isSubmitting ? 'Activating Shield...' : 'Activate Vehicle Shield'}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Live Interactive Decal Card */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[6px_6px_0px_#111827] space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md uppercase tracking-wider text-secondary">
                          Live Shield Pass Preview
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                          PREVIEW
                        </span>
                      </div>

                      {/* Card Graphic */}
                      <div className="p-6 rounded-2xl bg-secondary-fixed/50 border-2 border-on-surface space-y-4 shadow-[3px_3px_0px_#111827]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-[26px]">
                              directions_car
                            </span>
                            <span className="font-headline-md text-title-md text-on-surface">
                              CallMyCar
                            </span>
                          </div>
                          <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                            {formData.plateSegments.state}
                          </span>
                        </div>

                        {/* License Plate Display */}
                        <div className="p-3 bg-surface-container-lowest rounded-xl shadow-[3px_3px_0px_#111827] text-center">
                          <span className="font-code-plate text-[26px] tracking-widest text-on-surface uppercase font-bold">
                            {getPlateString() || 'ENTER PLATE'}
                          </span>
                        </div>

                        <div className="space-y-1 text-on-surface">
                          <div className="font-title-md text-body-md font-semibold">
                            {displayName || 'Vehicle Description'}
                          </div>
                          <p className="font-body-sm text-[12px] text-on-surface-variant">
                            Shield Status: Active Member Shield
                          </p>
                        </div>

                        <div className="pt-2 border-t border-on-surface/10 flex items-center justify-between text-[11px] font-bold text-tertiary">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            Masked: +•• •••• ••••
                          </span>
                          <span>Relay Ready</span>
                        </div>
                      </div>

                      {/* Explainer Perks */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            <strong>No Towing Surprise:</strong> Stranded neighbors alert you before calling municipal towing dispatch.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                            smart_toy
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            <strong>Polite AI Butler:</strong> Handles notifications courteously and eliminates aggressive road rage confrontations.
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                            battery_charging_full
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            <strong>Battery & Window Alerts:</strong> Neighbors notify you immediately if you left headlights on or windows cracked in rain.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
