export namespace pitneybowes {
  export interface Distance {
    unit: string;
    value: string;
  }

  export interface MatchedAddress {
    formattedAddress: string;
    mainAddressLine: string;
    addressLastLine: string;
    placeName: string;
    areaName1: string;
    areaName2: string;
    areaName3: string;
    areaName4: string;
    postCode: string;
    postCodeExt: string;
    country: string;
    addressNumber: string;
    streetName: string;
    unitType: string;
    unitValue: string;
  }

  export interface Geometry {
    type: string;
    coordinates: number[];
  }

  export interface GeosearchLocation {
    address: MatchedAddress;
    distance: Distance;
    geometry: Geometry;
  }

  export interface GeosearchLocations {
    location: GeosearchLocation[];
  }
}
