import { getGoogleMapsLocation } from '../map';

describe('Google Maps Parse', () => {
  const coords = {
    lat: 38.8976763,
    long: -77.0387185,
  };

  const url =
    'https://www.google.com/maps/place/white+house/@38.8976763,-77.0387185,17z/data=!3m1!4b1!4m5!3m4!1s0x89b7b7bcdecbb1df:0x715969d86d0b76bf!8m2!3d38.8976763!4d-77.0365298';
  test('Gets Correct Latitude and Longitude', () => {
    expect(getGoogleMapsLocation(url) === coords);
  });
});
