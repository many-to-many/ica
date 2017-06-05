
var Source = Model.createComponent("Source");

Source.sources = {count: 0};

Source.defineMethod("construct", function construct() {
  // Construct extracts
  Object.defineProperty(this, "extracts", {
    value: {}
  });
});

Source.defineMethod("init", function init(content, conversation, sourceId) {
  // Init sourceId
  this._sourceId = sourceId || - ++Source.sources.count;
  this.initSourceId();
  // Init conversation
  this._conversation = conversation;
  this.initConversation();
  // Init content
  this.content = content || {};
  return [];
});

Source.defineMethod("uninit", function uninit() {
  // Uninit content
  delete this.content;
  // Uninit conversation
  this.uninitConversation();
  delete this._conversation;
  // Uninit sourceId
  this.uninitSourceId();
  delete this._sourceId;
});

Source.defineMethod("destruct", function destruct() {
  // Destruct extracts

});

// Conversation

Object.defineProperty(Source.prototype, "conversation", {
  get: function () {
    return this._conversation;
  },
  set: function (value) {
    if (this._conversation == value) return;
    this.uninitConversation();
    this._conversation = value;
    this.initConversation();
  }
});

Source.defineMethod("initConversation", function initConversation() {
  if (!this.conversation) return;
  this.conversation.sources[this.sourceId] = this;
});

Source.defineMethod("uninitConversation", function uninitConversation() {
  if (!this.conversation) return;
  delete this.conversation.sources[this.sourceId];
});

// SourceId

Object.defineProperty(Source.prototype, "sourceId", {
  get: function () {
    return this._sourceId;
  },
  set: function (value) {
    if (this._sourceId == value) return;
    this.uninitSourceId();
    this._sourceId = value;
    this.initSourceId();
  }
});

Source.defineMethod("initSourceId", function initSourceId() {
  if (!this.sourceId) return;
  Source.sources[this.sourceId] = this;
  this.initConversation();
});

Source.defineMethod("uninitSourceId", function uninitSourceId() {
  if (!this.sourceId) return;
  // Uninit conversation as it refers to sourceId
  this.uninitConversation();
  delete Source.sources[this.sourceId];
});

// Extracts

Source.prototype.forEachExtract = function (callback) {
  for (var extractId in this.extracts) {
    callback(this.extracts[extractId]);
  }
};

// Publisher

Source.prototype.prePublish = function () {
  return Promise.resolve(); // Done pre-publish
};

Source.prototype.cloneContent = function () {
  // Clone an object
  var clone = this.content.constructor();
  for (var key in this.content) {
    if (this.content.hasOwnProperty(key)) {
      clone[key] = this.content[key];
    }
  }
  return clone;
};

Source.prototype.backup = function (force = false) {
  // Backup original for user editing
  if (!this._backup_content || force) {
    this._backup_content = this.cloneContent();
  }
};

Source.prototype.recover = function () {
  if (this._backup_content) {
    this.content = this._backup_content;
    delete this._backup_content;
  }
};
