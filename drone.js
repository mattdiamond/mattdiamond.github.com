var context = new webkitAudioContext();

//connect gain
var gain = context.createGainNode();
gain.gain.value = 10.0;
gain.connect(context.destination);

var noiseNodes = [];

function createNoiseGen(freq) {
  var panner = context.createPanner();
  var max = 20;
  var min = -20;
  var x = rand(min, max);
  var y = rand(min, max);
  var z = rand(min, max);
  panner.setPosition(x, y, z);
  panner.connect(gain);

  var filter = context.createBiquadFilter();
  filter.type = 2; //bandpass
  filter.frequency.value = freq;
  filter.Q.value = 150;
  filter.connect(panner);

  var noiseSource = context.createJavaScriptNode(1024, 0, 2);
  noiseSource.onaudioprocess = function (e) {
    var outBufferL = e.outputBuffer.getChannelData(0);
    var outBufferR = e.outputBuffer.getChannelData(1);
    for (var i = 0; i < 1024; i++) {
      outBufferL[i] = outBufferR[i] = Math.random() * 2 - 1;
    }
  };
  noiseSource.connect(filter);
  noiseNodes.push(noiseSource);

  setInterval(function () {
    x = x + rand(-0.1, 0.1);
    y = y + rand(-0.1, 0.1);
    z = z + rand(-0.1, 0.1);
    panner.setPosition(x, y, z);
  }, 500);

}

var scale = [0.0, 2.0, 4.0, 6.0, 7.0, 9.0, 11.0, 12.0, 14.0];
var base_note = 63;
var num_osc = 40;

for (var i = 0; i < num_osc; i++) {
  var degree = Math.floor(Math.random() * scale.length);
  var freq = mtof(base_note + scale[degree]);
  freq += Math.random() * 4 - 2;
  createNoiseGen(freq);
}

function mtof(m) {
  return Math.pow(2, (m - 69) / 12) * 440;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}