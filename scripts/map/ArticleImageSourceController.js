
var ArticleImageSourceController = ArticleSourceController.createComponent("ArticleImageSourceController");

ArticleImageSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-article-imagesource");
};

ArticleImageSourceController.defineMethod("updateView", function updateView(length = 0) {
  if (!this.view) return;

  var img = this.view.querySelector("img[data-ica-content]");
  img.src = this.source.content
    ? this.source.fileHandler.blob instanceof Blob
      ? this.source.fileHandler.url
      : this.source.fileHandler.url + "?width=" + (img.offsetWidth * this.devicePixelRatio)
    : "";
});
