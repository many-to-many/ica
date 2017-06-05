
var BlobFileSource = Source.createComponent("BlobFileSource");

BlobFileSource.defineMethod("construct", function construct() {

  if (!this.fileHandler) this.fileHandler = new BlobFileHandler();

});

BlobFileSource.defineMethod("init", function init(content, conversation, sourceId) {

  if (content && content["0"]) {
    this.fileHandler.blob = content["0"];
    this.fileHandler.didUpdate();
  }

});

BlobFileSource.defineMethod("didUpdate", function didUpdate() {

  this.fileHandler.blob = this.content["0"];
  this.fileHandler.didUpdate();

});

BlobFileSource.defineMethod("destruct", function destruct() {

  this.fileHandler.destroy();

});

BlobFileSource.prototype.prePublish = function () {
  return Promise.resolve()
    .then(function () {
      if (this.content["0"] && this.content["0"] instanceof Blob) {
        return ICA.uploadFileChunked(this.content["0"], "Uploading file...")
          .then(function (fileId) {
            this.content["0"] = fileId;
          }.bind(this));
      }
    }.bind(this));
};

BlobFileSource.prototype.getFileStats = function () {
  if (this.content["0"]) {
    if (this.content["0"] instanceof Blob) {
      return Promise.resolve({
        size: this.content["0"].size,
        type: this.content["0"].type
      });
    }
    return ICA.getFileStats(this.content["0"]);
  }
  return Promise.reject(new Error("File not exist"));
};
