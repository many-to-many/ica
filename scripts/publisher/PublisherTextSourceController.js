
var PublisherTextSourceController = PublisherSourceController.createComponent("PublisherTextSourceController");

PublisherTextSourceController.createViewFragment = function () {
  return cloneTemplate("#template-publisher-textsource");
};

PublisherTextSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  var input = this.view.querySelector("[data-ica-source-content]");
  input.addEventListener("change", function (e) {
    this.controller.source.content = input.value;
  }.bind(this.view));
});

PublisherTextSourceController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  var input = this.view.querySelector("[data-ica-source-content]");
  setInputValue(input, this.source.content || null);
});
