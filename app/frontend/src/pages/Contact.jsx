import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AICallModal from '../components/AICallModal';
import { lookupVehicle, initiateCall, sendSms } from '../api/client';
import { getVehicleFromFirebase, getTelegramDestinationForVehicle } from '../firebase';

function maskPhoneNumber(phone) {
  if (!phone) return '+91 •••• ••••••';
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.length < 4) return '••••';
  const lastFour = clean.slice(-4);
  return `+•• •••• ••${lastFour}`;
}

export default function Contact() {
  const { plate = 'DL 01 AB 1234' } = useParams();
  const [searchParams] = useSearchParams();
  const stateParam = searchParams.get('state') || 'DL';

  const [urgency, setUrgency] = useState('urgent');
  const [riskTier, setRiskTier] = useState('Blocking Access');
  const [aiMode, setAiMode] = useState('bot');
  const [selectedTemplate, setSelectedTemplate] = useState('🚗 Blocking Driveway');
  const [messageText, setMessageText] = useState(
    'Hey neighbor, your car is currently blocking my driveway. Could you please move it when free? Thanks!'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callSession, setCallSession] = useState(null);
  const [vehicle, setVehicle] = useState({
    plate: decodeURIComponent(plate),
    displayName: 'Sapphire Blue Sedan (2022)',
    responseEstimate: '~42 Seconds',
    shieldStatus: 'Active Member Shield',
  });
  const [smsFeedback, setSmsFeedback] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [targetChatId, setTargetChatId] = useState('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchVehicleData = async () => {
      const decodedPlate = decodeURIComponent(plate);
      const cleanPlate = decodedPlate.replace(/\s+/g, '').toUpperCase();

      // 1. Fetch from Firestore (saved when user registered)
      let fbData = null;
      let telegramDestination = null;
      try {
        fbData = await getVehicleFromFirebase(cleanPlate);
      } catch (err) {
        console.warn('Firebase vehicle lookup note:', err);
      }
      try {
        telegramDestination = await getTelegramDestinationForVehicle(cleanPlate);
      } catch (err) {
        console.warn('Telegram destination lookup note:', err);
      }

      // 2. Fetch from backend lookup
      let backendData = null;
      try {
        backendData = await lookupVehicle(decodedPlate, stateParam);
      } catch (err) {
        console.warn('Backend vehicle lookup note:', err);
      }

      if (!isMounted) return;

      const registeredPhone = fbData?.phone || backendData?.ownerRealPhone || '';
      const registeredChatId = telegramDestination?.telegramChatId || fbData?.telegramChatId || backendData?.telegramChatId || '';
      const vehicleDesc = fbData?.make
        ? `${fbData.color || ''} ${fbData.make} ${fbData.model} (${fbData.year || ''})`.trim()
        : (backendData?.displayName || 'Registered Vehicle');

      const merged = {
        plate: decodedPlate,
        state: stateParam,
        displayName: vehicleDesc,
        responseEstimate: backendData?.responseEstimate || '~30-45 Seconds',
        shieldStatus: backendData?.shieldStatus || 'Active Member Shield',
        registered: true,
        verified: true,
        ownerRealPhone: registeredPhone,
        ownerMaskedPhone: registeredPhone ? maskPhoneNumber(registeredPhone) : (backendData?.ownerMaskedPhone || '+91 •••• ••••••'),
        telegramChatId: registeredChatId,
      };

      setVehicle(merged);
      setTargetPhone(registeredPhone);
      setTargetChatId(registeredChatId);
    };

    fetchVehicleData();
    return () => { isMounted = false; };
  }, [plate, stateParam]);

  const presetTemplates = [
    {
      title: '🚗 Blocking Driveway',
      text: 'Hey neighbor, your car is currently blocking my driveway. Could you please move it when free? Thanks!',
    },
    {
      title: '💡 Lights Left On',
      text: 'Friendly notice: Your headlights/interior lights appear to have been left on!',
    },
    {
      title: '⚠️ Alarm Ringing',
      text: 'Heads up: Your car alarm has been ringing for several minutes.',
    },
    {
      title: '🪟 Window Open',
      text: 'Notice: Passenger window is slightly rolled down in rainy weather.',
    },
    {
      title: '🚨 Street Sweeping / Tow',
      text: 'Street cleaning tow trucks are currently on the street!',
    },
  ];

  const handleTemplateClick = (tpl) => {
    setSelectedTemplate(tpl.title);
    setMessageText(tpl.text);
  };

  const handleInitiateCall = async () => {
    const res = await initiateCall({
      plate: vehicle.plate,
      issue: riskTier,
      urgency,
      ai_mode: aiMode,
      phone: targetPhone || vehicle.ownerRealPhone,
    });
    setCallSession(res);
    setIsModalOpen(true);
  };

  const handleSendSms = async () => {
    const destPhone = targetPhone || vehicle.ownerRealPhone;
    if (!destPhone) {
      alert('Please enter or register a recipient phone number first.');
      return;
    }
    setIsSendingWhatsApp(true);
    try {
      const res = await sendSms({
        plate: vehicle.plate,
        message: messageText,
        phone: destPhone,
      });
      if (res && res.error) {
        alert(`WhatsApp error: ${res.error}`);
      } else {
        setSmsFeedback(`Encrypted WhatsApp alert dispatched successfully to ${destPhone}!`);
        setTimeout(() => {
          setSmsFeedback('');
        }, 4500);
      }
    } catch (e) {
      alert(`Failed to send WhatsApp alert: ${e.message}`);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleSendTelegram = async () => {
    const destChatId = targetChatId || vehicle.telegramChatId;
    setIsSendingTelegram(true);
    try {
      const response = await fetch('/api/telegram-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plateNumber: vehicle.plate,
          customMessage: messageText || 'Please move your vehicle immediately!',
          chatId: destChatId ? destChatId.trim() : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Telegram alert sent successfully to ${data.targetChatId ? `Chat ID ${data.targetChatId}` : 'Telegram'}!`);
      } else {
        alert(`Telegram Error: ${data.error || 'Failed to send Telegram alert'}`);
      }
    } catch (err) {
      console.error('Telegram error:', err);
      alert('Failed to send Telegram alert: ' + err.message);
    } finally {
      setIsSendingTelegram(false);
    }
  };

  return (
    <div className="bg-background min-h-screen font-body-md text-on-surface">
      <Header currentPath="how-it-works" />

      <main className="w-full pt-20 bg-background">
        <div className="flex flex-col w-full">
          {/* Top Scallop / Organic Wave Transition from Lavender to Canary Yellow */}
          <div className="w-full bg-secondary-container relative">
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-8 pb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Step Tracker Breadcrumb */}
              <div className="flex items-center flex-wrap gap-2 text-on-surface">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-[2px_2px_0px_#111827] hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                  <span className="font-label-md text-label-md text-on-surface uppercase">
                    1. Plate {vehicle.plate}
                  </span>
                </Link>
                <span className="material-symbols-outlined text-on-secondary-container text-[18px]">
                  arrow_forward
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-container shadow-[2px_2px_0px_#111827]">
                  <span className="material-symbols-outlined text-on-primary-container text-[18px]">
                    cell_tower
                  </span>
                  <span className="font-label-md text-label-md text-on-primary-container uppercase">
                    2. Select Relay
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-secondary-container text-[18px] opacity-40">
                  arrow_forward
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/40 opacity-70">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                    3. Solved
                  </span>
                </div>
              </div>

              {/* Quick Back & Shield Counter */}
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-tertiary font-label-md text-label-md shadow-[2px_2px_0px_#111827]">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Zero Identity Exposure</span>
                </div>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-variant font-label-md text-label-md text-on-surface transition-transform active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-[16px]">help</span>
                  <span>Help</span>
                </a>
              </div>
            </div>

            {/* Organic Scallop Wave SVG dividing header from Sunny Yellow Canvas */}
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

          {/* Main Canvas: Neo-Brutalist Sunny Canary Yellow Theme */}
          <div className="w-full bg-primary-container px-6 lg:px-10 pb-24 pt-2">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
              {/* Verified Vehicle Banner Card */}
              <div className="w-full bg-surface-container-lowest rounded-lg p-6 lg:p-8 shadow-[4px_4px_0px_#111827] flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 z-10">
                  <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center shadow-[2px_2px_0px_#111827] shrink-0">
                    <span className="material-symbols-outlined text-on-tertiary-container text-[36px]">
                      directions_car
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-code-plate text-headline-md text-on-surface px-3 py-1 bg-surface-container-high rounded-full shadow-[2px_2px_0px_#111827]">
                        {vehicle.plate}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md shadow-[2px_2px_0px_#111827]">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Community Verified
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md">
                        {vehicle.shieldStatus || 'Active Member Shield'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant pt-1">
                      Registered vehicle detected:{' '}
                      <strong className="text-on-surface">{vehicle.displayName}</strong>. Direct
                      encrypted ping is active and standing by.
                    </p>
                  </div>
                </div>

                {/* Vehicle Action Tagline Badge */}
                <div className="flex items-center gap-3 shrink-0 z-10">
                  <div className="flex flex-col text-left lg:text-right">
                    <span className="font-label-md text-label-md uppercase text-on-surface-variant">
                      Response Time
                    </span>
                    <span className="font-headline-md text-headline-md text-tertiary">
                      {vehicle.responseEstimate || '~42 Seconds'}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shadow-[2px_2px_0px_#111827]">
                    <span className="material-symbols-outlined text-on-secondary-container text-[24px]">
                      timer
                    </span>
                  </div>
                </div>

                {/* Subtle retro dot matrix graphic in corner */}
                <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none select-none">
                  <svg fill="#111827" height="180" width="180">
                    <pattern height="16" id="dot-matrix" patternUnits="userSpaceOnUse" width="16" x="0" y="0">
                      <circle cx="3" cy="3" r="2.5"></circle>
                    </pattern>
                    <rect fill="url(#dot-matrix)" height="180" width="180"></rect>
                  </svg>
                </div>
              </div>

              {/* TEMP: Vehicle Debug Panel */}
              <div className="w-full bg-error-container/10 border-2 border-error rounded-xl p-6 mb-8 shadow-[4px_4px_0px_#111827]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-md text-headline-md text-on-error-container flex items-center gap-2">
                    <span className="material-symbols-outlined">bug_report</span>
                    TEMP: Vehicle Debug Info
                  </h3>
                  <span className="px-3 py-1 bg-error text-on-error rounded-full font-label-sm text-label-sm">REMOVE BEFORE PRODUCTION</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                  <div className="bg-surface-container-lowest p-3 rounded-lg">
                    <span className="text-on-surface-variant">plate:</span>
                    <span className="text-on-error-container ml-2">{vehicle.plate}</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg">
                    <span className="text-on-surface-variant">displayName:</span>
                    <span className="text-on-error-container ml-2">{vehicle.displayName}</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg">
                    <span className="text-on-surface-variant">shieldStatus:</span>
                    <span className="text-on-error-container ml-2">{vehicle.shieldStatus}</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg">
                    <span className="text-on-surface-variant">responseEstimate:</span>
                    <span className="text-on-error-container ml-2">{vehicle.responseEstimate}</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg">
                    <span className="text-on-surface-variant">ownerMaskedPhone:</span>
                    <span className="text-on-error-container ml-2">{vehicle.ownerMaskedPhone}</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg">
                    <span className="text-on-surface-variant">registered:</span>
                    <span className="text-on-error-container ml-2">{vehicle.registered ? 'true' : 'false'}</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg">
                    <span className="text-on-surface-variant">verified:</span>
                    <span className="text-on-error-container ml-2">{vehicle.verified ? 'true' : 'false'}</span>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg col-span-2">
                    <span className="text-on-surface-variant">Full object:</span>
                    <pre className="text-on-error-container mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-40">{JSON.stringify(vehicle, null, 2)}</pre>
                  </div>
                </div>
              </div>

              {/* Main Headline + Editorial Direction */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <span className="inline-flex items-center gap-1.5 font-label-lg text-label-lg uppercase tracking-wider text-on-primary-fixed bg-primary-fixed px-3 py-1 rounded-full shadow-[2px_2px_0px_#111827]">
                    <span className="material-symbols-outlined text-[16px]">shield_person</span>
                    100% Anonymized Civic Proxy
                  </span>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    How would you like to alert the owner?
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Keep your neighborhood moving smoothly without confrontation. Your personal phone
                    number, identity, and location are fully encrypted by CallMyCar.
                  </p>
                </div>

                {/* Quick Status Filter Switcher */}
                <div className="flex items-center gap-2 p-1.5 bg-surface-container-lowest rounded-full shadow-[3px_3px_0px_#111827]">
                  <button
                    id="tab-urgent"
                    onClick={() => setUrgency('urgent')}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all ${
                      urgency === 'urgent'
                        ? 'bg-secondary text-on-secondary shadow-[2px_2px_0px_#111827]'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Urgent Dispatch
                  </button>
                  <button
                    id="tab-gentle"
                    onClick={() => setUrgency('gentle')}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all ${
                      urgency === 'gentle'
                        ? 'bg-tertiary text-on-tertiary shadow-[2px_2px_0px_#111827]'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Gentle Reminder
                  </button>
                </div>
              </div>

              {/* Two Primary Option Cards (Side by Side Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* CARD 1: AI Voice Agent Call */}
                <div className="bg-surface-container-lowest rounded-lg p-8 shadow-[4px_4px_0px_#111827] flex flex-col justify-between transition-transform duration-150 hover:-translate-y-1">
                  <div className="space-y-6">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-md text-label-md shadow-[2px_2px_0px_#111827]">
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        Fastest Response • 24/7 Voice Butler
                      </span>
                      <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-code-plate text-label-lg text-on-surface">
                        01
                      </span>
                    </div>

                    {/* Illustration & Headline */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center shadow-[3px_3px_0px_#111827] shrink-0">
                        <span className="material-symbols-outlined text-on-secondary-fixed text-[32px]">
                          support_agent
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                          Call the AI Voice Agent
                        </h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          Direct automated audio call placed through an encrypted proxy relay.
                        </p>
                      </div>
                    </div>

                    <p className="font-body-md text-body-md text-on-surface">
                      Our polite civic voice assistant rings the owner's phone immediately. The bot
                      communicates your vehicle notice clearly or connects you via a scrambled
                      one-way voice tunnel if preferred.
                    </p>

                    {/* Dynamic Settings Box */}
                    <div className="p-5 rounded-lg bg-surface-container-low space-y-4">
                      <span className="font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">
                        AI Speech Configuration
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-full cursor-pointer shadow-[2px_2px_0px_#111827]">
                          <input
                            type="radio"
                            name="ai_mode"
                            checked={aiMode === 'bot'}
                            onChange={() => setAiMode('bot')}
                            className="w-4 h-4 text-tertiary accent-tertiary"
                          />
                          <span className="font-label-md text-label-md text-on-surface">
                            Let Bot Speak
                          </span>
                        </label>
                      </div>

                      {/* Live Call Preview Soundwave Indicator */}
                      <div className="p-3 bg-surface-container-highest rounded-lg flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]">
                            graphic_eq
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface">
                            Bot: "Hello, this is CallMyCar regarding your {vehicle.displayName}..."
                          </span>
                        </div>
                        <span className="font-label-md text-label-md text-tertiary uppercase font-bold">
                          Ready
                        </span>
                      </div>
                    </div>

                    {/* Urgency Level Select Pills */}
                    <div className="space-y-2">
                      <span className="font-label-md text-label-md uppercase text-on-surface-variant">
                        Risk Tier
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {['Standard Notice', 'Blocking Access', 'Imminent Tow Zone'].map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setRiskTier(tier)}
                            className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md shadow-[2px_2px_0px_#111827] transition-colors ${
                              riskTier === tier
                                ? 'bg-secondary-container text-on-secondary-container font-bold'
                                : 'bg-surface-container-highest text-on-surface hover:bg-surface-variant'
                            }`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-8">
                    <button
                      id="initiate-ai-call-btn"
                      type="button"
                      onClick={handleInitiateCall}
                      className="w-full py-4 px-6 rounded-full bg-secondary text-on-secondary font-headline-md text-headline-md flex items-center justify-center gap-3 shadow-[4px_4px_0px_#111827] hover:bg-on-secondary-container transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[24px]">call</span>
                      <span>Initiate AI Voice Call</span>
                    </button>
                    <p className="font-body-sm text-body-sm text-center text-on-surface-variant mt-2.5">
                      Toll-free • Average pickup time under 1 minute
                    </p>
                  </div>
                </div>

                {/* CARD 2: Send Anonymous Text / SMS */}
                <div className="bg-surface-container-lowest rounded-lg p-8 shadow-[4px_4px_0px_#111827] flex flex-col justify-between transition-transform duration-150 hover:-translate-y-1">
                  <div className="space-y-6">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md shadow-[2px_2px_0px_#111827]">
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        Silent • Recorded Delivery Receipt
                      </span>
                      <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-code-plate text-label-lg text-on-surface">
                        02
                      </span>
                    </div>

                    {/* Illustration & Headline */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-[3px_3px_0px_#111827] shrink-0">
                        <span className="material-symbols-outlined text-on-tertiary-fixed text-[32px]">
                          sms
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                          Send Anonymous Text / SMS
                        </h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          Encrypted instant message dispatched straight to the driver's phone.
                        </p>
                      </div>
                    </div>

                    <p className="font-body-md text-body-md text-on-surface">
                      Tap any pre-written civic reason below or tailor your own courteous note. You
                      can also append a rapid snapshot so they understand the obstacle immediately.
                    </p>

                    {/* Quick Template Select Pills */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md uppercase text-on-surface-variant">
                          Quick Preset Templates
                        </span>
                        <span className="font-body-sm text-body-sm text-secondary">Tap to choose</span>
                      </div>
                      <div className="flex flex-wrap gap-2" id="preset-container">
                        {presetTemplates.map((tpl) => (
                          <button
                            key={tpl.title}
                            type="button"
                            onClick={() => handleTemplateClick(tpl)}
                            className={`preset-pill px-3 py-2 rounded-full font-label-md text-label-md transition-colors shadow-[2px_2px_0px_#111827] text-left ${
                              selectedTemplate === tpl.title
                                ? 'bg-secondary text-on-secondary font-bold'
                                : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                            }`}
                          >
                            {tpl.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Message Preview & Attachment */}
                    <div className="space-y-3 pt-2">
                      <div className="relative">
                        <textarea
                          id="message-text"
                          rows={3}
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Compose a friendly, respectful note..."
                          className="w-full p-4 rounded-lg bg-surface-container-lowest font-body-md text-body-md text-on-surface shadow-[3px_3px_0px_#111827] focus:outline-none focus:bg-surface-bright placeholder:text-on-surface-variant"
                        ></textarea>
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                          <label
                            htmlFor="file-upload"
                            title="Attach quick photo"
                            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-variant shadow-[1.5px_1.5px_0px_#111827] cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px] text-on-surface">
                              photo_camera
                            </span>
                          </label>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={() => alert('Photo attached anonymously.')}
                          />
                        </div>
                      </div>
                    </div>

                    {smsFeedback && (
                      <div className="p-3 bg-tertiary-container text-on-tertiary-container rounded-lg font-label-md text-label-md shadow-[2px_2px_0px_#111827]">
                        {smsFeedback}
                      </div>
                    )}

                    {/* Relay Delivery Destinations (Phone & Telegram) */}
                    <div className="mb-4 p-4 bg-surface-container-lowest border-2 border-on-surface rounded-xl shadow-[3px_3px_0px_#111827] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-on-surface font-title-md">
                          <span className="material-symbols-outlined text-[20px] text-tertiary">hub</span>
                          <span className="font-label-md text-label-md uppercase tracking-wider">
                            Active Relay Delivery Destinations
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingTarget(!isEditingTarget)}
                          className="px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-[12px] text-on-surface shadow-[1.5px_1.5px_0px_#111827] hover:bg-secondary-fixed transition-colors cursor-pointer"
                        >
                          {isEditingTarget ? 'Done Testing' : 'Edit / Override Targets'}
                        </button>
                      </div>

                      {isEditingTarget ? (
                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                              Target Phone (WhatsApp & Voice Call)
                            </label>
                            <input
                              type="tel"
                              value={targetPhone}
                              onChange={(e) => setTargetPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full h-10 px-3 rounded-lg bg-surface-container font-mono text-sm text-on-surface border border-on-surface/20 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                              Target Telegram Chat ID (For Telegram Bot)
                            </label>
                            <input
                              type="text"
                              value={targetChatId}
                              onChange={(e) => setTargetChatId(e.target.value)}
                              placeholder="e.g. 5839201948 (Chat ID from @userinfobot)"
                              className="w-full h-10 px-3 rounded-lg bg-surface-container font-mono text-sm text-on-surface border border-on-surface/20 focus:outline-none"
                            />
                            <p className="text-[11px] text-on-surface-variant mt-1">
                              Telegram bots deliver to numerical Chat IDs. This vehicle's registered Chat ID is selected automatically; you can edit it here if needed.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm">
                          <div className="p-2.5 bg-surface-container rounded-lg">
                            <span className="text-xs uppercase text-on-surface-variant block font-bold">WhatsApp & Voice:</span>
                            <span className="font-mono text-on-surface font-semibold">
                              {targetPhone || vehicle.ownerRealPhone || vehicle.ownerMaskedPhone || 'None configured'}
                            </span>
                          </div>
                          <div className="p-2.5 bg-surface-container rounded-lg">
                            <span className="text-xs uppercase text-on-surface-variant block font-bold">Telegram Chat ID:</span>
                            <span className="font-mono text-on-surface font-semibold">
                              {targetChatId || vehicle.telegramChatId ? (
                                <span className="text-tertiary">ID: {targetChatId || vehicle.telegramChatId}</span>
                              ) : (
                                <span className="text-on-surface-variant">Default server channel</span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="text-[11px] text-on-surface-variant">
                        Each registered vehicle delivers alerts to its own owner phone number and Telegram Chat ID.
                      </div>
                    </div>

                  </div>

{/* Bottom Action Buttons */}
                    <div className="pt-8 space-y-4">
                      <button
                        id="send-whatsapp-alert-btn"
                        type="button"
                        disabled={isSendingWhatsApp}
                        onClick={handleSendSms}
                        className="w-full py-4 px-6 rounded-full bg-tertiary text-on-tertiary font-headline-md text-headline-md flex items-center justify-center gap-3 shadow-[4px_4px_0px_#111827] hover:bg-on-tertiary-container transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[24px]">chat</span>
                        <span>{isSendingWhatsApp ? 'Sending WhatsApp...' : 'Send WhatsApp Alert'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSendingTelegram}
                        onClick={handleSendTelegram}
                        className="w-full py-4 px-6 rounded-full bg-primary text-on-primary font-headline-md text-headline-md flex items-center justify-center gap-3 shadow-[4px_4px_0px_#111827] hover:bg-on-primary-container transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[24px]">telegram</span>
                        <span>{isSendingTelegram ? 'Sending Telegram...' : 'Send Telegram Alert'}</span>
                      </button>
                      <p className="font-body-sm text-body-sm text-center text-on-surface-variant mt-2.5">
                        Delivered within seconds via Push + SMS Gateway
                      </p>
                    </div>
                </div>
              </div>

              {/* Live Relay Architecture Diagram / Process Card */}
              <div className="w-full bg-surface-container-lowest rounded-lg p-6 lg:p-8 shadow-[4px_4px_0px_#111827]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
                  <div className="space-y-1">
                    <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider">
                      How Encrypted Proxy Works
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      Three-Way Masked Shield
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
                    End-to-End Relay Servers: Operational
                  </div>
                </div>

                {/* 3-Step Neo-Brutalist Isometric Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Step A */}
                  <div className="p-5 rounded-lg bg-surface-container-low flex flex-col justify-between gap-4 shadow-[2px_2px_0px_#111827]">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-code-plate text-on-primary-container text-label-lg shadow-[2px_2px_0px_#111827]">
                        A
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
                        visibility_off
                      </span>
                    </div>
                    <div>
                      <h4 className="font-title-md text-title-md text-on-surface">
                        You (The Reporter)
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-1">
                        Zero sign-up required. Your caller ID, browser IP, and name are purged on
                        connection.
                      </p>
                    </div>
                  </div>

                  {/* Step B */}
                  <div className="p-5 rounded-lg bg-surface-container-low flex flex-col justify-between gap-4 shadow-[2px_2px_0px_#111827]">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center font-code-plate text-on-secondary-fixed text-label-lg shadow-[2px_2px_0px_#111827]">
                        B
                      </span>
                      <span className="material-symbols-outlined text-secondary text-[22px]">
                        hub
                      </span>
                    </div>
                    <div>
                      <h4 className="font-title-md text-title-md text-on-surface">
                        CallMyCar Relay Node
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-1">
                        Translates the message through AI voice or SMS proxies with automatic
                        anti-harassment filtering.
                      </p>
                    </div>
                  </div>

                  {/* Step C */}
                  <div className="p-5 rounded-lg bg-surface-container-low flex flex-col justify-between gap-4 shadow-[2px_2px_0px_#111827]">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center font-code-plate text-on-tertiary-container text-label-lg shadow-[2px_2px_0px_#111827]">
                        C
                      </span>
                      <span className="material-symbols-outlined text-tertiary text-[22px]">
                        check_circle
                      </span>
                    </div>
                    <div>
                      <h4 className="font-title-md text-title-md text-on-surface">Vehicle Owner</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant pt-1">
                        Receives a courteous, actionable alert to move their car before city fines or
                        towing fees happen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust & Anti-Harassment Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-full bg-surface-container-lowest shadow-[3px_3px_0px_#111827]">
                <div className="flex items-center gap-3 px-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container text-[20px]">
                      verified_user
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Protected by CallMyCar SafeNeighborhood protocol. Explicit language & trolling
                    are scrubbed in real-time.
                  </span>
                </div>
                <a
                  href="#privacy"
                  className="px-5 py-2 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md shadow-[2px_2px_0px_#111827] shrink-0 transition-transform active:translate-x-0.5 active:translate-y-0.5"
                >
                  Read Privacy Shield
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Interactive AI Call Modal */}
      <AICallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plate={vehicle.plate}
        callId={callSession?.callId}
        issue={riskTier}
      />
    </div>
  );
}
