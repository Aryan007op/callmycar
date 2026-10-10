// Active Cloudflare Quick Tunnel for the local WhatsApp backend. This URL changes
// if the Quick Tunnel is restarted; keep Vercel deployments in sync with it.
const BASE_URL = 'https://accommodations-utah-gifts-unique.trycloudflare.com';
export const apiUrl = (path) => `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export async function registerVehicle(vehicleData) {
  const res = await fetch(apiUrl('/api/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicleData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || 'Vehicle registration failed.');
  }
  return data;
}

export async function lookupVehicle(plate, state = 'NY') {
  const res = await fetch(apiUrl('/api/lookup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plate, state }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.vehicle) {
    throw new Error(data.error || 'Vehicle lookup failed.');
  }
  return data.vehicle;
}

export async function initiateCall({ plate, issue, urgency = 'urgent', ai_mode = 'bot' }) {
  const res = await fetch(apiUrl('/api/call'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plate, issue, urgency, ai_mode }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'The call could not be started.');
  }
  return data;
}

export async function getCallStatus(callId) {
  const res = await fetch(apiUrl(`/api/status/${callId}`));
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Call status is unavailable.');
  }
  return data;
}

export async function sendSms({ plate, message, phone, additionalPhones = [] }) {
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
        additionalPhones,
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
    return { success: false, error: err.message || 'Telegram service is unavailable.' };
  }
}
