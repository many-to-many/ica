
var NotificationController = SingleModelController.createComponent("NotificationController");

NotificationController.defineAlias("model", "notification");

NotificationController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.view.classList.add("hidden");
  setElementProperty(this.view, "notification-id", this.notification.componentId);
});

NotificationController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-notification]").forEach(function (element) {
    element.textContent = this.notification[getElementProperty(element, "notification")];
  }.bind(this));

  this.view.classList.remove("hidden");
});

NotificationController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  setElementProperty(this.view, "notification-id");
});

NotificationController.defineMethod("destroy", function destroy(destroyView = false) {
  // Destroy view
  if (destroyView && this.view) {
    var view = this.view,
      model = this.notification,
      jointModels = Object.values(this.notification.jointModels);
    new Waterfall(null, 300 + 1) // Leave time for transition to finish
      .then(function () {
        view.classList.add("hidden");
      }, 300 + 1)
      .then(function () {
        view.parentNode.removeChild(view);
        jointModels.forEach(function (jointModel) {
          jointModel.removeNotification(model);
          jointModel.didUpdate();
        });
      }.bind(this));
  }
  return [];
});
