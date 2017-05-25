
var Notifications = JointModel.createComponent("Notifications");

Notifications.defineMethod("construct", function construct() {
  // Construct notifications
  this.notifications = [];
});

Notifications.defineMethod("destruct", function destruct() {
  // Destruct notifications
  delete this.notifications;
});

Notifications.prototype.addNotification = function (notification) {
  this.notifications.push(notification);
  this.retainModel(notification);
};

Notifications.prototype.removeNotification = function (notification) {
  var index = this.notifications.indexOf(notification);
  if (index > -1) {
    this.notifications.splice(index, 1);
    this.releaseModel(notification);
  }
};
