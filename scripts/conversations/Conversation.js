
var Conversation = Model.createComponent("Conversation");

Conversation.conversations = {count: 0};

Conversation.defineMethod("construct", function construct() {
  // Construct sources
  Object.defineProperty(this, "sources", {
    value: {}
  });
  // Construct comments
  Object.defineProperty(this, "comments", {
    value: {}
  });
  // Construct jointExtracts
  Object.defineProperty(this, "jointExtracts", {
    value: {}
  });
  // Construct meta handlers
  this.metaParticipantsHandler = new TokensHandler();
  this.metaThemesHandler = new TokensHandler();
});

Conversation.defineMethod("init", function init(meta, conversationId) {
  // Init conversationId
  this._conversationId = conversationId || - ++Conversation.conversations.count;
  this.initConversationId();
  // Init meta
  this.meta = meta || {};
  this.metaParticipantsHandler.tokens = this.meta.participants;
  this.metaThemesHandler.tokens = this.meta.themes;
  return [];
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
  // Uninit conversationId
  this.uninitConversationId();
  delete this._conversationId;
});

Conversation.defineMethod("destruct", function destruct() {
  // Destruct meta handlers
  this.metaParticipantsHandler.destroy();
  this.metaThemesHandler.destroy();
  // Destruct sources
  for (var sourceId in this.sources) {
    // Request source to release conversation
    this.sources[sourceId].conversation = null;
  }
  // Destruct comments
  for (var commentId in this.comments) {
    // Request comment to release conversation
    this.comments[commentId].conversation = null;
  }
  // Destruct jointExtracts

});

Conversation.defineMethod("destroy", function destroy(destroySources = true, destroyComments = true, destroyControllers = false, destroyViews = false) {
  if (destroySources) {
    for (var sourceId in this.sources) {
      this.sources[sourceId].destroy.apply(this.sources[sourceId], [destroyControllers, destroyViews]);
    }
  }
  if (destroyComments) {
    for (var commentId in this.comments) {
      this.comments[commentId].destroy.apply(this.comments[commentId], [destroyControllers, destroyViews]);
    }
  }
  return [destroyControllers, destroyViews];
});

// ConversationId

Object.defineProperty(Conversation.prototype, "conversationId", {
  get: function () {
    return this._conversationId;
  },
  set: function (value) {
    if (this._conversationId == value) return;
    this.uninitConversationId();
    this._conversationId = value;
    this.initConversationId();
  }
});

Conversation.defineMethod("initConversationId", function initConversationId() {
  if (!this.conversationId) return;
  Conversation.conversations[this.conversationId] = this;
});

Conversation.defineMethod("uninitConversationId", function uninitConversationId() {
  if (!this.conversationId) return;
  delete Conversation.conversations[this.conversationId];
});

// Sources

Object.defineProperty(Conversation.prototype, "imageSources", {
  get: function () {
    return this.filterSources(function (source) {
      return source instanceof ImageSource;
    });
  }
});

Object.defineProperty(Conversation.prototype, "audioSources", {
  get: function () {
    return this.filterSources(function (source) {
      return source instanceof AudioSource;
    });
  }
});

Conversation.prototype.mapSources = function (callback) {
  var result = [];
  for (var sourceId in this.sources) {
    result.push(callback(this.sources[sourceId], sourceId));
  }
  return result;
};

Conversation.prototype.forEachSource = function (callback) {
  for (var sourceId in this.sources) {
    callback(this.sources[sourceId], sourceId);
  }
};

Conversation.prototype.filterSources = function (filter) {
  var result = [];
  for (var sourceId in this.sources) {
    if (filter(this.sources[sourceId], sourceId)) {
      result.push(this.sources[sourceId]);
    }
  }
  return result;
};

Conversation.prototype.mapRecoverSources = function (callback) {
  var result = [];
  if (this._backup_sources) {
    for (var sourceId in this._backup_sources) {
      result.push(callback(this._backup_sources[sourceId], sourceId));
    }
  }
  return result;
};

Conversation.prototype.getNumberOfSources = function () {
  var sum = 0;
  this.forEachSource(function () {
    sum++;
  });
  return sum;
};

Conversation.prototype.forEachJointExtract = function (callback) {
  for (var jointExtractId in this.jointExtracts) {
    callback(this.jointExtracts[jointExtractId], jointExtractId);
  }
};

// Publisher

Conversation.prototype.prePublish = function () {
  return Promise.all(this.mapSources(function (source) {
    return source.prePublish();
  }));
};

Conversation.prototype.publish = function (notify) {
  return ICA.publishConversation(this, notify)
    .then(function (conversation) {
      this.backup(true);
      this.forEachSource(function (source) {
        source.backup(true);
      });

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

Conversation.prototype.cloneSources = function () {
  var sources = {};
  for (var sourceId in this.sources) {
    sources[sourceId] = this.sources[sourceId];
  }
  return sources;
};

Conversation.prototype.backup = function (force = false) {
  // Backup original for user editing
  if (!this._backup_meta || force) {
    this._backup_meta = this.cloneMeta();
  }
  if (!this._backup_sources || force) {
    this._backup_sources = this.cloneSources();
  }
};

Conversation.prototype.recover = function () {
  if (this._backup_meta) {
    this.meta = this._backup_meta;
    delete this._backup_meta;
  }
  if (this._backup_sources) {
    for (let sourceId in this.sources) {
      let source = this.sources[sourceId];
      if (source.sourceId < 0) {
        source.destroy(true, true);
      }
    }
    var _backup_sources = this._backup_sources;
    this.sources = this._backup_sources;
    delete this._backup_sources;
    for (let sourceId in _backup_sources) {
      if (!(sourceId in this.sources)) {
        let source = _backup_sources[sourceId];
        source.initConversation();
      }
    }
  }
};

// Comments

Conversation.prototype.forEachComment = function (callback) {
  for (var commentId in this.comments) {
    callback(this.comments[commentId], commentId);
  }
};
