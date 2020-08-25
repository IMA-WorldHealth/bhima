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
      excludeType : '<?',
      label : '@?',
      tag : '@?',
      allowAllRoot : '<?',
    },
  });

LocationConfigurationSelectController.$inject = [
  'LocationService', 'NotifyService', '$translate',
];
/**
 * Location Configuration Select Controller
 *
 * When the component is called for the very first time,
 * the first request to the server consists in fetching
 * all the locations (parent territorial entities)
 *
 * $ctrl.locationId : parameter is used to search for all the parents of the selected
 *                    location up to the entity with the highest level in the tree structure
 *
 * $ctrl.excludeType : This is the type of data to exclude when selecting locations
 *
 * $ctrl.allowAllRoot : Allows to select all the territorial entities defined as root,
 *                      if this parameter is defined as false in this case,
 *                      only the entities having the type defined as location default type root
 *                      In Enterprise Parameter
 * $ctrl.operationalMode : is used for all the other cases where the component is used
 *                         in another form except the form for recording locations
 *
 * $ctrl.parentId : is used to fetch to get the Parent entity
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
    /*
     * When the component is called for the very first time,
     * the first request to the server consists in fetching
     * all the locations (parent territorial entities)
     */

    const params = {
      locationId : $ctrl.locationId,
      excludeType : $ctrl.excludeType,
      allRoot : $ctrl.allowAllRoot,
    };

    loadLocationsTree(params);
  }

  function loadLocationsTree(params) {
    locationService.loadLocationsRoot(params)
      .then((data) => {
        if (data.rows.length) {
          let locationPath = {};

          $ctrl.aggregates = data.aggregates;
          $ctrl.multipleRoot = data.aggregates.length > 1;

          // When trying to get parents for location
          if ($ctrl.parentId || $ctrl.operationalMode) {
            /*
             * When the operational mode or the identifier is provided, the component searches
             * among the paths for existing locations, which correspond to the identifier provided in parameter
             */
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

            // Here we try to place the different levels of localization in a table according to their degree of depth
            for (let i = 1; i < deepLevelPlus; i++) {
              // Here we try to insert in the table, in order of growth, the elements with the highest index as root
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
    if (changes.locationId) {
      const { previousValue } = parseInt(changes.locationId, 10);
      const { currentValue } = parseInt(changes.locationId, 10);

      if (!previousValue && currentValue) {
        $ctrl.locationId = currentValue;
        loadLocationsTree({ locationId : currentValue });
      }
    }
  };

  // Here we try to obtain the child locations for a location that is not root and
  // the results obtained are displayed in the view of the component
  $ctrl.loadLeaves = function loadLeaves(locationId, option) {
    const excludeType = $ctrl.excludeType || null;

    if (option === 'root') {
      $ctrl.locationLeaves = [];
    } else {

      const optionIndex = option + 1;
      const temporaryArray = [];

      if (optionIndex < $ctrl.locationLeaves.length) {
        for (let i = 0; i < optionIndex; i++) {
          temporaryArray.push($ctrl.locationLeaves[i]);
        }

        $ctrl.locationLeaves = [];
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
              data.aggregates.forEach(aggr => {
                if (path.type_id === aggr.id) {
                  locationValue = path.id;
                }
              });
            });
          }

          if ($ctrl.operationalMode && !locationValue) {
            locationValue = $ctrl.locationId;
          }

          $ctrl.locationLeaves.push(
            {
              id : `level_${$ctrl.locationLeaves.length}`,
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

  // This function is used when you need to add a new location directly in the recording interface
  function addLocationModal() {
    locationService.modal()
      .then((data) => {
        $ctrl.onSelectCallback({ location : data });
        $ctrl.locationId = data.id;
        $ctrl.arrayLocationPath = [];
        onInit();
      });
  }

  // fires the onSelectCallback bound to the component boundary
  $ctrl.onSelect = ($item) => {
    $ctrl.onSelectCallback({ location : $item });
  };
}
