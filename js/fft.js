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
};

function bindFileInput(){
	var fileInput = document.getElementById('FileInput');
	fileInput.onchange = function(){
		var file = this.files[0];
		fileReader.readAsArrayBuffer(file);
	};
}

function processBuffer(buffer){
	console.log('running fft...');
	var processedL = fft.frequencyMap(buffer.getChannelData(0), randomPhase);
	var processedR = fft.frequencyMap(buffer.getChannelData(1), randomPhase);

	buffer.copyToChannel(processedL.real, 0);
	buffer.copyToChannel(processedR.real, 1);

	var source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(context.destination);
	console.log('starting buffer...');
	source.start();
}

function randomPhase(obj, i, n){
	console.log(i, n);
	//if (i < 10) obj.real = 0;
}