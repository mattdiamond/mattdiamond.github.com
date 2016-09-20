var fileReader = new FileReader(),
	context = new AudioContext(),
	fftWorker = new Worker('js/fft-worker.js');
	getUserMedia = (navigator.getUserMedia
					|| navigator.webkitGetUserMedia
					|| navigator.mozGetUserMedia
					|| navigator.msGetUserMedia).bind(navigator);

var source;

fileReader.onload = function(){
	reset();
	output('decoding...');
	context.decodeAudioData(fileReader.result, processBuffer);
};

$(function(){
	bindFileInput();

	//getUserMedia({ audio: true }, setUpMediaRecorder, function(){});
});

function reset(){
	if (source){
		source.stop();
		source.disconnect();
	}
	document.getElementById('output').innerHTML = '';
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
	fftWorker.postMessage({
		left: buffer.getChannelData(0),
		right: buffer.getChannelData(1)
	});
}

fftWorker.addEventListener('message', function(e){
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
}, false);

function output(text){
	$('#output').text(text);
}