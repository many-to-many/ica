
var ImageController = SingleModelController.createComponent("ImageController");

ImageController.createViewFragment = function () {
  return cloneTemplate("#template-image");
};

ImageController.defineAlias("model", "blobHandler");

ImageController.defineMethod("initView", function initView() {
  if (!this.view) return;

});

ImageController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  var parentNode = this.view.parentNode;
  var fragment = ImageController.createViewFragment()
  var element = fragment.querySelector(".image");
  parentNode.replaceChild(fragment, this.view);
  this.uninitView();
  this._view = element;
  this.initView(false);

  if (!this.blobHandler.blob) return;

  this.view.querySelector(".image-view").src = URL.createObjectURL(this.blobHandler.blob);
});

ImageController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

});
