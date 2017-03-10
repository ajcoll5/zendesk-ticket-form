var ticketForm = (function () {
  function makeGetChild (nodes) {
    nodes = [].slice.call(nodes).filter(function (node) {
      return !!node.attributes && !!node.attributes.id;
    });
    return function (id) {
      var child;
      nodes.forEach(function (node) {
        if (node.attributes.id.textContent === id) {
          child = node;
        }
      });
      return child;
    }
  }
  function attachInputsToForm (form) {
    var getChild = makeGetChild(form.querySelectorAll("*"));
    ["name", "reason", "email", "description"]
    .forEach(function (prop) {
      form[prop] = getChild(prop);
    });
  }
  function getReasonVal (el) {
    if (el.constructor === window.HTMLSelectElement) {
      var selected = el.options[el.selectedIndex];
      return selected.disabled ? null : selected.value;
    } else {
      return el.value;
    }
  }

  function initializeObject (form, api) {
    var _this, callbacks = {};
    attachInputsToForm(form);

    function gatherValues () {
      return {
        name: form.name.value,
        requester: form.email.value,
        subject: getReasonVal(form.reason),
        description: form.description.value
      }
    }

    _this = {
      init: function () {
        api.setCallbacks(callbacks);
        form.onsubmit = function (e) {
          e.preventDefault(); e.stopPropagation();
          api.submit( gatherValues() );
        };
      },
      setCallback: function (name, fn) {
        callbacks[name] = fn.bind(form);
        return _this;
      }
    }

    return _this;
  }

  return {
    new: initializeObject
  }
})();

module.exports = ticketForm;
