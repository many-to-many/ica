
var ArticleHyperlinkSourceController = ArticleSourceController.createComponent("ArticleHyperlinkSourceController");

ArticleHyperlinkSourceController.createViewFragment = function (source) {
  return cloneTemplate("#template-article-hyperlinksource");
};

ArticleHyperlinkSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-content]").href
    = this.view.querySelector("[data-ica-content]").textContent = this.source.content;

});
