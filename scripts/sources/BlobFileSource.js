
var BlobFileSource = Source.createComponent("BlobFileSource");

BlobFileSource.defineMethod("construct", function construct() {

  if (!this.fileHandler) this.fileHandler = new BlobFileHandler();

});

BlobFileSource.defineMethod("init", function init(content, jointSource, sourceId) {

  this.fileHandler.blob = content;
  this.fileHandler.didUpdate();

});

BlobFileSource.defineMethod("didUpdate", function didUpdate() {

  this.fileHandler.blob = this.content;
  this.fileHandler.didUpdate();

});

BlobFileSource.defineMethod("destruct", function destruct() {

  this.fileHandler.destroy();

});

BlobFileSource.prototype.prePublish = function () {
  return Promise.resolve()
    .then(function () {
      if (this.content && this.content instanceof Blob) {
        return ICA.uploadFile(this.content)
          .then(function (fileId) {
            this.content = fileId;
          }.bind(this));
      }
    }.bind(this));
};

BlobFileSource.prototype.getFileStats = function () {
  if (this.content instanceof Blob) {
    return Promise.resolve({
      size: this.content.size,
      type: this.content.type
    });
  }
  return ICA.getFileStats(this.content);
};
