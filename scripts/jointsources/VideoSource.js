
/**
 * VideoSource
 * Concrete model for a video clip.
 * @constructor
 */
let VideoSource = BlobFileSource.createComponent("VideoSource");

VideoSource.defineMethod("construct", function construct() {

  // Construct file handler
  // This will be destroyed by BlobFileSource
  if (!this.fileHandler) this.fileHandler = new BlobFileHandler();
  this.fileHandler.cached = false; // Video files are not cached

});
