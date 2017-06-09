
var Conversation = JointSource.createComponent("Conversation");

Conversation.defineAlias("jointSourceId", "conversationId");

Conversation.defineMethod("construct", function construct() {
  // Construct meta handlers
  this.metaParticipantsHandler = new TokensHandler();
  this.metaThemesHandler = new TokensHandler();
});

Conversation.defineMethod("init", function init(meta, conversationId) {
  // Init meta
  this.meta = meta || {};
  this.metaParticipantsHandler.tokens = this.meta.participants;
  this.metaThemesHandler.tokens = this.meta.themes;
  return [conversationId];
});

Conversation.defineMethod("didUpdate", function didUpdate() {
  this.metaParticipantsHandler.tokens = this.meta.participants;
  this.metaParticipantsHandler.didUpdate();
  this.metaThemesHandler.tokens = this.meta.themes;
  this.metaThemesHandler.didUpdate();
});

Conversation.defineMethod("uninit", function uninit() {
  // Uninit meta
  delete this.meta;
});

Conversation.defineMethod("destruct", function destruct() {
  // Destruct meta handlers
  this.metaParticipantsHandler.destroy();
  this.metaThemesHandler.destroy();
});

// Publish

Conversation.prototype.publish = function (notify) {
  return ICA.publishConversation(this, notify)
    .then(function (conversation) {
      if (this._backup) { // Force backup when existing backup is found
        this.backup(true);
        this.forEachSource(function (source) {
          source.backup(true);
        });
      }

      return conversation;
    }.bind(this));
};

Conversation.prototype.unpublish = function (notify) {
  return ICA.unpublishConversation(this, notify);
};

Conversation.prototype.cloneMeta = function () {
  var meta = {};
  for (var name in this.meta) {
    meta[name] = this.meta[name];
  }
  return meta;
};

Conversation.defineMethod("backup", function backup(force = false) {
  if (!this._backup_meta || force) {
    this._backup_meta = this.cloneMeta();
  }
});

Conversation.defineMethod("recover", function recover() {
  if (this._backup_meta) {
    this.meta = this._backup_meta;
    delete this._backup_meta;
  }
});
