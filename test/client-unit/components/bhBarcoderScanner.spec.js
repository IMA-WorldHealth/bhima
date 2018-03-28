/* eslint no-unused-expressions:off */
/* global inject, expect, chai */

describe('bhBarcodeScanner', bhBarcodeScannerTests);

function bhBarcodeScannerTests() {
  const template = `
    <bh-barcode-scanner on-scan-callback="callback(record)">
    </bh-barcode-scanner>
  `;

  // make sure the modules are correctly loaded.
  beforeEach(module('pascalprecht.translate', 'bhima.services', 'templates', 'bhima.components', 'angularMoment'));

  let $scope;
  let $compile;
  let element;

  let $timeout;
  let Barcode;
  let Q;

  const record = { uuid : 1, reference : 'Example Reference' };

  // utilities
  const find = (elm, selector) => elm[0].querySelector(selector);
  const isHidden = e => angular.element(e).hasClass('ng-hide');

  beforeEach(inject((_$rootScope_, _$compile_, _$timeout_, _$window_, _BarcodeService_, $q) => {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $timeout = _$timeout_;

    // spy on the barcode service's search() method
    Barcode = _BarcodeService_;
    Barcode.search = chai.spy(() => $q.resolve(record));
    Q = $q;

    element = $compile(angular.element(template))($scope);

    // Internally, the component uses $window.document.getElementById(). This
    // captures the call and re-writes to search within the element under test.
    // Mock the document.getElementById call in the setFocusOnHiddenInput() call.
    _$window_.document.getElementById = (id) => find(element, `#${id}`);

    // spy on the onScanCallback
    $scope.callback = chai.spy();

    $scope.$digest();
  }));

  // TODO - how do you find a focused element?
  it('has a hidden input for the barcode', () => {
    const input = find(element, '#hidden-barcode-input');
    expect(input.height).to.equal(0);
    expect(input.width).to.equal(0);
  });

  it('has a hidden reset button by default', () => {
    const btn = find(element, '[data-method="reset"]');
    expect(isHidden(btn)).to.equal(true);
  });

  it('shows the reset button if focus is lost from the input', () => {
    const btn = find(element, '[data-method="reset"]');
    expect(isHidden(btn)).to.equal(true);

    const input = find(element, '#hidden-barcode-input');
    angular.element(input).triggerHandler('blur');
    $scope.$digest();

    expect(isHidden(btn)).to.equal(false);
  });

  it('hides the reset button when it is pressed', () => {
    const btn = find(element, '[data-method="reset"]');
    const input = find(element, '#hidden-barcode-input');
    angular.element(input).triggerHandler('blur');

    // make sure the button becomes visible after blur
    $scope.$digest();
    expect(isHidden(btn)).to.equal(false);

    angular.element(btn).triggerHandler('click');
    $timeout.flush();
    $scope.$digest();
    $timeout.verifyNoPendingTasks();

    expect(isHidden(btn)).to.equal(true);
  });

  it('calls the barcode API when something is typed in the input', () => {
    const input = find(element, '#hidden-barcode-input');
    const ngModel = angular.element(input).controller('ngModel');

    const barcodeValue = '123456789';
    ngModel.$setViewValue(barcodeValue);

    // Note - the input id debounced, so we flush the timeout to force the
    // ngChange to fire.
    $timeout.flush();
    $scope.$digest();

    expect(Barcode.search).to.have.been.called.with(barcodeValue);
  });

  it('calls onScanCallback() upon a successful scan', () => {
    const input = find(element, '#hidden-barcode-input');
    const ngModel = angular.element(input).controller('ngModel');

    const barcodeValue = '123456789';
    ngModel.$setViewValue(barcodeValue);

    // Note - the input id debounced, so we flush the timeout to force the
    // ngChange to fire.
    $timeout.flush();
    $scope.$digest();

    expect($scope.callback).to.have.been.called.with(record);
  });

  it('does not call onScanCallback() if a failure occured', () => {
    // mock a failure method
    Barcode.search = () => Q.reject();

    const input = find(element, '#hidden-barcode-input');
    const ngModel = angular.element(input).controller('ngModel');

    const barcodeValue = '123456789';
    ngModel.$setViewValue(barcodeValue);

    // Note - the input id debounced, so we flush the timeout to force the
    // ngChange to fire.
    $timeout.flush();
    $scope.$digest();

    expect($scope.callback).to.have.not.been.called;
  });
}
