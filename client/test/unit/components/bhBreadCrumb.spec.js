/**
 * Created by Dedrick Kitamuka on 23/06/2016.
 */
describe('component : bhBreadCrumb', function () {

    var spy = chai.spy();

    var breadCrumb = {
      path : [
        { id : 'firstlink', label: 'path1', link: '#/path1_link_to_go' },
        { label: 'path2', link: '#/path2_link_to_go' },
        { label: 'path3', link: '#/path3_link_to_go', current: true }
      ],

      button : [
        { id : 'printbtn', icon: 'glyphicon glyphicon-print', label: 'Print', action: spy },
        { id : 'repeatbtn', icon: 'glyphicon glyphicon-repeat', label: 'Repeat', action: spy, color: 'btn-danger' },
        { id : 'refreshbtn', icon: 'glyphicon glyphicon-refresh', label: 'Refresh', action: spy}
      ],

      label : [
        { icon: 'glyphicon glyphicon-print', label: 'My Label 1' },
        { label: 'My label 2' },
        { label: 'My label 3' }
      ],

      dropdown : [
        {
          id : 'dropdownone',
          label : 'Dropdown 1',
          color : 'btn-primary',
          option : [
            { id : 'optionFranc', label : 'Fc', action : spy },
            { id : 'optionDollar', label : '$', action : spy }
          ]
        },

        {
          label : 'Dropdown 2',
          color : 'btn-success',
          option : [
            { label : 'item1 dd2 with a too long text that you can imagine', action : function (item){ return item.label;} },
            { label : 'item2 dd2', action : function (item){ return item.label;}}
          ]
        }
      ]
    };

    beforeEach(module('pascalprecht.translate', 'ngStorage', 'angularMoment', 'bhima.services', 'bhima.components', 'templates'));

    var element;
    var scope, $compile, $location, $controller;
    beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_, _$location_, _$controller_) {
      scope = _$rootScope_.$new();
      $compile = _$compile_;
      $location = _$location_;
      $controller = _$controller_;

      // _$templateCache_.put('partials/templates/breadcrumb.tmpl.html', breadcrumbTemplate);
    }));

    it('fires methods passed in through the button parameters', function () {
      let template = `
        <bh-breadcrumb
          path="config.path"
          button="config.button",
          label="config.label",
          dropdown="config.dropdown">
        </bh-breadcrumb>`;

      // assign configuration object to scope
      scope.config = breadCrumb;

      element = $compile(angular.element(template))(scope);
      scope.$digest();

      // 1. find the button by id
      // 2. call the .click() method on the button
      // 3. check that the spy has been called
    });

    it('fires the action on a dropdown using the dropdownHelper method', function () {
      // perform the same action as buttons but with the dropdown
    });
});
