
/**
 * JointSource
 * Abstract model representing a collection a sources.
 */
let JointSource = Model.createComponent("JointSource");

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

  Object.values(this.sources).forEach(function (source) {
    // Request source to release jointSource
    source.jointSource = null;
  });

  // Destruct jointExtracts

});

JointSource.defineMethod("destroy", function destroy(destroySources = true, destroyControllers = false, destroyViews = false) {

  if (destroySources) {
    Object.values(this.sources).forEach(function (source) {
      source.destroy.apply(source, [destroyControllers, destroyViews]);
    });
  }

  return [destroyControllers, destroyViews];
});

// JointSourceId

Object.defineProperty(JointSource.prototype, "jointSourceId", {
  get: function () {
    return this._jointSourceId;
  },
  set: function (value) {
    if (this._jointSourceId === value) return;
    this.uninitJointSourceId();

    // Update references

    Object.keys(this.referees).forEach(function (refereeJointSourceId) {
      JointSource.removeJointSourceReference(refereeJointSourceId, this._jointSourceId);
      JointSource.addJointSourceReference(refereeJointSourceId, value);
    }, this);

    Object.keys(this.referrers).forEach(function (referrerJointSourceId) {
      JointSource.removeJointSourceReference(this._jointSourceId, referrerJointSourceId);
      JointSource.addJointSourceReference(value, referrerJointSourceId);
    }, this);

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

JointSource.addJointSourceReference = function addJointSourceReference(refereeJointSourceId, referrerJointSourceId) {

  if (!JointSource.referrers[refereeJointSourceId]) {
    JointSource.referrers[refereeJointSourceId] = {};
  }

  Object.defineProperty(JointSource.referrers[refereeJointSourceId], referrerJointSourceId, {
    get: function () {
      return ICA.getJointSource(referrerJointSourceId);
    },
    enumerable: true,
    configurable: true
  });

  if (!JointSource.referees[referrerJointSourceId]) {
    JointSource.referees[referrerJointSourceId] = {};
  }

  Object.defineProperty(JointSource.referees[referrerJointSourceId], refereeJointSourceId, {
    get: function () {
      return ICA.getJointSource(refereeJointSourceId);
    },
    enumerable: true,
    configurable: true
  });

};

JointSource.removeJointSourceReference = function removeJointSourceReference(refereeJointSourceId, referrerJointSourceId) {

  if (JointSource.referrers[refereeJointSourceId]) {
    delete JointSource.referrers[refereeJointSourceId][referrerJointSourceId];
  }

  if (JointSource.referees[referrerJointSourceId]) {
    delete JointSource.referees[referrerJointSourceId][refereeJointSourceId];
  }

};

JointSource.removeAllJointSourceReferees = function removeAllJointSourceReferees(referrerJointSourceId) {

  if (JointSource.referees[referrerJointSourceId]) {
    Object.keys(JointSource.referees[referrerJointSourceId]).forEach(function (referrerJointSourceId) {
      JointSource.removeJointSourceReference(refereeJointSourceId, referrerJointSourceId);
    });
  }

};

JointSource.removeAllJointSourceReferrers = function removeAllJointSourceReferrers(refereeJointSourceId) {

  if (JointSource.referees[refereeJointSourceId]) {
    Object.keys(JointSource.referrers[refereeJointSourceId]).forEach(function (referrerJointSourceId) {
      JointSource.removeJointSourceReference(refereeJointSourceId, referrerJointSourceId);
    });
  }

};

JointSource.prototype.addReferee = function addReferee(refereeJointSourceId) {
  JointSource.addJointSourceReference(refereeJointSourceId, this.jointSourceId);
};

JointSource.prototype.addReferrer = function addReferrer(referrerJointSourceId) {
  JointSource.addJointSourceReference(this.jointSourceId, referrerJointSourceId);
};

JointSource.prototype.removeAllReferees = function removeAllReferees() {
  JointSource.removeAllJointSourceReferees(this.jointSourceId);
};

JointSource.prototype.removeReferee = function removeReferee(refereeJointSourceId) {
  JointSource.removeJointSourceReference(refereeJointSourceId, this.jointSourceId);
};

JointSource.prototype.removeAllReferrers = function removeAllReferrers() {
  JointSource.removeAllJointSourceReferrers(this.jointSourceId);
};

JointSource.prototype.removeReferrer = function removeReferrer(referrerJointSourceId) {
  JointSource.removeJointSourceReference(this.jointSourceId, referrerJointSourceId);
};

// Sources

Object.defineProperty(JointSource.prototype, "imageSources", {
  get: function () {
    return this.filterSourcesList(function (source) {
      return source instanceof ImageSource;
    });
  }
});

Object.defineProperty(JointSource.prototype, "audioSources", {
  get: function () {
    return this.filterSourcesList(function (source) {
      return source instanceof AudioSource;
    });
  }
});

JointSource.prototype.mapSourcesList = function mapSourcesList(callback) {
  return Object.values(this.sources).map(callback);
};

JointSource.prototype.forEachSource = function forEachSource(callback) {
  return Object.values(this.sources).forEach(callback);
};

JointSource.prototype.filterSourcesList = function filterSourcesList(callback) {
  return Object.values(this.sources).filter(callback);
};

JointSource.prototype.mapBackupSourcesList = function mapBackupSourcesList(callback) {
  return Object.values(this._backup_sources).map(callback);
};

JointSource.prototype.getNumberOfSources = function getNumberOfSources() {
  return Object.values(this).length;
};

// Extracts

JointSource.prototype.forEachJointExtract = function forEachJointExtract(callback) {
  Object.values(this.jointExtracts).forEach(callback);
};

// Publish

JointSource.defineMethod("prePublish", function prePublish() {
  return Promise.all(this.mapSourcesList(function (source) {
    return source.prePublish();
  }));
});

JointSource.prototype._backup = false;

JointSource.defineMethod("backup", function backup(force = false) {
  if (!this._backup_sources || force) {
    this._backup_sources = this.cloneSources();
  }
  if (!this._backup_referees || force) {
    this._backup_referees = this.cloneReferees();
  }
  if (!this._backup_referrers || force) {
    this._backup_referrers = this.cloneReferrers();
  }
  this._backup = true;
});

JointSource.defineMethod("recover", function recover() {

  if (this._backup_sources) {

    // Delete draft sources
    Object.values(this.sources).forEach(function (source) {
      if (source.sourceId < 0) {
        source.destroy(true, true);
      }
    });

    let _backup_sources = this._backup_sources;
    this.sources = this._backup_sources;
    delete this._backup_sources;

    // Recover sources
    Object.keys(_backup_sources).forEach(function (sourceId) {
      if (!(sourceId in this.sources)) {
        let source = _backup_sources[sourceId];
        source.initJointSource();
      }
    }, this);

  }

  if (this._backup_referees) {
    this.removeAllReferees();
    Object.keys(this._backup_referees).forEach(this.addReferee.bind(this));
    delete this._backup_referees;
  }

  if (this._backup_referrers) {
    this.removeAllReferrers();
    Object.keys(this._backup_referrers).forEach(this.addReferrer.bind(this));
    delete this._backup_referrers;
  }

  this._backup = false;
  this.backup();
});

JointSource.prototype.cloneSources = function cloneSources() {
  return cloneObject(this.sources);
};

JointSource.prototype.cloneReferees = function cloneReferees() {
  return cloneObject(this.referees);
};

JointSource.prototype.cloneReferrers = function cloneReferrers() {
  return cloneObject(this.referrers);
};

// Responses

JointSource.prototype.getResponses = function getResponses() {
  return ICA.getJointSourceResponses(this.jointSourceId);
};

// Discussions

JointSource.prototype.getDiscussions = function getDiscussions() {
  return ICA.getJointSourceDiscussions(this.jointSourceId);
};
