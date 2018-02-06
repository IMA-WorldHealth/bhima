angular.module('bhima.services')
  .service('IprTaxConfigService', IprTaxConfigService);

IprTaxConfigService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class IprTaxConfigService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /iprTaxConfig/ URL.
 */
function IprTaxConfigService(Api, Modal) {
  var service = new Api('/iprTaxConfig/');
  service.configData = configData;

  function configData(params, scales) {
    var iprConfig = {};
    var cumul = 0;

    iprConfig.taxe_ipr_id = params.taxe_ipr_id;
    iprConfig.rate = params.rate;
    iprConfig.tranche_annuelle_debut = params.tranche_annuelle_debut;
    iprConfig.tranche_annuelle_fin = params.tranche_annuelle_fin;

    iprConfig.tranche_mensuelle_debut = params.tranche_annuelle_debut / 12;
    iprConfig.tranche_mensuelle_fin = params.tranche_annuelle_fin / 12;

    iprConfig.ecart_annuel = params.tranche_annuelle_fin - params.tranche_annuelle_debut; 
    iprConfig.ecart_mensuel = iprConfig.tranche_mensuelle_fin - iprConfig.tranche_mensuelle_debut;

    iprConfig.impot_annuel = iprConfig.ecart_annuel * (params.rate / 100);
    iprConfig.impot_mensuel = iprConfig.impot_annuel / 12;

    scales.forEach(function (scale) {
      if (scale.tranche_annuelle_fin === iprConfig.tranche_annuelle_debut) {
        cumul = iprConfig.impot_annuel + scale.cumul_annuel;
      }
    });

    iprConfig.cumul_annuel = cumul;
    iprConfig.cumul_mensuel = iprConfig.cumul_annuel / 12;
    return iprConfig;
  }

  return service;
}
