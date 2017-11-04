
/**
 * PublisherAudioSourceController
 * Concrete view controller to present an audio source.
 * @constructor
 */
let PublisherAudioSourceController = PublisherSourceController.createComponent("PublisherAudioSourceController");

PublisherAudioSourceController.createViewFragment = function () {
  return cloneTemplate("#template-publisher-audiosource");
};

PublisherAudioSourceController.defineMethod("initView", function () {
  if (!this.view) return;

  this.publisherSourceDropHandler = new DropHandler(this.view, function (files) {
    this.querySelector("[data-ica-source-content='0']").files = files;
  }.bind(this.view));

  this.view.querySelector("[data-ica-source-content='0']").addEventListener("change", function (event) {
    this.controller.source.content["0"] = event.target.files[0];
    this.controller.source.didUpdate();
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='select-file']").addEventListener("click", function (event) {
    event.preventDefault();

    this.view.querySelector("[data-ica-source-content='0']").click();
  }.bind(this));

  this.player = plyr.setup(this.view.querySelector(".player"), {
    controls: ["play", "progress", "current-time", "fullscreen"]
  })[0];

  this.quill = new Quill(this.view.querySelector("[data-ica-source-content='1']"), {
    placeholder: "Enter transcription/translation here..."
  });
  this.quill.on("text-change", function () {
    this.source.content["1"] = this.quill.getText().replace(/\n$/, "");
  }.bind(this));
});

PublisherAudioSourceController.defineMethod("updateView", function () {
  if (!this.view) return;

  if (this.source && this.source.fileHandler.blob) {
    this.player.source({
      type: "audio",
      sources: [{
        src: this.source.fileHandler.url
      }]
    });
  }

  this.quill.setText(this.source.content["1"] || "");
});

PublisherAudioSourceController.defineMethod("uninitView", function () {
  if (!this.view) return;

  this.publisherSourceDropHandler.destroy();
  delete this.publisherSourceDropHandler;

  delete this.quill;
});
