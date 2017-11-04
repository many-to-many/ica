
/**
 * BlobFileHandler
 * @constructor
 */
let BlobFileHandler = Handler.createComponent("BlobFileHandler");

/**
 * The content is either going to be a blob id that represents a remote file on
 * the server end or an Blob instance. If a blob file id is provided, the blob
 * content may not be read directly.
 */
BlobFileHandler.defineAlias("content", "blob");

BlobFileHandler.defineMethod("uninitContent", function uninitContent() {
  // Remove the corresponding array buffer if any
  delete this._cache_array_buffer;
});

Object.defineProperty(BlobFileHandler.prototype, "url", {
  get: function () {
    if (this.blob) {
      if (this.blob instanceof Blob) return URL.createObjectURL(this.blob);
      return (!this.cached ? "/nocache" : "") + "/static/" + this.blob;
    }
  }
});

BlobFileHandler.prototype.cached = true;

BlobFileHandler.prototype.readAsArrayBuffer = function (loadRemote = false) {
  // Serve cached buffers if available
  if (this._cache_array_buffer) return Promise.resolve(this._cache_array_buffer);

  // Need blob for file reading
  if (!this.blob) return Promise.reject(new Error("No blob"));
  let promise;
  if (!(this.blob instanceof Blob)) {
    if (!loadRemote) {
      return Promise.reject(new Error("Disallowed to load remote content"));
    }
    // Need remote file access and then read file
    promise = ICA.request("GET", this.url, null, null, "blob")
      .then(function (data) {
        this.blob = data;
      }.bind(this));
  } else {
    promise = Promise.resolve();
  }

  return promise
    .then(function () {
      return new Promise(function (resolve, reject) {
        let reader = new FileReader();
        reader.onerror = function () {
          reject(new Error("Error reading file"));
        };
        reader.onprogress = function (event) {
          let percentage = Math.round((event.loaded / event.total) * 100);
          console.log("Reading file: {0}%".format(percentage));
        };
        reader.onabort = function () {
          reject(new Error("File read aborted"));
        };
        reader.onload = function (event) {
          let result = event.target.result; // ArrayBuffer

          console.log("File loaded");
          this._cache_array_buffer = result;
          resolve(result);
        }.bind(this);
        reader.readAsArrayBuffer(this.blob);
      }.bind(this));
    }.bind(this));
};

BlobFileHandler.prototype.makeSlices = function (size = 1024 * 1024) { // 1 MB each
  if (!this.blob || !(this.blob instanceof Blob)) return [];

  let slices = [];
  for (let offset = 0; offset < this.blob.size; offset = offset + size) {
    slices.push(this.blob.slice(offset, Math.min(offset + size, this.blob.size)));
  }
  return slices;
};
