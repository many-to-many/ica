
/**
 * NotificationController
 * Abstract view controller to display a notification.
 * @constructor
 */
let NotificationController = SingleModelController.createComponent("NotificationController");

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

  setTimeout(function () {
    this.view.classList.remove("hidden");
  }.bind(this), 1);

});

NotificationController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  removeElementProperty(this.view, "notification-id");

});

NotificationController.defineMethod("destroy", function destroy(destroyView = false) {

  // Destroy view
  if (destroyView && this.view) {

    let view = this.view,
      jointModels = Object.values(this.notification.jointModels);

    new Waterfall(function () {
      view.classList.add("hidden");
    }, 300 + 1)
      .then(function () {
        jointModels.forEach(function (jointModel) {
          jointModel.removeNotification(model);
          jointModel.didUpdate();
        });
        view.parentNode.removeChild(view);
      });

  }

  return [];
});
