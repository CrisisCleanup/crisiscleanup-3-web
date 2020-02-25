/* global google */
/* eslint-disable */

const GEOCODER_BASE_URL = 'https://api.pitneybowes.com';

export default {
  getOauthToken() {
    const tokenUrl = `${GEOCODER_BASE_URL}/oauth/token`;
    const params = {
      grant_type: 'client_credentials',
    };
    const URLSearchParams = Object.keys(params)
      .map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
      )
      .join('&');
    return fetch(tokenUrl, {
      method: 'POST',
      body: URLSearchParams,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${process.env.VUE_APP_PITNEYBOWES_BASIC_AUTH_TOKEN}`,
      },
    })
      .then(resp => resp.json())
      .then(data => data.access_token);
  },
  async getMatchingAddresses(text, country) {
    const geoCoderUrl = new URL(
      `${GEOCODER_BASE_URL}/location-intelligence/geocode-service/v1/transient/premium/geocode`,
    );
    const params = {
      mainAddress: text,
      country,
      maxCands: 5,
    };
    Object.keys(params).forEach(key =>
      geoCoderUrl.searchParams.append(key, params[key]),
    );

    const oauthToken = await this.getOauthToken();

    return fetch(geoCoderUrl, {
      method: 'get',
      mode: 'cors',
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${oauthToken}`,
      },
    })
      .then(resp => resp.json())
      .then(data => data.candidates);
  },

  async getMatchingAddressesGoogle(text) {
    return new Promise(resolve => {
      const sessionToken = new google.maps.places.AutocompleteSessionToken();

      // Pass the token to the autocomplete service.
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input: text,
          sessionToken,
        },
        results => resolve(results),
      );
    });
  },

  getPlaceDetails(address) {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const location = results[0];
          const { address_components } = location;
          resolve({
            address_components: {
              address: `${this.extractFromAddress(
                address_components,
                'street_number',
              )} ${this.extractFromAddress(address_components, 'route')}`,
              city: `${this.extractFromAddress(
                address_components,
                'locality',
              )}`,
              county: `${this.extractFromAddress(
                address_components,
                'administrative_area_level_2',
              )}`,
              state: `${this.extractFromAddress(
                address_components,
                'administrative_area_level_1',
              )}`,
              postal_code: `${this.extractFromAddress(
                address_components,
                'postal_code',
              )}`,
            },
            location: {
              lat: location.geometry.location.lat(),
              lng: location.geometry.location.lng(),
            },
          });
        } else {
          reject(`Can't find address: ${status}`);
        }
      });
    });
  },

  getLocationDetails({ longitude, latitude }) {
    const latlng = { lat: latitude, lng: longitude };
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const location = results[0];
          const { address_components } = location;
          resolve({
            address_components: {
              address: `${this.extractFromAddress(
                address_components,
                'street_number',
              )} ${this.extractFromAddress(address_components, 'route')}`,
              city: `${this.extractFromAddress(
                address_components,
                'locality',
              )}`,
              county: `${this.extractFromAddress(
                address_components,
                'administrative_area_level_2',
              )}`,
              state: `${this.extractFromAddress(
                address_components,
                'administrative_area_level_1',
              )}`,
              postal_code: `${this.extractFromAddress(
                address_components,
                'postal_code',
              )}`,
            },
            location: {
              lat: location.geometry.location.lat(),
              lng: location.geometry.location.lng(),
            },
          });
        } else {
          reject(`Can't find location: ${status}`);
        }
      });
    });
  },
  /**
   * Get the value for a given key in address_components
   *
   * @param {Array} components address_components returned from Google maps autocomplete
   * @param type key for desired address component
   * @returns {String} value, if found, for given type (key)
   */
  extractFromAddress(components, type) {
    return (
      components
        .filter(component => component.types.includes(type))
        .map(item => item.long_name)
        .pop() || null
    );
  },
};
