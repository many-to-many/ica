
var ArticleAudioSourceController = ArticleSourceController.createComponent("ArticleAudioSourceController");

ArticleAudioSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-article-audiosource");
};

ArticleAudioSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  var displayPlayer = function displayPlayer(display) {
    this.querySelectorAll(".source > :not(.download)").forEach(function (element) {
      element.style.display = display ? "" : "none";
    });
  }.bind(this.view);

  displayPlayer(false);
  this.source.getBlobStats()
    .then(function (stats) {
      if (this.querySelector("audio").canPlayType(stats.type) != "") {
        displayPlayer(true);
      }
    }.bind(this.view));

  if (this.source.fileHandler.blob) {
    this.view.querySelector("source[data-ica-content]").src = this.source.fileHandler.url;

    this.view.querySelector("a[data-ica-content]").href = this.source.fileHandler.url;
    this.view.querySelector("a[data-ica-content]").textContent = this.source.fileHandler.url;
  }

});
