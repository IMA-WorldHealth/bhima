/**
 * @module odk-central
 *api.
 * @description
 * This module contains the ODK Central API.
 */

const router = require('express').Router();
const debug = require('debug')('bhima:plugins:odk-central');
const _ = require('lodash');
const { json2csvAsync } = require('json-2-csv');
const tempy = require('tempy');
const fs = require('fs/promises');
const qrcode = require('qrcode');
const pako = require('pako');

const central = require('@ima-worldhealth/odk-central-api-cjs');
const db = require('../../lib/db');
const util = require('../../lib/util');
const core = require('../stock/core');

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

// BUILD QRCODE
async function buildQRCode(url, token, projectId, projectName) {
  const data = {
    general : {
      server_url : `${url}/v1/key/${token}/projects/${projectId}`,
      constraint_behavior : 'on_finalize',
    },
    admin : {
      edit_saved : false,
    },
    project : {
      name : projectName,
      icon : 'P',
      color : '#ff0000',
    },
  };

  const Uint8Array = new TextEncoder('utf-8').encode(JSON.stringify(data));
  const compressedSettings = pako.deflate(Uint8Array, { to : 'string' });
  const encodedS64 = Buffer.from(compressedSettings).toString('base64');

  return qrcode.toDataURL(encodedS64);
}
// END BUILD QRCODE

// utility function to format email addresses
function formatEmailAddr(email, enterpriseLabel) {
  const [username, host] = email.split('@');
  return `${username}+${enterpriseLabel}@${host}`;
}

function unformatEmailAddr(email) {
  const [username, host] = email.split('@');
  const [prefix] = username.split('+');
  return `${prefix}@${host}`;
}

