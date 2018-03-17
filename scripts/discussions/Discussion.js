
/**
 * Discussion
 * @constructor
 */
let Discussion = JointSource.createComponent("Discussion");

Discussion.defineAlias("jointSourceId", "discussionId");

Discussion.defineMethod("init", function init(title, intro, discussionId) {

  // Init meta
  // TODO: Refactor to have `this.meta` union
  this.title = title || {};
  this.intro = intro || {};

  return [discussionId];
});

Discussion.defineMethod("uninit", function uninit() {

  // Uninit title
  delete this.title;

});

// Publish

Discussion.prototype.publish = function notify(notify) {
  return ICA.publishDiscussion(this, notify)
    .then(function (discussion) {
      if (this._backup) { // Force backup when existing backup is found
        this.backup(true);
      }

      return discussion;
    }.bind(this));
};

Discussion.prototype.unpublish = function unpublish(notify) {
  return ICA.unpublishDiscussion(this, notify);
};

Discussion.prototype.cloneTitle = function cloneTitle() {
  return cloneObject(this.title);
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

Discussion.prototype.getResponsesInDiscussion = function getResponsesInDiscussion() {
  return ICA.getResponsesInDiscussion(this.discussionId);
};
