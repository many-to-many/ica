
var PublisherHyperlinkSourceController = PublisherSourceController.createComponent("PublisherHyperlinkSourceController");

PublisherHyperlinkSourceController.createViewFragment = function () {
  return cloneTemplate("#template-publisher-hyperlinksource");
};

PublisherHyperlinkSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  var input = this.view.querySelector("[data-ica-source-content]");
  input.addEventListener("input", function () {
    this.controller.source.content = input.value;
  }.bind(this.view));

});

PublisherHyperlinkSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-source-content]").value = this.source.content;

});
