
var MapConversationAudioSourceController = MapConversationSourceController.createComponent("MapConversationAudioSourceController");

MapConversationAudioSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-map-conversation-audiosource");
};

MapConversationAudioSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  var displayPlayer = function displayPlayer(display) {
    this.querySelectorAll(".source > :not(.download)").forEach(function (element) {
      element.style.display = display ? "" : "none";
    });
  }.bind(this.view);

  displayPlayer(false);
  this.source.getFileStats()
    .then(function (stats) {
      if (this.querySelector("audio").canPlayType(stats.type) != "") {
        displayPlayer(true);
      }
    }.bind(this.view));

  if (this.source.fileHandler.blob) {
    this.view.querySelector("source[data-ica-content='0']").src = this.source.fileHandler.url;

    this.view.querySelector("a[data-ica-content='0']").href = this.source.fileHandler.url;
    this.view.querySelector("a[data-ica-content='0']").textContent = this.source.fileHandler.url;
  }

  MapConversationTextSourceController.renderText(this.source.content["1"], this.view.querySelector(".text"));
});
