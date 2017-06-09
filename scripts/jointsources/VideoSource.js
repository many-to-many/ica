
var VideoSource = BlobFileSource.createComponent("VideoSource");

VideoSource.defineMethod("construct", function construct() {

  if (!this.fileHandler) this.fileHandler = new BlobFileHandler();
  this.fileHandler.cached = false;

});