async function defineUserAsDataCollector(userId) {
  const odkProject = await db.one('SELECT odk_project_id AS id FROM odk_central_integration LIMIT 1;');

  await central.api.users.assingUserToProjectRole(odkProject.id, odkCentralRoles.dataCollector, userId);
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
 * @function syncUsersWithCentral
 *
 * @description
 * This function synchronizes user accounts with ODK Central if a configuration exists.
 */
async function syncUsersWithCentral() {
  debug('Syncing BHIMA users with ODK Central users.');

  // look for all users with depot permissions in the database
  const users = await db.exec(`
    SELECT user.id, user.display_name, user.email
    FROM user WHERE user.deactivated <> 1 AND user.id NOT IN (
      SELECT bhima_user_id FROM odk_user
    ) AND user.id IN (SELECT user_id FROM depot_permission);
  `);

  // TODO(@jniles) LIMIT 1 is a hack.
  const enterprise = await db.one('SELECT * FROM enterprise LIMIT 1');

  debug(`There are ${users.length} users available in BHIMA.`);

  // pull the latest users from ODK Central.
  const centralUsers = await central.api.users.listAllUsers();

  debug(`There are ${centralUsers.length} users available in ODK Central.`);

  // get only central email addresses to use as a filter mask
  const centralEmails = centralUsers.map(user => unformatEmailAddr(user.email));

  debug(`Filtering out existing ODK Central users.`);

  // filter out all users who already have an email address in central
  const usersToCreate = users.filter(user => !centralEmails.includes(formatEmailAddr(user.email, enterprise.label)));

  debug(`Found ${usersToCreate.length} users to create.`);

  // loop through users and create them in ODK Central.
  for (const user of usersToCreate) { // eslint-disable-line
    const password = util.uuid();
    const email = formatEmailAddr(user.email, enterprise.name);
    debug(`Creating user ${email}.`);
    // only for web user
    // eslint-disable-next-line
    const centralUser = await central.api.users.createUserWithPassword(email, password);

    // only for web user
    // eslint-disable-next-line
    await defineUserAsDataCollector(centralUser.id);

    // eslint-disable-next-line
    await db.exec('INSERT INTO `odk_user` VALUES (?, ?, ?);', [centralUser.id, password, user.id]);
    debug(`Finished with user ${email}.`);
  }

  debug(`Created ${usersToCreate.length} users in ODK Central.`);
}

/**
 * @function syncUsersWithCentral
 *
 * @description
 * This function synchronizes user accounts with ODK Central if a configuration exists.
 */
async function syncAppUsers() {
  debug('Syncing BHIMA users with ODK Central app users.');

  // look for all users with depot permissions in the database
  const users = await db.exec(`
    SELECT user.id, user.display_name, user.email
    FROM user WHERE user.deactivated <> 1 AND user.id NOT IN (
      SELECT bhima_user_id FROM odk_app_user
    ) AND user.id IN (SELECT user_id FROM depot_permission);
  `);

  const config = await db.exec('SELECT odk_project_id FROM odk_central_integration LIMIT 1;');
  const projectId = config.length && config[0].odk_project_id;

  debug(`There are ${users.length} users available in BHIMA.`);

  // pull the latest app users from ODK Central.
  const centralUsers = await central.api.users.listAllAppUsers(projectId);

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
    const centralAppUser = await central.api.users.createAppUser(projectId, user.display_name);

    // eslint-disable-next-line
    await db.exec('INSERT INTO `odk_app_user` VALUES (?, ?, ?, ?);', [centralAppUser.id, centralAppUser.token, user.display_name, user.id]);
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

/**
 * @function syncDepotsWithCentral
 *
 * @description
 * This creates a stock exit form for each depot in the application.
 * The strategy is to upload an XLSX form that
 *
 */
async function syncDepotsWithCentral() {
  debug('Synchronizing depots with ODK Central');

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
          'uuid', 'lot_description', 'label', 'depot_text', 'depot_uuid',
          'text', 'unit_type', 'group_name', 'quantity', 'code', 'invenetory_uuid',
        ]),
      ),
    );
  }

  // generate a CSV and store it in a temporary file so we can upload to ODK Central later
  const lotsCsv = await json2csvAsync(data, { trimHeaderFields : true, trimFieldValues : true });
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
      depot.text AS depot_text,
      CONCAT(dm.text, " (", DATE_FORMAT(MAX(date), "%Y-%m-%d"), ") - ", COUNT(*), " produits") AS label
    FROM stock_movement
      JOIN document_map dm ON stock_movement.document_uuid = dm.uuid
      JOIN depot ON depot.uuid = stock_movement.depot_uuid
    WHERE stock_movement.flux_id = ${toOtherDepotFluxId}
    GROUP BY document_uuid;
  `);

  const documentsCsv = await json2csvAsync(allStockExitDocuments, { trimHeaderFields : true, trimFieldValues : true });
  const tmpDocumentsFile = tempy.file({ name : 'transfers.csv' });
  await fs.writeFile(tmpDocumentsFile, documentsCsv);
  debug(`Wrote ${allStockExitDocuments.length} transfer documents to temporary file: ${tmpDocumentsFile}`);

  debug(`Creating draft form for ODK`);

  // central.api.forms.createFormFromXLSXFile(odkProjectId);

  // now we need to create a draft form on ODK Central

  // now lets upload the latest lots to our draft

  // now lets publish our draft

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

// add routes
// @jniles - I'm using GET because I'm lazy
router.post('/sync-users', async (req, res, next) => {
  try {
    await syncUsersWithCentral();
    res.sendStatus(201);
  } catch (e) { next(e); }
});

router.post('/sync-app-users', async (req, res, next) => {
  try {
    await syncAppUsers();
    res.sendStatus(201);
  } catch (e) { next(e); }
});

router.post('/sync-enterprise', async (req, res, next) => {
  try {
    await syncEnterpriseWithCentral();
    res.sendStatus(201);
  } catch (e) { next(e); }
});

router.post('/sync-depots', async (req, res, next) => {
  try {
    await syncDepotsWithCentral();
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

    const appUsers = await central.api.users.listAllAppUsers(projectId);
    res.status(200).json(appUsers);

  } catch (e) {
    next(e);
  }
});

// get user qr code
router.get('/app-users/:userId/qrcode', async (req, res, next) => {
  try {
    const { userId } = req.params;

    const config = await db.exec('SELECT odk_project_id, odk_central_url FROM odk_central_integration;');
    const projectId = config.length && config[0].odk_project_id;
    const url = config.length && config[0].odk_central_url;

    const userDetails = await db.one(
      'SELECT odk_app_user_token AS token FROM odk_app_user WHERE bhima_user_id = ?', [userId],
    );
    const { token } = userDetails;

    const data = await buildQRCode(url, token, projectId, req.session.enterprise.name);
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
