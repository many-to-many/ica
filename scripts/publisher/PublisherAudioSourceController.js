
var PublisherAudioSourceController = PublisherSourceController.createComponent("PublisherAudioSourceController");

PublisherAudioSourceController.createViewFragment = function () {
  return cloneTemplate("#template-publisher-audiosource");
};

PublisherAudioSourceController.defineMethod("initView", function () {
  if (!this.view) return;

  this.waveformController = new WaveformController(
    this.source.fileHandler,
    this.view.querySelector(".waveform"));

  this.publisherSourceDropHandler = new DropHandler(this.view, function (files) {
    this.querySelector("[data-ica-source-content='0']").files = files;
  }.bind(this.view));

  this.view.querySelector("[data-ica-source-content='0']").addEventListener("change", function (e) {
    var file = e.target.files[0];
    this.controller.source.content = file;
    this.controller.source.didUpdate();
  }.bind(this.view));

  this.view.querySelector("[data-ica-action='select-file']").addEventListener("click", function (e) {
    e.preventDefault();

    this.view.querySelector("[data-ica-source-content='0']").click();
  }.bind(this));

  this.player = plyr.setup(this.view.querySelector(".player"), {
    controls: ["play", "progress", "current-time", "fullscreen"]
  })[0];

  var editor = this.view.querySelector("[data-ica-source-content='1']");
  this.quill = new Quill(editor, {
    modules: {
      toolbar: false
    },
    theme: ""
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

  this.quill.setText(this.source.content["1"]);
});

PublisherAudioSourceController.defineMethod("uninitView", function () {
  if (!this.view) return;

  this.waveformController.destroy();
  delete this.waveformController;

  this.publisherSourceDropHandler.destroy();
  delete this.publisherSourceDropHandler;

  delete this.quill;
});
