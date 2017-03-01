
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
};

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

ICA.request = function (method, url, headers, data, responseType = "json", returnXHR = false) {
  return new Promise(function (resolve, reject) {
    var x = new XMLHttpRequest();
    x.open(method, url, true);
    if (responseType && responseType != "x") x.responseType = responseType;
    if (x.upload) x.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        var percentComplete = (e.loaded / e.total) * 100;
        console.log("Requesting: {0}%".format(percentComplete));
      }
    };
    x.onprogress = function (e) {
      if (e.lengthComputable) {
        var percentComplete = (e.loaded / e.total) * 100;
        console.log("Responding: {0}%".format(percentComplete));
      }
    };
    x.onreadystatechange = function () {
      if (x.readyState == 4) {
        if (returnXHR) {
          resolve(x);
          return;
        }
        if (x.status == 200) {
          switch (x.responseType) {
          case "blob":
            resolve(new Blob(
              [x.response],
              {
                type: x.getResponseHeader("Content-Type")
                  || "text/plain"
              }));
            break;
          case "json":
            resolve(x.response);
            break;
          default:
            if (x.getResponseHeader("Content-Type") == "application/json") {
              resolve(JSON.parse(x.responseText));
              break;
            }
            resolve(x.responseText);
          }
        } else {
          reject(new Error("Something else other than 200 was returned"));
        }
      }
    };
    if (this.accountSession) {
      x.setRequestHeader("Authorization", "Bearer " + this.accountSession);
    }
    if (headers) for (var header in headers) {
      x.setRequestHeader(header, headers[header]);
    }
    x.send(data);
  }.bind(this));
};

ICA.requestAPI = function (method, path, data) {
  return ICA.request(
    method,
    this.api + path,
    {
      "Content-Type": "application/json"
    },
    JSON.stringify(data),
    "json",
    true
  )
    .then(function (x) {
      var data = x.response;
      if (typeof data == "object" && data.error) {
        console.warn("Request caught error:", data);
        return Promise.reject(new Error(data.error));
      }
      return data;
    });
};

ICA.uploadFile = function (file) {
  return ICA.uploadFileChunked(file);
  // return ICA.request(
  //   "post",
  //   this.api + "/files/",
  //   {
  //     "Content-Type": file.type
  //   },
  //   blob
  // )
  //   .then(function (fileId) {
  //     console.log("ICA: File uploaded");
  //     return fileId;
  //   });
};

ICA.uploadFileChunked = function (file) {
  return ICA.request(
    "post",
    this.api + "/files/",
    {
      "X-Upload-Content-Type": file.type,
      "X-Upload-Content-Length": file.size
    },
    null,
    "json",
    true
  )
    .then(function (x) {
      var data = x.response;
      if (typeof data != "number") {
        if (typeof data == "object" && data.error) {
          console.warn("Request caught error:", data);
          return Promise.reject(new Error(data.error));
        }
        return Promise.reject(new Error("Error starting file upload"));
      }
      var fileId = data;

      function putFile(url, byteStart = 0, byteLength = 5 * 1024 * 1024) {
        var byteEnd = Math.min(file.size, byteStart + byteLength);
        return ICA.request(
          "put",
          url,
          {
            "Content-Type": file.type,
            "Content-Range": "bytes {0}-{1}/{2}".format(byteStart, byteEnd - 1, file.size)
          },
          file.slice(byteStart, byteEnd),
          null,
          true
        )
          .then(function (x) {
            if (x.status == 200) {
              // File upload completed
              return fileId;
            } else if (x.status == 308) {
              // File upload incomplete
              var matches = x.getResponseHeader("Range").match(/(\d*)-(\d*)/),
                byteLast = parseInt(matches[2]);
              console.log("ICA: File upload incomplete: {0}%".format(100 * (byteLast + 1) / file.size));
              return putFile(url, byteLast + 1, byteLength);
            } else {
              // Error uploading file chunk
              return Promise.reject(); // TODO: Allow retry
            }
          });
      }

      // Start uploading file chunks
      return putFile(this.api + "/files/" + fileId);
      // return fileId;
    }.bind(this));
};

