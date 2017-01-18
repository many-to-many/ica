
var BlobHandler = Handler.createComponent("BlobHandler");

BlobHandler.defineAlias("content", "blob");

BlobHandler.defineMethod("initContent", function initContent() {
  if (!(this.blob instanceof Blob)) {
    this._blobId = this.blob;
    delete this._content;
  }
});

BlobHandler.defineMethod("uninitContent", function uninitContent() {
  delete this._blobId;
  delete this._cache_blob;
  delete this._cache_array_buffer;
});

Object.defineProperty(BlobHandler.prototype, "url", {
  get: function () {
    if (this._blobId) return (this.stream ? "streams/" : "") + "files/" + this._blobId;
    return URL.createObjectURL(this.blob);
  }
});

BlobHandler.prototype.stream = false; // Serving static content

BlobHandler.prototype.readAsArrayBuffer = function () {
  // Does not support remote blob id
  if (!this.blob) return Promise.reject(new Error("No blob"));
  if (this._cache_array_buffer) return Promise.resolve(this._cache_array_buffer);

  var blob = this.blob;
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function (event) {
      reject(new Error("Error reading file"));
    };
    reader.onprogress = function (event) {
      var percentage = Math.round((event.loaded / event.total) * 100);
      console.log("Reading file: {0}%".format(percentage));
    };
    reader.onabort = function (event) {
      reject(new Error("File read aborted"));
    };
    reader.onload = function (event) {
      var result = event.target.result; // ArrayBuffer

      this._cache_array_buffer = result;
      this._cache_blob = blob;
      resolve(result);
    }.bind(this);
    reader.readAsArrayBuffer(blob);
  }.bind(this));
};

BlobHandler.prototype.makeSlices = function (size = 1 * 1024 * 1024) { // 1 MB each
  if (!this.blob) return [];

  var slices = [];
  for (var offset = 0; offset < this.blob.size; offset = offset + size) {
    slices.push(this.blob.slice(offset, Math.min(offset + size, this.blob.size)));
  }
  return slices;
};
