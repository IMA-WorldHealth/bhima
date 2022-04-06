const _ = require('lodash');
const core = require('../../../stock/core');
const reqInvScans = require('../../../stock/required_inventory_scans');
const ReportManager = require('../../../../lib/ReportManager');

const BASE_URL = './server/controllers/asset_management/assets';
const NEEDED_INVENTORY_SCAN_REPORT_TEMPLATE = `${BASE_URL}/reports/needed_inventory_scans.handlebars`;

async function neededInventoryScansReport(req, res, next) {
  const options = req.query;

  // @TODO: put these into combined bhConstants and eventually share across client and server
  const tableTitles = {
    'all' : 'REPORT.INVENTORY_SCANS_NEEDED.SCANS_ALL',
    'scanned' : 'REPORT.INVENTORY_SCANS_NEEDED.SCANS_SCANNED',
    'unscanned' : 'REPORT.INVENTORY_SCANS_NEEDED.SCANS_UNSCANNED',
  };

  const tableType = (options.scan_status && options.scan_status in tableTitles) ? options.scan_status : 'all';

  _.defaults(options, {
    filename : 'ASSETS.NEEDED_INVENTORY_SCANS',
    csvKey : 'assets',
    orientation : 'landscape',
  });

  try {
    const report = new ReportManager(NEEDED_INVENTORY_SCAN_REPORT_TEMPLATE, req.session, options);

    const [scan] = await reqInvScans.requiredInventoryScans({ uuid : options.uuid });

    const params = {
      depot_uuid : scan.depot_uuid,
      is_asset : scan.is_asset,
      scan_start_date : new Date(scan.start_date),
      scan_end_date : new Date(scan.end_date),
      reference_number : scan.reference_number,
      scan_status : options.scan_status,
    };
    const assets = await core.getAssets(params);

    const data = {
      scan,
      assets,
      tableTitle : tableTitles[tableType],
      date : new Date(),
    };

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}

exports.neededInventoryScansReport = neededInventoryScansReport;