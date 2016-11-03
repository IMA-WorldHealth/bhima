const db          = require('../../lib/db');
const BadRequest  = require('../../lib/errors/BadRequest');

const subscriptions = {
  debtor_billing_service : {
    entity  : 'debtor_group_uuid',
    map     : 'billing_service_id'
  }
};

function updateSubscription(req, res, next) {
  // TODO remove the concept of ids or uuids on linking tables
  const id = req.params.id;
  const subscriptionKey = req.params.key;
  const subscriptionDetails = subscriptions[key];
  const subscriptions = req.body.subscriptions;

  if (!subscriptionDetails) {
    throw new BadRequest(`Cannot find details for ${key} subscription`, 'ERROR.ERR_MISSING_INFO');
  }
  if (!subscriptions) {
    throw new BadRequest(`Request must specify a "subscriptions" object containing an array of entity ids`, 'ERROR.ERR_MISSING_INFO');
  }



}
