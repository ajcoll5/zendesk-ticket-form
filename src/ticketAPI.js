module.exports = (function () {
  function configureData (vals) {
    return Object.keys(vals).map(function (key) {
      return "z_" + encodeURIComponent(key) + "=" + encodeURIComponent(vals[key]);
    }).join("&");
  }

  function initializeObject (url, errorHandler) {
    var callbacks = {
      handleSuccess: function (ticket) {},
      handleErrors:  function (errors) {},
      handleFailure: function (res) {}
    };

    function handleResponse (json) {
      if (!!json.ticket) {
        callbacks.handleSuccess(json.ticket);
      } else if (!!json.errors) {
        callbacks.handleErrors(json.errors);
      } else {
        callbacks.handleFailure(res);
      }
    }

    function submitRequest (values) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function () {
        var json = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          handleResponse(json);
        } else {
          callbacks.handleFailure(json);
        }
      }
      xhr.send(JSON.stringify(values));
    }

    return {
      setCallbacks: function (cbs) {
        for (var fnName in cbs) {
          callbacks[fnName] = cbs[fnName];
        }
      },
      submit: function (values) {
        var validation = errorHandler.validate(values);
        if (!validation.valid) {
          callbacks.handleErrors(validation.errors)
        } else {
          submitRequest(values, callbacks);
        }
      }
    }
  }

  return {
    new: initializeObject
  }
})();
