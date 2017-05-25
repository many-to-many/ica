
var ProgressNotification = Notification.createComponent("ProgressNotification");

ProgressNotification.defineMethod("init", function (title = "Content loading...") {

  this.title = title;

});

ProgressNotification.prototype.progressPct = 0;
