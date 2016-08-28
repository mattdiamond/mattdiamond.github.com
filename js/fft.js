var fileReader = new FileReader(),
	context = new AudioContext(),
	sampleRate = context.sampleRate;

fileReader.onload = function(){
	console.log('decoding...');
	context.decodeAudioData(fileReader.result, function(buffer){
		processBuffer(buffer);
	});
};

window.onload = function(){
	//bindFileInput();

	output('downloading audio sample (please wait)...')

	fetch('/samples/sufjan.wav').then(function(response){
		output('retrieving arraybuffer...');
		return response.arrayBuffer();
	}).then(function(arrayBuffer){
		output('decoding audio data...');
		return context.decodeAudioData(arrayBuffer);
	}).then(processBuffer);
};

function output(text){
	document.body.innerHTML += text + '<br>';
}

function bindFileInput(){
	var fileInput = document.getElementById('FileInput');
	fileInput.onchange = function(){
		var file = this.files[0];
		fileReader.readAsArrayBuffer(file);
	};
}

function processBuffer(buffer){
	output('running spectral processing...');
	var processedL = fft.frequencyMap(buffer.getChannelData(0), mapFunc);
	var processedR = fft.frequencyMap(buffer.getChannelData(1), mapFunc);

	buffer.copyToChannel(processedL.real, 0);
	buffer.copyToChannel(processedR.real, 1);

	var source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(context.destination);
	output('starting bufferSource...');
	source.start();
}

function mapFunc(obj, i, n){
	obj.imag = Math.random() / 100;
}