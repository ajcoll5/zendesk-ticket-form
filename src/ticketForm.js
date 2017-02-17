var ticketForm = (function ($, window, document, undefined) {
  function initializeObject (selectors, api) {
    var _this;
    var form        = $(selectors.form),
        name        = form.find(selectors.name),
        requester   = form.find(selectors.requester),
        subject     = form.find(selectors.subject),
        description = form.find(selectors.description);
    var callbacks = {};

    function gatherValues () {
      return {
        name: name.val(),
        requester: requester.val(),
        subject: subject.val(),
        description: description.val()
      }
    }

    _this = {
      init: function () {
        api.setCallbacks(callbacks);
        form.submit(function (e) {
          e.preventDefault(); e.stopPropagation();
          api.submit( gatherValues() );
        });
      },
      elements: {
        form: form,
        name: name,
        requester: requester,
        subject: subject,
        description: description
      },
      setCallback: function (name, fn) {
        callbacks[name] = fn.bind(_this.elements);
        return _this;
      }
    }

    return _this;
  }

  function checkArgs (selectors, api) {
    if (!selectors || !api) {
      throw new Error("You must provide a 'selectors' object and an 'api' object to #new");
    }
    if (!selectors.form || !selectors.name || !selectors.requester || !selectors.subject || !selectors.description) {
      var properties = "'form', 'name', 'requester', 'subject', and 'description'";
      throw new Error("You must provide " + properties + " properties on the 'selectors' object");
    }
    if (!api.submit) {
      throw new Error("Your 'api' object does not have a #submit method");
    }
  }

  return {
    new: function (selectors, api) {
      checkArgs(selectors, api);
      return initializeObject(selectors, api);
    }
  }
})(jQuery, window, document);
