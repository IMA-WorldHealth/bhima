const core = require('./core');
const consumption = require('./consumption');
const leadtimes = require('./leadtimes');
const stock = require('./stock');

exports.getInventoryStatusById = getInventoryStatusById;

/**
* Query a specific inventory item and find out its stock status.  Calculates
* the number of days remaining, whether there is a shortage, overstock, and
* stockout.
*
* @function getInventoryStatusById
* @returns {Promise} The database query promise
*/
function getInventoryStatusById(uuid) {
  let data;

  // get the min stock values
  return core.getItemsMetadataById(uuid)
    .then((rows) => {
      if (!rows.length) {
        throw core.errors.NO_INVENTORY_ITEMS;
      }

      data = rows[0];

      return stock.getStockLevelsById(uuid);
    })
    .then((rows) => {
      data.quantity = rows.length > 0 ? rows[0].quantity : 0;

      return leadtimes.getInventoryLeadTimesById(uuid);
    })
    .then((rows) => {
      data.leadtime = rows.length > 0 ? rows[0].days : 0;

      return consumption.getAverageItemConsumption(uuid, {});
    })
    .then((rows) => {
      const avg = rows.length > 0 ? rows[0].average : 0;

      data.consumption = avg;

      // calculate the days of stock remaining in the inventory (in days)
      const daysOfStockRemaining =
        (data.quantity / data.consumption) - data.leadtime;

      data.remaining = daysOfStockRemaining;

      // if there are fewer days of stock remaining than the preset minimum value,
      // we are facing a shortage and should reorder stock immediately
      data.shortage = data.remaining < data.stock_min;

      // if there are more days of stock remaining than the preset maximum value,
      // we are facing an overstock and should sell off some of the excess stock
      data.overstock = data.remaining > data.stock_max;

      // if the quantity of stock is zero, we have a stockout and must purchase stock
      // immediately.
      data.stockout = data.quantity === 0;

      // TODO
      // We should probably have a fixed quantity of stock that a pharmacist can
      // set for the minimum and maximum values of stock they are comfortable
      // allowing in their pharmacy.
      //
      // For example, the pharmacy cannot handle (no storage space) 1,000
      // mosquito nets, so the maximum is 800.  Similarly, the pharmacist is
      // comfortable (from experience) with only 200 vials of penicillin.  They
      // can set that as the minimum value.
      //
      // This would make the calculation for shortage
      //  data.shortage = data.remaining < MAX(data.min_days, data.min_quantity)
      // and similarly for overstock
      //  data.overstock = data.remaining > MIN(data.max_days, data.max_quantity)
      //
      // You can then toggle a warning or error state based on which condition was
      // violated - the quantity or the number of days.

      return data;
    });
}
