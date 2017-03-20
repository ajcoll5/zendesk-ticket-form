(function (window, document, undefined) {
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
        handleFailure: function (xhr) {}
      };

      function handleResponse (xhr) {
        try {
          var json = window.JSON.parse(xhr.responseText);
          if (!!json.ticket) {
            callbacks.handleSuccess(json.ticket);
          } else if (!!json.errors) {
            callbacks.handleErrors(json.errors);
          } else {
            callbacks.handleFailure(json);
          }
        } catch (e) { // responseText is not JSON
          callbacks.handleFailure(xhr);
        }
      }

      function submitRequest (values) {
        var xhr = new window.XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function (e) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              handleResponse(xhr);
            } else {
              callbacks.handleFailure(xhr);
            }
          }
        }
        xhr.onerror = function (e) {
          callbacks.handleFailure(xhr);
        }
        xhr.send(configureData(values));
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
    function makeGetChild (nodes) {
      nodes = [].slice.call(nodes).filter(function (node) {
        return !!node.attributes && !!node.attributes.id;
      });
      return function (id) {
        var child;
        nodes.forEach(function (node) {
          if (node.attributes.id.textContent === id) {
            child = node;
          }
        });
        return child;
      }
    }
    function attachInputsToForm (form) {
      var getChild = makeGetChild(form.getElementsByTagName("*"));
      ["name", "reason", "email", "description"]
      .forEach(function (prop) {
        form[prop] = getChild(prop);
      });
    }
    function getReasonVal (el) {
      if (el.constructor === window.HTMLSelectElement) {
        var selected = el.options[el.selectedIndex];
        return selected.disabled ? null : selected.value;
      } else {
        return el.value;
      }
    }

    function initializeObject (form, api) {
      var _this, callbacks = {};
      attachInputsToForm(form);

      function gatherValues () {
        return {
          name: form.name.value,
          requester: form.email.value,
          subject: getReasonVal(form.reason),
          description: form.description.value
        }
      }

      _this = {
        init: function () {
          api.setCallbacks(callbacks);
          form.onsubmit = function (e) {
            e.preventDefault(); e.stopPropagation();
            api.submit( gatherValues() );
          };
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

  var protoMethod = (function () {
    function makeGetData (nodes) {
      nodes = [].slice.call(nodes).filter(function (node) {
        return !!node.attributes && !!node.attributes.id;
      });
      return function (id, field) {
        var errMessage;
        nodes.forEach(function (node) {
          if (node.attributes.id.textContent === id) {
            errMessage = node.dataset[field];
          }
        });
        return errMessage;
      }
    }
    function errMessagesFrom (form) {
      var getData = makeGetData(form.getElementsByTagName("*"));
      return {
        blankName:        getData("name", "blank"),
        blankRequester:   getData("email", "blank"),
        invalidRequester: getData("email", "invalid"),
        blankSubject:     getData("reason", "blank"),
        blankDescription: getData("description", "blank")
      }
    }

    return function (callbacks) {
      checkArgs(callbacks);
      var errorHandler = ticketErrors.new(errMessagesFrom(this));
      var api = ticketAPI.new(this.dataset.url, errorHandler);
      ticketForm.new(this, api)
      .setCallback("handleSuccess", callbacks.handleSuccess)
      .setCallback("handleFailure", callbacks.handleFailure)
      .setCallback("handleErrors",  callbacks.handleErrors)
      .init();
      return this;
    }
  })();

  try {
    var constructor = window.HTMLFormElement || window.document.createElement("FORM").constructor;
    constructor.prototype.zendeskTicketForm = protoMethod;
  } catch (error) {
    window.console.error(
      "zendesk-ticket-form will not work in this browser!",
      "Cannot access HTMLFormElement prototype:",
      error
    );
  }
})(window, document);
