module.exports = function (callbacks) {
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
