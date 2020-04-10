angular.module('bhima.components')
  .component('bhModalNotify', {
    templateUrl : 'js/components/bhModalNotify/bhModalNotify.html',
    controller  : ModalNotifyController,
    transclude  : true,
    bindings    : {
      value : '<?',
      type : '@?',
      error : '<?',
      ttl : '<?',
    },
  });

ModalNotifyController.$inject = ['$timeout', '$translate'];

function ModalNotifyController($timeout, $translate) {
  const $ctrl = this;
  const TTL = $ctrl.ttl || 3000;
  const ERR_TTL = 50000;

  const options = {
    success : {
      format  : 'notification-success',
    },
    danger : {
      format  : 'notification-danger',
    },
    info : {
      format  : 'notification-info',
    },
    warn : {
      format  : 'notification-warn',
    },
    error : {
      format  : 'notification-error',
    },
  };

  function handleError(error) {
    if (error.data && error.data.code) {
      setNotification(error.data.code, ERR_TTL);
    }
  }

  function setNotification(key, ttl) {
    const errorFormat = options.error.format;
    const otherFormat = options[$ctrl.status || 'info'].format;
    $ctrl.message = $translate.instant(key);
    $ctrl.style = $ctrl.error ? errorFormat : otherFormat;
    $ctrl.visible = true;

    $timeout(() => {
      $ctrl.visible = false;
    }, ttl);
  }

  $ctrl.close = () => {
    $ctrl.visible = false;
  };

  $ctrl.$onChanges = (changes) => {
    if (changes.value && changes.value.currentValue) {
      setNotification(changes.value.currentValue, TTL);
    }

    if (changes.error && changes.error.currentValue) {
      handleError(changes.error.currentValue);
    }
  };
}
