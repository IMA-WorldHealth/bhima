const fs = require('fs');
let sf = require('../../client/src/i18n/fr.json');

let properties = Object.keys(sf);

properties.forEach(function (property) {
  var f = fs.openSync('../../client/src/i18n/fr/' + property.toLowerCase() + '.json', 'w');
  var obj = {};
  obj[property] = sf[property];
  let objAsString = JSON.stringify(obj);
  
  let res = objAsString.split(',').join(',\n');
  
  fs.writeFileSync(f, res, 'utf-8');
});

