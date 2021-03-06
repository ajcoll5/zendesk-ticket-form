# Zendesk Ticket Form

### Summary

This a JavaScript module that allows for quicker development of a [Zendesk ticket](https://support.zendesk.com/hc/en-us/articles/203690856-Working-with-tickets) submission form.

The module relies on a specific form element configuration, and on some PHP server-side error handling and request sending, extended from [this script](https://github.com/apanzerj/Former-For-Zendesk/blob/Lesson-1-Branch/former.php).

**NOTE: if you have jQuery on your site, you can integrate this module into jQuery. Check [this branch](https://github.com/dunxtand/zendesk-ticket-form/tree/jquery) for details. There are a few minor usage differences; the jQuery plugin uses jQuery functions instead of native browser functionality.**

### Inclusion

This module has no JavaScript dependencies except a handful of basic DOM constructors and methods that are supported in all browsers. Just grab [the minified script](https://github.com/dunxtand/zendesk-ticket-form/blob/master/build/ztf.min.js) and include it on your site:

````html
<script src="/your/path/to/ztf.min.js"></script>
````

Or, if you're using **npm**, you can install it in your project:

````bash
npm install zendesk-ticket-form
````

...and just require it in your code:

````javascript
require("zendesk-ticket-form");
````

**NOTE: The code relies on a global *window* object, so installing server-side only works if your code is going to be bundled up and executed on the client.**

Include [zendesk.php](https://github.com/dunxtand/zendesk-ticket-form/blob/master/example/zendesk.php) and your customized [config.php](https://github.com/dunxtand/zendesk-ticket-form/blob/master/example/config.php) on a server, customize your [form](https://github.com/dunxtand/zendesk-ticket-form/blob/master/example/form.html), and write your [initialization](https://github.com/dunxtand/zendesk-ticket-form/blob/master/example/form.html).

### Examples

Check [the examples folder](https://github.com/dunxtand/zendesk-ticket-form/tree/master/example) for a a model form, initialization script, and required PHP files.

Check the [Hickies support page](https://www.hickies.com/blogs/support) for an example of this plugin being used on a live site.

## Configuration

### PHP

Copy over [zendesk.php](https://github.com/dunxtand/zendesk-ticket-form/blob/master/example/zendesk.php) and [config.php](https://github.com/dunxtand/zendesk-ticket-form/blob/master/example/config.php) *into the same folder* on your server. Edit the values in config.php with your own Zendesk **api key**, **user email**, and **api address**, and your own error messages:

````php
<?php
define("ZDAPIKEY", "<YOUR-API-KEY>");
define("ZDUSER", "<YOUR-USER-EMAIL>");
define("ZDURL", "https://<YOUR-SUBDOMAIN>.zendesk.com/api/v2");
define("BLANK_NAME", "name can't be blank");
define("BLANK_EMAIL", "email can't be blank");
define("INVALID_EMAIL", "email must be valid");
define("BLANK_REASON", "must choose a reason");
define("BLANK_DESCRIPTION", "description can't be blank");
?>
````

These error messages correspond to the inputs on the HTML form that you'll make.

### Submission Form

Create a form on your site that has four inputs within it, respectively given ids **#name**, **#email**, **#subject**, and **#description**. Give each of these elements the data attributes specified below.

##### Form

Give the form element a **data-url** attribute that points to the location of your **zendesk.php** script.

##### Name

Give the input corresponding to the customer's name an id of **name** and a **data-blank** attribute that contains an error message for when the field is left unfilled.

##### Email

Give the input corresponding to the customer's email an id of **email**, a **data-blank** attribute that contains an error message for when the field is left unfilled, and a **data-invalid** attribute that contains an error message for when the field's value is not a valid email.

##### Reason

Give the select element corresponding to the subject of the customer's ticket an id of **reason** and a **data-blank** attribute that contains an error message for when the field is left unfilled.

##### Description

Give the textarea element corresponding to the extra information about the customer's problem an id of **description** and a **data-blank** attribute that contains an error message for when the field is left unfilled.

#### The end result should look like [this](https://github.com/dunxtand/zendesk-ticket-form/blob/master/example/form.html):

````html
<form id="ticket-form" data-url="https://example.com/zendesk.php">
  <label for="name">Enter your name:</label>
  <input type="text" id="name" data-blank="name can't be blank">

  <label for="email">Enter your email address:</label>
  <input type="text" id="email" data-blank="email can't be blank" data-invalid="email must be valid">

  <label for="reason">Choose your reason for contacting us:</label>
  <select id="reason" data-blank="must choose a reason">
    <option selected disabled>Pick one.</option>
    <option>Option One</option>
    <option>Option Two</option>
    <option>Option Three</option>
  </select>

  <label for="description">Tell us anything else we need to know:</label>
  <textarea id="description" data-blank="details can't be blank"></textarea>
</form>
````

## Initialization

Now all you need to do is select your form and call the **zendeskTicketForm** method on it. The method takes as an argument an object that contains three functions: **handleSuccess**, **handleFailure**, and **handleErrors**.

````javascript
document.getElementById("ticket-form").zendeskTicketForm({
  handleSuccess: function (ticket) {
    alert("Ticket sumbitted! Your ticket ID is " + ticket.id);
  },
  handleFailure: function (xhr) {
    alert("Sorry, something went wrong.");
    console.log(xhr.responseText);
  },
  handleErrors: function (errors) {
    errors.forEach(function (err) {
      var el = this[err.name];
      el.style.borderColor = "red";
      alert(err.message);
    }, this);
  }
});
````

* **handleSuccess** is called when the PHP script successfully submits your ticket. The argument to this function will be an object with one property, the ID of the successfully submitted ticket.

* **handleFailure** is called when the request fails. The argument to this function is the XMLHttpRequest object used to connect to Zendesk.

* **handleErrors** is called when your ticketErrors object finds errors, or when your PHP script returns an object with key 'errors'. The argument to this function is an array filled with objects and looks like this:

```javascript
[{name: "name", message: "name can't be blank"}, {name: "email", message: "email must be valid"}]
```

Inside each of these functions, you can access the selected form element and all of its inputs throught the **this** keyword:

````javascript
this              // <form id="ticket-form">...</form>
this.name         // <input id="name">
this.email        // <input id="email">
this.reason       // <select id="reason">...</select>
this.description  // <textarea id="description">...</textarea>
````

Each of the 'name' properties on the objects in the 'errors' array correspondings to a property on **this**, so you can find the input that each error message belongs to:

````javascript
function (errors) {
  errors.forEach(function (err) {
    var el = this[err.name]; // use 'this' and 'err.name' to find the field with errors
    el.style.borderColor = "red";
    alert(err.message);
  }, this);
}
````

## Testing

This plugin includes some light tests to make sure that the error handling component returns the correct data, correctly configured. If you want to run the tests yourself, clone the repo, cd into the directory, npm install, and run npm test:

````bash
$ git clone git@github.com:dunxtand/zendesk-ticket-form.git
$ cd zendesk-ticket-form
$ npm install
$ npm test
````

## License

[MIT](https://opensource.org/licenses/MIT).

## Questions

Please reach out to me with anything; my email is listed on my [profile page](https://github.com/dunxtand).
