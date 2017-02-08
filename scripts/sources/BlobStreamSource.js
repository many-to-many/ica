
var BlobStreamSource = BlobSource.createComponent("BlobStreamSource");

BlobStreamSource.defineMethod("construct", function construct() {

  if (!this.blobHandler) this.blobHandler = new BlobHandler();
  this.blobHandler.stream = true;

});
