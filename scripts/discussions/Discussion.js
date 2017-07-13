
var Discussion = JointSource.createComponent("Discussion");

Discussion.defineAlias("jointSourceId", "discussionId");

Discussion.defineMethod("init", function init(title, discussionId) {
  // Init title
  this.title = title || {};
  return [discussionId];
});

Discussion.defineMethod("uninit", function () {
  // Uninit title
  delete this.title;
});

// Publish

Discussion.prototype.publish = function (notify) {
  return ICA.publishDiscussion(this, notify)
    .then(function (discussion) {
      if (this._backup) { // Force backup when existing backup is found
        this.backup(true);
      }

      return discussion;
    }.bind(this));
};

Discussion.prototype.unpublish = function (notify) {
  return ICA.unpublishDiscussion(this, notify);
};

Discussion.prototype.cloneTitle = function () {
  var title = {};
  for (var index in this.title) {
    title[index] = this.title[index];
  }
  return title;
};

Discussion.defineMethod("backup", function backup(force = false) {
  if (!this._backup_title || force) {
    this._backup_title = this.cloneTitle();
  }
});

Discussion.defineMethod("recover", function recover() {
  if (this._backup_title) {
    this.title = this._backup_title;
    delete this._backup_title;
  }
});

// Responses in discussion

Discussion.prototype.getResponsesInDiscussion = function () {
  return ICA.getResponsesInDiscussion(this.discussionId);
};
