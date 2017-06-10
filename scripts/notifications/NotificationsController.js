
var NotificationsController = SingleModelController.createComponent("NotificationsController");

NotificationsController.defineAlias("model", "notifications");

NotificationsController.defineMethod("updateView", function () {
  if (!this.view) return;

  var bottom = 0;
  for (let notification of this.notifications.notifications) {
    var element = this.view.querySelector("[data-ica-notification-id='{0}']".format(notification.componentId));

    // Check existing element
    if (element) {
      element.style.bottom = bottom + "px";
    } else {
      // Create new view

      // Skip dummy notifications (placeholders)
      if (!Component.components[notification.componentId]) continue;

      // Match controller
      var Controller;
      switch (notification.constructor) {
      case BasicNotification: Controller = BasicNotificationController; break;
      case ProgressNotification: Controller = ProgressNotificationController; break;
      case XHRProgressNotification: Controller = XHRProgressNotificationController; break;
      default:
        console.warn("Unhandled item:", notification.constructor);
        continue;
      }

      // Create view
      var fragment = Controller.createViewFragment();
      element = fragment.querySelector(".notification");
      element.style.bottom = bottom + "px";
      this.view.appendChild(fragment);
      new Controller(notification, element).componentOf = this;
    }

    bottom += element.offsetHeight + 8; // 16 px margin top & bottom
  }
});
