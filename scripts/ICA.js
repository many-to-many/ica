
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

              // Notify
              notifications.addNotification(new BasicNotification("Logged in as Anonymous"));
              notifications.didUpdate();

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

  ICA.promptLogin = function () {
    return new Promise(function (resolve, reject) {
      var prompt = new BasicPrompt(
        "Many-to-Many",
        "Log in to Many-to-Many to participate in conversation(s) of all shapes, sizes, scales and media.",
        [
          new PromptAction("Cancel", function () {
            reject(new Error("Not yet logged in"));
          }),
          new PromptAction("Log in or Sign up", function () {
            ICA.login()
              .then(function () {
                if (prompt) {
                  prompt.destroy(true, true, true, true);
                  prompt = undefined;
                }
                resolve();
              }, function (e) {
                console.warn(e);
              });
            return false;
          }, true)
        ]
      );
      var fragment = BasicPromptController.createViewFragment();
      var element = fragment.querySelector(".prompt");
      document.body.appendChild(fragment);
      new BasicPromptController(prompt, element);
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

  ICA.request = function (method, url, headers, data, notify) {
    return new Promise(function (resolve, reject) {
      var x = new XMLHttpRequest();

      // Create progress notification
      if (notify) {
        notifications.addNotification(new XHRProgressNotification(x, notify));
        notifications.didUpdate();
      }

      x.open(method, url, true);

      x.responseType = "json";

      x.addEventListener("load", function () {
        resolve(x);
      });
      x.addEventListener("error", function () {
        reject(x);
      });
      x.addEventListener("abort", function () {
        reject(x);
      });

      if (headers) for (var header in headers) {
        if (headers[header]) x.setRequestHeader(header, headers[header]);
      }

      x.send(data);
    }.bind(this));
  };

  ICA._requestAPI = function (method, path, headers = {}, data, notify) {
    if (this.accountSession) {
      headers["Authorization"] = "Bearer " + this.accountSession;
    }

    return ICA.request(
      method,
      this.api + path,
      headers,
      data,
      notify
    )
      .then(function (x) {
        switch (x.status) {
        case 401: // Needs logging in
          return ICA.promptLogin()
            .then(function () {
              return ICA._requestAPI(method, path, headers, data, notify);
            });
        }
        var response = x.response;
        if (response && typeof response == "object" && response.error) {
          console.warn("Request caught error:", response);
          return Promise.reject(new Error(response.error));
        }
        return x;
      });
  };

  ICA.requestAPI = function (method, path, data, state, notify) {
    return ICA._requestAPI(
      method,
      path,
      {
        "Content-Type": "application/json",
        "X-ICA-State": state
      },
      JSON.stringify(data),
      notify
    )
      .then(function (x) {
        return new ICA.APIResponse(x.response, [method, path, data, x.getResponseHeader("X-ICA-State-Next")]);
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
    return ICA._requestAPI(
      "post",
      "/files/",
      {
        "Content-Type": file.type
      },
      file,
      notify
    )
      .then(function (x) {
        var fileId = x.response;
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

    return ICA._requestAPI(
      "post",
      "/files/",
      {
        "X-Upload-Content-Type": file.type,
        "X-Upload-Content-Length": file.size
      }
    )
      .then(function (x) {
        var fileId = x.response;
        if (typeof fileId != "number") {
          return Promise.reject(new Error("Error starting file upload"));
        }

        function putFile(path, byteStart = 0, byteLength = 5 * 1024 * 1024) {
          var byteEnd = Math.min(file.size, byteStart + byteLength);
          return ICA._requestAPI(
            "put",
            path,
            {
              "Content-Type": file.type,
              "Content-Range": "bytes {0}-{1}/{2}".format(byteStart, byteEnd - 1, file.size)
            },
            file.slice(byteStart, byteEnd)
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

                return putFile(path, byteLast + 1, byteLength);
              } else {
                return Promise.reject(new Error("Error uploading file chunk")); // TODO: Allow retry
              }
            });
        }

        // Start uploading file chunks
        return putFile("/files/" + fileId);
      }.bind(this))
      .catch(function (err) {
        notification.progressPct = 1;
        notification.didUpdate();

        throw err;
      });
  };

  ICA.getConversations = function (params, notify) {
    var data = [];
    for (var key in params) {
      data.push(key + "=" + params[key]);
    }
    return ICA.get(
      "/conversations/"
        + (data.length > 0
        ? "?" + data.join("&")
        : ""),
      undefined,
      undefined,
      notify
    )
      .then(touchConversationsWithAPIResponse);
  };

  ICA.publishConversation = function (conversation, notify) {
    return conversation.prePublish()
      .then(function () {
        // if (conversation.getNumberOfSources() == 0) throw new Error("Needs at least one source");
        if (conversation.conversationId < 0) {
          // Post new joint source
          return ICA.post("/conversations/", {
            _id: conversation.conversationId,
            meta: conversation.meta
              ? {
                title: conversation.meta.title ? {"0": conversation.meta.title} : null,
                intro: conversation.meta.intro ? {"0": conversation.meta.intro} : null,
                themes: conversation.meta.themes ? {"0": conversation.meta.themes} : null,
                participants: conversation.meta.participants ? {"0": conversation.meta.participants} : null,
                region: conversation.meta.region ? {"0": conversation.meta.region} : null
              }
              : {},
            sources: conversation.mapSources(function (source) {
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
            .then(touchConversations)
            .then(function () {
              console.log("ICA: Joint source posted");
              return conversation;
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

        return ICA.put("/conversations/{0}/".format(conversation.conversationId), {
          meta: conversation.meta
            ? {
              title: conversation.meta.title ? {"0": conversation.meta.title} : null,
              intro: conversation.meta.intro ? {"0": conversation.meta.intro} : null,
              themes: conversation.meta.themes ? {"0": conversation.meta.themes} : null,
              participants: conversation.meta.participants ? {"0": conversation.meta.participants} : null,
              region: conversation.meta.region ? {"0": conversation.meta.region} : null
            }
            : {}
        })
          .then(function () {
            console.log("ICA: Joint source revision posted");
          })
          // Post new sources
          .then(function () {
            return Promise.all(conversation.mapSources(function (source) {
              ++numTasksTodo;

              var promise;
              if (source.sourceId < 0) {
                switch (source.constructor) {
                case ImageSource:
                  promise = ICA.post("/conversations/{0}/sources/".format(conversation.conversationId), {
                    _id: source.sourceId,
                    type: "image",
                    content: source.content
                  });
                  break;
                case AudioSource:
                  promise = ICA.post("/conversations/{0}/sources/".format(conversation.conversationId), {
                    _id: source.sourceId,
                    type: "audio",
                    content: source.content
                  });
                  break;
                case VideoSource:
                  promise = ICA.post("/conversations/{0}/sources/".format(conversation.conversationId), {
                    _id: source.sourceId,
                    type: "video",
                    content: source.content
                  });
                  break;
                case TextSource:
                default:
                  promise = ICA.post("/conversations/{0}/sources/".format(conversation.conversationId), {
                    _id: source.sourceId,
                    type: "text",
                    content: {"0": source.content}
                  });
                }
                return promise
                  .then(ICA.APIResponse.getData)
                  .then(function (dataSources) {
                    touchSources(dataSources, conversation);
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
                promise = ICA.put("/conversations/{0}/sources/{1}/".format(
                  conversation.conversationId,
                  source.sourceId),
                  {
                    content: source.content
                  });
                break;
              case TextSource:
              default:
                promise = ICA.put("/conversations/{0}/sources/{1}/".format(
                  conversation.conversationId,
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
            return Promise.all(conversation.mapRecoverSources(function (source, sourceId) {
              if (!(sourceId in conversation.sources)) {
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
            notification.progressPct = 1;
            notification.didUpdate();
          }, function (err) {
            notification.progressPct = 1;
            notification.didUpdate();

            return Promise.reject(err);
          });
      });
  };

  ICA.unpublishConversation = function (conversation, notify) {
    if (conversation.conversationId < 0) return Promise.reject(new Error("Joint source not yet published"));
    return ICA.delete("/conversations/{0}/".format(conversation.conversationId),
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
      "/conversations/{0}/sources/{1}/".format(
        source.conversation.conversationId,
        source.sourceId
      ),
      undefined,
      notify
    )
      .then(function () {
        console.log("ICA: Source deleted");
      });
  };

  ICA.getAuthor = function (authorId) {
    return ICA.get("/authors/{0}/".format(authorId))
      .then(function (apiResponse) {
        var dataAuthor = apiResponse.data;
        var author = new Author(authorId);
        author.name = dataAuthor.name;
        return author;
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

  function touchConversations(data) {
    var conversations = [];
    for (var conversationId in data) {
      var dataConversation = data[conversationId], conversation;
      if (dataConversation._id) {
        conversation = Conversation.conversations[dataConversation._id];
        conversation.conversationId = conversationId;
      } else {
        conversation = new Conversation(dataConversation.meta
          ? {
            title: dataConversation.meta.title ? dataConversation.meta.title["0"] : null,
            intro: dataConversation.meta.intro ? dataConversation.meta.intro["0"] : null,
            themes: dataConversation.meta.themes ? dataConversation.meta.themes["0"] : null,
            participants: dataConversation.meta.participants ? dataConversation.meta.participants["0"] : null,
            region: dataConversation.meta.region ? dataConversation.meta.region["0"] : null
          }
          : {}, conversationId);
        conversations.push(conversation);
      }
      touchSources(dataConversation.sources, conversation);
    }
    return conversations;
  }

  function touchConversationsWithAPIResponse(apiResponse) {
    var conversations = touchConversations(apiResponse.data);
    conversations.requestNext = function () {
      return apiResponse.requestNext()
        .then(touchConversationsWithAPIResponse);
    };
    return conversations;
  }

  function touchSources(dataSources, conversation) {
    var sources = [];
    for (var sourceId in dataSources) {
      var dataSource = dataSources[sourceId], source;
      if (dataSource._id) {
        source = Source.sources[dataSource._id];
        source.sourceId = sourceId;
      } else {
        switch (dataSource.type) {
        case "image":
          source = new ImageSource(dataSource.content, conversation, sourceId);
          break;
        case "audio":
          source = new AudioSource(dataSource.content, conversation, sourceId);
          break;
        case "video":
          source = new VideoSource(dataSource.content, conversation, sourceId);
          break;
        case "text":
        default:
          source = new TextSource(dataSource.content["0"], conversation, sourceId);
        }
        sources.push(source);
      }
      // conversation._timeLastUpdated = dataConversation["updated"];
    }
    return sources;
  }

  window.ICA = ICA;
} (window));
