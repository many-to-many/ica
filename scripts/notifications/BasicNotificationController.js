
/**
 * BasicNotificationController
 * Concrete view controller to display a basic notification.
 * At view init this controller will register a time to automatically destroy the notification.
 * @constructor
 */
let BasicNotificationController = NotificationController.createComponent("BasicNotificationController");

BasicNotificationController.createViewFragment = function () {
  return cloneTemplate("#template-notification-basic");
};

BasicNotificationController.defineMethod("initView", function initView() {
  if (!this.view) return;

  this.notificationTimeout = setTimeout(function () {
    delete this.notificationTimeout;
    this.notification.destroy(true, true);
  }.bind(this), this.notification.duration);

});

BasicNotificationController.defineMethod("uninitView", function uninitView() {
  if (!this.view) return;

  if (this.notificationTimeout) {
    clearTimeout(this.notificationTimeout);
    delete this.notificationTimeout;
  }

});
