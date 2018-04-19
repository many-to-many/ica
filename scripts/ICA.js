
(function (window) {
  let ICA = {};

  // User Authentication

  let _ica = JSON.parse(window.sessionStorage.getItem("_ica")) || {};

  ICA.login = function () {
    return new Promise(function (resolve, reject) {
      let oauthWindow = window.open("/oauth2login", "Log in via MintKit", "location=0,status=0,width=600,height=700");

      let loginCallbackData;
      window.loginCallback = function (data) {
        loginCallbackData = data;
      };

      if (oauthWindow) {
        let timer = setInterval(function () {
          if (oauthWindow.closed) {
            clearInterval(timer);
            delete window.loginCallback;

            if (Math.abs(new Date().getTime() / 1000 - loginCallbackData.timestampLogin) < 1000) {
              ICA.getAuthor(loginCallbackData.accountId)
                .then(function (author) {
                  _ica.accountId = loginCallbackData.accountId;
                  _ica.sessionId = loginCallbackData.sessionId;

                  window.sessionStorage.setItem("_ica", JSON.stringify(_ica));

                  // Display notification
                  notifications.addNotification(new BasicNotification("Logged in as " + author.name));
                  notifications.didUpdate();

                  resolve();
                }, function () {
                  reject(new Error("Error fetching author info"));
                });
            } else {
              reject(new Error("Error synchronizing time"));
            }
          }
        }, 1000);
      } else {
        reject(new Error("Failed to open popup window"));
      }
    })
      .catch(function (e) {
        console.warn(e);

        // Display notification
        notifications.addNotification(new BasicNotification("Failed to log in", e ? e.message : undefined));
        notifications.didUpdate();

        throw e;
      });
  };

  ICA.promptLogin = function () {
    return new Promise(function (resolve, reject) {
      let prompt = new BasicPrompt(
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
                  prompt.destroy(true, true, true);
                  prompt = undefined;
                }
                resolve();
              });
            return false;
          }, true)
        ]
      );
      let fragment = BasicPromptController.createViewFragment();
      let element = fragment.querySelector(".prompt");
      document.body.appendChild(fragment);
      new BasicPromptController(prompt, element);
    });
  };

  Object.defineProperty(ICA, "accountId", {
    get: function () {
      return _ica.accountId;
    }
  });

  Object.defineProperty(ICA, "accountSession", {
    get: function () {
      return _ica.sessionId;
    }
  });

  // API Request

  ICA.APIResponse = function (data, next) {
    this.data = data;
    this.next = next;

    if (next[3]) {
      if (next[0] !== "GET") {
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

  ICA.api = "/api/v1";

  ICA.request = function (method, url, headers, data, notify) {
    return new Promise(function (resolve, reject) {
      let x = new XMLHttpRequest();

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

      if (headers) Object.entries(headers).forEach(function (entry) {
        if (entry[1]) x.setRequestHeader(entry[0], entry[1]);
      });

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
        let response = x.response;
        if (response && typeof response === "object" && response.error) {
          console.warn("Request caught error:", response);
          return Promise.reject(new Error(response.error));
        }
        return x;
      });
  };

  ICA.requestAPI = function (method, path, params, state, notify) {
    return ICA._requestAPI(
      method,
      path,
      {
        "Content-Type": "application/json",
        "X-ICA-State": state
      },
      JSON.stringify(params),
      notify
    )
      .then(function (x) {
        return new ICA.APIResponse(x.response, [method, path, params, x.getResponseHeader("X-ICA-State-Next")]);
      });
  };

  ICA.get = function (path, state, notify) {
    return this.requestAPI("GET", path, undefined, state, notify);
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
      "POST",
      "/files/",
      {
        "Content-Type": file.type
      },
      file,
      notify
    )
      .then(function (x) {
        let fileId = x.response;
        console.log("ICA: File uploaded");
        return fileId;
      });
  };

  ICA.uploadFileChunked = function (file, notify) {
    let notification = new ProgressNotification(notify);
    if (notify) {
      notifications.addNotification(notification);
      notifications.didUpdate();
    }

    return ICA._requestAPI(
      "POST",
      "/files/",
      {
        "X-Upload-Content-Type": file.type,
        "X-Upload-Content-Length": file.size
      }
    )
      .then(function (x) {
        let fileId = x.response;
        if (typeof fileId !== "number") {
          return Promise.reject(new Error("Error starting file upload"));
        }

        function putFile(path, byteStart = 0, byteLength = 5 * 1024 * 1024) {
          let byteEnd = Math.min(file.size, byteStart + byteLength);
          return ICA._requestAPI(
            "PUT",
            path,
            {
              "Content-Type": file.type,
              "Content-Range": "bytes {0}-{1}/{2}".format(byteStart, byteEnd - 1, file.size)
            },
            file.slice(byteStart, byteEnd)
          )
            .then(function (x) {
              if (x.status === 200) {
                // File upload completed

                notification.progressPct = 1;
                notification.didUpdate();

                return fileId;
              } else if (x.status === 308) {
                // File upload incomplete
                let matches = x.getResponseHeader("Range").match(/(\d*)-(\d*)/),
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

  let jointSourcePromises = {};

  ICA.getJointSource = function (jointSourceId, forceReload = false) {
    if (JointSource.jointSources[jointSourceId] && !forceReload) {
      return Promise.resolve(JointSource.jointSources[jointSourceId]);
    }

    if (!jointSourcePromises[jointSourceId]) {
      jointSourcePromises[jointSourceId] =
        ICA.get("/jointsources/{0}/".format(jointSourceId))
          .then(ICA.APIResponse.getData)
          .then(function (data) {
            switch (data.type) {
              case "conversation":
                return touchConversation(jointSourceId, data);
              case "discussion":
                return touchDiscussion(jointSourceId, data);
              case "response":
                return touchResponse(jointSourceId, data);
              default:
                throw new Error("Unknown joint source type");
            }
          });
    }

    return jointSourcePromises[jointSourceId];
  };

  ICA.getJointSourceResponses = function (jointSourceId) {
    return ICA.get("/jointsources/{0}/responses/".format(jointSourceId))
      .then(touchResponsesWithAPIResponse);
  };

  ICA.getJointSourceDiscussions = function (jointSourceId) {
    return ICA.get("/jointsources/{0}/discussions/".format(jointSourceId))
      .then(touchDiscussionsWithAPIResponse);
  };

  ICA.getConversations = function (params) {
    let data = !params
      ? []
      : Object.entries(params).map(function (entry) {
        return entry[0] + "=" + entry[1];
      });
    return ICA.get(
      "/conversations/"
        + (data.length > 0
        ? "?" + data.join("&")
        : ""))
      .then(touchConversationsWithAPIResponse);
  };

  let conversationPromises = {};

  ICA.getConversation = function (conversationId, forceReload = false) {
    if (JointSource.jointSources[conversationId] && !forceReload) {
      if (JointSource.jointSources[conversationId] instanceof Conversation) {
        return Promise.resolve(JointSource.jointSources[conversationId]);
      }
      return Promise.reject(new Error("Conversation not found"));
    }

    if (!conversationPromises[conversationId]) {
      conversationPromises[conversationId] =
        ICA.get("/conversations/{0}/".format(conversationId))
          .then(touchConversationWithAPIResponse.bind(null, conversationId))
          .then(function (conversation) {
              if (conversation instanceof Conversation) {
                return conversation;
              }
              throw new Error("Conversation not found");
            });
    }

    return conversationPromises[conversationId];
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
                region: conversation.meta.region ? {"0": conversation.meta.region} : null,
                others: conversation.meta.others ? {"0": conversation.meta.others} : null
              }
              : {},
            sources: conversation.mapSourcesList(function (source) {
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

        let notification = new ProgressNotification(notify);
        let numTasksTodo = 1, numTasksDone = 0;
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
              region: conversation.meta.region ? {"0": conversation.meta.region} : null,
              others: conversation.meta.others ? {"0": conversation.meta.others} : null
            }
            : {}
        })
          // Post new sources
          .then(function () {
            return Promise.all(conversation.mapSourcesList(function (source) {
              ++numTasksTodo;

              let promise;
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
            return Promise.all(conversation.mapBackupSourcesList(function (source) {
              if (!(source.sourceId in conversation.sources)) {
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
          })
          .then(function () {
            console.log("ICA: Conversation revision posted");
            return conversation;
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

  ICA.publishResponse = function (response, notify) {
    return response.prePublish()
      .then(function () {
        if (response.responseId < 0) {
          // Post new joint source
          return ICA.post("/responses/", {
            _id: response.responseId,
            message: response.message || {},
            refereeJointSourceIds: Object.keys(response.referees),
            referrerJointSourceIds: Object.keys(response.referrers)
          }, notify)
            .then(touchResponsesWithAPIResponse)
            .then(function () {
              console.log("ICA: Response posted");
              return response;
            });
        }
        // Update existing response
        return ICA.put("/responses/{0}/".format(response.responseId), {
          message: response.message || {},
          refereeJointSourceIds: Object.keys(response.referees)
        }, notify)
          .then(touchResponsesWithAPIResponse)
          .then(function () {
            console.log("ICA: Response updated");
            return response;
          });
      });
  };

  ICA.unpublishResponse = function (response, notify) {
    if (response.responseId < 0) return Promise.reject(new Error("Joint source not yet published"));
    return ICA.delete("/responses/{0}/".format(response.responseId),
      undefined,
      notify
    )
      .then(function () {
        console.log("ICA: Response deleted");
      });
  };

  ICA.getDiscussions = function (params) {
    let data = !params
      ? []
      : Object.entries(params).map(function (entry) {
        return entry[0] + "=" + entry[1];
      });
    return ICA.get(
      "/discussions/"
      + (data.length > 0
        ? "?" + data.join("&")
        : ""))
      .then(touchDiscussionsWithAPIResponse);
  };

  let discussionPromises = {};

  ICA.getDiscussion = function (discussionId, forceReload = false) {
    if (JointSource.jointSources[discussionId] && !forceReload) {
      if (JointSource.jointSources[discussionId] instanceof Discussion) {
        return Promise.resolve(JointSource.jointSources[discussionId]);
      }
      return Promise.reject(new Error("Discussion not found"));
    }

    if (!discussionPromises[discussionId]) {
      discussionPromises[discussionId] =
        ICA.get("/discussions/{0}/".format(discussionId))
          .then(touchDiscussionWithAPIResponse.bind(null, discussionId))
          .then(function (discussion) {
            if (discussion instanceof Discussion) {
              return discussion;
            }
            throw new Error("Discussion not found");
          });
    }

    return discussionPromises[discussionId];
  };

  ICA.publishDiscussion = function (discussion, notify) {
    return discussion.prePublish()
      .then(function () {
        if (discussion.discussionId < 0) {
          // Post new discussion
          return ICA.post("/discussions/", {
            _id: discussion.discussionId,
            meta: {
              title: discussion.title ? discussion.title : {},
              intro: discussion.intro ? discussion.intro : {},
            },
            sources: discussion.mapSourcesList(function (source) {
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
            .then(touchDiscussionsWithAPIResponse)
            .then(function () {
              console.log("ICA: Discussion posted");
              return discussion;
            });
        }

        // Update discussion

        let notification = new ProgressNotification(notify);
        let numTasksTodo = 1, numTasksDone = 0;
        function updateNotification() {
          notification.progressPct = numTasksDone / numTasksTodo;
          notification.didUpdate();
        }
        if (notify) {
          notifications.addNotification(notification);
          notifications.didUpdate();
        }

        return ICA.put("/discussions/{0}/".format(discussion.discussionId), {
          meta: {
            title: discussion.title ? discussion.title : {},
            intro: discussion.intro ? discussion.intro : {},
          },
        })
        // Post new sources
          .then(function () {
            return Promise.all(discussion.mapSourcesList(function (source) {
              ++numTasksTodo;

              let promise;
              if (source.sourceId < 0) {
                switch (source.constructor) {
                  case ImageSource:
                    promise = ICA.post("/discussions/{0}/sources/".format(discussion.discussionId), {
                      _id: source.sourceId,
                      type: "image",
                      content: source.content
                    });
                    break;
                  case AudioSource:
                    promise = ICA.post("/discussions/{0}/sources/".format(discussion.discussionId), {
                      _id: source.sourceId,
                      type: "audio",
                      content: source.content
                    });
                    break;
                  case VideoSource:
                    promise = ICA.post("/discussions/{0}/sources/".format(discussion.discussionId), {
                      _id: source.sourceId,
                      type: "video",
                      content: source.content
                    });
                    break;
                  case TextSource:
                  default:
                    promise = ICA.post("/discussions/{0}/sources/".format(discussion.discussionId), {
                      _id: source.sourceId,
                      type: "text",
                      content: {"0": source.content}
                    });
                }
                return promise
                  .then(ICA.APIResponse.getData)
                  .then(function (dataSources) {
                    touchSources(dataSources, discussion);
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
                  promise = ICA.put("/discussions/{0}/sources/{1}/".format(
                    discussion.discussionId,
                    source.sourceId),
                    {
                      content: source.content
                    });
                  break;
                case TextSource:
                default:
                  promise = ICA.put("/discussions/{0}/sources/{1}/".format(
                    discussion.discussionId,
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
            return Promise.all(discussion.mapBackupSourcesList(function (source) {
              if (!(source.sourceId in discussion.sources)) {
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
          })
          .then(function () {
            console.log("ICA: Discussion revision posted");
            return discussion;
          });
      });
  };

  ICA.unpublishDiscussion = function (discussion, notify) {
    if (discussion.discussionId < 0) return Promise.reject(new Error("Discussion not yet published"));
    return ICA.delete("/discussions/{0}/".format(discussion.discussionId),
      undefined,
      notify
    )
      .then(function () {
        console.log("ICA: Discussion deleted");
      });
  };

  ICA.getResponsesInDiscussion = function (discussionId) {
    if (discussionId < 0) return Promise.reject(new Error("Discussion not yet published"));
    return ICA.get("/discussions/{0}/thread/".format(discussionId))
      .then(touchResponsesWithAPIResponse);
  };

  let authorPromises = {};

  ICA.getAuthor = function (authorId, forceReload = false) {
    if (Author.authors[authorId] && !forceReload) {
      return Promise.resolve(Author.authors[authorId]);
    }

    if (!authorPromises[authorId]) {
      authorPromises[authorId] =
        ICA.get("/authors/{0}/".format(authorId))
          .then(touchAuthorWithAPIResponse.bind(null, authorId));
    }

    return authorPromises[authorId];
  };

  ICA.getThemes = function () {
    return ICA.get("/themes/")
      .then(ICA.APIResponse.getData);
  };

  let fileStatsPromises = {};

  ICA.getFileStats = function (fileId, forceReload = false) {
    if (fileStatsPromises[fileId] && !forceReload) {
      return fileStatsPromises[fileId];
    }

    fileStatsPromises[fileId] =
      ICA.get("/files/" + fileId)
        .then(ICA.APIResponse.getData);

    return fileStatsPromises[fileId];
  };

  // Utility Functions

  function touchConversations(data) {
    let conversations = [];
    Object.entries(data).forEach(function (entry) {
      conversations.push(touchConversation(entry[0], entry[1]));
    });
    return conversations;
  }

  function touchConversation(conversationId, dataConversation) {
    let conversation;

    if (dataConversation._id) {
      // Newly published conversation

      conversation = JointSource.jointSources[dataConversation._id];
      conversation.conversationId = conversationId;

    } else {

      let meta = {
        title: dataConversation.meta.title ? dataConversation.meta.title["0"] : null,
        intro: dataConversation.meta.intro ? dataConversation.meta.intro["0"] : null,
        themes: dataConversation.meta.themes ? dataConversation.meta.themes["0"] : null,
        participants: dataConversation.meta.participants ? dataConversation.meta.participants["0"] : null,
        region: dataConversation.meta.region ? dataConversation.meta.region["0"] : null,
        others: dataConversation.meta.others ? dataConversation.meta.others["0"] : null
      };

      if (JointSource.jointSources[conversationId]) {
        // Updating existing conversation

        conversation = JointSource.jointSources[conversationId];

        if (conversation.locked) return conversation; // Cannot edit locked conversation

        conversation.meta = meta;

      } else {
        // New conversation

        conversation = new Conversation(meta, conversationId);

      }

    }

    touchSources(dataConversation.sources, conversation);

    conversation.didUpdate();

    return conversation;
  }

  function touchConversationsWithAPIResponse(apiResponse) {
    let conversations = touchConversations(apiResponse.data);
    conversations.requestNext = function () {
      return apiResponse.requestNext()
        .then(touchConversationsWithAPIResponse);
    };
    return conversations;
  }

  function touchConversationWithAPIResponse(conversationId, apiResponse) {
    return touchConversation(conversationId, apiResponse.data);
  }

  function touchSources(dataSources, jointSource) {
    let sources = [];
    Object.entries(dataSources).forEach(function (entry) {
      let [sourceId, dataSource] = entry;
      let source;
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
    });
    return sources;
  }

  function touchResponses(data) {
    let responses = [];
    Object.entries(data).forEach(function (entry) {
      responses.push(touchResponse(entry[0], entry[1]));
    });
    return responses;
  }

  function touchResponse(responseId, dataResponse) {
    let response;

    if (dataResponse._id) {
      // Newly published response

      response = JointSource.jointSources[dataResponse._id];
      response.jointSourceId = responseId;
      response.authorId = dataResponse._authorId;

    } else {

      if (JointSource.jointSources[responseId]) {
        // Update existing response

        response = JointSource.jointSources[responseId];

        if (response.locked) return response; // Cannot edit locked response

        response.message = dataResponse.message || {};
        response.authorId = dataResponse._authorId;

        // Reset existing references
        JointSource.removeAllJointSourceReferees(responseId);

      } else {
        // New response

        response = new Response(dataResponse.message || {}, responseId);
        response.authorId = dataResponse._authorId;

      }

      // Add references
      for (let jointSourceId of dataResponse.refereeJointSourceIds) {
        JointSource.addJointSourceReference(jointSourceId, responseId);
      }

    }

    // Update info
    [response._timestampAuthored, response._authorId] =
      [dataResponse._timestampAuthored, dataResponse._authorId];

    response.didUpdate();

    return response;
  }

  function touchResponsesWithAPIResponse(apiResponse) {
    let responses = touchResponses(apiResponse.data);
    responses.requestNext = function () {
      return apiResponse.requestNext()
        .then(touchResponsesWithAPIResponse);
    };
    return responses;
  }

  function touchResponseWithAPIResponse(responseId, apiResponse) {
    return touchResponse(responseId, apiResponse.data);
  }

  function touchDiscussions(data) {
    let discussions = [];
    Object.entries(data).forEach(function (entry) {
      discussions.push(touchDiscussion(entry[0], entry[1]));
    });
    return discussions;
  }

  function touchDiscussion(discussionId, dataDiscussion) {
    let discussion;

    if (dataDiscussion._id) {
      // Newly published discussion

      discussion = JointSource.jointSources[dataDiscussion._id];
      discussion.discussionId = discussionId;

    } else if (JointSource.jointSources[discussionId]) {
      // Update existing discussion

      discussion = JointSource.jointSources[discussionId];

      if (discussion.locked) return discussion; // Cannot edit locked discussion

      discussion.title = dataDiscussion.meta.title ? dataDiscussion.meta.title : {};
      discussion.intro = dataDiscussion.meta.intro ? dataDiscussion.meta.intro : {};

    } else {
      // New discussion

      discussion = new Discussion(
        dataDiscussion.meta.title ? dataDiscussion.meta.title : {},
        dataDiscussion.meta.title ? dataDiscussion.meta.intro : {},
        discussionId);

    }

    touchSources(dataDiscussion.sources, discussion);

    discussion.didUpdate();

    return discussion;
  }

  function touchDiscussionsWithAPIResponse(apiResponse) {
    let discussions = touchDiscussions(apiResponse.data);
    discussions.requestNext = function () {
      return apiResponse.requestNext()
        .then(touchDiscussionsWithAPIResponse);
    };
    return discussions;
  }

  function touchDiscussionWithAPIResponse(discussionId, apiResponse) {
    return touchDiscussion(discussionId, apiResponse.data);
  }

  function touchAuthor(authorId, dataAuthor) {
    let author;

    if (Author.authors[authorId]) {
      // Update existing author

      author = Author.authors[authorId];

    } else {
      // New author

      author = new Author(authorId);

    }

    author.name = dataAuthor.name;

    author.didUpdate();

    return author;
  }

  function touchAuthorWithAPIResponse(authorId, apiResponse) {
    return touchAuthor(authorId, apiResponse.data);
  }

  window.ICA = ICA;
} (window));
