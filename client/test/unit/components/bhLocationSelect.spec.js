/**
 * Created by Dedrick Kitamuka on 28/06/2016.
 */

describe('component Template and controller : bhLocationSelect', function () {
  var testData = {
    countries : [
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430A5', name : 'country 1'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430A6', name : 'country 2'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430A7', name : 'country 3'}
    ],

    provinces : [
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430A8', name : 'province 1', country_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A5'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430A9', name : 'province 2', country_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A5'},

      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430B1', name : 'province 3', country_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A6'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430B2', name : 'province 4', country_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A6'},

      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430B3', name : 'province 5', country_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A7'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430B4', name : 'province 6', country_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A7'}
    ],

    sectors : [
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430B5', name : 'sector 1', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A8'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430B6', name : 'sector 2', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A8'},

      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430B7', name : 'sector 3', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A9'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430B8', name : 'sector 4', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430A9'},

      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430B9', name : 'sector 5', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430B1'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430C1', name : 'sector 6', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430B1'},

      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430C2', name : 'sector 7', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430B2'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430C3', name : 'sector 8', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430B2'},

      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430C4', name : 'sector 9', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430B3'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430C5', name : 'sector 10', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430B3'},

      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430C6', name : 'sector 11', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430B4'},
      {uuid : '0x2C90F3C84EB146D39A5CDA180D1430C7', name : 'sector 12', province_uuid  : '0x2C90F3C84EB146D39A5CDA180D1430B4'}
    ],

    villages : [
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7E1', name : 'village 1', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B5'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7E2', name : 'village 2', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B5'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7E3', name : 'village 3', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B6'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7E4', name : 'village 4', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B6'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7E5', name : 'village 5', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B7'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7E6', name : 'village 6', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B7'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7E7', name : 'village 7', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B8'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7E8', name : 'village 8', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B8'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7E9', name : 'village 9', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B9'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7F1', name : 'village 10', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430B9'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7F2', name : 'village 11', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C1'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7F3', name : 'village 12', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C1'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7F4', name : 'village 13', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C2'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7F5', name : 'village 14', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C2'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7F6', name : 'village 15', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C3'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7F7', name : 'village 16', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C3'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7F8', name : 'village 17', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C4'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7F9', name : 'village 18', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C4'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7A1', name : 'village 19', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C5'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7A2', name : 'village 20', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C5'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7A3', name : 'village 21', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C6'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7A4', name : 'village 22', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C6'},

      {uuid : '0x03A329B203FE4F73B40F56A2870CC7A5', name : 'village 23', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C7'},
      {uuid : '0x03A329B203FE4F73B40F56A2870CC7A6', name : 'village 24', sector_uuid : '0x2C90F3C84EB146D39A5CDA180D1430C7'},
    ]
  };
  var componentController, element, scope, $compile;
  var template = `<bh-location-select id="location-id" location-uuid="initialVillageUuid"></bh-location-select>`;

  beforeEach(module('pascalprecht.translate', 'ngStorage', 'angularMoment', 'ui.bootstrap', 'bhima.services', 'bhima.components', 'templates'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$httpBackend_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;

    $httpBackend.whenGET('/locations/countries').respond(testData.countries);
    $httpBackend.whenRoute('GET', '/locations/detail/:uuid')
      .respond(function (method, url, data, headers, params) {
        var response = {};

        var village =  testData.villages.filter(function (village){ return village.uuid === params.uuid; })[0];
        var sector = testData.sectors.filter(function (sector){ return sector.uuid === village.sector_uuid; })[0];
        var province = testData.provinces.filter(function (province){ return province.uuid === sector.province_uuid; })[0];
        var country = testData.countries.filter(function (country){ return country.uuid === province.country_uuid; })[0];

        response.villageUuid = village.uuid;
        response.village = village.name;
        response.sector = sector.name;
        response.sectorUuid = sector.uuid;
        response.province = province.name;
        response.provinceUuid = province.uuid;
        response.country = country.name;
        response.countryUuid = country.uuid;

        return [200, response];
      });
    $httpBackend.whenRoute('GET', '/locations/provinces')
      .respond(function (method, url, data, headers, params) {
        var response;
        if(params.country){
          response = testData.provinces.filter(function (province){ return province.country_uuid === params.country;});
        }else{
          response = testData.provinces;
        }

        return [200, response];
      });
    $httpBackend.whenRoute('GET', '/locations/sectors')
      .respond(function (method, url, data, headers, params) {
        var response;
        if(params.province){
          response = testData.sectors.filter(function (sector){ return sector.province_uuid === params.province;});
        }else{
          response = testData.sectors;
        }

        return [200, response];
      });
    $httpBackend.whenRoute('GET', '/locations/villages')
      .respond(function (method, url, data, headers, params) {
        var response;
        if(params.sector){
          response = testData.villages.filter(function (village){ return village.sector_uuid === params.sector;});
        }else{
          response = testData.villages;
        }

        return [200, response];
      });

    scope.initialVillageUuid = testData.villages[0].uuid;
    element = $compile(angular.element(template))(scope);
    scope.$digest();
    componentController = element.controller('bhLocationSelect');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('Loads an initial village, sector, province, country, countries and country message correctly', function (){
    //This test case test indirectly the loadLocation and the loadCountries functions

    $httpBackend.flush();
    expect(Object.keys(componentController.village).length).to.be.equal(2);
    expect(Object.keys(componentController.sector).length).to.be.equal(2);
    expect(Object.keys(componentController.province).length).to.be.equal(2);
    expect(Object.keys(componentController.country).length).to.be.equal(2);
    expect(componentController.countries.length).to.be.equal(3);
    expect(componentController.messages.country).to.be.equal('FORM.SELECTS.SELECT_COUNTRY');
    expect(componentController.village).to.have.keys('uuid', 'village');
    expect(componentController.sector).to.have.keys('uuid', 'sector');
    expect(componentController.province).to.have.keys('uuid', 'province');
    expect(componentController.country).to.have.keys('uuid', 'country');
  });
  
  it('Tests that the methode loadVillages works correctly', function(){
    componentController.loadVillages();
    $httpBackend.flush();
    expect(componentController.villages.length).to.be.equal(2);
    expect(componentController.messages.village).to.be.equal('FORM.SELECTS.SELECT_VILLAGE');
  });

  it('Tests that the methode loadSectors works correctly', function () {
    componentController.loadSectors();
    $httpBackend.flush();
    expect(componentController.sectors.length).to.be.equal(2);
    expect(componentController.messages.sector).to.be.equal('FORM.SELECTS.SELECT_SECTOR');
  });

  it('Tests that the methode loadProvinces works correctly', function () {
    componentController.loadProvinces();
    $httpBackend.flush();
    expect(componentController.provinces.length).to.be.equal(2);
    expect(componentController.messages.province).to.be.equal('FORM.SELECTS.SELECT_PROVINCE');
  });
});
