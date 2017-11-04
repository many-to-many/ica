
/**
 * Response
 * @constructor
 */
let Response = JointSource.createComponent("Response");

Response.defineAlias("jointSourceId", "responseId");

Response.defineMethod("init", function init(message, responseId) {

  // Init message
  this.message = message || {};

  return [responseId];
});

Response.defineMethod("uninit", function uninit() {

  // Uninit message
  delete this.message;

});

// Author

Response.prototype.getAuthor = function () {
  if (this._authorId) return ICA.getAuthor(this._authorId);
  return Promise.reject(new Error("No author id"));
};

// Publish

Response.prototype.publish = function (notify) {
  return ICA.publishResponse(this, notify)
    .then(function (response) {
      if (this._backup) {
        this.backup(true);
      }

      return response;
    }.bind(this));
};

Response.prototype.unpublish = function (notify) {
  return ICA.unpublishResponse(this, notify);
};

Response.prototype.cloneMessage = function () {
  return cloneObject(this.message);
};

Response.defineMethod("backup", function backup(force = false) {
  if (!this._backup_message || force) {
    this._backup_message = this.cloneMessage();
  }
});

Response.defineMethod("recover", function recover() {
  if (this._backup_message) {
    this.message = this._backup_message;
    delete this._backup_message;
  }
});
