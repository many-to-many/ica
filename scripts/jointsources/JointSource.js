
var JointSource = Model.createComponent("JointSource");

JointSource.jointSources = {count: 0};

JointSource.defineMethod("construct", function construct() {
  // Construct sources
  Object.defineProperty(this, "sources", {
    value: {}
  });
  // Construct references
  Object.defineProperty(this, "referees", {
    get: function () {
      if (!JointSource.referees[this.jointSourceId]) {
        JointSource.referees[this.jointSourceId] = {};
      }
      return JointSource.referees[this.jointSourceId];
    }
  });
  Object.defineProperty(this, "referrers", {
    get: function () {
      if (!JointSource.referrers[this.jointSourceId]) {
        JointSource.referrers[this.jointSourceId] = {};
      }
      return JointSource.referrers[this.jointSourceId];
    }
  });
  // Construct jointExtracts
  Object.defineProperty(this, "jointExtracts", {
    value: {}
  });
});

JointSource.defineMethod("init", function init(jointSourceId) {
  // Init jointSourceId
  this._jointSourceId = jointSourceId || - ++JointSource.jointSources.count;
  this.initJointSourceId();
});

JointSource.defineMethod("uninit", function uninit() {
  // Uninit jointSourceId
  this.uninitJointSourceId();
  delete this._jointSourceId;
});

JointSource.defineMethod("destruct", function destruct() {
  // Destruct sources
  for (var sourceId in this.sources) {
    // Request source to release jointSource
    this.sources[sourceId].jointSource = null;
  }
  // Destruct responses
  for (var responseId in this.responses) {
    // Request response to release jointSource
    this.responses[responseId].detachJointSource(this);
    this.responses[responseId].softAttachJointSource(this.jointSourceId);
  }
  // Destruct jointExtracts

});

JointSource.defineMethod("destroy", function destroy(destroySources = true, destroyResponses = true, destroyControllers = false, destroyViews = false) {
  if (destroySources) {
    for (var sourceId in this.sources) {
      this.sources[sourceId].destroy.apply(this.sources[sourceId], [destroyControllers, destroyViews]);
    }
  }
  if (destroyResponses) {
    for (var responseId in this.responses) {
      this.responses[responseId].destroy.apply(this.responses[responseId], [destroyControllers, destroyViews]);
    }
  }
  return [destroyControllers, destroyViews];
});

JointSource.defineMethod("didUpdate", function didUpdate() {
  for (var referrerJointSourceId in this.referrers) {
    if (this.referrers[referrerJointSourceId]) this.referrers[referrerJointSourceId].refereeDidUpdate(this);
  }
  for (var refereeJointSourceId in this.referees) {
    if (this.referees[refereeJointSourceId]) this.referees[refereeJointSourceId].referrerDidUpdate(this);
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

    // Update references
    for (var refereeJointSourceId in this.referees) {
      JointSource.removeJointSourceReference(refereeJointSourceId, this._jointSourceId);
      JointSource.addJointSourceReference(refereeJointSourceId, value);
    }
    for (var referrerJointSourceId in this.referrers) {
      JointSource.removeJointSourceReference(this._jointSourceId, referrerJointSourceId);
      JointSource.addJointSourceReference(value, referrerJointSourceId);
    }

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

// References

JointSource.referrers = {};
JointSource.referees = {};

JointSource.addJointSourceReference = function (refereeJointSourceId, referrerJointSourceId) {
  if (!JointSource.referrers[refereeJointSourceId]) {
    JointSource.referrers[refereeJointSourceId] = {};
  }
  Object.defineProperty(JointSource.referrers[refereeJointSourceId], referrerJointSourceId, {
    get: function () {
      return JointSource.jointSources[referrerJointSourceId];
    },
    enumerable: true,
    configurable: true
  });

  if (!JointSource.referees[referrerJointSourceId]) {
    JointSource.referees[referrerJointSourceId] = {};
  }
  Object.defineProperty(JointSource.referees[referrerJointSourceId], refereeJointSourceId, {
    get: function () {
      return JointSource.jointSources[refereeJointSourceId];
    },
    enumerable: true,
    configurable: true
  });
};

JointSource.removeJointSourceReference = function (refereeJointSourceId, referrerJointSourceId) {
  if (JointSource.referrers[refereeJointSourceId]) {
    delete JointSource.referrers[refereeJointSourceId][referrerJointSourceId];
  }
  if (JointSource.referees[referrerJointSourceId]) {
    delete JointSource.referees[referrerJointSourceId][refereeJointSourceId];
  }
};

JointSource.removeAllJointSourceReferees = function (referrerJointSourceId) {
  if (JointSource.referees[referrerJointSourceId]) {
    for (var refereeJointSourceId in JointSource.referees[referrerJointSourceId]) {
      JointSource.removeJointSourceReference(refereeJointSourceId, referrerJointSourceId);
    }
  }
};

JointSource.defineMethod("referrerDidUpdate", function referrerDidUpdate(referrer) {

});

JointSource.defineMethod("refereeDidUpdate", function refereeDidUpdate(referee) {

});

// Sources

Object.defineProperty(JointSource.prototype, "imageSources", {
  get: function () {
    return this.filterSources(function (source) {
      return source instanceof ImageSource;
    });
  }
});

Object.defineProperty(JointSource.prototype, "audioSources", {
  get: function () {
    return this.filterSources(function (source) {
      return source instanceof AudioSource;
    });
  }
});

JointSource.prototype.mapSources = function (callback) {
  var result = [];
  for (var sourceId in this.sources) {
    result.push(callback(this.sources[sourceId], sourceId));
  }
  return result;
};

JointSource.prototype.forEachSource = function (callback) {
  for (var sourceId in this.sources) {
    callback(this.sources[sourceId], sourceId);
  }
};

JointSource.prototype.filterSources = function (filter) {
  var result = [];
  for (var sourceId in this.sources) {
    if (filter(this.sources[sourceId], sourceId)) {
      result.push(this.sources[sourceId]);
    }
  }
  return result;
};

JointSource.prototype.mapRecoverSources = function (callback) {
  var result = [];
  if (this._backup_sources) {
    for (var sourceId in this._backup_sources) {
      result.push(callback(this._backup_sources[sourceId], sourceId));
    }
  }
  return result;
};

JointSource.prototype.getNumberOfSources = function () {
  var sum = 0;
  this.forEachSource(function () {
    sum++;
  });
  return sum;
};

JointSource.prototype.cloneSources = function () {
  var sources = {};
  for (var sourceId in this.sources) {
    sources[sourceId] = this.sources[sourceId];
  }
  return sources;
};

JointSource.prototype.forEachJointExtract = function (callback) {
  for (var jointExtractId in this.jointExtracts) {
    callback(this.jointExtracts[jointExtractId], jointExtractId);
  }
};

JointSource.prototype.forEachResponse = function (callback) {
  for (var responseId in this.responses) {
    callback(this.responses[responseId], responseId);
  }
};

// Publish

JointSource.defineMethod("prePublish", function prePublish() {
  return Promise.all(this.mapSources(function (source) {
    return source.prePublish();
  }));
});

JointSource.prototype._backup = false;

JointSource.defineMethod("backup", function backup(force = false) {
  if (!this._backup_sources || force) {
    this._backup_sources = this.cloneSources();
    this._backup = true;
  }
});

JointSource.defineMethod("recover", function recover() {
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
        source.initJointSource();
      }
    }
  }
  this._backup = false;
});

// Responses

JointSource.prototype.getResponses = function () {
  return ICA.getJointSourceResponses(this.jointSourceId);
};
