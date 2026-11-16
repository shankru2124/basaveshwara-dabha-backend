/**
 * Web Audio API synthesizer for Restaurant Order Alarm
 * Synthesizes a loud, distinctive restaurant notification bell / siren
 * without depending on missing external MP3 files or network assets.
 */

class SoundAlertController {
  private audioCtx: AudioContext | null = null;
  private intervalId: number | null = null;
  private isRinging: boolean = false;
  private volume: number = 0.8;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays a distinct dual-tone Dabha Order Chime
   */
  public playTone(frequency1 = 880, frequency2 = 660, duration = 0.35) {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency1, now);
      osc.frequency.exponentialRampToValueAtTime(frequency2, now + duration * 0.5);
      osc.frequency.exponentialRampToValueAtTime(frequency1 * 1.2, now + duration);

      gain.gain.setValueAtTime(this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }

  /**
   * Starts a repeating alarm cycle (repeats every intervalSeconds until acknowledged)
   */
  public startRepeatingAlarm(intervalSeconds = 5) {
    if (this.isRinging) return;
    this.isRinging = true;

    // First ring immediately
    this.playTone(880, 660, 0.4);
    setTimeout(() => {
      this.playTone(987, 784, 0.4);
    }, 300);

    // Repeat until stopped
    this.intervalId = window.setInterval(() => {
      if (!this.isRinging) return;
      this.playTone(880, 660, 0.4);
      setTimeout(() => {
        if (!this.isRinging) return;
        this.playTone(987, 784, 0.4);
      }, 300);
    }, intervalSeconds * 1000);
  }

  /**
   * Stops the repeating alarm when the admin acknowledges the order
   */
  public stopAlarm() {
    this.isRinging = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getIsRinging(): boolean {
    return this.isRinging;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }
}

export const soundAlert = new SoundAlertController();
