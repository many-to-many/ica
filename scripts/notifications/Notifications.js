
var Notifications = JointModel.createComponent("Notifications");

Notifications.defineMethod("construct", function construct() {
  // Construct notifications
  this.notifications = [];
});

Notifications.defineMethod("destruct", function destruct() {
  // Destruct notifications
  delete this.notifications;
});

Notifications.defineMethod("retainModel", function retainModel(article) {
  this.notifications.push(article);
});

Notifications.defineMethod("releaseModel", function releaseModel(article) {
  var index = this.notifications.indexOf(article);
  if (index > -1) {
    this.notifications.splice(index, 1);
  }
});

Notifications.prototype.addNotification = function (notification) {
  this.retainModel(notification);
};
