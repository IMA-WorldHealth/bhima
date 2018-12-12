angular.module('bhima.services')
  .service('LotService', LotService);

LotService.$inject = ['PrototypeApiService'];

function LotService(Api) {
  const lots = new Api('/lots/');

  lots.read = (uuid) => {
    return Api.read.call(lots, uuid)
      .then(res => {
        res.expiration_date = new Date(res.expiration_date);
        return res;
      });
  };
  return lots;
}
