
/**
 * BlobFileSource
 * Abstract model for a media file that can be audio, video, image, doc, etc.
 */
let BlobFileSource = Source.createComponent("BlobFileSource");

BlobFileSource.defineMethod("construct", function construct() {

  // Construct file handler
  if (!this.fileHandler) this.fileHandler = new BlobFileHandler();

});

BlobFileSource.defineMethod("init", function init(content, jointSource, sourceId) {

  // Sync file handler
  if (content && content["0"]) {
    this.fileHandler.blob = content["0"];
    this.fileHandler.didUpdate();
  }

});

BlobFileSource.defineMethod("didUpdate", function didUpdate() {

  // Sync file handler
  this.fileHandler.blob = this.content["0"];
  this.fileHandler.didUpdate();

});

BlobFileSource.defineMethod("destruct", function destruct() {

  // Destruct file handler
  this.fileHandler.destroy();
  delete this.fileHandler;

});

// Publish

BlobFileSource.prototype.prePublish = function prePublish() {
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

// Stats

BlobFileSource.prototype.getFileStats = function getFileStats() {
  if (this.content["0"]) {
    if (this.content["0"] instanceof Blob) {
      return Promise.resolve({
        size: this.content["0"].size,
        type: this.content["0"].type
      });
    }
    return ICA.getFileStats(this.content["0"]);
  }
  return Promise.reject(new Error("File does not exist"));
};
