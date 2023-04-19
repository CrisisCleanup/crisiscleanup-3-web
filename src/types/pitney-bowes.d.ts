export type PBDistance = {
  unit: string;
  value: string;
};

export type PBMatchedAddress = {
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

export type PBGeometry = {
  type: string;
  coordinates: number[];
};

export type PBGeosearchLocation = {
  address: PBMatchedAddress;
  distance: PBDistance;
  geometry: PBGeometry;
};

export type PBGeosearchLocations = {
  location: PBGeosearchLocation[];
};
