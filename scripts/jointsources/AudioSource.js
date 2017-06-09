
var AudioSource = BlobFileSource.createComponent("AudioSource");

AudioSource.defineMethod("construct", function construct() {

  if (!this.fileHandler) this.fileHandler = new BlobFileHandler();
  this.fileHandler.cached = false;

});
