angular.module('bhima.controllers')
  .controller('LotsScheduleModalController', LotsScheduleModalController);

// dependencies injections
LotsScheduleModalController.$inject = [
  'data', '$uibModalInstance', 'StockService', 'LotService',
  'NotifyService', 'bhConstants', 'moment', '$translate',
];

function LotsScheduleModalController(data, Instance, Stock, Lots,
  Notify, bhConstants, Moment, $translate) {
  const vm = this;
  vm.close = close;
  vm.lotUuid = data.uuid; // The lot that invoked this modal
  vm.DATE_FMT = bhConstants.dates.format;
  vm.labelWidth = 100; // pixels
  vm.monthWidth = 36; // pixels
  vm.numMonths = 36; // Number of table columns for months
  vm.chartWidth = vm.labelWidth + (vm.numMonths * vm.monthWidth); // pixels

  const today = new Date();
  vm.startDate = new Date(today.getFullYear(), today.getMonth(), 1);

  function startup() {
    Stock.lots.read(null, {
      inventory_uuid : data.inventoryUuid,
      depot_uuid : data.depotUuid,
    })
      .then((lots) => {
        // Save info about the inventory article (lot[0] may have zero quantity)
        vm.inventory_name = lots[0].text;
        vm.projection_text = $translate.instant('LOTS_SCHEDULE.PROJECTION_BASIS', lots[0]);

        // We need to eliminate any exhausted lots and any expired lots
        // and then sort the remaining lots by expiration date
        vm.lots = lots.filter(lot => lot.quantity > 0)
          .filter(lot => Moment(new Date(lot.expiration_date)) >= Moment(today))
          .sort(sortByExpirationDate);

        // runningDate is the date the last lot ran out
        // (Always start the first lot at the current date; ignore past)
        let runningDate = new Date(today);

        vm.lots.forEach(lot => {
          // Process the lots and determine sequential start/end dates and other info
          lot.start_date = new Date(runningDate);

          // Compute when the lot runs out (based on adjusted start date)
          lot.exhausted_date = Moment(lot.start_date).add(lot.quantity / lot.avg_consumption, 'months').toDate();

          // Compute the end date for this lot
          lot.end_date = new Date(lot.expiration_date);
          if (lot.exhausted_date < lot.expiration_date) {
            lot.end_date = lot.exhausted_date;
          }

          // Compute the starting value (assume enterprise currency)
          lot.value = lot.quantity * lot.unit_cost;

          // Compute the lot quantity that will be left at the end date
          lot.num_days = Moment(lot.end_date).diff(Moment(lot.start_date), 'days');
          lot.num_months = lot.num_days / 30.5;
          const numUsed = Math.ceil(lot.num_months * lot.avg_consumption);
          lot.quantity_used = Math.min(numUsed, lot.quantity); // Cannot use more than we have!
          lot.quantity_wasted = lot.quantity - lot.quantity_used;
          lot.value_wasted = lot.quantity_wasted * lot.unit_cost;

          // Compute the width of the lot rectangle in pixels
          lot.width_pixels = Math.ceil(lot.num_months * vm.monthWidth);

          // Compute the starting location for the lot in pixels
          lot.start_pixel = Math.round((
            Moment(lot.start_date).diff(Moment(vm.startDate), 'days') / 30.5) * vm.monthWidth);

          lot.tooltip = $translate.instant('LOTS_SCHEDULE.LOT_TOOLTIP', lot);
          if (lot.quantity_wasted > 0) {
            lot.tooltip += $translate.instant('LOTS_SCHEDULE.LOT_TOOLTIP_WASTE', lot);
          }

          // Highlight the lot which invoked the schedule display (if any)
          lot.new_color = lot.uuid === vm.lotUuid ? 'background-color: #aaaaff;' : '';

          // Adjust the running date (the next lot will start at this date)
          runningDate = lot.end_date;
        });

        // Construct an array with the months for the next 36 months
        vm.months = [];
        let month = new Date(vm.startDate);
        for (let i = 0; i < vm.numMonths; i++) {
          vm.months.push({
            month : Moment(month).format('MMM'),
            year  : Moment(month).format('YYYY'),
          });
          month = Moment(month).add(1, 'months').toDate();
        }

        // Get sorted list of the years and the number of months in each year
        const allYears = vm.months.map(obj => obj.year);
        const years = Array.from(new Set(allYears)).sort();
        vm.years = [];
        years.forEach(yr => {
          vm.years.push({
            year : yr,
            count : allYears.reduce((n, year) => n + (year === yr), 0),
          });
        });

      })
      .catch(Notify.handleError);
  }

  function close() {
    Instance.close('close');
  }

  function sortByExpirationDate(a, b) {
    // Sort by expiration date : earlier dates first
    if (a.expiration_date > b.expiration_date) {
      return 1;
    }
    if (a.expiration_date === b.expiration_date) {
      return 0;
    }
    return -1;
  }

  startup();
}
