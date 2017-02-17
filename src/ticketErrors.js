var ticketErrors = (function ($, window, document, undefined) {
  var validEmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
      name: name,
      message: messages[ getBlankValMessagesKey(name) ]
    }
  }
  function createInvalidRequesterError (messages) {
    return {
      name: "requester",
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
        errorObj = createInvalidRequesterError(messages);
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

  function checkArgs (messages) {
    if (!messages) {
      throw new Error("You must provide a 'messages' object argument to #new");
    }
    if (!messages.blankName) {
      throw new Error("You must provide a 'blankName' property to the 'messages' object");
    }
    if (!messages.blankRequester) {
      throw new Error("You must provide a 'blankRequester' property to the 'messages' object");
    }
    if (!messages.invalidRequester) {
      throw new Error("You must provide a 'invalidRequester' property to the 'messages' object");
    }
    if (!messages.blankSubject) {
      throw new Error("You must provide a 'blankSubject' property to the 'messages' object");
    }
    if (!messages.blankDescription) {
      throw new Error("You must provide a 'blankDescription' property to the 'messages' object");
    }
  }

  return {
    new: function (messages) {
      checkArgs(messages);
      return initializeObject(messages);
    }
  }
})(jQuery, window, document);
