export namespace pitneybowes {
  export type Distance = {
    unit: string;
    value: string;
  };

  export type MatchedAddress = {
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
  };

  export type Geometry = {
    type: string;
    coordinates: number[];
  };

  export type GeosearchLocation = {
    address: PBMatchedAddress;
    distance: PBDistance;
    geometry: PBGeometry;
  };

  export type GeosearchLocations = {
    location: PBGeosearchLocation[];
  };
}
