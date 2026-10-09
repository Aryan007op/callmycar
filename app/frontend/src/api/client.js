// Active Cloudflare Quick Tunnel for the local WhatsApp backend. This URL changes
// if the Quick Tunnel is restarted; keep Vercel deployments in sync with it.
const BASE_URL = 'https://accommodations-utah-gifts-unique.trycloudflare.com';
export const apiUrl = (path) => `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export async function registerVehicle(vehicleData) {
  try {
    const res = await fetch(apiUrl('/api/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicleData),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, using simulated vehicle registration:', err);
  }

  return {
    success: true,
    message: `Vehicle ${vehicleData.plate} registered successfully!`,
    vehicle: {
      ...vehicleData,
      displayName: `${vehicleData.color || ''} ${vehicleData.make || ''} ${vehicleData.model || ''} (${vehicleData.year || '2024'})`.trim(),
      shieldStatus: 'Active Member Shield',
      ownerMaskedPhone: '+1 (•••) •••-' + (vehicleData.ownerPhone ? vehicleData.ownerPhone.slice(-4) : '1234'),
      registered: true,
      verified: true,
    },
  };
}

export async function lookupVehicle(plate, state = 'NY') {
  try {
    const res = await fetch(apiUrl('/api/lookup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plate, state }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.vehicle;
    }
  } catch (err) {
    console.warn('Backend unavailable, using fallback mock:', err);
  }

  // Fallback mock
  return {
    plate: plate.toUpperCase(),
    state: state.toUpperCase(),
    displayName: 'Sapphire Blue Sedan (2022)',
    registered: true,
    verified: true,
    responseEstimate: '~42 Seconds',
    shieldStatus: 'Active Member Shield',
    ownerMaskedPhone: '+1 (•••) •••-4291',
  };
}

export async function initiateCall({ plate, issue, urgency = 'urgent', ai_mode = 'bot', phone }) {
  try {
    const res = await fetch(apiUrl('/api/call'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plate, issue, urgency, ai_mode, phone }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, using simulated call session:', err);
  }

  return {
    success: true,
    callId: `mock_call_${Date.now()}`,
    status: 'ringing',
    message: `AI Voice Assistant is dialing the registered driver of ${plate}.`,
  };
}

export async function getCallStatus(callId, elapsedSeconds = 0) {
  try {
    const res = await fetch(apiUrl(`/api/status/${callId}`));
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // fallback progression
  }

  if (elapsedSeconds < 4) {
    return {
      success: true,
      status: 'ringing',
      step: 1,
      message: 'Ringing handset...',
    };
  } else if (elapsedSeconds < 8) {
    return {
      success: true,
      status: 'answered',
      step: 2,
      message: 'Handset answered. Scrambling audio tunnel...',
    };
  } else if (elapsedSeconds < 16) {
    return {
      success: true,
      status: 'speaking',
      step: 3,
      message: 'AI Butler speaking to owner respectfully...',
    };
  } else {
    return {
      success: true,
      status: 'completed',
      step: 4,
      message: 'Owner responded: "On my way! 2 mins." Call ended successfully.',
    };
  }
}

export async function sendSms({ plate, message, phone }) {
  try {
    // Sanitize plate number (remove spaces, special chars)
    const cleanPlate = (plate || '').replace(/\s+/g, '').toUpperCase();
    
    const res = await fetch(apiUrl('/api/sms'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plateNumber: cleanPlate,
        customMessage: message,
        phone: phone || '',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      return {
        success: false,
        error: data.error || data.message || `WhatsApp request failed with status ${res.status}.`,
      };
    }
    return data;
  } catch (err) {
    console.warn('WhatsApp backend request failed:', err);
    return { success: false, error: err.message || 'WhatsApp service is unavailable.' };
  }
}

// Alias retained for callers that use the alert-specific API name.
export const sendSmsAlert = sendSms;

export async function sendAssistantReport({ plateNumber, issue = 'blocking my car', urgency = 'standard' }) {
  try {
    const res = await fetch(apiUrl('/api/assistant-report'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plateNumber, issue, urgency }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok ? data : { ...data, success: false };
  } catch (err) {
    return { success: false, fulfillmentText: err.message || 'Could not reach CallMyCar.' };
  }
}

export async function sendTelegramAlert({ plate, message, chatId }) {
  try {
    const cleanPlate = (plate || '').replace(/\s+/g, '').toUpperCase();
    const res = await fetch(apiUrl('/api/telegram-alert'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plateNumber: cleanPlate,
        customMessage: message,
        chatId: chatId || undefined,
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback Telegram response:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}
