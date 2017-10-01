
/**
 * BasicNotification
 * Concrete model for a notification, with title, message and a duration.
 * @constructor
 */
let BasicNotification = Notification.createComponent("BasicNotification");

BasicNotification.defineMethod("init", function init(title, message, duration = 3000) {

  this.title = title;
  this.message = message;
  this.duration = duration;

});
