
var NotificationController = SingleModelController.createComponent("NotificationController");

NotificationController.defineAlias("model", "notification");

NotificationController.defineMethod("initView", function () {
  if (!this.view) return;

  this.view.classList.add("hidden");
  setElementProperty(this.view, "notification-id", this.notification.componentId);
});

NotificationController.defineMethod("updateView", function () {
  if (!this.view) return;

  this.view.classList.remove("hidden");
});

NotificationController.defineMethod("uninitView", function () {
  if (!this.view) return;

  setElementProperty(this.view, "notification-id");
});

NotificationController.defineMethod("destroy", function (destroyView = false) {
  // Destroy view
  if (destroyView && this.view) {
    var view = this.view, jointModels = Object.values(this.notification.jointModels);
    new Waterfall(null, 300 + 50) // Leave time for transition to finish
      .then(function () {
        view.classList.add("hidden");
      }, 300 + 600)
      .then(function () {
        view.parentNode.removeChild(view);
        jointModels.forEach(function (jointModel) {
          jointModel.didUpdate();
        });
      }.bind(this));
  }
  return [];
});
