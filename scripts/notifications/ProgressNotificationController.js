
/**
 * ProgressNotificationController
 * Concrete view controller to display a progress notification.
 * @constructor
 */
let ProgressNotificationController = NotificationController.createComponent("ProgressNotificationController");

ProgressNotificationController.createViewFragment = function () {
  return cloneTemplate("#template-notification-progress");
};

ProgressNotificationController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelector(".meter > .meter-bar").style.width = this.notification.progressPct * 100 + "%";

  if (this.notification.progressPct === 1) {
    setTimeout(function (notification) {
      notification.destroy(true, true);
    }.bind(null, this.notification), 300);
  }

});
