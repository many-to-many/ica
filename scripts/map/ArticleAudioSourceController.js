
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

  if (this.source.content instanceof Blob) {
    displayPlayer(true);
  } else {
    displayPlayer(false);
    ICA.getFileStats(this.source.content)
      .then(function (fileStats) {
        if (this.querySelector("audio").canPlayType(fileStats.mime) != "") {
          displayPlayer(true);
        }
      }.bind(this.view));
  }

  if (this.source.blobHandler.blob) {
    this.view.querySelector("source[data-ica-content]").src = this.source.blobHandler.url;

    this.view.querySelector("a[data-ica-content]").href = this.source.blobHandler.url;
    this.view.querySelector("a[data-ica-content]").textContent = this.source.blobHandler.url;
  }

});
