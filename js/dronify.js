var context = new webkitAudioContext();
var fileReader = new FileReader();
var bufferSources = [];

fileReader.onload = function(){
  context.decodeAudioData(fileReader.result, function(buffer){
    processBuffer(buffer);
  }, function(){
    alert("Sorry, but that audio file couldn't be decoded. Please try another file.");
  });
}

function processBuffer(buffer){
  var duration = buffer.duration;
  var grainLen, spacing, wobble;
  grainLen = spacing = wobble = 1.0;
  for (var i = 0; i < duration; i += spacing){
    var bufferSource = context.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.loop = true;
    bufferSource.gain.value = (spacing / duration);
    bufferSource.noteGrainOn(context.currentTime + rand(0, wobble), i, grainLen);
    bufferSource.connect(context.destination);
    bufferSources.push(bufferSource);
  }
}

function reset(){
  while (bufferSources.length){
    var source = bufferSources.pop();
    source.noteOff(0);
    source.disconnect();
  }
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

$(function(){
  $('#FileInput').change(function(){
    reset();
    var file = this.files[0];
    fileReader.readAsArrayBuffer(file);
  });
});