angular.module('bhima.components')
  .component('bhLocationConfigurationSelect', {
    templateUrl : 'modules/templates/bhLocationConfigurationSelect.tmpl.html',
    controller  : LocationConfigurationSelectController,
    transclude  : true,
    bindings    : {
      onSelectCallback : '&',
      locationId : '<?',
      parentId : '<?',
      addLocation : '<?',
      operationalMode : '<?',
      required : '@?',
      parent : '<?',
      label : '@?',
      allowAllRoot : '<?',
    },
  });

LocationConfigurationSelectController.$inject = [
  'LocationService', 'NotifyService', '$translate',
];

/**
 * Location Configuration Select Controller
 *
 */
function LocationConfigurationSelectController(locationService, Notify, $translate) {
  const $ctrl = this;
  $ctrl.locationLeaves = [];
  $ctrl.arrayLocationPath = [];
  $ctrl.addLocationModal = addLocationModal;
  $ctrl.$onInit = onInit;

  function onInit() {
    $ctrl.required = $ctrl.required || false;

    const params = {
      locationId : $ctrl.locationId,
      excludeType : $ctrl.parent,
      allRoot : $ctrl.allowAllRoot,
    };

    locationService.loadLocationsRoot(params)
      .then((data) => {
        if (data.rows.length) {
          let locationPath = {};
          $ctrl.aggregates = data.aggregates;
          $ctrl.multipleRoot = data.aggregates.length > 1;

          if ($ctrl.parentId || $ctrl.operationalMode) {
            data.locationsDeep.forEach(path => {
              if ($ctrl.parentId) {
                if (path.parent === $ctrl.parentId) {
                  locationPath = path;
                }
              } else if ($ctrl.operationalMode) {
                if (path.id === $ctrl.locationId) {
                  locationPath = path;
                }
              }
            });

            const deepLevelPlus = data.deepLevel + 1;
            for (let i = 1; i < deepLevelPlus; i++) {
              const indicePathId = `location_id_${deepLevelPlus - i}`;
              const indicePathLabel = `translation_key_${deepLevelPlus - i}`;
              const indicePathType = `location_type_id_${deepLevelPlus - i}`;

              if (locationPath[indicePathId]) {
                $ctrl.arrayLocationPath.push({
                  id : locationPath[indicePathId],
                  label : $translate.instant(locationPath[indicePathLabel]),
                  type_id : locationPath[indicePathType],
                });
              }
            }

            if ($ctrl.arrayLocationPath[0]) {
              $ctrl.locationConfigurationId = $ctrl.arrayLocationPath[0].id;
              $ctrl.loadLeaves($ctrl.locationConfigurationId, 'root');
            }

            for (let i = 1; i < $ctrl.arrayLocationPath.length; i++) {
              $ctrl.loadLeaves($ctrl.arrayLocationPath[i].id, i);
            }

            $ctrl.roots = data.rows;

          } else {
            data.rows.forEach(type => {
              type.typeLabel = $translate.instant(type.translation_key);
            });

            data.rows.sort((a, b) => {
              return a.typeLabel - b.typeLabel;
            });

            $ctrl.roots = data.rows;
          }

        } else {
          $ctrl.typeHighest = true;
        }

      })
      .catch(Notify.handleError);
  }

  $ctrl.$onChanges = (changes) => {
    if (changes.parent) {
      $ctrl.parent = changes.parent.currentValue || null;
    }

    if (changes.parentId) {
      $ctrl.parentId = changes.parentId.currentValue || null;
    }

    if (changes.locationId) {
      $ctrl.locationId = changes.locationId.currentValue || null;
    }

  };

  $ctrl.loadLeaves = function loadLeaves(locationId, option) {
    const excludeType = $ctrl.parent || null;

    if (option === 'root') {
      $ctrl.locationLeaves = [];
    } else {
      const optionIndex = option + 1;
      const temporaryArray = [];

      if (optionIndex < $ctrl.locationLeaves.length) {
        for (let i = 0; i < optionIndex; i++) {
          temporaryArray.push($ctrl.locationLeaves[i]);
        }

        delete $ctrl.locationLeaves;
        $ctrl.locationLeaves = temporaryArray;
      }
    }

    locationService.loadLocationsRoot({ parentId : locationId, excludeType })
      .then((data) => {
        if (data.rows.length) {
          let locationValue;

          const { aggregates } = data;
          const multipleRoot = data.aggregates.length > 1;

          data.rows.forEach(type => {
            type.typeLabel = $translate.instant(type.translation_key);
          });

          data.rows.sort((a, b) => {
            return a.typeLabel - b.typeLabel;
          });

          if ($ctrl.arrayLocationPath) {
            $ctrl.arrayLocationPath.forEach(path => {
              if (path.type_id === data.aggregates[0].id) {
                locationValue = path.id;
              }
            });
          }

          if ($ctrl.operationalMode && !locationValue) {
            locationValue = $ctrl.locationId;
          }

          $ctrl.locationLeaves.push(
            {
              id : `location_${locationId}`,
              elements : data.rows,
              model : locationValue,
              aggregates,
              multipleRoot,
            },
          );
        }

      })
      .catch(Notify.handleError);
  };

  function addLocationModal() {
    locationService.modal()
      .then((data) => {
        $ctrl.locationId = data.id;
        const item = {
          id : data.id,
          uuid : data.uuid,
        };

        $ctrl.allowAllRoot = true;
        onInit();
        $ctrl.onSelectCallback({ location : item });
      });
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = ($item) => {

    $ctrl.onSelectCallback({ location : $item });
  };
}
