
var ICA = {
  api: "api/v1"
};

ICA.login = function () {
  return new Promise(function (resolve, reject) {
    var oauthWindow = window.open("oauth2login", "Log in via MintKit", "location=0,status=0,width=600,height=700");

    if (oauthWindow) {
      var timer = setInterval(function () {
        if (oauthWindow.closed) {
          clearInterval(timer);

          if (new Date().getTime() - window.sessionStorage.getItem("_ica_oauth2_timestamp") < 1000) {
            resolve();
          } else {
            reject(new Error("Error synchronizing/failed to log in"));
          }
        }
      }, 1000);
    } else {
      console.error("Failed to open popup window");
    }
  });
}

Object.defineProperty(ICA, "accountId", {
  get: function () {
    return window.sessionStorage.getItem("_ica_account_id");
  }
});

Object.defineProperty(ICA, "accountSession", {
  get: function () {
    return window.sessionStorage.getItem("_ica_account_session");
  }
});

ICA.request = function (path, method, data) {
  return new Promise(function (resolve, reject) {
    try {
      var x = new XMLHttpRequest();
      x.open(method, this.api + path, true);
      if (x.upload) {
        x.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            var percentComplete = (e.loaded / e.total) * 100;
            console.log("Requesting: {0}%".format(percentComplete));
          }
        };
      }
      x.onprogress = function (e) {
        if (e.lengthComputable) {
          var percentComplete = (e.loaded / e.total) * 100;
          console.log("Responding: {0}%".format(percentComplete));
        }
      };
      x.onreadystatechange = function (e) {
        if (x.readyState == 4) {
          if (x.status == 200){
            try {
              var data = JSON.parse(x.responseText);
              if (data.error) {
                console.warn("Request caught error:", data);
                reject(new Error(data.error));
                return;
              }
              if (data.warn) {
                console.warn("Request caught warning:", data);
              }
              resolve(data);
            } catch(e) {
              reject(new Error("Error parsing server response:\n" + x.responseText));
            }
          } else if (x.status == 400) {
            reject(new Error("There was an error processing the token"));
          } else {
            reject(new Error("something else other than 200 was returned"));
          }
        }
      };
      if (this.accountSession) {
        x.setRequestHeader("Authorization", "Bearer " + this.accountSession);
      }
      if (!data) data = {};
      if (data instanceof File) {
        // if (data.size > 16 * 1024 * 1024) throw new Error("File size over 16 MB");
        x.setRequestHeader("Content-Type", data.type);
        x.send(data);
      } else {
        x.setRequestHeader("Content-Type", "application/json");
        x.send(JSON.stringify(data));
      }
      console.log("Request: {0} {1}".format(method, path));
    } catch (err) {
      reject(err);
    }
  }.bind(this));
};

ICA.get = function (path, params) {
  return this.request(path, "GET", params);
};

ICA.post = function (path, params) {
  return this.request(path, "POST", params);
};

ICA.put = function (path, params) {
  return this.request(path, "PUT", params);
};

ICA.delete = function (path, params) {
  return this.request(path, "DELETE", params);
};

ICA.getJointSources = function () {
  return ICA.get("/jointsources/")
    .then(touchJointSources);
}

