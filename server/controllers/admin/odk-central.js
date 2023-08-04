/**
 * @module odk-central
 *api.
 * @description
 * This module contains the ODK Central API.
 */

const router = require('express').Router();
const debug = require('debug')('bhima:plugins:odk-central');
const _ = require('lodash');
const { json2csv } = require('json-2-csv');
const tempy = require('tempy');
const path = require('path');
const fs = require('fs/promises');

const central = require('@ima-worldhealth/odk-central-api-cjs');

const { getPeriodIdForDate } = require('../../lib/util');
const db = require('../../lib/db');
const util = require('../../lib/util');
const core = require('../stock/core');

const { flux } = require('../../config/constants');

// NOTE(@jniles) - it is not clear how long these roles will be valid. ODK Central may
// begin asking users to create their own roles/permissions.
const odkCentralRoles = {
  admin : 1,
  projectManager : 5,
  dataCollector : 8,
};

setupODKCentralConnection();
async function setupODKCentralConnection() {
  debug('initializing ODK Central link.');

  // load the configuration from database if it exists
  await loadODKCentralSettingsFromDatabase();
}

async function defineUserAsDataCollector(xmlFormId, userId) {
  const { id } = await db.one('SELECT odk_project_id AS id FROM odk_central_integration LIMIT 1;');
  return central.api.forms.assignActorToFormRole(id, xmlFormId, odkCentralRoles.dataCollector, userId);
}

/**
 * @function loadODKCentralSettingsFromDatabase
 *
 * @description
 * Loads the ODK central settings from the database.
 *
 */
async function loadODKCentralSettingsFromDatabase() {
  const [odk] = await db.exec('SELECT * FROM odk_central_integration;');

  if (!odk) {
    debug('No odk_central_configuration found.');
  } else {
    debug(`configuring ODK Central with url: ${odk.odk_central_url}`);
    central.auth.setConfig(odk.odk_central_url, odk.odk_admin_user, odk.odk_admin_password);
    debug('ODK Central link configured');
  }
}

/**
 * @function syncAppUsersWithCentral
 *
 * @description
 * This function synchronizes user accounts with ODK Central if a configuration exists.
 */
async function syncAppUsersWithCentral() {
  debug('Syncing BHIMA users with ODK Central app users.');

  // look for all users with depot permissions in the database
  const users = await db.exec(`
    SELECT user.id, user.display_name, user.email
    FROM user WHERE user.deactivated <> 1 AND user.id NOT IN (
      SELECT bhima_user_id FROM odk_app_user
    ) AND user.id IN (SELECT user_id FROM depot_permission)
    AND user.email IS NOT NULL;
  `);

  const config = await db.exec('SELECT odk_project_id FROM odk_central_integration LIMIT 1;');
  const projectId = config.length && config[0].odk_project_id;

  debug(`There are ${users.length} users available in BHIMA.`);

  // pull the latest app users from ODK Central.
  const centralUsers = await central.api['app-users'].listAllAppUsers(projectId);

  debug(`There are ${centralUsers.length} app-users available in ODK Central.`);

  // get only central name to use as a filter mask
  const centralAppUserNames = centralUsers.map(user => user.displayName);

  debug(`Filtering out existing ODK Central app-users.`);

  // filter out all users who already have an email address in central
  const usersToCreate = users
    .filter(user => !centralAppUserNames.includes(user.displayName));

  debug(`Found ${usersToCreate.length} users to create.`);

  // loop through users and create them in ODK Central.
  for (const user of usersToCreate) { // eslint-disable-line
    debug(`Creating app-user ${user.display_name}.`);

    // eslint-disable-next-line
    const centralAppUser = await central.api['app-users'].createAppUser(projectId, user.display_name);

    // eslint-disable-next-line
    await db.exec('INSERT INTO `odk_app_user` VALUES (?, ?, ?);', [centralAppUser.id, user.display_name, user.id]);
    debug(`Finished with user ${user.display_name}.`);
  }

  debug(`Created ${usersToCreate.length} app users in ODK Central.`);
}

