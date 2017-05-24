
var NotificationController = SingleModelController.createComponent("NotificationController");

NotificationController.defineAlias("model", "notification");

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
