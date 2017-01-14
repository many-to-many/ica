
var AudioExtract = function (source, scheme, id) {
  Extract.call(this, source, scheme, id);
};

AudioExtract.prototype = Object.create(Extract.prototype);

AudioExtract.prototype.constructor = AudioExtract;
