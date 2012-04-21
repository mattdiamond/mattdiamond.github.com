var context = new webkitAudioContext();

var buffer = context.createBuffer(1, 44100, 44100);
var bufferData = buffer.getChannelData(0);

//generate noise loop
for (var i = 0; i < bufferData.length; i++){
	var samp = Math.random() * 2 - 1;
	bufferData[i] = samp;
}

var gens = [];

function createNoiseGen(freq){
	var panner = context.createPanner();
	var max = 20;
	var min = -20;
	var x = Math.random() * (max - min) + min;
	var y = Math.random() * (max - min) + min;
	var z = Math.random() * (max - min) + min;
	panner.setPosition(x, y, z);
	panner.connect(context.destination);
	
	var filter = context.createBiquadFilter();
	filter.type = 2; //bandpass
	filter.frequency.value = freq;
	filter.Q.value = 150;
	filter.connect(panner);
	
	var bufferSource = context.createBufferSource();
	bufferSource.loop = true;
	bufferSource.buffer = buffer;
	bufferSource.connect(filter);
	bufferSource.gain = 0.2;
	
	bufferSource.noteOn(0);
	gens.push(bufferSource);
}

var scale = [0.0, 2.0, 4.0, 6.0, 7.0, 9.0, 11.0, 12.0, 14.0];
var base_note = 63;
var num_osc = 60;

for (var i = 0; i < num_osc; i++){
	var degree = Math.floor(Math.random() * scale.length);
	var freq = mtof(base_note + scale[degree]);
	freq += Math.random() * 4 - 2;
	createNoiseGen(freq);
}

function mtof(m){
	return Math.pow(2, (m-69)/12) * 440;
}