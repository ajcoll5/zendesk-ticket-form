# jQuery Zendesk Ticket Form

### Summary

These are three JavaScript components, built on top of [jQuery](http://jquery.com/), that enable quicker development of a [Zendesk ticket](https://support.zendesk.com/hc/en-us/articles/203690856-Working-with-tickets) submission form. The components are:

* **ticketErrors** (error handling of form inputs)
* **ticketAPI** (packaging and sending of form inputs)
* **ticketForm** (gathering form inputs and managing form state)

The components also rely on some PHP server-side error handling and request sending, extended from [this script](https://github.com/apanzerj/Former-For-Zendesk/blob/Lesson-1-Branch/former.php).

### Requirements

Using these components requires that you have jQuery enabled on the site in which the form resides, and that you have a specific PHP file on an available server. You also must have a valid Zendesk account and an API key to interface with that account.

### Examples

Check [the examples folder](https://github.com/dunxtand/jquery-zendesk-ticket-form/tree/master/example) for a a sample form, initialization script, and PHP file.

##

### ticketErrors

This object has only one method, **#new**.

Call this method, passing as an argument object with these keys:

* **blankName** (message to be returned when 'name' input is blank)
* **blankRequester** (message to be returned when 'requester' input is blank)
* **invalidRequester** (message to be returned when 'requester' input is not a valid email)
* **blankSubject** (message to be returned when 'subject' input is blank)
* **blankDescription** (message to be returned when 'description' input is blank)

```javascript
var messages = {
  blankName: "name can't be blank",
  blankRequester: "email can't be blank",
  invalidRequester: "email must be valid",
  blankSubject: "must choose a reason",
  blankDescription: "details can't be blank"
}

var errorHandler = ticketErrors.new(messages);
```

...to create an object with a **#validate** method, which will be used internally by the ticketAPI object.

##

### ticketAPI

This object has only one method, **#new**.

Call this method, passing in as arguments the url pointing to your PHP script and the previously defined ticketErrors object:

```javascript
var url = "https://example.com/zendesk.php";
var api = ticketAPI.new(url, errorHandler);
```

..to create an object with **#submit** and **#setCallbacks** methods, which will be used internally by the ticketForm object.

##

### ticketForm

This object has only one method, **#new**.

Call this method, passing in as arguments an object with keys:

* **form** (selector to find your form element)
* **name** (selector to find the 'name' input within the form)
* **requester** (selector to find the 'requester' input within the form)
* **subject** (selector to find the 'subject' input within the form)
* **description** (selector to find the 'description' input within the form)

...and the previously defined ticketAPI object:

```javascript
var selectors = {
  form: "#ticket-form",
  name: "#name",
  requester: "#email",
  subject: "#reason",
  description: "#details"
}

var form = ticketForm.new(selectors, api);
```

...to create an object with properties:

* **#elements** (object that stores references to the selected form and its elements)
* **#setCallback** (method that sets callbacks to be used during the life of the request submission)
* **#init** (method that starts up the functionality of the components)

#### #elements

This object has properties **form**, **name**, **requester**, **subject**, and **description** (all of which contain jQuery objects that correspond to the elements you've selected), which you can use to inspect which elements you've selected, and which is also available in callback functions via the **this** keyword. In the case of the example form in this repo, it would look like this:

```javascript
{
  form: [form#ticket-form],
  name: [input#name],
  requester: [input#requester],
  subject: [select#reason],
  description: [textarea#details]
}
```

#### #setCallback

This method takes two arguments. The first is a string with the name of the callback function, the second is the function to be executed. The form can be manipulated in these functions via the **this** keyword, which will be the 'elements' object described above.

You must define three callbacks: **handleSuccess**, **handleFailure**, and **handleErrors**:

* **handleSuccess** is called when the PHP script successfully submits your ticket. The argument to this function will be an object with one property, the ID of the successfully submitted ticket.

```javascript
form.setCallback("handleSuccess", function (ticket) {
   alert("Ticket sumbitted! Your ticket ID is " + ticket.id);
});
```

* **handleFailure** is called when the request fails. The argument to this function is the response body.

```javascript
form.setCallback("handleFailure", function (res) {
  alert("Sorry, something went wrong.");
  console.log(res);
});
```

* **handleErrors** is called when your ticketErrors object finds errors, or when your PHP script returns an object with key 'errors'. The argument to this function is an array filled with objects and looks like this:

```javascript
[
  {
    name: "name",
    message: "name can't be blank"
  },
  {
    name: "requester",
    message: "email must be valid"
  }
]
```

The 'name' property corresponds a key on the 'elements' object, so you can access the appropriate form input if you want to restyle it or attach the error message to it.

```javascript
form.setCallback("handleErrors", function (errors) {
  var el, elements = this;
  errors.forEach(function (err) {
    el = elements[err.name];
    el.css("border-color", "red");
    alert(err.message);
  });
});
```

#### #init

This method should be called after all three callbacks have been defined. It gives the callbacks to its ticketAPI object and sets a submission event listener on the selected form.

```javascript
form.init();
```

##

### Notes

##### Input Naming

The 'name', 'requester', 'subject', and 'description' nomenclature correspondings the fields that Zendesk accepts in its ticket API. You can name them whatever you want within your form.

##### Requester == Email

These components assume that the 'requester' input will be an email; the error handler checks to see if it is a valid one.

##### PHP

The PHP script may seem like an unnecessary extra step (as opposed to simply submitting to the Zendesk API directly from the JavaScript), but it adds security and provides a second line of defense against errors.
