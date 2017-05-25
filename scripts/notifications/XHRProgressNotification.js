
var XHRProgressNotification = ProgressNotification.createComponent("XHRProgressNotification");

XHRProgressNotification.defineMethod("init", function (x, title = "Content loading...") {

  this.x = x;

  if (x.upload) {
    x.upload.addEventListener("progress", function (e) {
      if (e.lengthComputable) {
        this.requestProgressPct = e.loaded / e.total;
        this.progressPct = (this.requestProgressPct + this.respondProgressPct) / 2;
        this.didUpdate();
      }
    }.bind(this));
  }

  x.addEventListener("progress", function (e) {
    if (e.lengthComputable) {
      this.respondProgressPct = e.loaded / e.total;
      this.progressPct = (this.requestProgressPct + this.respondProgressPct) / 2;
      this.didUpdate();
    }
  }.bind(this));

  x.addEventListener("load", function () {
    this.requestProgressPct = 1;
    this.respondProgressPct = 1;
    this.progressPct = 1;
    this.didUpdate();
  }.bind(this));

  return [title];

});

XHRProgressNotification.prototype.requestProgressPct = 0;

XHRProgressNotification.prototype.respondProgressPct = 0;
