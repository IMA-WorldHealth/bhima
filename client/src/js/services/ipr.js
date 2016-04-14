/* jshint forin:false */
angular.module('bhima.services')
.service('ipr', [
  'validate',
  '$q',
  'connect',
  function (validate, $q, connect) {
    //Summary:
    // Ce service effectue les calculs de l'IPR pour le Payroll
    var dependencies = {};

    dependencies.taxe_ipr = {
      query : {
        tables : {
          'taxe_ipr' : {
            columns : ['id', 'taux', 'tranche_annuelle_debut', 'tranche_annuelle_fin', 'tranche_mensuelle_debut', 'tranche_mensuelle_fin', 'ecart_annuel', 'ecart_mensuel', 'impot_annuel', 'impot_mensuel', 'cumul_annuel', 'cumul_mensuel', 'currency_id']
          }
        }
      }
    };

    function setupModel(model) {
      return $q.when(model.taxe_ipr.data);
    }

    function generateEcartsImpots(tranches) {
      var ecart_an, ecart_mois, impot_an, impot_mois, ecarts = [], impots = [];
      for (var tranche in tranches) {
        tranches[tranche].tranche_mensuelle_debut = tranches[tranche].tranche_annuelle_debut / 12;
        tranches[tranche].tranche_mensuelle_fin = tranches[tranche].tranche_annuelle_fin / 12;
        ecart_an = tranches[tranche].tranche_annuelle_fin - tranches[tranche].tranche_annuelle_debut;
        ecart_mois = ecart_an / 12;
        impot_an = Math.round(ecart_an * (tranches[tranche].taux / 100));
        impot_mois = impot_an / 12;
        ecarts.push({'ecart_annuel':ecart_an,'ecart_mensuel':ecart_mois});
        impots.push({'impot_annuel':impot_an,'impot_mensuel':impot_mois});
      }
      return $q.when({tranches : tranches, ecarts : ecarts, impots : impots, currency_id : (tranches[0]) ? tranches[0].currency_id : null});
    }

    function generateCumuls(obj) {
      var cum_an, cum_mois, cumuls = [];
      cumuls.push({'cumul_annuel':0,'cumul_mensuel':0});
      for (var i=1;i<obj.impots.length;i++) {
        cum_an = obj.impots[i].impot_annuel + cumuls[i-1].cumul_annuel;
        cum_mois = cum_an / 12;
        cumuls.push({'cumul_annuel':cum_an,'cumul_mensuel':cum_mois});
      }
      return $q.when({tranches : obj.tranches, ecarts : obj.ecarts, impots : obj.impots, cumuls : cumuls});
    }

    function handleResult(obj) {
      var record;
      for(var i in obj.tranches) {
        obj.tranches[i].ecart_annuel = obj.ecarts[i].ecart_annuel;
        obj.tranches[i].ecart_mensuel = obj.ecarts[i].ecart_mensuel;
        obj.tranches[i].impot_annuel = obj.impots[i].impot_annuel;
        obj.tranches[i].impot_mensuel = obj.impots[i].impot_mensuel;
        obj.tranches[i].cumul_annuel = obj.cumuls[i].cumul_annuel;
        obj.tranches[i].cumul_mensuel = obj.cumuls[i].cumul_mensuel;

        //Update line
        record = connect.clean(obj.tranches[i]);
        connect.put('taxe_ipr', [record], ['id']);
      }
      return $q.when(obj.tranches);
    }

    function calculate () {
      var deff = $q.defer();
      validate.process(dependencies)
      .then(setupModel)
      .then(generateEcartsImpots)
      .then(generateCumuls)
      .then(handleResult)
      .then(function (result) {
        deff.resolve(result);
      });
      return deff.promise;
    }

    function fillFrom(model) {
      var deff = $q.defer();
      generateEcartsImpots(model)
      .then(generateCumuls)
      .then(handleResult)
      .then(function (result) {
        deff.resolve(result);
      });
      return deff.promise;
    }

    this.calculate = calculate;
    this.fillFrom = fillFrom;
  }
]);
