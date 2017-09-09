
/**
 * AudioSource
 * Concrete model for a piece of audio recording.
 * @constructor
 */
let AudioSource = BlobFileSource.createComponent("AudioSource");

AudioSource.defineMethod("construct", function construct() {

  // Construct file handler
  // This will be destroyed by BlobFileSource
  if (!this.fileHandler) this.fileHandler = new BlobFileHandler();
  this.fileHandler.cached = false; // Audio files are not cached

});
