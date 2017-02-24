// This is the script that becomes minified;
// the others are included for legibility and testing.

(function ($, window, document, undefined) {
  var ticketErrors = (function () {
    var validEmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var nameMap = {
      name: "name",
      requester: "email",
      subject: "reason",
      description: "description"
    }
    function isBlank (val) {
      return !val || !val.trim();
    }
    function isInvalidEmail (email) {
      return !email.match(validEmailRegex);
    }
    function getBlankValMessagesKey (name) {
      return "blank" + name[0].toUpperCase() + name.slice(1);
    }
    function createBlankValError (name, messages) {
      return {
        name: nameMap[name],
        message: messages[ getBlankValMessagesKey(name) ]
      }
    }
    function createInvalidRequesterError (name, messages) {
      return {
        name: nameMap[name],
        message: messages.invalidRequester
      }
    }
    function configureValidation (validation, values, messages) {
      var errorObj;
      for (var name in values) {
        if (isBlank(values[name])) {
          errorObj = createBlankValError(name, messages);
          validation.errors.push(errorObj);
        }
        else if (name === "requester" && isInvalidEmail(values[name])) {
          errorObj = createInvalidRequesterError(name, messages);
          validation.errors.push(errorObj);
        }
      }
    }

    function initializeObject (messages) {
      return {
        validate: function (values) {
          var validation = { valid: false, errors: [] };
          configureValidation(validation, values, messages);
          if (!validation.errors.length) { validation.valid = true; }
          return validation;
        }
      }
    }

    return {
      new: initializeObject
    }
  })();

  var ticketAPI = (function () {
    function configureData (vals) {
      return Object.keys(vals).map(function (key) {
        return "z_" + encodeURIComponent(key) + "=" + encodeURIComponent(vals[key]);
      }).join("&");
    }

    function initializeObject (url, errorHandler) {
      var callbacks = {
        handleSuccess: function (ticket) {},
        handleErrors:  function (errors) {},
        handleFailure: function (res) {}
      };

      function handleResponse (res) {
        var json = JSON.parse(res);
        if (!!json.ticket) {
          callbacks.handleSuccess(json.ticket);
        } else if (!!json.errors) {
          callbacks.handleErrors(json.errors);
        } else {
          callbacks.handleFailure(res);
        }
      }

      function submitRequest (values) {
        $.ajax({
          url: url,
          type: "POST",
          data: configureData(values),
          success: handleResponse,
          error: callbacks.handleFailure
        });
      }

      return {
        setCallbacks: function (cbs) {
          for (var fnName in cbs) {
            callbacks[fnName] = cbs[fnName];
          }
        },
        submit: function (values) {
          var validation = errorHandler.validate(values);
          if (!validation.valid) {
            callbacks.handleErrors(validation.errors)
          } else {
            submitRequest(values, callbacks);
          }
        }
      }
    }

    return {
      new: initializeObject
    }
  })();

  var ticketForm = (function () {
    function initializeObject (form, api) {
      var _this, callbacks = {};
      form.name        = form.find("#name"),
      form.email       = form.find("#email"),
      form.reason      = form.find("#reason"),
      form.description = form.find("#description");

      function gatherValues () {
        return {
          name: form.name.val(),
          requester: form.email.val(),
          subject: form.reason.val(),
          description: form.description.val()
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
        setCallback: function (name, fn) {
          callbacks[name] = fn.bind(form);
          return _this;
        }
      }

      return _this;
    }

    return {
      new: initializeObject
    }
  })();

  var checkArgs = function (callbacks) {
    if (!callbacks) {
      throw new Error("You must provide a 'callbacks' object arg to #zendeskTicketForm");
    }
    if (!callbacks.handleSuccess || typeof callbacks.handleSuccess !== "function") {
      throw new Error("You must provide a 'handleSuccess' function to the 'callbacks' arg");
    }
    if (!callbacks.handleFailure || typeof callbacks.handleFailure !== "function") {
      throw new Error("You must provide a 'handleFailure' function to the 'callbacks' arg");
    }
    if (!callbacks.handleErrors || typeof callbacks.handleErrors !== "function") {
      throw new Error("You must provide a 'handleErrors' function to the 'callbacks' arg");
    }
  }

  $.fn.extend({
    zendeskTicketForm: function (callbacks) {
      checkArgs(callbacks);
      var errorHandler = ticketErrors.new({
        blankName: this.find("#name").data("blank"),
        blankRequester: this.find("#email").data("blank"),
        invalidRequester: this.find("#email").data("invalid"),
        blankSubject: this.find("#reason").data("blank"),
        blankDescription: this.find("#description").data("blank")
      });
      var api = ticketAPI.new(this.data("url"), errorHandler);
      var form = ticketForm.new(this, api);
      for (var fnName in callbacks) {
        form.setCallback(fnName, callbacks[fnName])
      }
      form.init();
      return this;
    }
  });
})(jQuery, window, document);
