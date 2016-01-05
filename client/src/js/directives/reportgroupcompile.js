angular.module('bhima.directives')
.directive('reportGroupCompile', ['$compile', function($compile) {

  //TODO Currently tries too hard to use generic templating and ends up being a tightly coupled (slow) operation
  //replace with functions that build array templates and join()
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var built = false, template = [];
      var groupModel = attrs.groupModel, tableDefinition = attrs.tableDefinition;
      var accountRowTemplate = '<tr><td style=\'text-align: right;\'>%d</td><td %s>%s</td>%s</tr>';
      var accountTotalTemplate = '<tr><td></td><td %s\'>%s</td>%s</tr>';

      if (groupModel && tableDefinition) {
        scope.$watch(groupModel, function(nval) {
          if (!built && nval.length > 0) {
            buildTable(nval); //Remove directive $watch
          }
        }, true);
      }

      function buildTable(data) {
        built = true;
        parseGroup(data);

        //TODO append to element vs replace (attach to tbody)
        element.replaceWith($compile(template.join(''))(scope));
      }

      function parseGroup(accountGroup) {
        accountGroup.forEach(function(account) {
          var detail = account.detail, style = buildAccountStyle(detail);

          //Row for group detail
          template.push(printf(accountRowTemplate, detail.account_number, style, detail.account_txt, buildAccountColumns(detail, false)));
          if (!account.accounts) { return; }

          //Group children
          parseGroup(account.accounts);

          //Total row
          template.push(printf(accountTotalTemplate, printf('style=\'padding-left: %dpx; font-weight: bold;\'', detail.depth * 30), 'Total ' + detail.account_txt, buildAccountColumns(detail, true)));
        });
      }

      function buildAccountStyle(detail) {

        //FIXME hardcoded account type definition
        var styleTemplate = '',
            colspanTemplate = '',
            classTemplate = '',
            title = (detail.account_type_id === 3);

        styleTemplate = printf('style=\'padding-left: %dpx;\'', detail.depth * 30);
        if (title) {
          colspanTemplate = printf('colspan=\'%d\'', scope[tableDefinition].columns.length + 1);
          classTemplate = 'class="reportTitle"';
        }
        return printf('%s %s %s', styleTemplate, colspanTemplate, classTemplate);
      }

      function buildAccountColumns(detail, isTotal) {
        if (detail.account_type_id === 3 && !isTotal) {
          return '';
        }

        var columnTemplate = [], data = isTotal ? detail.total : detail;
        scope[tableDefinition].columns.forEach(function(column) {
          columnTemplate.push(printf('<td %s>{{%d | currency}}</td>', (isTotal ? 'style="font-weight: bold;"' : ''), data[column.key] || 0));
        });
        return columnTemplate.join('');
      }

      //Naive templating function
      function printf(template) {
        var typeIndex = [], tempTemplate = template, shift = 0;
        var replaceArguments = [];
        var types = {
          '%s' : '[object String]',
          '%d' : '[object Number]',
          '%l' : '[object Array]'
        };

        //read arguments - not sure how much 'use strict' aproves of this
        for(var i = 1; i < arguments.length; i += 1) {
          replaceArguments.push(arguments[i]);
        }

        Object.keys(types).forEach(function(matchKey) {
          var index = tempTemplate.indexOf(matchKey);
          while(index >= 0) {
            typeIndex.push({index: index, matchKey: matchKey});
            tempTemplate = tempTemplate.replace(matchKey, '');
            index = tempTemplate.indexOf(matchKey);
          }
        });

        typeIndex.sort(function(a, b) { return a.index > b.index; });
        typeIndex.forEach(function(replaceObj, index) {
          var targetArg = replaceArguments[index];
          if (Object.prototype.toString.call(targetArg) !== types[replaceObj.matchKey]) {
            throw new Error('Argument ' + targetArg + ' is not ' + types[replaceObj.matchKey]);
          }
          template = template.replace(replaceObj.matchKey, targetArg);
          shift += targetArg.length;
        });
        return template;
      }
    }
  };
}]);
