"use strict";

$(function(){
  var errorHandler = ticketErrors.new({
    blankName: "name can't be blank",
    blankRequester: "email can't be blank",
    invalidRequester: "email must be valid",
    blankSubject: "must choose a reason",
    blankDescription: "details can't be blank"
  });
  var url = "https://example.com/zendesk.php";
  var api = ticketAPI.new(url, errorHandler);
  // in the below callback functions, 'this' contains the selected elements;
  // this.form, this.name, this.requester, this.subject, and this.description
  // will all correspond to their selected jQuery objects
  ticketForm.new({
    form: "#ticket-form",
    name: "#name",
    requester: "#email",
    subject: "#reason",
    description: "#details"
  }, api)
  .setCallback("handleSuccess", function (ticket) {
    alert("Ticket sumbitted! Your ticket ID is " + ticket.id);
  })
  .setCallback("handleFailure", function (res) {
    alert("Sorry, something went wrong.");
    console.log(res);
  })
  .setCallback("handleErrors", function (errors) {
    var el, elements = this;
    errors.forEach(function (err) {
      el = elements[err.name];
      el.css("border-color", "red");
      alert(err.message);
    });
  })
  .init(); // attach event listener
});
