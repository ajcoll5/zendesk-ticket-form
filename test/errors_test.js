var expect = require("chai").expect;
var ticketErrors = require("../src/ticketErrors");

describe("ticketErrors component", function () {
  var blankName = "name can't be blank",
      blankRequester = "email can't be blank",
      invalidRequester = "email must be valid",
      blankSubject = "must choose a reason",
      blankDescription = "description can't be blank";
  var messages = {
    blankName: blankName,
    blankRequester: blankRequester,
    invalidRequester: invalidRequester,
    blankSubject: blankSubject,
    blankDescription: blankDescription
  };

  describe("error handler returned by #new", function () {
    var errorHandler = ticketErrors.new(messages);
    var valid = {
      name: "Duncan Standish",
      requester: "duncanstandish@example.com",
      subject: "I never got my product",
      description: "I ordered it two months ago and it never came"
    };

    it("is an object with only a #validate method", function () {
      expect(typeof errorHandler).to.equal("object");
      expect(Object.keys(errorHandler).length).to.equal(1);
      expect(errorHandler.hasOwnProperty("validate")).to.equal(true);
    });

    describe("#validate", function () {
      it("rejects a blank name", function () {
        var values = newValuesObject(valid, "name", "");
        var validation = errorHandler.validate(values);
        expect(validation.valid).to.equal(false);
        expect(validation.errors.length).to.equal(1);
        expect(validation.errors[0].name).to.equal("name");
        expect(validation.errors[0].message).to.equal(blankName);
      });

      it("rejects a blank email", function () {
        var values = newValuesObject(valid, "requester", "");
        var validation = errorHandler.validate(values);
        expect(validation.valid).to.equal(false);
        expect(validation.errors.length).to.equal(1);
        expect(validation.errors[0].name).to.equal("email");
        expect(validation.errors[0].message).to.equal(blankRequester);
      });

      it("rejects an invalid email", function () {
        var values = newValuesObject(valid, "requester", "duncanstandish@example");
        var validation = errorHandler.validate(values);
        expect(validation.valid).to.equal(false);
        expect(validation.errors.length).to.equal(1);
        expect(validation.errors[0].name).to.equal("email");
        expect(validation.errors[0].message).to.equal(invalidRequester);
      });

      it("rejects a blank reason", function () {
        var values = newValuesObject(valid, "subject", null);
        var validation = errorHandler.validate(values);
        expect(validation.valid).to.equal(false);
        expect(validation.errors.length).to.equal(1);
        expect(validation.errors[0].name).to.equal("reason");
        expect(validation.errors[0].message).to.equal(blankSubject);
      });

      it("rejects a blank description", function () {
        var values = newValuesObject(valid, "description", "");
        var validation = errorHandler.validate(values);
        expect(validation.valid).to.equal(false);
        expect(validation.errors.length).to.equal(1);
        expect(validation.errors[0].name).to.equal("description");
        expect(validation.errors[0].message).to.equal(blankDescription);
      });

      it("accepts values when all are valid", function () {
        var validation = errorHandler.validate(valid);
        expect(validation.valid).to.equal(true);
        expect(validation.errors.length).to.equal(0);
      });
    });
  });
});

function newValuesObject (original, replacedProp, replacedPropVal) {
  var vals = {};
  for (var prop in original) {
    if (replacedProp === prop) {
      vals[prop] = replacedPropVal;
    } else {
      vals[prop] = original[prop];
    }
  }
  return vals;
}
