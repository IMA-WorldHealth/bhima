/** 
 * Invoice Receipt Controller
 *
 * This controller is responsible for collecting information required by a 
 * patient invoice receipt. This information is passed to a renderer 
 * according the standard report format and returned to the client (based 
 * on the clients request).
 * 
 * @todo  rename internal lookup method
 *        Invoices.lookupSale -> Invoices... 
 * @todo  get balance information on the invoice
 * @module finance/reports
 */
var uuid        = require('node-uuid');
var q           = require('q');
var _           = require('lodash');

var db          = require('../../../lib/db');
var NotFound    = require('../../../lib/errors/NotFound');
var BadRequest  = require('../../../lib/errors/BadRequest');
  
var Invoices    = require('../patientInvoice.js');
var Patients    = require('../../medical/patient.js');

const FLAG_TRUE = 1;

const SUCCESS_STATUS = 200;

exports.build = build;
 
/** 
 * HTTP Request Method
 *
 * Returns a compiled object that adheres to the reports standards 
 * 
 * ```
 * { 
 *   header : ...
 *   data   : ... 
 *   meta   : ...
 * }
 */
function build(req, res, next) { 
  var queryString = req.query;
  var invoiceUuid = req.params.uuid; 
  var invoiceResponse = {};

  if (queryString.minimal === FLAG_TRUE) { 
    
    // update accordingly
  }
  
  reportData(invoiceUuid)
    .then(function (result) { 
      var recipientUuid = result.patient_uuid;
      _.extend(invoiceResponse, result);
      
      return headerData(recipientUuid);
    })
    .then(function (result) { 
      invoiceResponse.recipient = result;

      res.status(SUCCESS_STATUS).send(invoiceResponse);
    })
    .catch(next)
    .done();
}

function headerData(patientUuid) { 

  /*
  var headerRequests = { 
    recipient : Patients.lookupPatient(patientUuid)
  }
  
  return q.all(_.values(headerRequests))
    .then(function (results) { 
      return _.keyBy(results, (o, i) => _.keys(headerRequest)[i]); 
    });
  */
  return Patients.lookupPatient(patientUuid);
}

function reportData(uuid) { 
  return Invoices.lookupSale(uuid);
}

function metaData() { 

}
// function footerData
