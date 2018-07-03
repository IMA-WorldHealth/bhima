/**
 * @todo complex page should require loading resolve before displaying, a lot of
 *       data is fetched per page load
 */
angular.module('bhima.controllers')
  .controller('DebtorGroupUpdateController', DebtorGroupsUpdateController);

DebtorGroupsUpdateController.$inject = [
  '$state', 'DebtorGroupService', 'AccountService', 'PriceListService',
  'ScrollService', 'util', 'NotifyService', 'ModalService',
];

function DebtorGroupsUpdateController(
  $state, DebtorGroups, Accounts, Prices,
  ScrollTo, util, Notify, Modal
) {
  const vm = this;
  const target = $state.params.uuid;

  vm.submit = submit;
  vm.state = $state;
  vm.invoicingFeeSubscriptions = invoicingFeeSubscriptions;
  vm.subsidySubscriptions = subsidySubscriptions;

  vm.$loading = true;
  vm.$loaded = false;
  vm.cancel = cancel;
  vm.deleteGroup = deleteGroup;

  vm.colors = DebtorGroups.colors;


  Prices.read()
    .then((priceLists) => {
      vm.priceLists = priceLists;
      return Accounts.read();
    })
    .then((accounts) => {
      vm.accounts = accounts;
      return DebtorGroups.read(target);
    })
    .then((result) => {
      vm.group = result;
      vm.$loaded = true;
      $state.params.label = vm.group.name;

      /** @todo work around for checkboxes (use value='' instead) */
      vm.group.apply_invoicing_fees = Boolean(vm.group.apply_invoicing_fees);
      vm.group.apply_subsidies = Boolean(vm.group.apply_subsidies);
      vm.group.apply_discounts = Boolean(vm.group.apply_discounts);
    })
    .catch(Notify.handleError)
    .finally(() => {
      vm.$loading = false;
    });

  function submit(debtorGroupForm) {
    debtorGroupForm.$setSubmitted();

    // ensure we don't make HTTP requests if the form is invalid - exit early
    if (debtorGroupForm.$invalid) {
      Notify.danger('FORM.ERRORS.RECORD_ERROR');
      return;
    }

    // catch 'nothing has changed' and redirect to list page
    if (debtorGroupForm.$pristine) {
      Notify.warn('FORM.ERRORS.NO_CHANGE');
      $state.go('debtorGroups.list', null, { reload : true });
      return;
    }

    const submitDebtorGroup = util.filterFormElements(debtorGroupForm, true);

    DebtorGroups.update(target, submitDebtorGroup)
      .then(() => {
        Notify.success('DEBTOR_GROUP.UPDATED');
        $state.go('debtorGroups.list', null, { reload : true });
      })
      .catch(Notify.handleError);
  }

  function cancel() {
    $state.go('debtorGroups.list');
  }

  function invoicingFeeSubscriptions() {
    const modal = DebtorGroups.manageInvoicingFees(vm.group);
    modal.result
      .then((results) => {
        // update UI
        vm.group.invoicingFees = results;
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
      });
  }

  function subsidySubscriptions() {
    const modal = DebtorGroups.manageSubsidies(vm.group);
    modal.result
      .then((results) => {
        // update UI
        vm.group.subsidies = results;
        Notify.success('FORM.INFO.UPDATE_SUCCESS');
      });
  }

  /**
   * @function deleteGroup
   * @description delete a creditor group
   */
  function deleteGroup(groupUuid) {
    Modal.confirm()
      .then((confirmResponse) => {
        if (!confirmResponse) {
          return false;
        }

        // user has confirmed removal of debtor group
        return DebtorGroups.remove(groupUuid)
          .then(() => {
            Notify.success('FORM.INFO.DELETE_SUCCESS');
            $state.go('debtorGroups.list', null, { reload : true });
          })
          .catch(Notify.handleError);
      });
  }
}
