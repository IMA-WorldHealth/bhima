/**
 * @module odk-central
 *
 * @description
 * This module contains the ODK Central API.
 *
 *
 */

const debug = require('debug')('bhima:plugins:odk-central');
const db = require('../../lib/db');
const util = require('../../lib/util');

let central;

// because the ODK Central API is ESM, we must use a dynamic import()
// instead of require().
setupODKCentralConnection();
async function setupODKCentralConnection() {
  debug('initializing ODK Central link.');

  // eslint-disable-next-line
  central = await import('@ima-worldhealth/odk-central-api'); 

  // load the configuration from database if it exists
  await loadODKCentralSettingsFromDatabase();
}

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

  try {

    // look for all users with depot permissions in the database
    const users = await db.exec(`
    SELECT user.id, user.display_name, user.email
    FROM user WHERE user.deactivate <> 1 AND user.id NOT IN (
      SELECT bhima_user_id FROM odk_user
    ) AND user.id IN (SELECT user_id FROM depot_permission);
  `);

    const enterprise = await db.one('SELECT * FROM enterprise');

    debug(`There are ${users.length} users available in BHIMA.`);

    // pull the latest users from ODK Central.
    const centralUsers = await central.users.listAllUsers();

    debug(`There are ${centralUsers.length} users available in ODK Central.`);

    // get only central email addresses to use as a filter mask
    const centralEmails = centralUsers.map(user => unformatEmailAddr(user.email));

    debug(`Filtering out existing ODK Central users.`);

    // filter out all users who already have an email address in central
    const usersToCreate = users.filter(user => centralEmails.includes(formatEmailAddr(user.email, enterprise.label)));

    debug(`Found ${usersToCreate.length} users to create.`);

    // loop through users and create them in ODK Central.
    for (const user of usersToCreate) { // eslint-disable-line
      const password = util.uuid();
      const email = formatEmailAddr(user.email, enterprise.name);
      debug(`Creating user ${email}.`);
      // eslint-disable-next-line
      const centralUser = await central.users.createUserWithPassword(email, password);
      // eslint-disable-next-line
      await db.exec('INSERT INTO `odk_user` VALUES (?, ?, ?);', [centralUser.id, password, user.id]);
      debug(`Finished with user ${email}.`);
    }

    debug(`Created ${usersToCreate.length} users in ODK Central.`);
  } catch (e) {
    debug('An error occurred:', e);
  }
}

/**
 * @function syncEnterpriseWithCentral
 */
async function syncEnterpriseWithCentral() {
  debug('Synchronizing BHIMA enterprise with ODK Central');
  try {
    const settings = await db.exec('SELECT * FROM odk_central_integration WHERE odk_project_id IS NULL;');

    if (!settings.length) {
      debug('Nothing to sync.  Ignoring');
      return;
    }

    const [enterprise] = await db.exec('SELECT * FROM enterprise;');

    debug(`Creating a project on ODK Central for ${enterprise.name}.`);

    const result = await central.project.createProject(enterprise.name);

    debug(`Created project on central with id: ${result.id}.`);

    await db.exec('UPDATE odk_central_integration SET odk_project_id = ? WHERE enterprise_id = ?;', [result.id, enterprise.id]);
  } catch (e) {
    debug('An error occured:', e);
  }

  debug(`Finished synchronizing projects and enterprises.`);
}

/**
 * @function syncDepotsWithCentral
 *
 * @description
 * This creates a stock entry and stock exit form for each depot in the application.
 */
async function syncDepotsWithCentral() {

}

/**
 *
 *
 *
 */
async function pullStockMovementsFromCentral() { }

exports.syncUsersWithCentral = syncUsersWithCentral;
exports.syncDepotsWithCentral = syncDepotsWithCentral;
exports.syncEnterpriseWithCentral = syncEnterpriseWithCentral;
exports.loadODKCentralSettingsFromDatabase = loadODKCentralSettingsFromDatabase;
