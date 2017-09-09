
/**
 * MapConversationVideoSourceController
 * Concrete view controller to display video source.
 * @constructor
 */
let MapConversationVideoSourceController = MapConversationSourceController.createComponent("MapConversationVideoSourceController");

MapConversationVideoSourceController.createViewFragment = function () {
  return cloneTemplate("#template-map-conversation-videosource");
};

MapConversationVideoSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  let displayPlayer = function displayPlayer(display) {
    this.querySelector(".plyr").hidden = !display;
  }.bind(this.view);

  displayPlayer(false);
  this.source.getFileStats()
    .then(function (stats) {
      if (this.querySelector("video").canPlayType(stats.type) !== "") {
        displayPlayer(true);
      }
    }.bind(this.view));

  let url = this.source.fileHandler.url;
  if (url) {
    this.view.querySelector("source[data-ica-content='0']").src = url;

    this.view.querySelector("a[data-ica-content='0']").href = url;
    this.view.querySelector("a[data-ica-content='0']").textContent = url;
  }

});
