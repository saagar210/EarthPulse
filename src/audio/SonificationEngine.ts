let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch((e) => console.warn("AudioContext resume failed:", e));
  }
  return audioCtx;
}

let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;

export function playEarthquakeTone(magnitude: number, depth: number): void {
  const ctx = getContext();
  const freq = 100 + magnitude * 100;
  const duration = 0.5;
  const volume = Math.min(magnitude / 10, 1.0);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  // Depth → reverb-like effect (longer tail for deep quakes)
  const depthFactor = Math.min(depth / 700, 1.0);
  const totalDuration = duration + depthFactor * 0.5;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + totalDuration);
}

export function updateKpDrone(kpIndex: number): void {
  const ctx = getContext();
  const volume = Math.max(0, Math.min(kpIndex / 9, 1.0)) * 0.15;

  if (!droneOsc) {
    droneOsc = ctx.createOscillator();
    droneGain = ctx.createGain();
    droneOsc.type = "sine";
    droneOsc.frequency.value = 65; // C2
    droneGain.gain.value = 0;
    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);
    droneOsc.start();
  }

  if (droneGain) {
    droneGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1);
  }
}

export function stopDrone(): void {
  if (droneOsc) {
    try {
      droneOsc.stop();
    } catch {
      // Already stopped — safe to ignore
    }
    droneOsc.disconnect();
    droneOsc = null;
  }
  if (droneGain) {
    droneGain.disconnect();
    droneGain = null;
  }
}

export function cleanup(): void {
  stopDrone();
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
}
