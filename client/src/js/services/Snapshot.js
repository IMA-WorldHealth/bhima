
angular.module('bhima.services')
.service('SnapshotService', SnapshotService);

SnapshotService.$inject = ['$uibModal', '$http'];

function SnapshotService($uibModal, $http) {

var service = this;
service.dataUriToFile = dataUriToFile;
service.openWebcamModal = openWebcamModal;

function openWebcamModal() {
  return $uibModal.open({
    templateUrl : 'modules/templates/bhSnapShot.html',
    controller : snapshotController,
    controllerAs : 'snapshotCtrl',
    backdrop     : 'static',
    animation    : false,
    size : 'lg',
  }).result;
}

// convert the data_url to a file object
function dataUriToFile(dataUri, fileName, mimeType) {
  return (
    $http.get(dataUri, { responseType : 'arraybuffer' })
      .then(function (res) {
        return res.data;
      })
      .then(function(buf) {
        return new File([buf], fileName, { type : mimeType });
      })
  );
}


return service;
}


// the controler for this service

angular.module('bhima.controllers').controller('snapshotController', snapshotController);

snapshotController.$inject = ['$uibModalInstance'];

function snapshotController($uibModalInstance) {
var vm = this;
var _video = null;
var patData = null;

vm.showDemos = false;
vm.mono = false;
vm.invert = false;
vm.hasDataUrl = false;


// Setup a channel to receive a video property
// with a reference to the video element
// See the HTML binding in main.html
vm.channel = {};

vm.webcamError = false;
vm.onError = function (err) {
  vm.webcamError = err;
};

vm.onSuccess = function () {
  // The video element contains the captured camera data
  _video = vm.channel.video;
  vm.patOpts = { x : 0, y : 0, w : _video.width, h :  _video.height };
  vm.showDemos = true;
 
};

/**
 * Make a snapshot of the camera data and show it in another canvas.
 */
vm.makeSnapshot = function makeSnapshot() {

  if (!_video) { return; }

  var patCanvas = document.querySelector('#snapshot');
  if (!patCanvas) return;

  patCanvas.width = _video.width;
  patCanvas.height = _video.height;
  var ctxPat = patCanvas.getContext('2d');
  var idata = getVideoData(vm.patOpts.x, vm.patOpts.y, vm.patOpts.w, vm.patOpts.h);
  ctxPat.putImageData(idata, 0, 0);
  storeImageBase64(patCanvas.toDataURL());
  patData = idata; 

};

/**
   * Redirect the browser to the URL given.
   * Used to download the image by passing a dataURL string
   */
vm.downloadSnapshot = function downloadSnapshot(dataURL) {
  window.location.href = dataURL;
};

var getVideoData = function getVideoData(x, y, w, h) {
  var hiddenCanvas = document.createElement('canvas');
  hiddenCanvas.width = _video.width;
  hiddenCanvas.height = _video.height;
  var ctx = hiddenCanvas.getContext('2d');
  ctx.drawImage(_video, 0, 0, _video.width, _video.height);
  return ctx.getImageData(x, y, w, h);
};

  /**
   * This function could be used to send the image data
   * to a backend server that expects base64 encoded images.
   *
   * In this example, we simply store it in the scope for display.
   */
var storeImageBase64 = function storeImageBase64(imgBase64) {
  vm.snapshotData = imgBase64;
  vm.hasDataUrl = true;
};


(function () {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var start = Date.now();

/**
 * Apply a simple edge detection filter.
 */
function applyEffects(timestamp) {
  var progress = timestamp - start;

  if (!_video) { return;}
  var videoData = newFunction(getVideoData, _video);

  var resCanvas = document.querySelector('#result');

  if (!resCanvas) return;

  resCanvas.width = _video.width;
  resCanvas.height = _video.height;
  var ctxRes = resCanvas.getContext('2d');
  ctxRes.putImageData(videoData, 0, 0);
    // apply edge detection to video image
  Pixastic.process(resCanvas, "edges", {mono : vm.mono, invert : vm.invert});
  

  if (progress < 20000) {
    requestAnimationFrame(applyEffects);
  }
}

vm.getDataUrl = function () {
  
  $uibModalInstance.close(vm.snapshotData);
}

vm.closeModal = function () {
  $uibModalInstance.dismiss('cancel');
};
requestAnimationFrame(applyEffects);

}

function newFunction(getVideoData, _video) {
var videoData = getVideoData(0, 0, _video.width, _video.height);
return videoData;
}

