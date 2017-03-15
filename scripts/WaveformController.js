
var WaveformController = SingleModelController.createComponent("WaveformController");

WaveformController.createViewFragment = function () {
  return cloneTemplate("#template-waveform");
};

WaveformController.defineAlias("model", "blobHandler");

WaveformController.defineMethod("initView", function initView() {
  if (!this.view) return;

  var waveformCanvas = this.view.querySelector(".waveform-canvas");
  if (waveformCanvas) {
    this.canvasHandler = new CanvasHandler(waveformCanvas);
    this.canvasHandler.clearRect(0, 0, this.canvasHandler.canvasWidth, this.canvasHandler.canvasHeight);
    this.canvasHandler.canvasContext.fillStyle = "#555";
  }

});

WaveformController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  var parentNode = this.view.parentNode;
  var waveformFragment = WaveformController.createViewFragment();
  var waveformElement = waveformFragment.querySelector(".waveform");
  parentNode.replaceChild(waveformFragment, this.view);
  this.uninitView();
  this._view = waveformElement;
  this.initView(false);

  if (!this.blobHandler.blob) return;

  // var audio = new Audio(URL.createObjectURL(this.blobHandler.blob));
  // console.log(audio);

  this.blobHandler.readAsArrayBuffer()
    .then(function (audioData) {

      if (this.canvasHandler) {
        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var audioSource = audioContext.decodeAudioData(audioData, function (buffer) {
          console.log("Audio duration: {0} s".format(buffer.duration));
          for (var channelIndex = 0; channelIndex < buffer.numberOfChannels; channelIndex++) {
            var peaks = [];
            var channel = buffer.getChannelData(channelIndex);
            var sampleLength = Math.floor(3 * channel.length / this.canvasHandler.canvasWidth);
            var gmin = 0, gmax = 0;
            for (var slice = 0; slice < channel.length; slice += sampleLength) {
              var min = 0, max = 0;
              for (let i = slice, end = Math.min(channel.length, slice + sampleLength); i < end; i += 64 * 1024) {
                // Sample min and max
                if (channel[i] < min) min = channel[i];
                if (channel[i] > max) max = channel[i];
              }
              // Global min and max
              if (min < gmin) gmin = min;
              if (max > gmax) gmax = max;
              peaks.push([min, max]);
            }
            var globalRange = gmax - gmin;
            for (let i in peaks) {
              var peak = peaks[i],
                sampleRange = peak[1] - peak[0],
                sampleScale = this.canvasHandler.canvasHeight / buffer.numberOfChannels / globalRange * 0.8,
                sampleHigh = peak[1] * sampleScale,
                sampleLow = peak[0] * sampleScale,
                sampleHeight = sampleHigh - sampleLow;

              this.canvasHandler.roundRect(
                i * this.canvasHandler.canvasWidth / peaks.length + 0.6,
                (1 + 2 * channelIndex) * this.canvasHandler.canvasHeight / 2 / buffer.numberOfChannels - sampleHeight / 2,
                this.canvasHandler.canvasWidth / peaks.length - 1.4,
                sampleHeight,
                1.6);
              this.canvasHandler.fill();
            }
          }
        }.bind(this), function () {
          alert("Decode error");
        });
      }

    }.bind(this));
});

WaveformController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  if (this.canvasHandler) {
    this.canvasHandler.destroy();
    delete this.canvasHandler;
  }

});
