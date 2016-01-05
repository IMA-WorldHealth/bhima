angular.module('bhima.services')
.service('FormStateFactory', FormStateFactory);

// Manages state for a particular form.
function FormStateService() {
  var service = this;

  // boolean states
  service.created   = false;
  service.deleted   = false;
  service.errored   = false;
  service.updated   = false;
  service.pristine  = true;

  // service methods
  service.flush  = flush;
  service.reset  = reset;
  service.create = create;
  service.update = update;
  service.delete = del;
  service.error  = error;
  service.touch  = touch;

  /* ------------------------------------------------------------------------ */

  // utility - flush all states to false
  function flush() {
    var keys = [
      'created', 'deleted', 'errored', 'updated', 'pristine'
    ];

    keys.forEach(function (key) {
      service[key] = false;
    });
  }

  function create() {
    flush();
    service.created = true;
  }

  function del() {
    flush();
    service.deleted = true;
  }

  function update() {
    flush();
    service.updated = true;
  }

  function error() {
    flush();
    service.errored = true;
  }

  function reset() {
    flush();
    service.pristine = true;
  }

  function touch() {
    flush();
  }
}

function FormStateFactory() {
  return FormStateService;
}
