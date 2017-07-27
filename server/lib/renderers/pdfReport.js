// API /entityLink/:codeRef/:language

// npm deps
const q = require('q');
const _ = require('lodash');
const uuid = require('node-uuid');

// module dependencies
const db = require('../../lib/db');
const FilterParser = require('../../lib/filter');
const NotFound = require('../../lib/errors/NotFound');
const BadRequest = require('../../lib/errors/BadRequest');
const identifiers = require('../../config/identifiers');

exports.refenreceTransaction=refenreceTransaction;
//


//loading identifiers keyies, used for defining the table name
const identifiersIndex = {};
function indexIdentifiers() {
  _.forEach(identifiers, (entity) => {
    identifiersIndex[entity.key] = entity;
  });
}
 

//This function render a report in the browser
//It takes a transaction reference code as paramter and the language
//The reference code is a combination of table_key.project_abbr.reference
//The table name is variable, it can be :invoice, cash or voucher

function refenreceTransaction(req,res,next){
   
  //loading identifiers keyies, used for defining the table name
  indexIdentifiers();

  var codeRef =  req.params.codeRef.split(".");
  const language= req.params.language;

  const code = codeRef[0];
  const projectName=codeRef[1];
  const refence=codeRef[2];
  const documentDefinition = identifiersIndex[code];
   
  const query = `
    SELECT BUID(uuid) as uuid FROM ${documentDefinition.table}  tb, project p 
    WHERE tb.project_id=p.id AND p.abbr=? AND tb.reference=?
  `;
  
  // search for full UUID
  db.one(query,[projectName,refence])
    .then(result =>
      {
        let uuid=result.uuid;
        let url= `${documentDefinition.documentPath}${uuid}?lang=${language}&renderer=pdf`;
        res.redirect(url);
      }
    ).catch((error)=>{
      res.send({'message':'an error occured'});
    }).done();
}