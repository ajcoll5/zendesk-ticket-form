var $ = require("jquery");
var checkArgs = require("./checkArgs");
var ticketErrors = require("./ticketErrors");
var ticketAPI = require("./ticketAPI");
var ticketForm = require("./ticketForm");

module.exports = function () {
  $.fn.extend({
    zendeskTicketForm: function (callbacks) {
      checkArgs(callbacks);
      var errorHandler = ticketErrors.new({
        blankName: this.find("#name").data("blank"),
        blankRequester: this.find("#email").data("blank"),
        invalidRequester: this.find("#email").data("invalid"),
        blankSubject: this.find("#reason").data("blank"),
        blankDescription: this.find("#details").data("blank")
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
}
