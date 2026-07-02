let audioCtx = null;
let alarmInterval = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playZenBellSound = () => {
  initAudio();
  const now = audioCtx.currentTime;
  
  // Beautiful gongs & singing bowl frequencies
  const freqs = [150, 300, 440, 600, 880];
  const gains = [0.6, 0.3, 0.2, 0.1, 0.05];
  
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.3, now);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);
  masterGain.connect(audioCtx.destination);
  
  freqs.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    // Tiny frequency drift for rich natural texture
    osc.frequency.linearRampToValueAtTime(freq + (Math.random() * 2 - 1), now + 4.0);
    
    g.gain.setValueAtTime(gains[i], now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 4.0);
    
    osc.connect(g);
    g.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 4.0);
  });
};

const playCrystalChimeSound = () => {
  initAudio();
  const now = audioCtx.currentTime;
  
  // Play ascending bright arpeggio
  const notes = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
  const times = [0, 0.1, 0.2, 0.3];
  
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + times[idx]);
    
    gainNode.gain.setValueAtTime(0, now + times[idx]);
    gainNode.gain.linearRampToValueAtTime(0.2, now + times[idx] + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + 1.2);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now + times[idx]);
    osc.stop(now + times[idx] + 1.5);
  });
};

const playDigitalBeepSound = () => {
  initAudio();
  const now = audioCtx.currentTime;
  
  const playBeep = (time) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, time);
    
    gainNode.gain.setValueAtTime(0.1, time);
    gainNode.gain.setValueAtTime(0.1, time + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.12);
  };
  
  playBeep(now);
  playBeep(now + 0.25);
};

const triggerSound = (type) => {
  try {
    if (type === 'zen') {
      playZenBellSound();
    } else if (type === 'chime') {
      playCrystalChimeSound();
    } else {
      playDigitalBeepSound();
    }
  } catch (err) {
    console.error('Audio synthesis failed:', err);
  }
};

export const startAlarm = (type = 'zen') => {
  stopAlarm();
  
  // Play first iteration immediately
  triggerSound(type);
  
  // Set up looping intervals based on sound length
  const intervalTime = type === 'zen' ? 5000 : type === 'chime' ? 4000 : 2000;
  alarmInterval = setInterval(() => {
    triggerSound(type);
  }, intervalTime);
};

export const stopAlarm = () => {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
};

export const playPreview = (type = 'zen') => {
  triggerSound(type);
};
