
var AudioSource = Source.createComponent("AudioSource");

AudioSource.defineMethod("construct", function construct() {

  this.blobHandler = new BlobHandler();

});

AudioSource.defineMethod("didUpdate", function didUpdate() {

  if (this.content.constructor == File) {
    this.blobHandler.blob = this.content;
  } else {
    this.blobHandler.blob = null;
  }
  this.blobHandler.didUpdate();

});

AudioSource.defineMethod("destruct", function destruct() {

  this.blobHandler.destroy();

});

AudioSource.prototype.prePublish = function () {
  return Promise.resolve()
    .then(function () {
      if (this.content) {
        switch (this.content.constructor) {

          case File:
            return ICA.uploadFile(this.content)
              .then(function (fileId) {
                this.content = fileId;
              }.bind(this));
            break;

        }
      }
    }.bind(this));
};

// AudioSource.prototype.extractConstructor = AudioExtract;

// AudioSource.prototype.extract = function (scheme) {
//   return new AudioExtract(this, scheme);
// };
