
var ProgressNotificationController = NotificationController.createComponent("ProgressNotificationController");

ProgressNotificationController.createViewFragment = function () {
  return cloneTemplate("#template-notification-progress");
};

ProgressNotificationController.defineMethod("updateView", function () {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-notification]").forEach(function (element) {
    switch (getElementProperty(element, "notification")) {
    case "title":
      element.textContent = this.notification.title;
      break;
    }
  }.bind(this));

  this.view.querySelector(".meter > .meter-bar").style.width =
    this.notification.progressPct * 100 + "%";

  if (this.notification.progressPct == 1) {
    this.notification.destroy(true, true);
  }

});
