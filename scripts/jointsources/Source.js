
/**
 * Source
 * Abstract model for a source in jointSource.
 */
let Source = Model.createComponent("Source");

Source.sources = {count: 0};

Source.defineMethod("construct", function construct() {

  // Construct extracts
  Object.defineProperty(this, "extracts", {
    value: {}
  });

});

Source.defineMethod("init", function init(content, jointSource, sourceId) {

  // Init sourceId
  this._sourceId = sourceId || - ++Source.sources.count;
  this.initSourceId();

  // Init jointSource
  this._jointSource = jointSource;
  this.initJointSource();

  // Init content
  this.content = content || {};

  return [];
});

Source.defineMethod("uninit", function uninit() {

  // Uninit content
  delete this.content;

  // Uninit jointSource
  this.uninitJointSource();
  delete this._jointSource;

  // Uninit sourceId
  this.uninitSourceId();
  delete this._sourceId;

});

Source.defineMethod("destruct", function destruct() {

  // Destruct extracts
  clearObject(this.extracts);

});

// JointSource

Object.defineProperty(Source.prototype, "jointSource", {
  get: function () {
    return this._jointSource;
  },
  set: function (value) {
    if (this._jointSource === value) return;
    this.uninitJointSource();
    this._jointSource = value;
    this.initJointSource();
  }
});

Source.defineMethod("initJointSource", function initJointSource() {
  if (!this.jointSource) return;
  this.jointSource.sources[this.sourceId] = this;
});

Source.defineMethod("uninitJointSource", function uninitJointSource() {
  if (!this.jointSource) return;
  delete this.jointSource.sources[this.sourceId];
});

// SourceId

Object.defineProperty(Source.prototype, "sourceId", {
  get: function () {
    return this._sourceId;
  },
  set: function (value) {
    if (this._sourceId === value) return;
    this.uninitSourceId();
    this._sourceId = value;
    this.initSourceId();
  }
});

Source.defineMethod("initSourceId", function initSourceId() {
  if (!this.sourceId) return;
  Source.sources[this.sourceId] = this;
  this.initJointSource();
});

Source.defineMethod("uninitSourceId", function uninitSourceId() {
  if (!this.sourceId) return;
  // Uninit jointSource as it refers to sourceId
  this.uninitJointSource();
  delete Source.sources[this.sourceId];
});

// Extracts

Source.prototype.forEachExtract = function forEachExtract(callback) {
  for (let extractId in this.extracts) if (this.extracts.hasOwnProperty(extractId)) {
    callback(this.extracts[extractId]);
  }
};

// Publish

Source.prototype.prePublish = function prePublish() {
  return Promise.resolve(); // Done pre-publish
};

Source.prototype.cloneContent = function cloneContent() {
  // Clone an object
  let clone = this.content.constructor();
  for (let key in this.content) {
    if (this.content.hasOwnProperty(key)) {
      clone[key] = this.content[key];
    }
  }
  return clone;
};

Source.prototype.backup = function backup(force = false) {
  // Backup original for user editing
  if (!this._backup_content || force) {
    this._backup_content = this.cloneContent();
  }
};

Source.prototype.recover = function recover() {
  if (this._backup_content) {
    this.content = this._backup_content;
    delete this._backup_content;
  }
};
