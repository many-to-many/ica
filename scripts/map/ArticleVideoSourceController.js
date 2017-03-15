
var ArticleVideoSourceController = ArticleSourceController.createComponent("ArticleVideoSourceController");

ArticleVideoSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-videosource");
};

ArticleVideoSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  if (this.source.blobHandler.blob) {
    this.view.querySelector("source[data-ica-content]").src = this.source.blobHandler.url;

    this.view.querySelector("a[data-ica-content]").href = this.source.blobHandler.url;
    this.view.querySelector("a[data-ica-content]").textContent = this.source.blobHandler.url;
  }

});
