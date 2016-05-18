var wkhtmltopdf = require('wkhtmltopdf');

var html = require('./html');

var path = require('path');
var q = require('q');
var streamToPromise = require('stream-to-promise');

var process = require('process');

var root = process.cwd();

exports.render = renderPDF;

function renderPDF(context, template, options) {

  // pdf requires absolute path to be passed to templates to be picked up by wkhtmltopdf on windows
  context.absolutePath = path.join(root, 'client');

  console.log('using path', context.absolutePath);

  return html.render(context, template)
    .then(function (result) {
      // var deferred = q.defer();

      console.log('got html result success mayn', result);

      /** @todo move to function */
      // return streamToPromise(wkhtmltopdf(result, {}));
      //
      return streamToPromise(wkhtmltopdf(result));

      // return deferred.promise;
    });
}

exports.headers = {
  'Content-Type' : 'application/pdf'
};
