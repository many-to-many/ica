
(function (window) {
  var ICA = {};

  // User Authentication

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

  // API Request

  ICA.APIResponse = function (data, next) {
    this.data = data;
    this.next = next;

    if (next[3]) {
      if (next[0] != "GET") {
        throw new Error("Only GET response can be paginated");
      }
      this.paginated = true;
    }
  };

  ICA.APIResponse.prototype.data = null;

  ICA.APIResponse.prototype.next = null;

  ICA.APIResponse.prototype.paginated = false;

  ICA.APIResponse.prototype.requestNext = function () {
    if (!this.next[3]) return Promise.reject(new ICA.APIResponse.EndOfResponse());
    return ICA.requestAPI.apply(ICA, this.next);
  };

  ICA.APIResponse.getData = function getData(apiResponse) {
    return apiResponse.data;
  };

  ICA.APIResponse.EndOfResponse = function () {
    this.name = "End of Response";
  };

  ICA.APIResponse.EndOfResponse.prototype = Object.create(Error.prototype);

  ICA.api = "api/v1";

  ICA.request = function (method, url, headers, data, responseType = "json", returnXHR = false, notify) {
    return new Promise(function (resolve, reject) {
      var x = new XMLHttpRequest();
      x.open(method, url, true);

      if (responseType && responseType != "x") x.responseType = responseType;

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

      // Set request headers
      if (this.accountSession) {
        x.setRequestHeader("Authorization", "Bearer " + this.accountSession);
      }
      if (headers) for (var header in headers) {
        if (headers[header]) x.setRequestHeader(header, headers[header]);
      }

      // Create progress notification
      if (notify) {
        notifications.addNotification(new XHRProgressNotification(x, notify));
        notifications.didUpdate();
      }

      x.send(data);
    }.bind(this));
  };

  ICA.requestAPI = function (method, path, data, state, notify) {
    return ICA.request(
      method,
      this.api + path,
      {
        "Content-Type": "application/json",
        "X-ICA-State": state
      },
      JSON.stringify(data),
      "json",
      true,
      notify
    )
      .then(function (x) {
        var data = x.response;
        if (data && typeof data == "object" && data.error) {
          console.warn("Request caught error:", data);
          return Promise.reject(new Error(data.error));
        }
        return new ICA.APIResponse(data, [method, path, data, x.getResponseHeader("X-ICA-State-Next")]);
      });
  };

  ICA.get = function (path, params, state, notify) {
    return this.requestAPI("GET", path, params, state, notify);
  };

  ICA.post = function (path, params, notify) {
    return this.requestAPI("POST", path, params, undefined, notify);
  };

  ICA.put = function (path, params, notify) {
    return this.requestAPI("PUT", path, params, undefined, notify);
  };

  ICA.delete = function (path, params, notify) {
    return this.requestAPI("DELETE", path, params, undefined, notify);
  };

  ICA.uploadFile = function (file, notify) {
    return ICA.request(
      "post",
      this.api + "/files/",
      {
        "Content-Type": file.type
      },
      file,
      "json",
      false,
      notify
    )
      .then(function (fileId) {
        console.log("ICA: File uploaded");
        return fileId;
      });
  };

  ICA.uploadFileChunked = function (file, notify) {
    var notification = new ProgressNotification(notify);
    if (notify) {
      notifications.addNotification(notification);
      notifications.didUpdate();
    }

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

          notification.progressPct = 1;
          notification.didUpdate();

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

                notification.progressPct = 1;
                notification.didUpdate();

                return fileId;
              } else if (x.status == 308) {
                // File upload incomplete
                var matches = x.getResponseHeader("Range").match(/(\d*)-(\d*)/),
                  byteLast = parseInt(matches[2]);
                console.log("ICA: File upload incomplete: {0}%".format(100 * (byteLast + 1) / file.size));

                notification.progressPct = byteLast / (file.size - 1);
                notification.didUpdate();

                return putFile(url, byteLast + 1, byteLength);
              } else {
                // Error uploading file chunk

                notification.progressPct = 1;
                notification.didUpdate();

                return Promise.reject(); // TODO: Allow retry
              }
            });
        }

        // Start uploading file chunks
        return putFile(this.api + "/files/" + fileId);
        // return fileId;
      }.bind(this));
  };

  ICA.getJointSources = function (params, notify) {
    var data = [];
    for (var key in params) {
      data.push(key + "=" + params[key]);
    }
    return ICA.get(
      "/jointsources/"
        + (data.length > 0
        ? "?" + data.join("&")
        : ""),
      undefined,
      undefined,
      notify
    )
      .then(touchJointSourcesWithAPIResponse);
  };

  ICA.publishJointSource = function (jointSource, notify) {
    return jointSource.prePublish()
      .then(function () {
        // if (jointSource.getNumberOfSources() == 0) throw new Error("Needs at least one source");
        if (jointSource.jointSourceId < 0) {
          // Post new joint source
          return ICA.post("/jointsources/", {
            _id: jointSource.jointSourceId,
            meta: jointSource.meta
              ? {
                title: jointSource.meta.title ? {"0": jointSource.meta.title} : null,
                intro: jointSource.meta.intro ? {"0": jointSource.meta.intro} : null,
                themes: jointSource.meta.themes ? {"0": jointSource.meta.themes} : null,
                participants: jointSource.meta.participants ? {"0": jointSource.meta.participants} : null,
                region: jointSource.meta.region ? {"0": jointSource.meta.region} : null
              }
              : {},
            sources: jointSource.mapSources(function (source) {
              switch (source.constructor) {
              case ImageSource:
                return {
                  _id: source.sourceId,
                  type: "image",
                  content: source.content
                };
              case AudioSource:
                return {
                  _id: source.sourceId,
                  type: "audio",
                  content: source.content
                };
              case VideoSource:
                return {
                  _id: source.sourceId,
                  type: "video",
                  content: source.content
                };
              case TextSource:
              default:
                return {
                  _id: source.sourceId,
                  type: "text",
                  content: {"0": source.content}
                };
              }
            })
          }, notify)
            .then(ICA.APIResponse.getData)
            .then(touchJointSources)
            .then(function () {
              console.log("ICA: Joint source posted");
              return jointSource;
            });
        }

        // Update joint source and individual sources (only if necessary TODO)

        var notification = new ProgressNotification(notify);
        var numTasksTodo = 1, numTasksDone = 0;
        function updateNotification() {
          notification.progressPct = numTasksDone / numTasksTodo;
          notification.didUpdate();
        }
        if (notify) {
          notifications.addNotification(notification);
          notifications.didUpdate();
        }

        return ICA.put("/jointsources/{0}/".format(jointSource.jointSourceId), {
          meta: jointSource.meta
            ? {
              title: jointSource.meta.title ? {"0": jointSource.meta.title} : null,
              intro: jointSource.meta.intro ? {"0": jointSource.meta.intro} : null,
              themes: jointSource.meta.themes ? {"0": jointSource.meta.themes} : null,
              participants: jointSource.meta.participants ? {"0": jointSource.meta.participants} : null,
              region: jointSource.meta.region ? {"0": jointSource.meta.region} : null
            }
            : {}
        })
          .then(function () {
            console.log("ICA: Joint source revision posted");
          })
          // Post new sources
          .then(function () {
            return Promise.all(jointSource.mapSources(function (source) {
              ++numTasksTodo;

              var promise;
              if (source.sourceId < 0) {
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
                case VideoSource:
                  promise = ICA.post("/jointsources/{0}/sources/".format(jointSource.jointSourceId), {
                    _id: source.sourceId,
                    type: "video",
                    content: source.content
                  });
                  break;
                case TextSource:
                default:
                  promise = ICA.post("/jointsources/{0}/sources/".format(jointSource.jointSourceId), {
                    _id: source.sourceId,
                    type: "text",
                    content: {"0": source.content}
                  });
                }
                return promise
                  .then(ICA.APIResponse.getData)
                  .then(function (dataSources) {
                    touchSources(dataSources, jointSource);
                    console.log("ICA: Source posted");

                    ++numTasksDone;
                    updateNotification();
                  });
              }
              // TODO: Post new revision only if necessary
              switch (source.constructor) {
              case AudioSource:
              case VideoSource:
              case ImageSource:
                promise = ICA.put("/jointsources/{0}/sources/{1}/".format(
                  jointSource.jointSourceId,
                  source.sourceId),
                  {
                    content: source.content
                  });
                break;
              case TextSource:
              default:
                promise = ICA.put("/jointsources/{0}/sources/{1}/".format(
                  jointSource.jointSourceId,
                  source.sourceId),
                  {
                    content: {"0": source.content}
                  });
              }
              return promise
                .then(function () {
                  console.log("ICA: Source revision posted");

                  ++numTasksDone;
                  updateNotification();
                });
            }));
          })
          // Unpublish sources removed
          .then(function () {
            return Promise.all(jointSource.mapRecoverSources(function (source, sourceId) {
              if (!(sourceId in jointSource.sources)) {
                ++numTasksTodo;
                
                return ICA.unpublishSource(source)
                  .then(function () {
                    source.destroy(true, true);

                    ++numTasksDone;
                    updateNotification();
                  });
              }
              return Promise.resolve();
            }));
          })
          .then(function () {

            ++numTasksDone;
            updateNotification();

            return;
          });
      });
  };

  ICA.unpublishJointSource = function (jointSource, notify) {
    if (jointSource.jointSourceId < 0) return Promise.reject(new Error("Joint source not yet published"));
    return ICA.delete("/jointsources/{0}/".format(jointSource.jointSourceId),
      undefined,
      notify
    )
      .then(function () {
        console.log("ICA: Joint source deleted");
      });
  };

  ICA.unpublishSource = function (source, notify) {
    if (source.sourceId < 0) throw new Error("Source not yet published");
    return ICA.delete(
      "/jointsources/{0}/sources/{1}/".format(
        source.jointSource.jointSourceId,
        source.sourceId
      ),
      undefined,
      notify
    )
      .then(function () {
        console.log("ICA: Source deleted");
      });
  };

  ICA.getThemes = function () {
    return ICA.get("/themes/")
      .then(ICA.APIResponse.getData);
  };

  ICA.getFileStats = function (fileId) {
    return ICA.get("/files/" + fileId)
      .then(ICA.APIResponse.getData);
  };

  // Utility Functions

  ICA.empty = function (data) {
    if (data == undefined || data == null) return true;
    if (Array.isArray(data)) {
      return data.length == 0;
    }
    if (typeof data == "object") {
      return Object.keys(data).length == 0;
    }
    return false;
  };

  function touchJointSources(data) {
    var jointSources = [];
    for (var jointSourceId in data) {
      var dataJointSource = data[jointSourceId], jointSource;
      if (dataJointSource._id) {
        jointSource = JointSource.jointSources[dataJointSource._id];
        jointSource.jointSourceId = jointSourceId;
      } else {
        jointSource = new JointSource(dataJointSource.meta
          ? {
            title: dataJointSource.meta.title ? dataJointSource.meta.title["0"] : null,
            intro: dataJointSource.meta.intro ? dataJointSource.meta.intro["0"] : null,
            themes: dataJointSource.meta.themes ? dataJointSource.meta.themes["0"] : null,
            participants: dataJointSource.meta.participants ? dataJointSource.meta.participants["0"] : null,
            region: dataJointSource.meta.region ? dataJointSource.meta.region["0"] : null
          }
          : {}, jointSourceId);
        jointSources.push(jointSource);
      }
      touchSources(dataJointSource.sources, jointSource);
    }
    return jointSources;
  }

  function touchJointSourcesWithAPIResponse(apiResponse) {
    var jointSources = touchJointSources(apiResponse.data);
    jointSources.requestNext = function () {
      return apiResponse.requestNext()
        .then(touchJointSourcesWithAPIResponse);
    };
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
          source = new ImageSource(dataSource.content, jointSource, sourceId);
          break;
        case "audio":
          source = new AudioSource(dataSource.content, jointSource, sourceId);
          break;
        case "video":
          source = new VideoSource(dataSource.content, jointSource, sourceId);
          break;
        case "text":
        default:
          source = new TextSource(dataSource.content["0"], jointSource, sourceId);
        }
        sources.push(source);
      }
      // jointSource._timeLastUpdated = dataJointSource["updated"];
    }
    return sources;
  }

  window.ICA = ICA;
} (window));
