var fileReader = new FileReader(),
	context = new AudioContext(),
	getUserMedia = (navigator.getUserMedia
					|| navigator.webkitGetUserMedia
					|| navigator.mozGetUserMedia
					|| navigator.msGetUserMedia).bind(navigator);

var source, fftWorker;

var wavesurfer;

function setupWavesurfer(){
	wavesurfer = WaveSurfer.create({
		container: '#waveform'
	});
}

fileReader.onload = function(){
	reset();
	output('decoding...');
	context.decodeAudioData(fileReader.result, processBuffer);
};

$(function(){
	bindFileInput();
	setupWavesurfer();
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

var selection, audioBuffer;

function processBuffer(buffer){
	audioBuffer = buffer;

	wavesurfer.loadDecodedBuffer(buffer);
	wavesurfer.enableDragSelection({});
	wavesurfer.on('region-update-end', region => {
		if (selection) selection.remove();
		selection = region;
		processSelection();
	});
}

function processSelection(){
	var totalDuration = wavesurfer.getDuration(),
		bufferLength = audioBuffer.length,
		start = Math.floor(selection.start / totalDuration * bufferLength),
		end = Math.floor(selection.end / totalDuration * bufferLength);

	if (fftWorker) fftWorker.terminate();

	fftWorker = spawnWorker();

	var leftSelection = audioBuffer.getChannelData(0).slice(start, end),
		rightSelection = audioBuffer.getChannelData(1).slice(start, end);

	console.log('selection size:', leftSelection.length);

	fftWorker.postMessage({
		left: leftSelection,
		right: rightSelection
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