/**
 * @function syncEnterpriseWithCentral
 */
async function syncEnterpriseWithCentral() {
  debug('Synchronizing BHIMA enterprise with ODK Central');
  const settings = await db.exec('SELECT * FROM odk_central_integration WHERE odk_project_id IS NULL;');

  if (!settings.length) {
    debug('Nothing to sync.  Ignoring');
    return;
  }

  const [enterprise] = await db.exec('SELECT * FROM enterprise;');

  debug(`Creating a project on ODK Central for ${enterprise.name}.`);

  const result = await central.api.projects.createProject(enterprise.name);

  debug(`Created project on central with id: ${result.id}.`);

  await db.exec(
    'UPDATE odk_central_integration SET odk_project_id = ? WHERE enterprise_id = ?;',
    [result.id, enterprise.id],
  );

  debug(`Finished synchronizing projects and enterprises.`);
}

function importODKSubmission(submission, user) {
  // this is the depot targeted

  const transaction = db.transaction();

  const date = new Date(submission.date);
  const periodId = getPeriodIdForDate(date);

  const record = {
    depot_uuid : db.bid(submission.depot_uuid),
    entity_uuid : db.bid(submission.entity_uuid),
    is_exit : 0,
    flux_id : flux.FROM_OTHER_DEPOT,
    document_uuid : db.bid(submission.document_uuid),
    date,
    description : submission.description,
    user_id : user.id,
    period_id : periodId,
  };

  for (const row of submission.barcode_repeat) { // eslint-disable-line
    debug('processing:', JSON.stringify(row));
    const line = { ...record };
    line.uuid = db.bid(util.uuid());
    line.lot_uuid = db.bid(row.lot_uuid);
    line.unit_cost = row.unit_cost;
    line.quantity = 1;

    transaction.addQuery('INSERT INTO stock_movement SET ?', [line]);
  }

  return transaction.execute();

}

async function syncSubmissionsWithCentral(user) {
  debug('Synchronizing submissions with ODK Central');

  const integration = await db.exec('SELECT odk_project_id FROM odk_central_integration;');
  if (!integration.length) {
    debug('No odk_project_id found!  ODK Central integration not set up.  Exiting early.');
    return;
  }

  const odkProjectId = integration[0].odk_project_id;
  const xmlFormId = 'bhima_pv_reception';

  const submissions = await central.api.getSubmissionsJSONByProjectIdAndFormId(odkProjectId, xmlFormId);

  debug(`Got ${submissions.length} submission for ${xmlFormId}.`);

  // import the submissions
  for (const submission of submissions) { // eslint-disable-line
    await importODKSubmission(submission, user); // eslint-disable-line
  }

  debug(`Finished synchronizing submissions.`);
}

/**
 * @function syncFormsWithCentral
 *
 * @description
 * This creates a stock exit form for each depot in the application.
 * The strategy is to upload an XLSX form that
 *
 */
