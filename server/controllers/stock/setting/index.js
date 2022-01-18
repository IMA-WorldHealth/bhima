/**
 * The Stock Settings Controller
 *
 * This controller is responsible for creating and updating stock-related settings.
 */

const db = require('../../../lib/db');
const NotFound = require('../../../lib/errors/NotFound');


let central;

// because the ODK Central API is ESM, we must use a dynamic import()
// instead of require().
(async () => {
  central = await import('@ima-worldhealth/odk-central-api');
})();

// GET /stock/setting
//
// Get the current stock settings for the Enterprise
//    If req.query.enterprise_id is set, it will use that,
//    otherwise it will look up the entry for Enterprise.id=1
exports.list = async function list(req, res, next) {
  const enterpriseId = req.params.id || req.session.enterprise.id;

  const sql = `
    SELECT month_average_consumption, default_min_months_security_stock,
      enable_auto_purchase_order_confirmation, enable_auto_stock_accounting,
      enable_strict_depot_permission, enable_supplier_credit,
      enable_strict_depot_distribution, average_consumption_algo,
      min_delay, default_purchase_interval, enable_expired_stock_out,
      default_cost_center_for_loss
    FROM stock_setting
    WHERE enterprise_id = ? LIMIT 1;
    `;

  try {
    const rows = await db.exec(sql, [enterpriseId]);

    if (rows.length !== 1) {
      throw new NotFound(`Could not find stock_setting data with enterprise id ${req.params.id} (get)`);
    }

    const [settings] = rows;

    const odkSettings = await db.exec('SELECT * FROM odk_central_integration WHERE enterprise_id = ?;', [enterpriseId]);

    // merge in the settings if they are defined
    if (odkSettings.length > 0) {
      settings.odk = odkSettings.pop();
    }

    res.status(200).json([settings]);
  } catch (e) {
    next(e);
  }
};

// PUT /stock/setting/:id
//
//  Update the settings in stock_settings for the settings
//  with enterprise_id given by the 'id' parameter
exports.update = async function update(req, res, next) {
  const sql = 'UPDATE stock_setting SET ? WHERE enterprise_id = ?';
  const { settings } = req.body;
  const { odk } = settings;

  delete settings.odk;

  try {

    const { affectedRows } = await db.exec(sql, [settings, req.params.id]);

    if (!affectedRows) {
      throw new NotFound(`Could not find stock_setting row with enterprise id ${req.params.id} (put)`);
    }

    const updatedSettings = await db.exec(
      'UPDATE stock_setting SET ? WHERE enterprise_id = ?',
      [settings, req.params.id]);

    // update the ODK settings
    if (odk) {
      await db.exec('DELETE FROM odk_central_integration WHERE enterprise_id = ?', [req.params.id]);
      await db.exec('INSERT INTO odk_central_integration SET ?;', [{ ...odk, enterprise_id : req.params.id }]);

      // attempt to log in with the ODK api
      await setupODKCentralConnection(odk.odk_central_url, odk.odk_admin_user, odk.odk_admin_password);
    }

    res.status(200).json(updatedSettings);
  } catch (e) {
    next(e);
  }
};

async function setupODKCentralConnection(serverUrl, userEmail, userPassword) {
  central.auth.setConfig(serverUrl, userEmail, userPassword);

  const details = await central.api.users.getCurrentUserDetails();

}
