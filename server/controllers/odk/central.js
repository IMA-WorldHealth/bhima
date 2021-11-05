/**
 * Handlers for ODK CENTRAL API ENDPOINTS
 */
const axios = require('axios');

const {
  ODK_CENTRAL_SERVER,
  ODK_CENTRAL_WEB_EMAIL,
  ODK_CENTRAL_WEB_PASSWORD,
} = process.env;

const api = {
  sessions : `${ODK_CENTRAL_SERVER}/v1/sessions`,
  users : `${ODK_CENTRAL_SERVER}/v1/users`,
  projects : `${ODK_CENTRAL_SERVER}/v1/projects`,
};

const config = {
  headers : { 'X-Extended-Metadata' : true },
};

const loggingIn = async () => {
  if (!ODK_CENTRAL_SERVER) { return {}; }

  const parameters = {
    email : ODK_CENTRAL_WEB_EMAIL,
    password : ODK_CENTRAL_WEB_PASSWORD,
  };
  const response = await axios.post(api.sessions, parameters);
  const token = response && response.data && response.data.token ? response.data.token : null;
  config.headers = { ...config.headers, Authorization : `Bearer ${token}` };
  return response.data;
};

const loggingOut = async (token) => {
  if (!ODK_CENTRAL_SERVER || !token) { return null; }

  const response = await axios.delete(`${api.sessions}/${token}`, config);
  return response;
};

const currentUserDetails = async () => {
  const response = await axios.get(`${api.users}/current`, config);
  return response.data;
};

const currentUserProjects = async () => {
  const response = await axios.get(`${api.projects}`, config);
  return response.data;
};

const forms = async (projectId) => {
  const response = await axios.get(`${api.projects}/${projectId}/forms`, config);
  return response.data;
};

/**
 * // Official route gives only submissions summary, for real data sent you MUST use the synthax bellow
 * // Route for more information on data submitted
 * // Note that the form unique name MUST finished with .svc and capital S for Submissions
 * @example /v1/projects/2/forms/ima_foyers_ameliores.svc/Submissions?$top=250&$skip=0&$count=true&$wkt=true
 * @param {number} projectId the project id
 * @param {string} formId the form unique name
 * @returns {object}
 */
const submissions = async (projectId, formId) => {
  const options = { ...config, params : { $expand : '*' } };
  const response = await axios.get(
    `${api.projects}/${projectId}/forms/${formId}.svc/Submissions`,
    options,
  );
  return response.data;
};

exports.forms = forms;
exports.currentUserDetails = currentUserDetails;
exports.currentUserProjects = currentUserProjects;
exports.submissions = submissions;
exports.loggingIn = loggingIn;
exports.loggingOut = loggingOut;
