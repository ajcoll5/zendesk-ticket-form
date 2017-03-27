var protoMethod = require("./src/protoMethod");
try {
  var constructor = window.HTMLFormElement || window.document.createElement("FORM").constructor;
  constructor.prototype.zendeskTicketForm = protoMethod;
} catch (error) {
  console.error(
    "zendesk-ticket-form will not work in this environment!",
    "Cannot access HTMLFormElement prototype:",
    error
  );
}
