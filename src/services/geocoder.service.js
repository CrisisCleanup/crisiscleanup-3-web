/* global google */
/* eslint-disable */

const GEOCODER_BASE_URL = 'https://api.pitneybowes.com';
const GEOCODER = 'google';
import store from '@/store';

export default {
  getGooglePlaceDetails(placeId) {
    const sessionToken = store.getters['map/autocompleteToken'];
    return new Promise((resolve) => {
      const div = document.createElement('div');
      const map = new google.maps.Map(div, {
        center: { lat: -33.866, lng: 151.196 },
        zoom: 15,
      });
      const request = {
        placeId: placeId,
        fields: ['address_components', 'geometry'],
        sessionToken,
      };
      const service = new google.maps.places.PlacesService(map);
      service.getDetails(request, (place, status) => {
        resolve(place);
        div.remove();
      });
    });
  },
  getOauthToken() {
    const tokenUrl = `${GEOCODER_BASE_URL}/oauth/token`;
    const params = {
      grant_type: 'client_credentials',
    };
    const URLSearchParams = Object.keys(params)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
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
      .then((resp) => resp.json())
      .then((data) => data.access_token);
  },
  async getMatchingAddresses(text, country, maxCandidates = 5) {
    if (GEOCODER === 'pitney-bowes') {
      const geoCoderUrl = new URL(
        `${GEOCODER_BASE_URL}/location-intelligence/geosearch/v2/locations`,
      );
      const params = {
        searchText: text,
        country,
        maxCandidates,
      };
      Object.keys(params).forEach((key) =>
        geoCoderUrl.searchParams.append(key, params[key]),
      );

      const oauthToken = await this.getOauthToken();

      const results = await fetch(geoCoderUrl, {
        method: 'get',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${oauthToken}`,
        },
      })
        .then((resp) => resp.json())
        .then((data) => data.location);

      return results.map((result) => {
        return {
          description: result.address.formattedAddress,
          data: result,
        };
      });
    } else if (GEOCODER === 'google') {
      return new Promise((resolve) => {
        let sessionToken;
        if (store.getters['map/autocompleteToken']) {
          sessionToken = store.getters['map/autocompleteToken'];
        } else {
          sessionToken = new google.maps.places.AutocompleteSessionToken();
          store.commit('map/setAutocompleteToken', sessionToken);
        }
        // Pass the token to the autocomplete service.
        const autocompleteService = new google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: text,
            sessionToken,
          },
          (results) => {
            if (results) {
              resolve(
                results.map((result) => {
                  return {
                    description: result.description,
                    data: result,
                  };
                }),
              );
            } else {
              resolve([]);
            }
          },
        );
      });
    } else {
      return [];
    }
  },

  getAddress(address_components, location) {
    const data = {
      address_components: {
        address: `${this.extractFromAddress(
          address_components,
          'street_number',
        )} ${this.extractFromAddress(address_components, 'route')}`,
        city: `${
          this.extractFromAddress(address_components, 'locality') ||
          this.extractFromAddress(address_components, 'sublocality_level_1')
        }`,
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
    };
    return data;
  },
  async getPlaceDetails(address, placeId = null) {
    if (GEOCODER === 'google') {
      return new Promise((resolve, reject) => {
        if (placeId) {
          this.getGooglePlaceDetails(placeId).then((place) => {
            const { address_components } = place;
            resolve(this.getAddress(address_components, place));
          });
        } else {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
              const location = results[0];
              const { address_components } = location;
              resolve(this.getAddress(address_components, location));
            } else {
              reject(`Can't find address: ${status}`);
            }
          });
          store.commit('map/setAutocompleteToken', null);
        }
      });
    } else if (GEOCODER === 'pitney-bowes') {
      const [result] = await this.getMatchingAddresses(address, 'USA', 1);
      return {
        address_components: {
          address: result.data.address.mainAddressLine,
          city: result.data.address.areaName3,
          county: result.data.address.areaName2,
          state: result.data.address.areaName1,
          postal_code: result.data.address.postCode,
        },
        location: {
          lat: result.data.geometry.coordinates[1],
          lng: result.data.geometry.coordinates[0],
        },
      };
    }
  },

  async getLocationDetails({ longitude, latitude }) {
    if (GEOCODER === 'google') {
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
                city: `${
                  this.extractFromAddress(address_components, 'locality') ||
                  this.extractFromAddress(
                    address_components,
                    'sublocality_level_1',
                  )
                }`,
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
    } else if (GEOCODER === 'pitney-bowes') {
      const geoCoderUrl = new URL(
        `${GEOCODER_BASE_URL}/location-intelligence/geocode-service/v1/transient/advanced/reverseGeocode`,
      );
      const params = {
        x: longitude,
        y: latitude,
      };
      Object.keys(params).forEach((key) =>
        geoCoderUrl.searchParams.append(key, params[key]),
      );
      const oauthToken = await this.getOauthToken();
      const [result] = await fetch(geoCoderUrl, {
        method: 'get',
        mode: 'cors',
        headers: {
          'Content-type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${oauthToken}`,
        },
      })
        .then((resp) => resp.json())
        .then((data) => data.candidates);

      return {
        address_components: {
          address: result.address.mainAddressLine,
          city: result.address.areaName3,
          county: result.address.areaName2,
          state: result.address.areaName1,
          postal_code: result.address.postCode,
        },
        location: {
          lat: result.geometry.coordinates[1],
          lng: result.geometry.coordinates[0],
        },
      };
    }
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
        .filter((component) => component.types.includes(type))
        .map((item) => item.long_name)
        .pop() || null
    );
  },
};
