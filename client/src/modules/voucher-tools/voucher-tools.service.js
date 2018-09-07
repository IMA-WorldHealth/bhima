angular.module('bhima.services')
  .service('VoucherToolsService', VoucherToolsService);

VoucherToolsService.$inject = ['$http'];

function VoucherToolsService($http) {
  const service = this;

  service.correctTransaction = function correctTransaction(transactionUuid, voucherDetails) {
    const url = `/journal/${transactionUuid}/correct`;
    return $http.post(url, {voucherDetails})
      .then((result) => {
        console.log('client service got result', result);
        return result;
      });
  }
}
