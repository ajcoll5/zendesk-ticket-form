"use strict";

$(function(){
  // configure components
  var errorHandler = ticketErrors.new({
    blankName: "name can't be blank",
    blankRequester: "email can't be blank",
    invalidRequester: "email must be valid",
    blankSubject: "must choose a reason",
    blankDescription: "details can't be blank"
  });
  var address = "//example.com/zendesk.php";
  var api = ticketAPI.new(address, errorHandler);
  ticketForm.new({
    form: "#support-ticket",
    name: "#name",
    requester: "#email",
    subject: "#reason",
    description: "#details"
  }, api)
  // in the below functions, 'this' contains the above selected elements;
  // this.form, this.name, this.requester, this.subject, and this.description
  // will all correspond to their selected jQuery objects
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
