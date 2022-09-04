document.addEventListener('DOMContentLoaded', e => {

  let metronome;

  let storedSettings = JSON.parse(localStorage.getItem('settings')) || {bpm: 80, frequency: 220};
  let bpm = storedSettings.bpm;
  let freq = storedSettings.frequency;

  const MAX_BPM = 180;

  const MAX_FREQ = 880;
  const MIN_FREQ = 110;


  // SETUP PLAY / PAUSE
  const toggle = document.querySelector('#toggle');
  const play = document.querySelector('#play');
  const pause = document.querySelector('#pause');
  let playing = false;

  toggle.addEventListener('click', e => {
      if(!metronome) { metronome = new Metronome() }
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
  });

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
    if(metronome)
      metronome.settings({bpm: bpm});
  });

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
    if(metronome)
      metronome.settings({frequency: freq});
  });








});





class Metronome {
  #settings;

  constructor(){
    this.ctx = new AudioContext();

    this.#settings = {
      frequency: 220,
      noteDuration: 0.2,
      bpm: 60,
    }

    this.scheduler = null;
    this.scheduleTime = 0.025;
    this.bufferTime = 0.1;
    this.lastnote = Number.NEGATIVE_INFINITY;
  }

  settings(settings){

    Object.assign(
      this.#settings,
      settings
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
    const n = thisclass.lastnote;
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
