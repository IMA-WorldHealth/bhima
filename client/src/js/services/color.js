angular.module('bhima.services').service('ColorService', ColorService);
ColorService.$inject = [
  '$translate',
];

function ColorService($translate) {
  const service = this;
  service.list = [
    { name : $translate.instant('COLORS.AQUA'), value : '#00ffff' },
    { name : $translate.instant('COLORS.GRAY'), value : '#808080' },
    { name : $translate.instant('COLORS.FORESTGREEN'), value : '#228b22' },
    { name : $translate.instant('COLORS.LIME'), value : '#00ff00' },
    { name : $translate.instant('COLORS.RED'), value : '#ff0000' },
    { name : $translate.instant('COLORS.YELLOW'), value : '#ffff00' },
    { name : $translate.instant('COLORS.YELLOWGREEN'), value : '#9acd32' },
    { name : $translate.instant('COLORS.SLATEBLUE'), value : '#6a5acd' },
    { name : $translate.instant('COLORS.MAROON'), value : '#800000' },
    { name : $translate.instant('COLORS.CRIMSON'), value : '#dc143c' },
    { name : $translate.instant('COLORS.BLUEVIOLET'), value : '#8A2BE2' },
  ];
  return service;
}
