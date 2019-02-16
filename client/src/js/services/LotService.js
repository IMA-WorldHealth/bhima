angular.module('bhima.services')
  .service('LotService', LotService);

LotService.$inject = ['PrototypeApiService', '$http', 'util'];

function LotService(Api, $http, util) {
  const lots = new Api('/lots/');

  lots.read = (uuid) => {
    return Api.read.call(lots, uuid)
      .then(res => {
        res.expiration_date = new Date(res.expiration_date);
        return res;
      });
  };

  lots.assignments = (uuid, depotUuid) => {
    return $http.get(`/lots/${uuid}/assignments/${depotUuid}`)
      .then(util.unwrapHttpResponse);
  };

  return lots;
}
