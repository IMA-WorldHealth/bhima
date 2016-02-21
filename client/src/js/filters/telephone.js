angular.module('bhima.filters')
.filter('telephone', TelephoneFilter);

/**
 * Telephone Filter
 *
 * The telephone filter formats telephone numbers into nicely formatted strings.
 * If the number is unrecognized, it will simply return it.  Otherwise, it works
 * as follows for the following formats:
 *   1. 0821234567    => (082) 123-4567
 *   2. 243123456789  => +243 (12) 345-6789
 *
 * Derived from: http://jsfiddle.net/jorgecas99/S7aSj/.
 */
function TelephoneFilter() {
    return function telephone(tel) {
        
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        // if the country is defined, prepend a plus sign
        if (country) {
          country = '+' + country;
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + ' (' + city + ') ' + number).trim();
    };
}
