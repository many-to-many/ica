
var JointSource = Model.createComponent("JointSource");

JointSource.jointSources = {count: 0};

JointSource.defineMethod("construct", function construct() {
  // Construct sources
  Object.defineProperty(this, "sources", {
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

JointSource.defineMethod("init", function init(meta, jointSourceId) {
  // Init jointSourceId
  this._jointSourceId = jointSourceId || - ++JointSource.jointSources.count;
  this.initJointSourceId();
  // Init meta
  this.meta = meta || {};
  this.metaParticipantsHandler.tokens = this.meta.participants;
  this.metaThemesHandler.tokens = this.meta.themes;
  return [];
});

JointSource.defineMethod("didUpdate", function didUpdate() {
  this.metaParticipantsHandler.tokens = this.meta.participants;
  this.metaParticipantsHandler.didUpdate();
  this.metaThemesHandler.tokens = this.meta.themes;
  this.metaThemesHandler.didUpdate();
});

JointSource.defineMethod("uninit", function uninit() {
  // Uninit meta
  delete this.meta;
  // Uninit jointSourceId
  this.uninitJointSourceId();
  delete this._jointSourceId;
});

JointSource.defineMethod("destruct", function destruct() {
  // Destruct meta handlers
  this.metaParticipantsHandler.destroy();
  this.metaThemesHandler.destroy();
  // Destruct sources (in destroy)

  // Destruct jointExtracts

});

JointSource.defineMethod("destroy", function destroy() {
  // Destruct components
  for (var sourceId in this.sources) {
    this.sources[sourceId].destroy.apply(this.sources[sourceId], arguments);
  }
});

// JointSourceId

Object.defineProperty(JointSource.prototype, "jointSourceId", {
  get: function () {
    return this._jointSourceId;
  },
  set: function (value) {
    if (this._jointSourceId == value) return;
    this.uninitJointSourceId();
    this._jointSourceId = value;
    this.initJointSourceId();
  }
});

JointSource.defineMethod("initJointSourceId", function initJointSourceId() {
  if (!this.jointSourceId) return;
  JointSource.jointSources[this.jointSourceId] = this;
});

JointSource.defineMethod("uninitJointSourceId", function uninitJointSourceId() {
  if (!this.jointSourceId) return;
  delete JointSource.jointSources[this.jointSourceId];
});

// Sources

JointSource.prototype.mapSources = function (callback) {
  var result = [];
  for (var sourceId in this.sources) {
    result.push(callback(this.sources[sourceId], sourceId));
  }
  return result;
}

JointSource.prototype.forEachSource = function (callback) {
  for (var sourceId in this.sources) {
    callback(this.sources[sourceId], sourceId);
  }
}

JointSource.prototype.mapRecoverSources = function (callback) {
  var result = [];
  if (this._backup_sources) {
    for (var sourceId in this._backup_sources) {
      result.push(callback(this._backup_sources[sourceId], sourceId));
    }
  }
  return result;
}

JointSource.prototype.getNumberOfSources = function () {
  var sum = 0;
  this.forEachSource(function () {
    sum++;
  });
  return sum;
}

JointSource.prototype.forEachJointExtract = function (callback) {
  for (var jointExtractId in this.jointExtracts) {
    callback(this.jointExtracts[jointExtractId], jointExtractId);
  }
}

// Publisher

JointSource.prototype.prePublish = function () {
  return Promise.all(this.mapSources(function (source) {
    return source.prePublish();
  }));
}

JointSource.prototype.publish = function () {
  return ICA.publishJointSource(this)
    .then(function (jointSource) {
      this.backup(true);
      this.forEachSource(function (source) {
        source.backup(true);
      });

      return jointSource;
    }.bind(this), function (err) {
      console.warn("Failed to publish:", err.message);
      throw err;
    });
};

JointSource.prototype.unpublish = function () {
  return ICA.unpublishJointSource(this)
    .then(function () {

    }, function (err) {
      console.warn("Failed to unpublish:", err.message);
      throw err;
    });
};

JointSource.prototype.cloneMeta = function () {
  var meta = {};
  for (var name in this.meta) {
    meta[name] = this.meta[name];
  }
  return meta;
}

JointSource.prototype.cloneSources = function () {
  var sources = {};
  for (var sourceId in this.sources) {
    sources[sourceId] = this.sources[sourceId];
  }
  return sources;
}

JointSource.prototype.backup = function (force = false) {
  // Backup original for user editing
  if (!this._backup_meta || force) {
    this._backup_meta = this.cloneMeta();
  }
  if (!this._backup_sources || force) {
    this._backup_sources = this.cloneSources();
  }
}

JointSource.prototype.recover = function () {
  if (this._backup_meta) {
    this.meta = this._backup_meta;
    delete this._backup_meta;
  }
  if (this._backup_sources) {
    for (var sourceId in this.sources) {
      var source = this.sources[sourceId];
      if (source.sourceId < 0) {
        source.destroy(true);
      }
    }
    var _backup_sources = this._backup_sources;
    this.sources = this._backup_sources;
    delete this._backup_sources;
    for (var sourceId in _backup_sources) {
      if (!(sourceId in this.sources)) {
        var source = _backup_sources[sourceId];
        source.initJointSource();
      }
    }
  }
};
