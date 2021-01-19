angular.module('bhima.services')
  .service('LotService', LotService);

LotService.$inject = ['PrototypeApiService', '$http', 'util'];

function LotService(Api, $http, util) {
  const lots = new Api('/lots/');
  const dupes = new Api('/lots/dupes');

  lots.read = (uuid) => {
    return Api.read.call(lots, uuid)
      .then(res => {
        res.expiration_date = new Date(res.expiration_date);
        return res;
      });
  };

  lots.dupes = (params) => {
    console.log("DUPES: ", params);
    return Api.dupes.call(params)
      .then(res => {
        res.entry_date = new Date(res.entry_date);
        res.expiration_date = new Date(res.expiration_date);
        return res;
      });
  };

  lots.assignments = (uuid, depotUuid) => {
    return $http.get(`/lots/${uuid}/assignments/${depotUuid}`)
      .then(util.unwrapHttpResponse);
  };

  /**
  * @function computeLotWarningFlags()
  *  @description
  *   Takes in a Lot and attaches warning flags to the Lot.
  *
  *   The logic goes like this, in this order.
  *   NOTE: Once a case is found to be true, all following cases are ignored.
  *     1. If the stock is exhausted, warn about that.
  *        (Recall that the user can choose to display exhausted lots in Lots Registry.)
  *     2. If the Lot is expired, warn about that.
  *     3. If the Lot is near expiration, warn about that.
  *        NOTE that this assumes the CMM and that stock exits all come from this
  *        lot exclusively.  But the CMM is based on not only on this lot, but on
  *        an aggregate all lots of this inventory item, so there is no guarantee
  *        that this will be correct.
  *     4. If a Lot is at risk of running out, warn about that. Again this is
  *        based on the aggregate CMM which may not work out exactly for this
  *        Lot in practice.
  *
  * Based on this logic, only one of the warning flags should be set to true.
  */
  lots.computeLotWarningFlags = (lot) => {
    lots.exhausted = false;
    lots.expired = false;
    lots.near_expiration = false;
    lots.at_risk = false;
    if (lot.quantity <= 0) {
      lot.exhausted = true;
    } else if (lot.lifetime < 0) {
      // Equivalent to: lot.quantity > 0 && lot.lifetime < 0
      lot.expired = true;
    } else if (lot.IS_IN_RISK_EXPIRATION) {
      // Equivalent to: lot.quantity > 0 && lot.lifetime >= 0 && lot.IS_IN_RISK_EXPIRATION
      lot.near_expiration = true;
    } else if (lot.S_RISK <= 0) {
      // Equivalent to: lot.quantity > 0 && lot.lifetime >= 0 && lot.S_RISK <= 0
      lot.at_risk = true;
    }

  };

  return lots;
}
