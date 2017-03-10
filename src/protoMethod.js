var checkArgs = require("./checkArgs");
var ticketErrors = require("./ticketErrors");
var ticketAPI = require("./ticketAPI");
var ticketForm = require("./ticketForm");

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
    var getData = makeGetData(form.querySelectorAll("*"));
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

module.exports = protoMethod;
