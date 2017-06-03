
var BasicNotification = Notification.createComponent("BasicNotification");

BasicNotification.defineMethod("init", function init(title, message, duration = 3000) {

  this.title = title;
  this.message = message;
  this.duration = duration;

});
