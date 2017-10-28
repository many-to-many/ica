
/**
 * ProgressNotification
 * Concrete model to represent an activity progress.
 * @constructor
 */
let ProgressNotification = Notification.createComponent("ProgressNotification");

ProgressNotification.defineMethod("init", function init(title = "Content loading...") {

  this.title = title;

});

ProgressNotification.prototype.progressPct = 0;
