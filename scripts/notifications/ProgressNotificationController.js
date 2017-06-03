
var ProgressNotificationController = NotificationController.createComponent("ProgressNotificationController");

ProgressNotificationController.createViewFragment = function () {
  return cloneTemplate("#template-notification-progress");
};

ProgressNotificationController.defineMethod("updateView", function updateView() {
  if (!this.view) return;

  this.view.querySelector(".meter > .meter-bar").style.width = this.notification.progressPct * 100 + "%";

  if (this.notification.progressPct == 1) {
    this.notification.destroy(true, true);
  }

});
