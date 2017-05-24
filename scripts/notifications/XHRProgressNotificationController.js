
var XHRProgressNotificationController = NotificationController.createComponent("XHRProgressNotificationController");

XHRProgressNotification.createViewFragment = function () {
  return cloneTemplate("#template-notification-xhrprogress");
};

XHRProgressNotificationController.defineMethod("updateView", function () {
  if (!this.view) return;

  this.view.querySelector(".meter > .meter-bar").style.width =
    this.notification.overallProgressPct * 100 + "%";

  if (this.notification.overallProgressPct == 1) {
    this.notification.destroy(true, true);
  }
});
