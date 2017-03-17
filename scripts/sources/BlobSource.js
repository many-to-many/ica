
var BlobSource = Source.createComponent("BlobSource");

BlobSource.defineMethod("construct", function construct() {

  if (!this.blobHandler) this.blobHandler = new BlobHandler();

});

BlobSource.defineMethod("init", function init(content, jointSource, sourceId) {

  this.blobHandler.blob = content;
  this.blobHandler.didUpdate();

});

BlobSource.defineMethod("didUpdate", function didUpdate() {

  this.blobHandler.blob = this.content;
  this.blobHandler.didUpdate();

});

BlobSource.defineMethod("destruct", function destruct() {

  this.blobHandler.destroy();

});

BlobSource.prototype.prePublish = function () {
  return Promise.resolve()
    .then(function () {
      if (this.content && this.content instanceof Blob) {
        return ICA.uploadFileChunked(this.content)
          .then(function (fileId) {
            this.content = fileId;
          }.bind(this));
      }
    }.bind(this));
};

BlobSource.prototype.getBlobStats = function () {
  if (this.content instanceof Blob) {
    return Promise.resolve({
      size: this.content.size,
      type: this.content.type
    });
  }
  return ICA.getFileStats(this.content);
}
