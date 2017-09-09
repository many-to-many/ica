
let Inline = Quill.import("blots/inline");

class LinkBlot extends Inline {

  static create(link) {
    let node = super.create();

    node.setAttribute("link-value", link);

    let {category, jointSourceId, token} = LinkBlot.describeLink(link);

    if (jointSourceId) {

      let promise;

      switch (category) {
        case "jointsources":
          promise = ICA.getJointSource(jointSourceId);
          break;
        case "conversations":
          promise = ICA.getConversation(jointSourceId);
          break;
        case "discussions":
          promise = ICA.getDiscussion(jointSourceId);
          break;
        default:
          return node;
      }

      promise
        .then(function (jointSource) {
          switch (jointSource.constructor) {
            case Conversation:
              if (token.type === "ticket") token.category = "conversations";
              node.setAttribute("title", jointSource.meta.title);
              break;
            case Discussion:
              if (token.type === "ticket") token.category = "discussions";
              node.setAttribute("title", jointSource.title["0"]);
              break;
            default: return;
          }

          setElementProperty(node, "token", "");
          node.setAttribute("href", token.toHref());
          node.setAttribute("target", "_self");
        })
        .catch(function () {
          // Do not emit error when joint source not found
        });

    } else {
      node.setAttribute("href", token.toHref());
      node.setAttribute("target", "_blank");
    }

    return node;
  }

  static formats(domNode) {
    return domNode.getAttribute("link-value");
  }

  static describeLink(link) {
    let category, jointSourceId;

    if (typeof link === "string") {
      link = linkify.tokenize(link)[0];
    }

    if (link.type === "url") {
      let matches = link.toHref().match(/(conversations|discussions)\/(\d+)/);
      if (matches) {
        category = matches[1];
        jointSourceId = matches[2];
      }
    } else if (link.type === "ticket") {
      category = link.category;
      jointSourceId = link.ticketId;
    }

    return {
      category: category,
      jointSourceId: jointSourceId,
      token: link
    };
  }
}

LinkBlot.blotName = "link";
LinkBlot.tagName = "a";

Quill.register(LinkBlot);

// Linkify module for Quill

Quill.register("modules/linkify", function (quill, options) {
  let module = this;

  module.links = [];

  function linkifyText(text) {
    let ops = [], op;
    let tokens = linkify.tokenize(text);
    let links = [];

    for (let token of tokens) {

      if (token.isLink) {

        if (op) ops.push(op);

        links.push(token);

        op = {
          retain: token.toString().length,
          attributes: {
            link: token,
          }
        };

        ops.push(op);
        op = undefined;

        continue;
      }

      if (!op) op = {
        retain: 0,
        attributes: {
          link: false
        }
      };

      op.retain += token.toString().length;

    }

    if (op) ops.push(op);
    module.links = links;

    return ops;
  }

  quill.on("text-change", function () {
    let timeout;

    return function (delta, oldDelta, source) {
      if (timeout) clearTimeout(timeout);

      if (source === "user") {
        timeout = setTimeout(function () {

          let linkifyOps = linkifyText(quill.getText());
          quill.updateContents({ops: linkifyOps}, "silent");

          if (options.onchange) options.onchange(module.links, source);

        }.bind(this), 30);
      } else if (source === "api") {

        let linkifyOps = linkifyText(quill.getText());
        quill.updateContents({ops: linkifyOps}, "silent");

        if (options.onchange) options.onchange(module.links, source);

      }
    };
  }());
});

// Enable linkify by default
Quill.DEFAULTS.modules["linkify"] = true;

// Ticket MultiToken module for linkify

(function (linkify) {
  let plugin = function () {

    function ticket(linkify) {
      let TT = linkify.scanner.TOKENS;
      let MultiToken = linkify.parser.TOKENS.Base;
      let S_START = linkify.parser.start;

      // Token

      function TICKET(value) {
        this.v = value;

        if (value.length === 2) {
          this.category = "jointsources";
          this.ticketId = value[1].toString();
        } else if (value.length === 4) {
          this.category = value[1].toString();
          this.ticketId = value[3].toString();
        }
      }

      linkify.inherits(MultiToken, TICKET, {
        type: "ticket",
        isLink: true,
        toHref: function () {
          return "/" + this.category + "/" + this.ticketId;
        }
      });

      let S_TICKET = new linkify.parser.State(TICKET);

      // Parser

      let S_HASH = S_START.jump(TT.POUND);
      let S_HASH_SYM = new linkify.parser.State();
      let S_HASH_SYM_SLASH = new linkify.parser.State();

      S_HASH
        .on([TT.DOMAIN, TT.TLD, TT.LOCALHOST], S_HASH_SYM)
        .on(TT.NUM, S_TICKET);

      S_HASH_SYM
        .on(TT.SLASH, S_HASH_SYM_SLASH);

      S_HASH_SYM_SLASH
        .on(TT.NUM, S_TICKET);

    }

    return ticket;
  }();

  plugin(linkify);
}(linkify));

// Helper function to limit pulsing function calls

function limitPulses(func, interval) {
  let timeout;

  return function () {
    let _arguments = arguments;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(function () {

      func.apply(null, _arguments);

    }, interval);
  };
}
