
var PublisherSourceController = SourceController.createComponent("PublisherSourceController");

PublisherSourceController.defineMethod("initModel", function initModel() {
  if (!this.source) return;
  this.source.backup();
});

PublisherSourceController.defineMethod("uninitModel", function uninitModel() {
  if (!this.source) return;
  this.source.recover();
  this.source.didUpdate();
});

PublisherSourceController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.view.querySelector("[data-ica-action='remove-source']").addEventListener("click", function (e) {
    e.preventDefault();

    if (this.controller.source.sourceId < 0) {
      this.controller.source.destroy(true);
    } else {
      this.controller.source.uninitJointSource(); // This should be undone when the joint source is recovered
      this.controller.destroy(true);
    }
  }.bind(this.view));
});
