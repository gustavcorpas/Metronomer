let metronome;

const storedSettings = JSON.parse(localStorage.getItem('settings')) || {};

let bpm = parseInt(storedSettings.bpm) || 80;
let freq = parseInt(storedSettings.frequency) || 220;
let adjust = parseInt(storedSettings.adjust) || 0;

let adjustInterval = null;

const MAX_BPM = 180;

const MAX_ADJUST = 60;

const MAX_FREQ = 880;
const MIN_FREQ = 110;


// SETUP PLAY / PAUSE
const toggle = document.querySelector('#toggle');
const play = document.querySelector('#play');
const pause = document.querySelector('#pause');
let playing = false;

toggle.addEventListener('click', () => {
    if(!metronome) metronome = new Metronome();
    metronome.settings({bpm: bpm, frequency: freq});
    if(!playing){
      metronome.start();
      play.classList.add('disable');
      pause.classList.remove('disable');

    }else{
      metronome.stop();
      play.classList.remove('disable');
      pause.classList.add('disable');
    }

  playing = !playing;
}, {passive: true});

// SETUP BPM SLIDER
const rangeSliderThumbBpm = document.querySelector('#range-slider-thumb-bpm');
const inputBpm = document.querySelector('#input-bpm');
const pBpm = document.querySelector('#p-bpm');

rangeSliderThumbBpm.style.width = `${bpm / MAX_BPM * 100}%`;
inputBpm.value = bpm;
pBpm.textContent = bpm;

inputBpm.addEventListener('input', e => {
  bpm = e.target.value;
  pBpm.textContent = bpm;
  rangeSliderThumbBpm.style.width = `${bpm / MAX_BPM * 100}%`;
  if(metronome){
    metronome.settings({bpm: bpm});
  }
}, {passive: true});

// SETUP FREQUENCY SLIDER
const rangeSliderThumbFreq = document.querySelector('#range-slider-thumb-freq');
const inputFreq = document.querySelector('#input-freq');
const pFreq = document.querySelector('#p-freq');

rangeSliderThumbFreq.style.width = `${(freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ) * 100}%`;
inputFreq.value = freq;
pFreq.textContent = freq;

inputFreq.addEventListener('input', e => {
  freq = e.target.value;
  pFreq.textContent = freq;
  rangeSliderThumbFreq.style.width = `${(freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ) * 100}%`;
  if(metronome){
    metronome.settings({frequency: freq});
  }
}, {passive: true});

// SETUP DYNAMIC BPM CHANGER
const rangeSliderThumbAdjust = document.querySelector('#range-slider-thumb-adjust');
const inputAdjust = document.querySelector('#input-adjust');
const pAdjust = document.querySelector('#p-adjust');

rangeSliderThumbAdjust.style.width = `${(freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ) * 100}%`;
inputAdjust.value = adjust;
pAdjust.textContent = adjust;

inputAdjust.addEventListener('input', e => {
  adjust = e.target.value;
  pAdjust.textContent = adjust;
  rangeSliderThumbAdjust.style.width = `${(adjust) / MAX_ADJUST * 100}%`;
  registerAdjustChange(adjust, false);
}, {passive: true});

let adjustWaiting = false;

function registerAdjustChange(val, cb){
  if(!cb && adjustWaiting === true) return;
  adjustWaiting = true;
  if(cb && val === adjust) { adjustWaiting = false; return; }
  setTimeout(registerAdjustChange, 1000, adjust, true);

  // ADJUST CHANGED
  console.log("adjust changed to: " + adjust);
  clearInterval(adjustInterval);
  const s = (adjust / 60);
  if(s !== 0){
    adjustInterval = setInterval(adjustBPM, 1 / s * 1000 );
  }

}

function adjustBPM(){
  console.log("adjust");
  if( metronome && bpm !== MAX_BPM && playing ){
    bpm += 1;
    metronome.settings({bpm: bpm});
    pBpm.textContent = bpm;
    rangeSliderThumbBpm.style.width = `${bpm / MAX_BPM * 100}%`;
    inputBpm.value = bpm;
  }
  console.log("done");

}












class Metronome {
  #settings;

  constructor(){
    this.ctx = new AudioContext();

    this.#settings = {
      frequency: 220,
      noteDuration: 0.2,
      bpm: 60,
    };

    this.scheduler = null;
    this.scheduleTime = 0.025;
    this.bufferTime = 0.1;
    this.lastnote = Number.NEGATIVE_INFINITY;
  }

  settings(settings){

    Object.assign(
      this.#settings,
      settings,
    );
    localStorage.setItem('settings', JSON.stringify(this.#settings));
  }

  start(){
    if(this.scheduler) throw Error('Metronome aldready playing!');
    this.scheduler = setInterval(this.scheduleNotes, this.scheduleTime * 1000, this);
    this.lastnote = this.ctx.currentTime;
  }

  stop(){
    clearInterval(this.scheduler);
    this.scheduler = null;
  }

  scheduleNotes(thisclass){

    const t = 60 / thisclass.#settings.bpm;
    let i = 1;

    while( thisclass.lastnote < thisclass.ctx.currentTime + thisclass.bufferTime){

      thisclass.#beep( thisclass.lastnote + (t * i) );
      i++;
    }
  }

  #beep(time){
    this.osc = this.ctx.createOscillator();
    this.osc.connect( this.ctx.destination );
    this.osc.frequency.value = this.#settings.frequency;
    this.osc.start(time);
    this.osc.stop(time + this.#settings.noteDuration);
    this.lastnote = time;

  }

}
