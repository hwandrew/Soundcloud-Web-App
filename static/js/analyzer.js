// establish all variables that the analyzer will use
var audio, canvas, ctx, source, context, analyzer, fbcArray,
  bars, barX, barWidth, barHeight;
var levelsData = [];
var beatTime;
var beatCutOff = 0;
var beatMin = 0.15;
var beatHoldTime = 40;
var beatDecayRate = 0.90;

// initialize analyzer data
function initAnalyzer() {
  // obtain the current instance of the audio object
  audio = document.getElementById("audioPlayer");
  audio.crossOrigin = "anonymous";
  context = new AudioContext(); // AudioContext object instance
  analyzer = context.createAnalyser();
  canvas = document.getElementById('visualizer');
  ctx = canvas.getContext('2d');
  // re-route audio playback into processing graph of the audioContext
  source = context.createMediaElementSource(audio);
  source.connect(analyzer);
  analyzer.connect(context.destination);
  updateFrame();
}

function updateAnalyzer() {
  audio.crossOrigin = "anonymous";
  fbcArray = new Uint8Array(analyzer.frequencyBinCount);
  analyzer.getByteFrequencyData(fbcArray); // length: 1024

  // normalize fbcArray
  for (var i = 0; i < 32; i++) {
    var sum = 0;
    for (var j = 0; j < 32; j++) {
      sum += fbcArray[(i * 32) + j];
    }
    levelsData[i] = sum / 32 / 256;
  }

  var sum = 0;
  for (var i = 0; i < 32; i++) {
    sum += levelsData[i];
  }
  level = sum / 32;

  if (level  > beatCutOff && level > beatMin){
    ctx.fillStyle = '#C25B56';
    beatCutOff = level *1.1;
    beatTime = 0;
  }
  else {
    ctx.fillStyle = '#FEF6EB';
    if (beatTime <= beatHoldTime) {
      beatTime ++;
    }
    else {
      beatCutOff *= beatDecayRate;
      beatCutOff = Math.max(beatCutOff, beatMin);
    }
  }

  ctx.beginPath();
  ctx.arc(canvas.width - 20, 20, 20, 0, 2 * Math.PI);
  ctx.fill();

  // set visualizer shapes
  ctx.fillStyle = '#FEF6EB';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, fbcArray[100], 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#C25B56';
  bars = 200;
  barWidth = 2;
  for (var i = 0; i < bars; i++) {
    barX = 170 + (i * 10);
    barHeight = -(fbcArray[i * 5]);
    ctx.fillRect(barX, canvas.height, barWidth, barHeight);
  }
}

function updateFrame() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.requestAnimationFrame(updateFrame);

  // set background
  ctx.fillStyle = '#525564';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updateAnalyzer();
}

$(function() {
  initAnalyzer();
});
