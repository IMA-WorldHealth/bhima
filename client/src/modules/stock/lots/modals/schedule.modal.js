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
  vm.monthWidthPads = 3; // Left-right padding + left border width
  vm.monthWidth = 21;
  vm.monthWidthInner = vm.monthWidth - vm.monthWidthPads;
  vm.monthWidthPads = 4; // Left-right padding + left border width
  vm.numMonths = 36; // Number of table columns for months

  // Start at the first day of this month and end numMonths later
  const today = new Date();
  vm.startChartDate = new Date(today.getFullYear(), today.getMonth(), 1);
  vm.endChartDate = Moment(vm.startChartDate).add(vm.numMonths, 'months').toDate();

  function startup() {
    Stock.lots.read(null, {
      inventory_uuid : data.inventoryUuid,
      depot_uuid : data.depotUuid,
    })
      .then((lots) => {
        // Save info about the inventory article
        // (lot[0] may have zero quantity and be filtered out below)
        vm.inventory_name = lots[0].text;
        vm.inventory_code = lots[0].code;
        const avgConsumption = lots[0].avg_consumption;
        const minMonthsSecurityStock = lots[0].min_months_security_stock;
        if (avgConsumption > 0) {
          vm.projection_text = $translate.instant('LOTS_SCHEDULE.PROJECTION_BASIS', lots[0]);
        } else {
          vm.projection_text = $translate.instant('LOTS_SCHEDULE.WARNING_ZERO_CMM', lots[lots.length - 1]);
        }

        // We need to eliminate any exhausted lots and any expired lots
        vm.lots = lots.filter(lot => lot.quantity > 0)
          .filter(lot => Moment(new Date(lot.expiration_date)) >= Moment(today));

        // runningDate is the date the last lot ran out
        // (Always start the first lot 00:00 AM of current date; ignore the past)
        let runningDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        vm.lots.forEach(lot => {
          // Process the lots and determine sequential start/end dates and other info
          lot.start_date = new Date(runningDate);
          lot.expiration_date = new Date(lot.expiration_date);

          // Compute when the lot runs out (based on adjusted start date)
          if (avgConsumption > 0) {
            // Calculate in days since Moment.add does not handle fractional months
            // NB: Since Moment.diff silently truncates its arguments, even this
            //     calculation will include some round-off errors.
            lot.exhausted_date = Moment(lot.start_date).add(30.5 * lot.quantity / avgConsumption, 'days').toDate();
          } else {
            lot.exhausted_date = vm.endChartDate;
          }

          // Compute the end date for this lot
          lot.end_date = new Date(lot.exhausted_date);
          lot.premature_expiration = false;
          const daysResidual = Moment(lot.exhausted_date).diff(Moment(lot.expiration_date), 'days');
          if (daysResidual > 0) {
            lot.end_date = lot.expiration_date;
            lot.premature_expiration = true;
          }

          lot.truncated = lot.end_date.getTime() >= vm.endChartDate.getTime();

          // Compute the starting value (assume enterprise currency)
          lot.value = lot.quantity * lot.unit_cost;

          // Compute the lot quantity that will be left at the end date
          lot.num_days = Moment(lot.end_date).diff(Moment(lot.start_date), 'days');
          lot.num_months = lot.num_days / 30.5;
          // if we do not expire before exhaustion, assume all stock articles are used.
          // Otherwise, do the calculation to estimate how many will be wasted
          const numUsed = lot.premature_expiration ? Math.ceil(lot.num_months * avgConsumption) : lot.quantity;
          lot.quantity_used = Math.min(numUsed, lot.quantity); // Cannot use more than we have!
          lot.quantity_wasted = lot.quantity - lot.quantity_used;
          lot.value_wasted = lot.quantity_wasted * lot.unit_cost;

          // Compute the starting location for the lot in pixels
          lot.start_pixel = (Moment(lot.start_date).diff(Moment(vm.startChartDate), 'days') / 30.5) * vm.monthWidth + 1;

          // Compute the width of the lot rectangle in pixels
          lot.width_pixels = lot.num_months * vm.monthWidth;

          // If the lot is exhausted prematurely, compute the width of the unusable RESIDUAL rectangle
          if (lot.premature_expiration) {
            lot.residual_start_pixel = lot.start_pixel + lot.width_pixels;
            lot.residual_days = daysResidual;
            lot.residual_months = lot.residual_days / 30.5;

            // Truncate the width of the residual area to the width of the chart so it does not wrap
            const residualWidth = lot.residual_months * vm.monthWidth;
            const chartWidth = vm.monthWidth * vm.numMonths;
            lot.residual_truncated = false;
            lot.residual_width_pixels = residualWidth;
            if ((residualWidth > chartWidth - lot.residual_start_pixel)
              || (avgConsumption <= 0 && (lot.residual_months > 0))) {
              lot.residual_truncated = true;
              lot.residual_width_pixels = chartWidth - lot.residual_start_pixel;
            }

            // If the CMM is 0, fix the exhaused date
            if (avgConsumption <= 0) {
              lot.exhausted_date = $translate.instant('LOTS_SCHEDULE.NEVER_EXHAUSTED');
            }
          }

          // Construct the main summary tooltip for the lot
          lot.tooltip = $translate.instant('LOTS_SCHEDULE.LOT_TOOLTIP', lot);
          if (lot.quantity_wasted > 0) {
            lot.tooltip += $translate.instant('LOTS_SCHEDULE.LOT_TOOLTIP_WASTE', lot);
          }

          // Highlight the lot which invoked the schedule display (if any)
          lot.selected = lot.uuid === vm.lotUuid ? 'selected' : '';

          // Adjust the running date (the next lot will start at this date)
          runningDate = lot.end_date;
        });

        // Compute the reorder date
        if (avgConsumption > 0) {
          const allLotsExhausted = vm.lots[vm.lots.length - 1].end_date;
          vm.reorderDate = Moment(allLotsExhausted).subtract(minMonthsSecurityStock * 30.5, 'days').toDate();
          vm.reorderSuggestion = avgConsumption > 0 ? $translate.instant('LOTS_SCHEDULE.REORDER_STOCK_DATE',
            { reorder_date : vm.reorderDate }) : '';
          if (vm.reorderDate < today) {
            vm.reorderDate = today;
            vm.reorderSuggestion = $translate.instant('LOTS_SCHEDULE.REORDER_STOCK_TODAY');
          }
        } else {
          vm.reorderDate = vm.endChartDate;
          vm.reorderSuggestion = '';
        }
        const reorderYear = Moment(vm.reorderDate).format('YYYY');
        const reorderMonth = Moment(vm.reorderDate).format('MMM');

        // Construct an array with the months for the next 36 months
        vm.months = [];
        let month = new Date(vm.startChartDate);
        for (let i = 0; i < vm.numMonths; i++) {
          const yr = Moment(month).format('YYYY');
          const mn = Moment(month).format('MMM');
          const reorder = (avgConsumption > 0) && (mn === reorderMonth) && (yr === reorderYear);
          vm.months.push({
            month : mn,
            year  : yr,
            reorder : reorder ? 'reorder' : '',
            reorder_tooltip : reorder ? vm.reorderSuggestion : '',
          });
          month = Moment(month).add(1, 'months').toDate();
        }

        // Get sorted list of the years and the number of months in each year
        const allYears = vm.months.map(obj => obj.year);
        const years = Array.from(new Set(allYears)).sort();
        vm.years = years.map(yr => ({
          year : yr,
          count : allYears.reduce((n, year) => n + (year === yr), 0),
        }));
      })
      .catch(Notify.handleError);
  }

  function close() {
    Instance.close('close');
  }

  startup();
}
