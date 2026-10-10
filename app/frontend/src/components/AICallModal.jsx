import React, { useEffect, useState } from 'react';
import { getCallStatus } from '../api/client';

export default function AICallModal({ isOpen, onClose, plate = 'AA 1234', callId }) {
  const [elapsed, setElapsed] = useState(0);
  const [callState, setCallState] = useState({
    status: 'ringing',
    message: 'Checking call status…',
    step: 1,
  });

  useEffect(() => {
    if (!isOpen) {
      setElapsed(0);
      setCallState({ status: 'ringing', message: 'Checking call status…', step: 1 });
      return;
    }

    const interval = setInterval(async () => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (callId) {
          getCallStatus(callId, next).then((data) => {
            if (data) setCallState(data);
          }).catch((error) => {
            setCallState({
              status: 'unavailable',
              message: error.message || 'Live call status is unavailable.',
              step: 1,
            });
          });
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, callId]);

  if (!isOpen) return null;

  // Compute progress bar width
  const progressPercent =
    callState.step === 1 ? '35%' : callState.step === 2 ? '65%' : callState.step === 3 ? '85%' : '100%';

  const normalizedStatus = String(callState.status || '').toLowerCase();
  const statusLabel = ['ended', 'completed'].includes(normalizedStatus)
    ? 'Call ended'
    : normalizedStatus === 'failed'
      ? 'Call failed'
      : normalizedStatus === 'in-progress'
        ? 'Call in progress'
        : ['ringing', 'queued'].includes(normalizedStatus)
          ? 'Ringing owner'
          : normalizedStatus === 'unavailable'
            ? 'Status unavailable'
            : 'Waiting for call status';

  return (
    <div
      id="ai-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface-container-lowest rounded-lg p-6 lg:p-8 max-w-md w-full shadow-[6px_6px_0px_#111827] space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                callState.step === 4 ? 'bg-tertiary' : 'bg-tertiary animate-ping'
              }`}
            ></div>
            <span className="font-label-md text-label-md text-tertiary uppercase tracking-wider">
              {statusLabel} ({elapsed}s)
            </span>
          </div>
          <button
            id="close-call-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-variant flex items-center justify-center font-bold text-on-surface shadow-[1.5px_1.5px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Center Graphic and Info */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-container flex items-center justify-center shadow-[3px_3px_0px_#111827] relative">
            <span className="material-symbols-outlined text-on-primary-container text-[42px]">
              phone_in_talk
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Call for vehicle {plate}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {callState.message || 'Checking the call status with the voice provider.'}
          </p>
        </div>

        {/* Dynamic Status Progress Bar */}
        <div className="p-4 rounded-lg bg-surface-container-low space-y-2">
          <div className="flex justify-between font-label-md text-label-md text-on-surface-variant">
            <span>Call Status</span>
            <span className="text-tertiary font-bold">{statusLabel}</span>
          </div>
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-tertiary h-full transition-all duration-500 ease-out"
              style={{ width: progressPercent }}
            ></div>
          </div>
        </div>

        {/* End Call Button */}
        <button
          id="end-relay-call-btn"
          onClick={onClose}
          className="w-full py-3 rounded-full bg-error text-on-error font-headline-md text-title-md shadow-[3px_3px_0px_#111827] hover:bg-error/90 active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          {callState.step === 4 || normalizedStatus === 'unavailable' ? 'Close' : 'End Relay Call'}
        </button>
      </div>
    </div>
  );
}
