var ticketAPI = (function () {
  function configureData (vals) {
    return Object.keys(vals).map(function (key) {
      return "z_" + encodeURIComponent(key) + "=" + encodeURIComponent(vals[key]);
    }).join("&");
  }

  function initializeObject (url, errorHandler) {
    var callbacks = {
      handleSuccess: function (ticket) {},
      handleErrors:  function (errors) {},
      handleFailure: function (xhr) {}
    };

    function handleResponse (xhr) {
      try {
        var json = window.JSON.parse(xhr.responseText);
        if (!!json.ticket) {
          callbacks.handleSuccess(json.ticket);
        } else if (!!json.errors) {
          callbacks.handleErrors(json.errors);
        } else {
          callbacks.handleFailure(xhr);
        }
      } catch (e) { // responseText is not JSON
        callbacks.handleFailure(xhr);
      }
    }

    function submitRequest (values) {
      var xhr = new window.XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            handleResponse(xhr);
          } else {
            callbacks.handleFailure(xhr);
          }
        }
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
