
/**
 * AudioHandler
 * @constructor
 */
let AudioHandler = ElementHandler.createComponent("AudioHandler");

AudioHandler.defineAlias("element", "audio");

AudioHandler.defineMethod("construct", function construct() {
  this.paused = true;
});

AudioHandler.prototype.play = function () {
  if (this.audio) {
    // If the audio handler is not paused, sync the state of the audio handler to that of the audio object
    // Otherwise, the audio handler is paused, and should start playing the audio
    this.paused |= this.audio.paused;

    if (this.paused) {
      this.paused = false;

      if (!(this.audio instanceof Audio)) {
        this.audio = new Audio(this.audio);
      }

      // Stop audio fade out
      if (this.fadeOutRoutine) {
        this.fadeOutRoutine.end();
      }

      // Play audio
      this.audio.volume = 1.0;
      this.audio.play();

      console.log("AudioHandler: Playing audio");
    }
  }
};

AudioHandler.prototype.stop = function (fadeOut = 0) {
  if (!this.paused) {
    if (this.audio && this.audio instanceof Audio) {

      let dVolume = this.audio.volume, dVolumeStep = 0.05;
      this.fadeOutRoutine = new Routine(function () {
        if (this.audio && this.audio instanceof Audio && !this.audio.paused) {
          if (this.audio.volume > 0.0) {
            this.audio.volume = Math.max(0.0, this.audio.volume - dVolumeStep);
          } else {
            // End audio fade out
            this.fadeOutRoutine.end();

            // Pause audio
            this.audio.pause();
            this.audio.currentTime = 0;

            console.log("AudioHandler: Audio paused");
          }
        }
      }.bind(this), fadeOut / (dVolume / dVolumeStep));

      console.log("AudioHandler: Audio fading out", fadeOut);

    }

    this.paused = true;
  }
};
