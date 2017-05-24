
var XHRProgressNotificationController = NotificationController.createComponent("XHRProgressNotificationController");

XHRProgressNotificationController.createViewFragment = function () {
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

XHRProgressNotificationController.defineMethod("destroy", function (destroyView = false) {
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
