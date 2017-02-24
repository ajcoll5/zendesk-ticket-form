module.exports = (function () {
  function initializeObject (form, api) {
    var _this, callbacks = {};
    form.name        = form.find("#name"),
    form.email       = form.find("#email"),
    form.reason      = form.find("#reason"),
    form.description = form.find("#description");

    function gatherValues () {
      return {
        name: form.name.val(),
        requester: form.email.val(),
        subject: form.reason.val(),
        description: form.description.val()
      }
    }

    _this = {
      init: function () {
        api.setCallbacks(callbacks);
        form.submit(function (e) {
          e.preventDefault(); e.stopPropagation();
          api.submit( gatherValues() );
        });
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
