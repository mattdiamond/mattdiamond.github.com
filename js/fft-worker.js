importScripts('/jsfft/lib/complex_array.js', '/jsfft/lib/fft.js');

addEventListener('message', function(e) {
	processData(e.data);
}, false);

function processData(data){
	var complexL = new complex_array.ComplexArray(data.left),
		complexR = new complex_array.ComplexArray(data.right);

	output('starting spectral processing...');

	output('performing FFT on left channel...');
	complexL.FFT();
	output('performing FFT on right channel...');
	complexR.FFT();

	output('transforming left channel spectral data...');
	complexL.map(mapFunc);
	output('transforming right channel spectral data...');
	complexR.map(mapFunc);

	output('performing InvFFT on left channel...');
	complexL.InvFFT();
	output('performing InvFFT on right channel...');
	complexR.InvFFT();

	output('spectral processing complete');

	postMessage({ type: 'result', left: complexL.real, right: complexR.real });
}

function output(text){
	postMessage({ type: 'update', update: text });
}

function complex2freq(obj){
	return {
		amp: Math.sqrt(Math.pow(obj.imag, 2) + Math.pow(obj.real, 2)),
		phase: Math.atan2(obj.imag, obj.real)
	};
}

function freq2complex(bin){
	return {
		real: bin.amp * Math.cos(bin.phase),
		imag: bin.amp * Math.sin(bin.phase)
	};
}

function mapFunc(obj, i, n){
	var freq = complex2freq(obj);

	transform(freq, i, n);

	var complex = freq2complex(freq);

	obj.real = complex.real;
	obj.imag = complex.imag;
}

/* the actual transformation */

function transform(bin, i, n){
	bin.phase = Math.random() * (2 * Math.PI) - Math.PI;
}