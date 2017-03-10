var ticketAPI = (function () {
  function configureData (vals) {
    return Object.keys(vals).map(function (key) {
      return "z_" + encodeURIComponent(key) + "=" + encodeURIComponent(vals[key]);
    }).join("&");
  }
  function orsc (success, failure) {
    if (this.readyState === 4) {
      if (this.status === 200) {
        var json = JSON.parse(this.responseText);
        success(json);
      } else {
        failure(this);
      }
    }
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
        callbacks.handleFailure(json);
      }
    }

    function submitRequest (values) {
      var xhr = new window.XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function (e) {
        orsc.call(xhr, handleResponse, callbacks.handleFailure);
      }
      xhr.onerror = function (e) {
        callbacks.handleFailure(xhr);
      }
      xhr.send(configureData(values));
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

module.exports = ticketAPI;
