var context = new webkitAudioContext();

var saw = context.createOscillator(),
    sawGain = context.createGainNode(),
    sine = context.createOscillator(),
    sineGain = context.createGainNode(),
    filter = context.createBiquadFilter();

saw.type = saw.SAWTOOTH;
sine.type = sine.SINE;
filter.type = filter.LOWPASS;

sine.frequency.value = 10;

filter.frequency.value = 10000;
filter.Q.value = 10;

sineGain.gain.value = 10;
sawGain.gain.value = 0;

sine.connect(sineGain);
sineGain.connect(saw.frequency);

saw.connect(sawGain);
sawGain.connect(filter);
filter.connect(context.destination);

saw.noteOn(0);
sine.noteOn(0);

var playing = false;

window.onkeydown = function(e){
  if (playing) return;
  playing = true;
  saw.frequency.value = mtof(e.which);
  filter.frequency.cancelScheduledValues(0);
  filter.frequency.setValueAtTime(10000, context.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1000, context.currentTime + 1);
  sawGain.gain.value = 1;
}

window.onkeyup = function(e){
  sawGain.gain.value = 0;
  playing = false;
}

function mtof(m) {
  return Math.pow(2, (m - 69) / 12) * 440;
}