ICA.publishJointSource = function (jointSource) {
  return jointSource.prePublish()
    .then(function () {
      if (jointSource.getNumberOfSources() == 0) throw new Error("Needs at least one source");
      if (jointSource.jointSourceId < 0) {
        // Post new joint source
        return ICA.post("/jointsources/", {
          _id: jointSource.jointSourceId,
          meta: jointSource.meta,
          sources: jointSource.mapSources(function (source) {
            switch (source.constructor) {
              case ImageSource:
                return {
                  _id: source.sourceId,
                  type: "image",
                  content: source.content
                }
              case AudioSource:
                return {
                  _id: source.sourceId,
                  type: "audio",
                  content: source.content
                }
              case TextSource:
              default:
                return {
                  _id: source.sourceId,
                  type: "text",
                  content: source.content
                }
            }
          })
        })
          .then(touchJointSources)
          .then(function (jointSources) {
            console.log("ICA: Joint source posted");
            return jointSource;
          });
      }
      // Update joint source and individual sources (only if necessary TODO)
      return ICA.put("/jointsources/{0}/".format(jointSource.jointSourceId), {
        meta: jointSource.meta
      })
        .then(function () {
          console.log("ICA: Joint source revision posted");
        })
        // Post new sources
        .then(function () {
          return Promise.all(jointSource.mapSources(function (source) {
            if (source.sourceId < 0) {
              var promise;
              switch (source.constructor) {
                case ImageSource:
                  promise = ICA.post("/jointsources/{0}/sources/".format(jointSource.jointSourceId), {
                    _id: source.sourceId,
                    type: "image",
                    content: source.content
                  });
                  break;
                case AudioSource:
                  promise = ICA.post("/jointsources/{0}/sources/".format(jointSource.jointSourceId), {
                    _id: source.sourceId,
                    type: "audio",
                    content: source.content
                  });
                  break;
                case TextSource:
                default:
                  promise = ICA.post("/jointsources/{0}/sources/".format(jointSource.jointSourceId), {
                    _id: source.sourceId,
                    type: "text",
                    content: source.content
                  });
              }
              return promise
                .then(function (dataSources) {
                  touchSources(dataSources, jointSource);
                  console.log("ICA: Source posted");
                });
            }
            // Post new revision (only if necessary) TODO
            return ICA.put("/jointsources/{0}/sources/{1}/".format(
              jointSource.jointSourceId,
              source.sourceId), {
              content: source.content
            })
              .then(function () {
                console.log("ICA: Source revision posted");
              });
          }));
        })
        // Unpublish sources removed
        .then(function () {
          return Promise.all(jointSource.mapRecoverSources(function (source, sourceId) {
            if (!(sourceId in jointSource.sources)) {
              return ICA.unpublishSource(source);
            }
            return Promise.resolve();
          }));
        })
        .then(function () {
          return;
        });
    });
};

ICA.unpublishJointSource = function (jointSource) {
  if (jointSource.jointSourceId < 0) return Promise.reject(new Error("Joint source not yet published"));
  return ICA.delete("/jointsources/{0}/".format(jointSource.jointSourceId))
    .then(function () {
      jointSource.destroy(true);
      console.log("ICA: Joint source deleted");
    });
};

ICA.unpublishSource = function (source) {
  if (source.sourceId < 0) throw new Error("Source not yet published");
  return ICA.delete("/jointsources/{0}/sources/{1}/".format(
    source.jointSource.jointSourceId,
    source.sourceId))
    .then(function () {
      source.destroy(true);
      console.log("ICA: Source deleted");
    });
};

ICA.uploadFile = function (file) {
  return ICA.post("/files/", file)
    .then(function (fileId) {
      console.log("ICA: File uploaded");
      return fileId;
    });
};

function touchJointSources(data) {
  var jointSources = [];
  for (var jointSourceId in data) {
    var dataJointSource = data[jointSourceId], jointSource;
    if (dataJointSource._id) {
      jointSource = JointSource.jointSources[dataJointSource._id];
      jointSource.jointSourceId = jointSourceId;
    } else {
      jointSource = new JointSource(dataJointSource.revision.meta, jointSourceId);
      jointSources.push(jointSource);
    }
    touchSources(dataJointSource.sources, jointSource);
  }
  return jointSources;
}

function touchSources(dataSources, jointSource) {
  var sources = [];
  for (var sourceId in dataSources) {
    var dataSource = dataSources[sourceId], source;
    if (dataSource._id) {
      source = Source.sources[dataSource._id];
      source.sourceId = sourceId;
    } else {
      switch (dataSource.type) {
        case "image":
          source = new ImageSource(dataSource.revision.content, jointSource, sourceId);
          break;
        case "audio":
          source = new AudioSource(dataSource.revision.content, jointSource, sourceId);
          break;
        case "text":
        default:
          source = new TextSource(dataSource.revision.content, jointSource, sourceId);
      }
      sources.push(source);
    }
    // jointSource._timeLastUpdated = dataJointSource["updated"];
  };
  return sources;
}
