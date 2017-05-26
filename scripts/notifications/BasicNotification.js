
var BasicNotification = Notification.createComponent("BasicNotification");

BasicNotification.defineMethod("init", function init(title, message = null, duration = 3000) {

  this.title = title;
  this.message = message;
  this.duration = duration;

});
