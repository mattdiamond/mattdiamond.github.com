const WORKER_PATH = 'js/fft-worker.js';

$(function(){
	window.app = new App();
});

class App {
	constructor(){
		this.context = new (window.AudioContext || window.webkitAudioContext)();
		this.editor = new Editor();
		this.setupFileReader();
		this.setupControls();
	}

	setupFileReader(){
		this.fileReader = new FileReader();
		this.fileReader.onload = () => {
			this.output('decoding...');
			this.context.decodeAudioData(this.fileReader.result, buffer => {
				this.editor.loadBuffer(buffer);
				this.output('ready!');
			});
		};
	}

	setupControls(){
		this.$fileInput = $('#FileInput');
		this.$fileInput.on('change', () => {
			var file = this.$fileInput[0].files[0];
			if (file) this.fileReader.readAsArrayBuffer(file);
		});

		$('[data-action="play-selection"]').click(() => {
			this.editor.playSelection();
		});

		$('[data-action="stop-selection"]').click(() => {
			this.editor.stop();
		});

		$('[data-action="process-selection"]').click(() => {
			this.processSelection();
		});

		$('[data-action="stop-fft-playback"]').click(() => {
			this.stopBufferSource();
		});
		
		$('[data-action="normalize"]').click(() => {
			this.editor.normalizeBuffer();	
		});
	}

	processSelection(){
		this.spawnFFTWorker();

		var selection = this.editor.selection;

		this.fftWorker.postMessage({
			left: selection.getChannelData(0),
			right: selection.getChannelData(1)
		});
	}

	spawnFFTWorker(){
		if (this.fftWorker) this.fftWorker.terminate();

		this.fftWorker = new Worker(WORKER_PATH);
		this.fftWorker.onmessage = this.workerMessageHandler.bind(this);
	}

	workerMessageHandler(e){
		if (e.data.type === 'update'){
			this.output(e.data.update);
			return;
		}

		this.playFFTOutput(e.data.left, e.data.right);
	}

	output(text){
		$('#output').text(text);
	}

	playFFTOutput(left, right){
		var context = this.context;
		var outputBuffer = context.createBuffer(2, left.length, context.sampleRate);
		outputBuffer.getChannelData(0).set(left);
		outputBuffer.getChannelData(1).set(right);

		this.stopBufferSource();

		this.bufferSource = context.createBufferSource();
		this.bufferSource.buffer = outputBuffer;
		this.bufferSource.loop = true;
		this.bufferSource.connect(context.destination);
		this.bufferSource.start();
	}

	stopBufferSource(){
		if (this.bufferSource){
			this.bufferSource.stop();
			this.bufferSource.disconnect();
			delete this.bufferSource;
		}
	}
}

class Editor {
	constructor(){
		this.wavesurfer = WaveSurfer.create({
			container: '#waveform'
		});
		this.wavesurfer.enableDragSelection({});
		this.wavesurfer.on('region-update-end', this.onRegionUpdated.bind(this));

		this.selection = this.createSelection();	//init empty selection

		this.$snapToPowerOf2 = $('[data-setting="snap-to-power-of-2"]');
	}

	createSelection(region){
		return new Selection(region, this);
	}

	playSelection(){
		this.selection.play();
	}

	stop(){
		this.wavesurfer.stop();
	}

	onRegionUpdated(region){
		this.stop();
		if (region !== this.selection.region){
			this.selection.remove();
			this.selection = this.createSelection(region);
		} else {	//modified existing region
			this.selection.update();
		}
	}

	loadBuffer(audioBuffer){
		this.audioBuffer = audioBuffer;
		this.wavesurfer.empty();
		this.wavesurfer.loadDecodedBuffer(this.audioBuffer);
	}
	
	normalizeBuffer(){
		normalize(this.audioBuffer.getChannelData(0));
		normalize(this.audioBuffer.getChannelData(1));
		this.wavesurfer.empty();
		this.wavesurfer.drawBuffer();
	}

	getIndexFromTime(time){
		var buffer = this.audioBuffer;
		return Math.floor(time / buffer.duration * buffer.length);
	}

	getTimeFromIndex(index){
		var buffer = this.audioBuffer;
		return index / buffer.length * buffer.duration;
	}

	get snapToPowerOf2(){
		return this.$snapToPowerOf2.is(':checked');
	}
}

class Selection {
	constructor(region, editor){
		this.region = region;
		this.editor = editor;

		if (this.region){
			this.update();
		}
	}

	update(){
		this.calculateIndexes();
		if (this.editor.snapToPowerOf2){
			this.adjustToPowerOf2();
		}
	}

	play(){
		if (this.region) this.region.play();
	}

	getChannelData(channel){
		return this.editor.audioBuffer
				.getChannelData(channel)
				.subarray(this.start, this.end);
	}

	calculateIndexes(){
		this.start = this.editor.getIndexFromTime(this.region.start);
		this.end = this.editor.getIndexFromTime(this.region.end);
	}

	adjustToPowerOf2(){
		var origDuration = this.end - this.start,
			durations = getClosestPowersOf2(origDuration),
			higherGap = durations.higher - origDuration,
			lowerGap = origDuration - durations.lower,
			bufferLength = this.editor.audioBuffer.length;

		if (higherGap < lowerGap && (this.start + durations.higher <= bufferLength)){
			this.end = this.start + durations.higher;
		} else {
			this.end = this.start + durations.lower;
		}
		this.region.update({ end: this.editor.getTimeFromIndex(this.end) });
	}

	remove(){
		if (this.region) this.region.remove();
	}
}

function getClosestPowersOf2(number){
	return {
		lower: Math.pow(2, Math.floor(Math.log2(number))),
		higher: Math.pow(2, Math.ceil(Math.log2(number)))
	};
}

function getMax(array){
	//Math.max(...array) can fail on extremely large arrays
	//so we'll do it via iteration
	
	var max = -Infinity;
	array.forEach(value => {
		if (value > max) max = value;
	});
	
	return max;
}

function normalize(arr){
	var factor = 1 / getMax(arr);
	for (var i = 0; i < arr.length; i++){
		arr[i] *= factor;
	}
}
