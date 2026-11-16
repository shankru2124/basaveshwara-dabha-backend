// Audio & Browser notification manager for Restaurant Kitchen / Order Alerts

let audioCtx: AudioContext | null = null;
let alarmIntervalId: any = null;
let autoStopTimeoutId: any = null;
let isAlarmRinging = false;
let activeAlarmOrderId: string | null = null;
const alarmListeners = new Set<(active: boolean, orderId: string | null) => void>();

function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

// Single loud, attention-grabbing commercial kitchen order chime (double harmonic pulse)
function playChimeCycle() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const playNote = (freq: number, start: number, duration: number, gainVal = 0.5) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine'; // Pure, crisp commercial bell chime
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.01, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    } catch (e) {}
  };

  // High-frequency kitchen alert pattern: E6 (1318Hz) -> G6 (1568Hz) -> B6 (1975Hz)
  playNote(1318.51, 0.0, 0.22, 0.45);
  playNote(1567.98, 0.18, 0.22, 0.5);
  playNote(1975.53, 0.36, 0.45, 0.55);
}

/**
 * Start 20-30 seconds persistent kitchen alarm for incoming new order.
 * Rings every 1.3 seconds until restaurant accepts the order or stops alarm.
 */
export function startOrderAlarm(orderId?: string) {
  activeAlarmOrderId = orderId || null;
  isAlarmRinging = true;

  // Clear any existing active loops
  if (alarmIntervalId) clearInterval(alarmIntervalId);
  if (autoStopTimeoutId) clearTimeout(autoStopTimeoutId);

  // Play immediately
  playChimeCycle();

  // Repeat every 1.3 seconds for 20-30 seconds
  alarmIntervalId = setInterval(() => {
    if (isAlarmRinging) {
      playChimeCycle();
    } else {
      stopOrderAlarm();
    }
  }, 1300);

  // Auto-stop after 30 seconds if unacknowledged
  autoStopTimeoutId = setTimeout(() => {
    stopOrderAlarm();
  }, 30000);

  notifyAlarmListeners();
}

/**
 * Stop alarm immediately when restaurant accepts or rejects the order.
 */
export function stopOrderAlarm() {
  if (!isAlarmRinging && !alarmIntervalId && !autoStopTimeoutId) return;

  isAlarmRinging = false;
  activeAlarmOrderId = null;

  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  if (autoStopTimeoutId) {
    clearTimeout(autoStopTimeoutId);
    autoStopTimeoutId = null;
  }

  notifyAlarmListeners();
}

export function isOrderAlarmActive(): boolean {
  return isAlarmRinging;
}

export function getActiveAlarmOrderId(): string | null {
  return activeAlarmOrderId;
}

export function onAlarmStateChange(callback: (active: boolean, orderId: string | null) => void) {
  alarmListeners.add(callback);
  callback(isAlarmRinging, activeAlarmOrderId);
  return () => {
    alarmListeners.delete(callback);
  };
}

function notifyAlarmListeners() {
  alarmListeners.forEach((cb) => {
    try {
      cb(isAlarmRinging, activeAlarmOrderId);
    } catch (e) {}
  });
}

// Backward compatible alias
export function playIncomingOrderAlert(orderId?: string) {
  startOrderAlarm(orderId);
}

export function playTestSound() {
  playChimeCycle();
}

export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

export function showBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/logo.jpg'
      });
    } catch (e) {
      // ignore
    }
  }
}
