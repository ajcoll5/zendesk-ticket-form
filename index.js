var protoMethod = require("./src/protoMethod");
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
