angular.module('bhima.controllers')
.controller('SnisUpdateController', SnisUpdateController);

SnisUpdateController.$inject = [
  '$scope', '$http', '$q', '$translate', '$routeParams', '$location',
  'util', 'validate', 'messenger', 'appstate'
];

function SnisUpdateController($scope, $http, $q, $translate, $routeParams, $location, util, validate, messenger, appstate) {
  var session = $scope.session = { step : 1 },
      identif = $scope.identif = {},
      dependencies = {};

  session.reportId = $routeParams.id;

  dependencies.zs = {
    identifier : 'id',
    query : {
      tables : {
        'mod_snis_zs' : { columns : ['id', 'zone', 'territoire', 'province'] },
        'project'     : { columns : ['name'] },
        'enterprise'  : { columns : ['location_id'] },
        'village'     : { columns : ['name::villageName'] },
        'sector'      : { columns : ['name::sectorName'] },
        'province'    : { columns : ['name::provinceName'] }
      },
      join : [
        'project.enterprise_id=enterprise.id',
        'project.zs_id=mod_snis_zs.id',
        'enterprise.location_id=village.uuid',
        'village.sector_uuid=sector.uuid',
        'sector.province_uuid=province.uuid'
      ]
    }
  };

  dependencies.report = {
    query : {
      tables : {
        'mod_snis_rapport' : { columns : ['date'] }
      },
      where : ['mod_snis_rapport.id=' + session.reportId]
    }
  };

  dependencies.employes = {
    query      : {
      tables : {
        'employee' : { columns : ['id', 'prenom', 'name', 'postnom'] },
        'fonction' : { columns : ['fonction_txt']}
      },
      join : ['employee.fonction_id=fonction.id']
    }
  };

  appstate.register('project', function (project) {
    $scope.project = project;
    dependencies.zs.query.where = ['project.id=' + $scope.project.id];
    validate.process(dependencies)
    .then(init)
    .then(load);
  });

  function load () {
    if (session.reportId) {
      $http.get('/snis/getReport/' + session.reportId)
      .success(function (res) {
        setSnisData(res.snisData);
        setIdentificationData(res.identification);
      });
    }
  }

  function init (model) {
    angular.extend($scope, model);
  }

  function setIdentificationData (identification) {
    var medecin = $scope.employes.get(identification[0].id_employe_medecin_dir);
    var envoi = $scope.employes.get(identification[0].id_employe_envoi);
    var reception = $scope.employes.get(identification[0].id_employe_reception);
    var encodage = $scope.employes.get(identification[0].id_employe_encodage);
    var zone = $scope.zs.get(identification[0].id_zs);

    $scope.identif.mois = new Date(util.htmlDate($scope.report.data[0].date));

    $scope.getMedecinDir(medecin);
    $scope.identif.nom_envoi_selected(envoi);
    $scope.identif.nom_reception_selected(reception);
    $scope.identif.nom_encodage_selected(encodage);

    $scope.identif.province = zone.province;
    $scope.identif.territoire = zone.territoire;
    $scope.identif.zone = zone.zone;
    $scope.identif.id_zs = zone.id;
    $scope.identif.hopital = zone.name;
    $scope.identif.info = identification[0].information;
    $scope.identif.adresse = zone.zone + ',' + zone.territoire + ' - ' + zone.province;
    $scope.identif.date_envoi = new Date(util.htmlDate(identification[0].date_envoie));
    $scope.identif.date_reception = new Date(util.htmlDate(identification[0].date_reception));
    $scope.identif.date_encodage = new Date(util.htmlDate(identification[0].date_encodage));
  }

  function setSnisData (snisData) {
    snisData.forEach(function (field) {
      $scope.snis_report[field.attribut_form] = field.value;
    });
  }

  function submit () {

    function submitIdentification () {
      var def = $q.defer(), next = false;

      if ($scope.identif.mois && $scope.identif.medecin_dir_id && $scope.identif.nom_reception_id && $scope.identif.nom_envoi_id && $scope.identif.nom_encodage_id) {

        $http.post('/snis/createReport/',{params :
          {
            zs_id                  : $scope.identif.id_zs,
            period                 : util.sqlDate($scope.identif.mois),
            project_id             : $scope.project.id,
            id_employe_medecin_dir : $scope.identif.medecin_dir_id,
            info                   : $scope.identif.info,
            date_reception         : util.sqlDate($scope.identif.date_reception),
            id_employe_reception   : $scope.identif.nom_reception_id,
            date_envoi             : util.sqlDate($scope.identif.date_envoi),
            id_employe_envoi       : $scope.identif.nom_envoi_id,
            date_encodage          : util.sqlDate($scope.identif.date_encodage),
            id_employe_encodage    : $scope.identif.nom_encodage_id
          }
        })
        .success(function (res) {
          next = true;
          def.resolve(next);
        })
        .error(function (err) {
          messenger.danger('[erreur] lors de la sauvegarde', true);
        });
      } else {
        messenger.info('Veuillez remplir correctement les zones de l\'identification', true);
      }

      return def.promise;
    }

    function saveData (obj){
      $http.post('/snis/populateReport',{params : {data : obj}})
      .success(function(){
        messenger.success('[success] Donnees sauvegardees avec succes', true);
        $location.path('/snis/');
      });
    }

    // sending and saving data
    submitIdentification()
    .then(function () {
      saveData($scope.snis_report);
    });
  }

  function loadView (view_id) {
    session.step = view_id;
  }

  $scope.getMedecinDir = function (obj) {
    $scope.identif.medecin_dir_id = obj.id;
    $scope.identif.medecin_dir = obj.prenom + ', ' + obj.name + ' - ' + obj.postnom;
    $scope.identif.qualification = obj.fonction_txt;
  };

  $scope.identif.nom_envoi_selected = function (obj) {
    $scope.identif.nom_envoi_id = obj.id;
    $scope.identif.nom_envoi = obj.prenom + ', ' + obj.name + ' - ' + obj.postnom;
  };

  $scope.identif.nom_reception_selected = function (obj) {
    $scope.identif.nom_reception_id = obj.id;
    $scope.identif.nom_reception = obj.prenom + ', ' + obj.name + ' - ' + obj.postnom;
  };

  $scope.identif.nom_encodage_selected = function (obj) {
    $scope.identif.nom_encodage_id = obj.id;
    $scope.identif.nom_encodage = obj.prenom + ', ' + obj.name + ' - ' + obj.postnom;
  };

  $scope.getPeriod = function (obj) {
    $scope.period = util.sqlDate(obj);
  };

  $scope.next = function () {
    if (session.step < 9) {
      // next step
      session.step++;
    } else if (session.step === 9) {
      // validate operations
      submit();
    }
  };

  $scope.previous = function () {
    if (session.step > 1 && session.step <= 9) {
      // next step
      session.step--;
    }
  };

  $scope.snis_report = {};
  $scope.loadView = loadView;
}
