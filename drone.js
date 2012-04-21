var context = new webkitAudioContext();

var buffer = context.createBuffer(1, 44100, 44100);
var bufferData = buffer.getChannelData(0);

//generate noise loop
for (var i = 0; i < bufferData.length; i++){
	var samp = Math.random() * 2 - 1;
	bufferData[i] = samp;
}

function createNoiseGen(freq){
	var panner = context.createPanner();
	var max = 20;
	var min = -20;
	var x = rand(min, max);
	var y = rand(min, max);
	var z = rand(min, max);
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
	bufferSource.gain = 1.0;
	bufferSource.playbackRate.value = 1 + rand(-0.1, 0.1);
	
	setInterval(function(){
		x = x + rand(-0.1, 0.1);
		y = y + rand(-0.1, 0.1);
		z = z + rand(-0.1, 0.1);
		panner.setPosition(x, y, z);
	}, 500);
	
	bufferSource.noteOn(0);
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

function rand(min, max){
	return Math.random() * (max - min) + min;
}