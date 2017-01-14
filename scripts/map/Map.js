
var Map = function () {
  this.levels = [];
}

Map.prototype.addSource = function (source, level = 0) {
  if (!(level in this.levels)) this.levels[level] = {
    sources: []
  };
  this.levels[level].sources[source.sourceId] = source;
};
