var fileReader = new FileReader(),
	context = new AudioContext(),
	getUserMedia = (navigator.getUserMedia
					|| navigator.webkitGetUserMedia
					|| navigator.mozGetUserMedia
					|| navigator.msGetUserMedia).bind(navigator);

var source, fftWorker;

fileReader.onload = function(){
	reset();
	output('decoding...');
	context.decodeAudioData(fileReader.result, processBuffer);
};

$(function(){
	bindFileInput();

	//getUserMedia({ audio: true }, setUpMediaRecorder, function(){});
});

function spawnWorker(){
	var worker = new Worker('js/fft-worker.js');
	worker.onmessage = messageHandler;
	return worker;
}

function reset(){
	if (source){
		source.stop();
		source.disconnect();
	}
	$('#output').empty();
}

function setUpMediaRecorder(stream){
	var record = document.getElementById('record'),
		stop = document.getElementById('stop'),
		source = context.createMediaStreamSource(stream),
		recorder = context.createScriptProcessor(),
		recording = false, chunkSize = recorder.bufferSize,
		inputL, inputR;

	source.connect(recorder);
	recorder.connect(context.destination);

	record.onclick = function(){
		output('recording');
		inputL = inputR = [];
		recording = true;
	};

	stop.onclick = function(){
		recording = false;

		var arrayLength = inputL.length,
			bufferLength = chunkSize * arrayLength,
			buffer = context.createBuffer(2, bufferLength, context.sampleRate);

		for (var i = 0; i < arrayLength; i++){
			buffer.copyToChannel(inputL[i], 0, i * chunkSize);
			buffer.copyToChannel(inputR[i], 1, i * chunkSize);
		}

		processBuffer(buffer);
	};

	recorder.onaudioprocess = function(e){
		if (!recording) return;
		inputL.push(e.inputBuffer.getChannelData(0));
		inputR.push(e.inputBuffer.getChannelData(1));
	};
}

function bindFileInput(){
	var fileInput = document.getElementById('FileInput');
	fileInput.onchange = function(){
		var file = this.files[0];
		fileReader.readAsArrayBuffer(file);
	};
}

function processBuffer(buffer){
	if (fftWorker) fftWorker.terminate();

	fftWorker = spawnWorker();

	fftWorker.postMessage({
		left: buffer.getChannelData(0),
		right: buffer.getChannelData(1)
	});
}

function messageHandler(e){
	if (e.data.type === 'update'){
		output(e.data.update);
		return;
	}

	var left = e.data.left,
		right = e.data.right;

	var outputBuffer = context.createBuffer(2, left.length, context.sampleRate);
	outputBuffer.copyToChannel(left, 0);
	outputBuffer.copyToChannel(right, 1);

	source = context.createBufferSource();
	source.buffer = outputBuffer;
	source.loop = true;
	source.connect(context.destination);
	source.start();
}

function output(text){
	$('#output').text(text);
}