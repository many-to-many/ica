
var ArticleSourceController = SourceController.createComponent("ArticleSourceController");

ArticleSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-action='edit-jointsource']").addEventListener("click", function (e) {
    e.preventDefault();
    this.controller.componentOf.displayPublisherJointSourceView();
  }.bind(this.view));

  this.view.addEventListener("click", function (e) {
    // e.preventDefault();
    e.stopPropagation();
  });
});
