
var ProgressNotification = Notification.createComponent("ProgressNotification");

ProgressNotification.defineMethod("init", function init(title = "Content loading...") {

  this.title = title;

});

ProgressNotification.prototype.progressPct = 0;