ICA.get = function (path, params) {
  return this.requestAPI("GET", path, params);
};

ICA.post = function (path, params) {
  return this.requestAPI("POST", path, params);
};

ICA.put = function (path, params) {
  return this.requestAPI("PUT", path, params);
};

ICA.delete = function (path, params) {
  return this.requestAPI("DELETE", path, params);
};

ICA.getJointSources = function () {
  return ICA.get("/jointsources/")
    .then(touchJointSources);
};

ICA.publishJointSource = function (jointSource) {
  return jointSource.prePublish()
    .then(function () {
      // if (jointSource.getNumberOfSources() == 0) throw new Error("Needs at least one source");
      if (jointSource.jointSourceId < 0) {
        // Post new joint source
        return ICA.post("/jointsources/", {
          _id: jointSource.jointSourceId,
          meta: {
            title: jointSource.meta.title ? {"*": jointSource.meta.title} : null,
            intro: jointSource.meta.intro ? {"*": jointSource.meta.intro} : null,
            themes: jointSource.meta.themes ? {"*": jointSource.meta.themes} : null
          },
          sources: jointSource.mapSources(function (source) {
            switch (source.constructor) {
            case ImageSource:
              return {
                _id: source.sourceId,
                type: "image",
                content: {"*": source.content}
              };
            case AudioSource:
              return {
                _id: source.sourceId,
                type: "audio",
                content: {"*": source.content}
              };
            case TextSource:
            default:
              return {
                _id: source.sourceId,
                type: "text",
                content: {"*": source.content}
              };
            }
          })
        })
          .then(touchJointSources)
          .then(function () {
            console.log("ICA: Joint source posted");
            return jointSource;
          });
      }
      // Update joint source and individual sources (only if necessary TODO)
      return ICA.put("/jointsources/{0}/".format(jointSource.jointSourceId), {
        meta: {
          title: jointSource.meta.title ? {"*": jointSource.meta.title} : null,
          intro: jointSource.meta.intro ? {"*": jointSource.meta.intro} : null,
          themes: jointSource.meta.themes ? {"*": jointSource.meta.themes} : null,
          participants: jointSource.meta.participants ? {"*": jointSource.meta.participants} : null
        }
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
                  content: {"*": source.content}
                });
                break;
              case AudioSource:
                promise = ICA.post("/jointsources/{0}/sources/".format(jointSource.jointSourceId), {
                  _id: source.sourceId,
                  type: "audio",
                  content: {"*": source.content}
                });
                break;
              case TextSource:
              default:
                promise = ICA.post("/jointsources/{0}/sources/".format(jointSource.jointSourceId), {
                  _id: source.sourceId,
                  type: "text",
                  content: {"*": source.content}
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
              source.sourceId),
              {
                content: {"*": source.content}
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

function touchJointSources(data) {
  var jointSources = [];
  for (var jointSourceId in data) {
    var dataJointSource = data[jointSourceId], jointSource;
    if (dataJointSource._id) {
      jointSource = JointSource.jointSources[dataJointSource._id];
      jointSource.jointSourceId = jointSourceId;
    } else {
      jointSource = new JointSource({
        title: dataJointSource.meta.title ? dataJointSource.meta.title["*"] : null,
        intro: dataJointSource.meta.intro ? dataJointSource.meta.intro["*"] : null,
        themes: dataJointSource.meta.themes ? dataJointSource.meta.themes["*"] : null,
        participants: dataJointSource.meta.participants ? dataJointSource.meta.participants["*"] : null
      }, jointSourceId);
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
        source = new ImageSource(dataSource.content["*"], jointSource, sourceId);
        break;
      case "audio":
        source = new AudioSource(dataSource.content["*"], jointSource, sourceId);
        break;
      case "video":
        source = new VideoSource(dataSource.content["*"], jointSource, sourceId);
        break;
      case "text":
      default:
        source = new TextSource(dataSource.content["*"], jointSource, sourceId);
      }
      sources.push(source);
    }
    // jointSource._timeLastUpdated = dataJointSource["updated"];
  }
  return sources;
}