async function syncFormsWithCentral() {
  debug('Synchronizing forms with ODK Central');

  const integration = await db.exec('SELECT odk_project_id FROM odk_central_integration;');
  if (!integration.length) {
    debug('No odk_project_id found!  ODK Central integration not set up.  Exiting early.');
    return;
  }

  const odkProjectId = integration[0].odk_project_id;

  const depots = await db.exec('SELECT buid(uuid) as uuid, depot.text FROM depot;');

  debug(`Located ${depots.length} depots locally...`);

  const data = [];

  // Here, we pull out the current quantity in stock every depot, including lot numbers
  // to create a lots.csv that will be uploaded to ODK Central to show inventory items as
  // they are scanned.

  // eslint-disable-next-line
  for (const depot of depots) {
    debug(`Pulling lots for ${depot.text}`);
    const lots = await core.getLotsDepot(depot.uuid, { // eslint-disable-line
      month_average_consumption : 6,
      average_consumption_algo : 'msh',
    });

    debug(`Found ${lots.length} lots.`);

    data.push(...lots
      .map(
        lot => _.pick(lot, [
          'barcode',
          'uuid', 'lot_description', 'label', 'depot_text', 'depot_uuid', 'unit_cost',
          'text', 'unit_type', 'group_name', 'quantity', 'code', 'invenetory_uuid',
        ]),
      ),
    );
  }

  // generate a CSV and store it in a temporary file so we can upload to ODK Central later
  const lotsCsv = await json2csv(data, { trimHeaderFields : true, trimFieldValues : true });
  const tmpLotsFile = tempy.file({ name : 'lots.csv' });
  await fs.writeFile(tmpLotsFile, lotsCsv);

  debug(`Wrote ${data.length} lots to temporary file: ${tmpLotsFile}`);

  // now we need to pull out the transfers out of depots to other depots
  // this will power a selection menu in ODK Collect application.

  const toOtherDepotFluxId = 8;

  // get all stock exits to other depots
  const allStockExitDocuments = await db.exec(`
    SELECT BUID(document_uuid) as document_uuid,
      dm.text AS documentReference,
      BUID(depot_uuid) AS origin_depot_uuid,
      BUID(entity_uuid) AS target_depot_uuid,
      depot.text AS origin_depot_text,
      dd.text AS target_depot_text,
      CONCAT(dm.text, " (", DATE_FORMAT(MAX(date), "%Y-%m-%d"), ") - ", COUNT(*), " produits") AS label
    FROM stock_movement
      JOIN document_map dm ON stock_movement.document_uuid = dm.uuid
      JOIN depot ON depot.uuid = stock_movement.depot_uuid
      LEFT JOIN depot AS dd ON dd.uuid = stock_movement.entity_uuid
    WHERE stock_movement.flux_id = ${toOtherDepotFluxId}
    GROUP BY document_uuid;
  `);

  const documentsCsv = await json2csv(allStockExitDocuments, { trimHeaderFields : true, trimFieldValues : true });
  const tmpDocumentsFile = tempy.file({ name : 'transfers.csv' });
  await fs.writeFile(tmpDocumentsFile, documentsCsv);
  debug(`Wrote ${allStockExitDocuments.length} transfer documents to temporary file: ${tmpDocumentsFile}`);

  debug(`Creating draft form for ODK`);

  const xlsxFormPath = path.join(__dirname, '../../../client/assets/pv-reception.xlsx');

  debug('Uploading', xlsxFormPath, 'to ODK Central.');

  const xmlFormId = 'bhima_pv_reception';

  // first, check if this form exists, and clear the form if it exists
  try {
    const hasForm = await central.api.getFormByProjectIdAndFormId(odkProjectId, xmlFormId);
    if (hasForm) {
      debug('Found an existing form.  Deleting it...');
      await central.api.forms.deleteForm(odkProjectId, xmlFormId);
    }
  } catch (e) {
    // ignore
    debug('No existing form found.');
  }

  // now we need to create a draft form on ODK Central
  const draft = await central.api.forms.createFormFromXLSX(odkProjectId, xlsxFormPath, xmlFormId);

  debug(`Created draft form "${draft.name}" (id: ${draft.xmlFormId}, version: ${draft.version}).  `);

  // let's add in the two attachments
  let result = await central.api.forms.addAttachmentToDraftForm(odkProjectId, xmlFormId, tmpDocumentsFile);
  debug(`Uploaded ${tmpDocumentsFile} with result success: ${result.success}`);

  result = await central.api.forms.addAttachmentToDraftForm(odkProjectId, xmlFormId, tmpLotsFile);
  debug(`Uploaded ${tmpLotsFile} with result success: ${result.success}`);

  // add the IMA icon to the form
  const srcIconFile = path.join(__dirname, '../../../client/assets/icon.png');
  result = await central.api.forms.addAttachmentToDraftForm(odkProjectId, xmlFormId, srcIconFile);
  debug(`Uploaded ${srcIconFile} with result success: ${result.success}`);

  // now lets publish our draft
  const published = await central.api.forms.publishDraftForm(odkProjectId, xmlFormId);
  debug(`Published with result success: ${published.success}`);

  // now lets give all app-users access to this form
  const allAppUsers = await central.api['app-users'].listAllAppUsers(odkProjectId);
  for (const user of allAppUsers) { // eslint-disable-line
    debug(`Assigning "Data Collector" role (id:${odkCentralRoles.dataCollector}) to ${user.displayName}.`);
    try {
      const { success }= await defineUserAsDataCollector(xmlFormId, user.id); // eslint-disable-line
      debug(`Role assigned to ${user.displayName} with success: ${success}`);
    } catch (e) {
      debug('User already defined.');
    }
  }

}

