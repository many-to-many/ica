
var BasicNotificationController = NotificationController.createComponent("BasicNotificationController");

BasicNotificationController.createViewFragment = function () {
  return cloneTemplate("#template-notification-basic");
};

BasicNotificationController.defineMethod("initView", function () {
  if (!this.view) return;

  this.notificationTimeout = setTimeout(function () {
    delete this.notificationTimeout;
    this.notification.destroy(true, true);
  }.bind(this), this.notification.duration);
});

BasicNotificationController.defineMethod("updateView", function () {
  if (!this.view) return;

  this.view.querySelectorAll("[data-ica-notification]").forEach(function (element) {
    switch (getElementProperty(element, "notification")) {
    case "title":
      element.textContent = this.notification.title;
      break;
    case "message":
      element.textContent = this.notification.message;
      break;
    }
  }.bind(this));
});

BasicNotificationController.defineMethod("uninitView", function () {
  if (!this.view) return;

  if (this.notificationTimeout) {
    clearTimeout(this.notificationTimeout);
    delete this.notificationTimeout;
  }
});
