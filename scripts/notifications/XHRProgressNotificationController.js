
var XHRProgressNotificationController = NotificationController.createComponent("XHRProgressNotificationController");

XHRProgressNotificationController.createViewFragment = function () {
  return cloneTemplate("#template-notification-xhrprogress");
};

XHRProgressNotificationController.defineMethod("updateView", function () {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-notification]").forEach(function (element) {
    switch (getElementProperty(element, "notification")) {
    case "title":
      element.textContent = this.notification.title;
      break;
    }
  }.bind(this));

  this.view.querySelector(".meter > .meter-bar").style.width =
    this.notification.overallProgressPct * 100 + "%";

  if (this.notification.overallProgressPct == 1) {
    this.notification.destroy(true, true);
  }
});
