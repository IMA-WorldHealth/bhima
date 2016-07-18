/**
 * Created by Dedrick Kitamuka on 23/06/2016.
 */
/* jshint expr: true */
/* global inject, expect, chai */
describe('component : bhBreadCrumb', function () {
  //two different spy for clarity
  var buttonSpy = chai.spy();
  var dropDownSpy = chai.spy();

  var breadCrumb = {
    path : [
      { id : 'firstlink', label: 'path1', link: '#/path1_link_to_go' },
      { label: 'path2', link: '#/path2_link_to_go' },
      { label: 'path3', link: '#/path3_link_to_go', current: true }
    ],

    button : [
      { id : 'printbtn', icon: 'glyphicon glyphicon-print', label: 'Print', action: buttonSpy },
      { id : 'repeatbtn', icon: 'glyphicon glyphicon-repeat', label: 'Repeat', action: buttonSpy, color: 'btn-danger' },
      { id : 'refreshbtn', icon: 'glyphicon glyphicon-refresh', label: 'Refresh', action: buttonSpy}
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
          { id : 'optionFranc', label : 'Fc', action : dropDownSpy },
          { id : 'optionDollar', label : '$', action : dropDownSpy }
        ]
      },

      {
        id : 'dropdowntwo',
        label : 'Dropdown 2',
        color : 'btn-success',
        option : [
          { id : 'long', label : 'item1 dd2 with a too long text that you can imagine', action : dropDownSpy },
          { id : 'short', label : 'item2 dd2', action : dropDownSpy}
        ]
      }
    ]
  }, component;

  var element, scope, $compile;

  var template = `
    <bh-breadcrumb
      path="config.path"
      button="config.button",
      label="config.label",
      dropdown="config.dropdown">
    </bh-breadcrumb>`;

  beforeEach(module('pascalprecht.translate', 'ngStorage', 'angularMoment', 'bhima.services', 'bhima.components', 'templates'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$componentController_) {
      scope = _$rootScope_.$new();
      $compile = _$compile_;
      component = _$componentController_('bhBreadcrumb', null, {
        label : breadCrumb.label,
        button : breadCrumb.button,
        dropdown : breadCrumb.dropdown,
        path : breadCrumb.path
      });
  }));

  it('receives path data correctly', function (){
    expect(component.path.length).to.be.equal(3);
  });

  it('receives button data correctly', function (){
    expect(component.button.length).to.be.equal(3);
  });

  it('receives label data correctly', function (){
    expect(component.label.length).to.be.equal(3);
  });

  it('receives dropdown data correctly', function (){
    expect(component.dropdown.length).to.be.equal(2);
  });

  it('fires methods passed in through the button parameters', function () {

    // assign configuration object to scope and init it
    scope.config = breadCrumb;
    element = $compile(angular.element(template))(scope);
    scope.$digest();

    scope.config.button.forEach(function (btn) {
      $(element).find('#' + component.prefix + btn.id).click();
      expect(buttonSpy).to.have.been.called.with(btn.label);
    });

    expect(buttonSpy).to.have.been.called.exactly(scope.config.button.length);
  });

  it('fires the action on a dropdown using the dropdownHelper method', function () {

    scope.config = breadCrumb;
    element = $compile(angular.element(template))(scope);
    scope.$digest();

    scope.config.dropdown.forEach(function (dropDownElement) {

      dropDownElement.option.forEach(function (opt) {
        $(element).find('#' + component.prefix + opt.id)[0].click();
        expect(dropDownSpy).to.have.been.called.with(opt);
      });
    });
  });
});
