"use strict";

$(function(){
  $("#ticket-form").zendeskTicketForm({
    handleSuccess: function (ticket) {
      alert("Ticket sumbitted! Your ticket ID is " + ticket.id);
    },
    handleFailure: function (res) {
      alert("Sorry, something went wrong.");
      console.log(res);
    },
    handleErrors: function (errors) {
      errors.forEach(function (err) {
        var el = this[err.name];
        el.css("border-color", "red");
        alert(err.message);
      }, this);
    }
  })
});
