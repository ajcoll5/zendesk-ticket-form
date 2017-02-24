module.exports = (function () {
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
