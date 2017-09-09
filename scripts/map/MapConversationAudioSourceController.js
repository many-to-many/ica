
/**
 * MapConversationAudioSourceController
 * Concrete view controller to display an audio source.
 * @constructor
 */
let MapConversationAudioSourceController = MapConversationSourceController.createComponent("MapConversationAudioSourceController");

MapConversationAudioSourceController.createViewFragment = function () {
  return cloneTemplate("#template-map-conversation-audiosource");
};

// View

MapConversationAudioSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  // Transcript
  this.quillTranscript = new Quill(this.view.querySelector(".text"), {
    readOnly: true
  });

});

MapConversationAudioSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  // Audio player

  let displayPlayer = function displayPlayer(display) {
    this.querySelector(".plyr").hidden = !display;
  }.bind(this.view);

  displayPlayer(false);
  this.source.getFileStats()
    .then(function (stats) {
      if (this.querySelector("audio").canPlayType(stats.type) !== "") {
        displayPlayer(true);
      }
    }.bind(this.view));

  let url = this.source.fileHandler.url;
  if (url) {
    this.view.querySelector("source[data-ica-content='0']").src = url;

    this.view.querySelector("a[data-ica-content='0']").href = url;
    this.view.querySelector("a[data-ica-content='0']").textContent = url;
  }

  // Transcript

  this.quillTranscript.setText(this.source.content["1"] || "");

});

MapConversationAudioSourceController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  // Transcript
  delete this.quillTranscript;

});
