angular.module('bhima.services')
  .service('VoucherToolsService', VoucherToolsService);

VoucherToolsService.$inject = ['$http'];

function VoucherToolsService($http) {
  const service = this;

  service.correctTransaction = function correctTransaction(transactionUuid, details) {
    const url = `/journal/${transactionUuid}/correct`;
    return $http.post(url, { transactionDetails : details.transactionDetails, correction : details.correction })
      .then((result) => {
        console.log('client service got result', result);
        return result;
      });
  };
}
