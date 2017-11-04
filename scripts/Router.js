
/**
 * Router
 */
let Router = (function () {
  let page = new Date().getTime();

  window.addEventListener("popstate", function (event) {
    if (event.state) {
      if (event.state.page !== page) {
        // From a different page
        window.location.reload();
      } else if (event.state.index + 1 > back.length) {
        // Go forward
        while (back.length < event.state.index + 1 && forward.length > 0) goForward();
      } else {
        // Go back
        while (back.length > event.state.index + 1 && back.length > 1) goBack();
      }
    } else {
      // Back to landing
      while (back.length > 1) goBack();
    }
  });

  let back = [], forward = [];

  function goBack() {
    if (back.length > 1) {
      let _ = back.pop();
      forward.push(_);
      _.controller.hideView();
    }

    back[back.length - 1].controller.unhideView();
  }

  function goForward() {
    back[back.length - 1].controller.hideView();

    if (forward.length > 0) {
      let _ = forward.pop();
      back.push(_);
      _.controller.unhideView();
    }
  }

  function push(controller, url, title, ignoreHistoricalScrollY) {
    // Clear forward entries
    while (forward.length > 0) {
      let _ = forward.pop();
      _.controller.destroy(true);
    }

    // Insert into history
    back.push({
      controller: controller,
      url: url,
      title: title
    });

    if (back.length > 1) {
      window.history.pushState({
        index: Router.index,
        page: page
      }, title, url);

      // Record the y-coord
      back[back.length - 2].scrollY = window.scrollY;

      back[back.length - 2].controller.hideView();
    } else {
      window.history.replaceState({
        index: Router.index,
        page: page
      }, title, url);
    }

    back[back.length - 1].controller.unhideView();

    if (ignoreHistoricalScrollY) {
      // Scroll to the top of the page
      window.scroll(0, 0);
    } else {
      // Scroll to the y-coord if previously page previously visited

      let index = back.length - 2, flag = false;

      while (index >= 0) {
        if (back[index].controller === controller) {
          window.scroll(0, back[index].scrollY);
          flag = true;
          break;
        }
        --index;
      }

      if (!flag) {
        window.scroll(0, 0);
      }
    }

    ga("send", "pageview", location.pathname);
  }

  function replace(url, title) {
    let _ = back[back.length - 1];

    if (url) _.url = url;
    if (title) _.title = title;

    window.history.replaceState({
      index: Router.index,
      page: page
    }, _.title, _.url);

    ga("send", "pageview", location.pathname);
  }

  function jump(index) {
    if (index < 0) return; // Index out of bound

    let cmp = index + 1 - back.length;
    if (cmp < 0) {
      window.history.go(cmp);
      while (back.length > index + 1) goBack();

      ga("send", "pageview", location.pathname);
    } else if (cmp > 0) {
      throw new Error("Jumping forward not supported yet");
    }
  }

  let Router = {
    push: push,
    replace: replace,
    jump: jump
  };

  Object.defineProperty(Router, "index", {
    get: function () {
      return back.length - 1;
    }
  });

  return Router;
}());

// Google Analytics

// eslint-disable-next-line
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga("create", "UA-84484405-2", "auto");
