
var ArticleSourceController = SourceController.createComponent("ArticleSourceController");

ArticleSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  // setElementProperty(this.view, "source-id", this.source.sourceId);

  this.view.addEventListener("click", function (e) {
    // e.preventDefault();
    e.stopPropagation();
  });
});
