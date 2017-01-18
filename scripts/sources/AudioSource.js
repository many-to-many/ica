
var AudioSource = BlobSource.createComponent("AudioSource");

AudioSource.defineMethod("construct", function construct() {

  if (!this.blobHandler) this.blobHandler = new BlobHandler();
  this.blobHandler.stream = true;

});

// AudioSource.prototype.extractConstructor = AudioExtract;

// AudioSource.prototype.extract = function (scheme) {
//   return new AudioExtract(this, scheme);
// };
