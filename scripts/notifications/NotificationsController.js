
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
    } else switch (notification.constructor) {
    case XHRProgressNotification:
      // Create new view
      var fragment = XHRProgressNotificationController.createViewFragment();
      element = fragment.querySelector(".notification");
      element.style.bottom = bottom + "px";
      this.view.appendChild(fragment);
      new XHRProgressNotificationController(notification, element).componentOf = this;
      break;
    default:
      console.warn("Unhandled item:", item.constructor);
      return false;
    }

    bottom += element.offsetHeight + 8; // 16 px margin top & bottom

    return true;
  }.bind(this));
});
