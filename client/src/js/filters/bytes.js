angular.module('bhima.filters')
.filter('bytes', BytesFilter);

BytesFilter.$inject = ['$translate'];

/**
 * Bytes Filter
 * Format bytes size to human readable format
 */
function BytesFilter($translate) {
	return function(bytes, precision) {
		if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) { return '-'; }
		if (typeof precision === 'undefined') { precision = 1; }
		var units = ['SIZE_BYTES', 'SIZE_KB', 'SIZE_MB', 'SIZE_GB', 'SIZE_TB', 'SIZE_TB'],
				number = Math.floor(Math.log(bytes) / Math.log(1024));

		units = units.map(function (unit) {
			return $translate.instant('FORM.LABELS.' + unit);
		});

		return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
	};
}
