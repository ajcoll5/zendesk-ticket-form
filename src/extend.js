var checkArgs = require("./checkArgs");
var ticketErrors = require("./ticketErrors");
var ticketAPI = require("./ticketAPI");
var ticketForm = require("./ticketForm");

module.exports = function () {
  document.zendeskTicketForm = function (id, callbacks) {
    checkArgs(callbacks);
    var _this = document.getElementById(id);
    var getData = function (id, field) {
      return document.getElementById(id).dataset[field];
    }
    var errorHandler = ticketErrors.new({
      blankName: getData("name", "blank"),
      blankRequester: getData("email", "blank"),
      invalidRequester: getData("email", "invalid"),
      blankSubject: getData("reason", "blank"),
      blankDescription: getData("description", "blank")
    });
    var api = ticketAPI.new(_this.dataset.url, errorHandler);
    var form = ticketForm.new(_this, api);
    for (var fnName in callbacks) {
      form.setCallback(fnName, callbacks[fnName])
    }
    form.init();
    return _this;
  }
}
