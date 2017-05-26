
var NotificationsController = SingleModelController.createComponent("NotificationsController");

NotificationsController.defineAlias("model", "notifications");

NotificationsController.defineMethod("updateView", function () {
  if (!this.view) return;

  var bottom = 0;
  this.notifications.notifications = this.notifications.notifications.filter(function (notification) {
    var element = this.view.querySelector("[data-ica-notification-id='{0}']".format(notification.componentId));

    // Check existing element
    if (element) {
      element.style.bottom = bottom + "px";
    } else {
      // Create new view

      // Match controller
      var Controller;
      switch (notification.constructor) {
      case BasicNotification: Controller = BasicNotificationController; break;
      case ProgressNotification: Controller = ProgressNotificationController; break;
      case XHRProgressNotification: Controller = XHRProgressNotificationController; break;
      default:
        console.warn("Unhandled item:", notification.constructor);
        return false;
      }

      // Create view
      var fragment = Controller.createViewFragment();
      element = fragment.querySelector(".notification");
      element.style.bottom = bottom + "px";
      this.view.appendChild(fragment);
      new Controller(notification, element).componentOf = this;
    }

    bottom += element.offsetHeight + 8; // 16 px margin top & bottom

    return true;
  }.bind(this));
});
