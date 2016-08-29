var fileReader = new FileReader(),
	context = new AudioContext();

fileReader.onload = function(){
	console.log('decoding...');
	context.decodeAudioData(fileReader.result, function(buffer){
		processBuffer(buffer);
	});
};

window.onload = function(){
	bindFileInput();

//	fetch('/samples/sufjan.wav').then(function(response){
//		output('retrieving arraybuffer...');
//		return response.arrayBuffer();
//	}).then(function(arrayBuffer){
//		output('decoding audio data...');
//		return context.decodeAudioData(arrayBuffer);
//	}).then(processBuffer);
};

function bindFileInput(){
	var fileInput = document.getElementById('FileInput');
	fileInput.onchange = function(){
		var file = this.files[0];
		fileReader.readAsArrayBuffer(file);
	};
}

function processBuffer(buffer){
	console.log('starting spectral processing...');

	console.log(buffer.length);

	var limit = 8000000;
	console.log('processing left channel...');
	var processedL = fft.frequencyMap(buffer.getChannelData(0).slice(0, limit), mapFunc);
	console.log('processing right channel...');
	var processedR = fft.frequencyMap(buffer.getChannelData(1).slice(0, limit), mapFunc);

	console.log('spectral processing complete');

	var outputBuffer = context.createBuffer(2, processedL.length, context.sampleRate);
	outputBuffer.copyToChannel(processedL.real, 0);
	outputBuffer.copyToChannel(processedR.real, 1);

	var source = context.createBufferSource();
	source.buffer = outputBuffer;
	source.loop = true;
	source.connect(context.destination);
	source.start();
}

function mapFunc(obj, i, n){
	if (i % 10000 === 0){
		console.log('processed '+i+'/'+n);
	}
	var amplitude = Math.sqrt(Math.pow(obj.imag, 2) + Math.pow(obj.real, 2));
	var phase = Math.PI * 2 * Math.random();

	obj.real = amplitude * Math.cos(phase);
	obj.imag = amplitude * Math.sin(phase);
}