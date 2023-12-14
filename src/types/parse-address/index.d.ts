// Modified from: https://github.com/hassansin/parse-address/issues/40#issuecomment-1115196847
declare module 'parse-address' {
  export function parseLocation(address: string): StreetAddress;

  export class StreetAddress {
    /**
     * House or street number.
     * @type {string}
     */
    number?: string;

    /**
     * Directional prefix for the street, such as N, NE, E, etc. A given prefix should be one to two characters long.
     * @type {string}
     */
    prefix?: string;

    /**
     * Name of the street, without directional or type qualifiers.
     * @type {string}
     */
    street?: string;

    /**
     * Abbreviated street type, e.g. Rd, St, Ave, etc. See the USPS official type abbreviations at http://pe.usps.com/text/pub28/pub28apc.html for a list of abbreviations used.
     * @type {string}
     */
    type?: string;

    /**
     * Directional suffix for the street, as above.
     * @type {string}
     */
    suffix?: string;

    /**
     * Name of the city, town, or other locale that the address is situated in.
     * @type {string}
     */
    city?: string;

    /**
     * The state which the address is situated in, given as its two-letter postal abbreviation. for a list of abbreviations used.
     * @type {string}
     */
    state?: string;

    /**
     * Five digit ZIP postal code for the address, including leading zero, if needed.
     * @type {string}
     */
    zip?: string;

    /**
     * If the address includes a Secondary Unit Designator, such as a room, suite or apartment, the sec_unit_type field will indicate the type of unit.
     * @type {string}
     */
    sec_unit_type?: string;

    /**
     * If the address includes a Secondary Unit Designator, such as a room, suite or apartment, the sec_unit_num field will indicate the number of the unit (which may not be numeric).
     * @type {string}
     */
    sec_unit_num?: string;

    // INTERSECTION_SPECIFIER
    // https://metacpan.org/release/TIMB/Geo-StreetAddress-US-1.04/view/US.pm#INTERSECTION-SPECIFIER

    // /**
    //  * Directional prefixes for the streets in question.
    //  * @type {string}
    //  */
    // prefix1?: string;

    // /**
    //  * Directional prefixes for the streets in question.
    //  * @type {string}
    //  */
    // prefix2?: string;

    // /**
    //  * Names of the streets in question.
    //  * @type {string}
    //  */
    // street1?: string;

    // /**
    //  * Names of the streets in question.
    //  * @type {string}
    //  */
    // street2?: string;

    // /**
    //  * Street types for the streets in question.
    //  * @type {string}
    //  */
    // type1?: string;

    // /**
    //  * Street types for the streets in question.
    //  * @type {string}
    //  */
    // type2?: string;

    // /**
    //  * Directional suffixes for the streets in question.
    //  * @type {string}
    //  */
    // suffix1?: string;

    // /**
    //  * Directional suffixes for the streets in question.
    //  * @type {string}
    //  */
    // suffix2?: string;

    // /**
    //  * City or locale containing the intersection, as above.
    //  * @type {string}
    //  */
    // city?: string;

    // /**
    //  * State abbreviation, as above.
    //  * @type {string}
    //  */
    // state?: string;

    // /**
    //  * Five digit ZIP code, as above.
    //  * @type {string}
    //  */
    // zip?: string;
  }
}
