
var NotificationController = SingleModelController.createComponent("NotificationController");

NotificationController.defineAlias("model", "notification");

NotificationController.defineMethod("initView", function () {
  if (!this.view) return;

  this.view.classList.add("hidden");
});

NotificationController.defineMethod("updateView", function () {
  if (!this.view) return;

  this.view.classList.remove("hidden");
});

NotificationController.defineMethod("destroy", function (destroyView = false) {
  // Destroy view
  if (destroyView && this.view) {
    var view = this.view;
    new Waterfall(null, 400) // Leave time for transition to finish
      .then(function () {
        view.classList.add("hidden");
      }, 400)
      .then(function () {
        view.parentNode.removeChild(view);
      }.bind(this));
  }
  return [];
});
