var fileReader = new FileReader(),
	context = new AudioContext(),
	analyser = context.createAnalyser();

fileReader.onload = function(){
	console.log('decoding...');
	context.decodeAudioData(fileReader.result, function(buffer){
		processBuffer(buffer);
	});
};

function processBuffer(buffer){
	bufferSource = context.createBufferSource();
	bufferSource.buffer = buffer;
	//bufferSource.connect(context.destination);
	bufferSource.connect(analyser);
	bufferSource.start();
}

function grab(fftSize){
	analyser.fftSize = fftSize || 2048;
	var result = new Float32Array(analyser.frequencyBinCount);
	analyser.getFloatFrequencyData(result);
	playSound(result);
}

function bindFileInput(){
	$('#FileInput').change(function(){
		var file = this.files[0];
		fileReader.readAsArrayBuffer(file);
	});
}

var compressor = context.createDynamicsCompressor();
compressor.connect(context.destination);

var units = [];

function reset(){
	while (units.length){
		var unit = units.pop();
		unit.osc.stop();
		unit.osc.disconnect();
		unit.gain.disconnect();
	}
}

function playSound(result){
	reset();

	var osc, gain;
	var min = Math.min.apply(Math, result),
		max = Math.max.apply(Math, result);

	$.each(result, function(i, db){
		osc = context.createOscillator();
		osc.frequency.value = binToFreq(i + 1);

		gain = context.createGain();
		gain.gain.value = scale(db, min, max);
		console.log(osc.frequency.value + ': ' + gain.gain.value);

		osc.connect(gain);
		gain.connect(compressor);

		units.push({ osc: osc, gain: gain });

		osc.start();
	});
}

function binToFreq(bin){
	return bin * (context.sampleRate / analyser.fftSize);
}

function scale(num, min, max){
	return (num - min) / (max - min);
}

$(function(){
	bindFileInput();
});