/**
 *
 *
 */
router.get('/', async (req, res, next) => {
  try {
    const settings = await db.exec(
      'SELECT * FROM odk_central_integration WHERE enterprise_id = ?;',
      [req.session.enterprise.id],
    );
    res.status(200).json(settings);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  const { enterprise } = req.session;
  const odk = req.body;

  try {
    await db.exec('DELETE FROM odk_central_integration WHERE enterprise_id = ?', [enterprise.id]);
    await db.exec('INSERT INTO odk_central_integration SET ?;', [{ ...odk, enterprise_id : enterprise.id }]);

    loadODKCentralSettingsFromDatabase();

    res.sendStatus(201);
  } catch (e) {
    next(e);
  }
});

router.post('/sync-submissions', async (req, res, next) => {
  try {
    await syncSubmissionsWithCentral(req.session.user);
    res.sendStatus(201);
  } catch (e) { next(e); }
});

router.post('/sync-app-users', async (req, res, next) => {
  try {
    await syncAppUsersWithCentral();
    res.sendStatus(201);
  } catch (e) { next(e); }
});

router.post('/sync-enterprise', async (req, res, next) => {
  try {
    await syncEnterpriseWithCentral();
    res.sendStatus(201);
  } catch (e) { next(e); }
});

router.post('/sync-forms', async (req, res, next) => {
  try {
    await syncFormsWithCentral();
    res.sendStatus(201);
  } catch (e) { next(e); }
});

// gets all mobile app users from central
router.get('/app-users', async (req, res, next) => {
  try {
    const config = await db.exec('SELECT odk_project_id FROM odk_central_integration;');
    const projectId = config.length && config[0].odk_project_id;

    //  if no configuration, return an empty object
    if (!projectId) {
      res.status(200).json({});
      return;
    }

    const appUsers = await central.api['app-users'].listAllAppUsers(projectId);
    res.status(200).json(appUsers);
  } catch (e) {
    next(e);
  }
});

// get user QR code
router.get('/app-users/:userId/qrcode', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const config = await db.exec('SELECT odk_project_id, odk_central_url FROM odk_central_integration;');
    const projectId = config.length && config[0].odk_project_id;

    const userDetails = await db.one(
      'SELECT odk_app_user_id AS odkAppUserId FROM odk_app_user WHERE bhima_user_id = ?', [userId],
    );

    const { odkAppUserId } = userDetails;
    const data = await central.api['app-users'].getQRCode(projectId, odkAppUserId);
    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
});

// gets the project settings from central
router.get('/project-settings', async (req, res, next) => {
  try {
    const config = await db.exec('SELECT odk_project_id FROM odk_central_integration;');

    const projectId = config.length && config[0].odk_project_id;

    //  if no configuration, return an empty object
    if (!projectId) {
      res.status(200).json({});
      return;
    }

    const project = await central.api.projects.getProjectById(projectId);
    res.status(200).json(project);
  } catch (e) { next(e); }
});

exports.router = router;
exports.loadODKCentralSettingsFromDatabase = loadODKCentralSettingsFromDatabase;
