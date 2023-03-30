import { describe, expect, test } from 'vitest';
import {
  getGoogleMapsLocation,
  averageGeolocation,
  degreesToRadians,
  findBezierPoints,
  randomIntFromInterval,
} from '@/utils/map';

describe('utils > map', () => {
  test('getGoogleMapsLocation', () => {
    const l1 =
      'https://www.google.com/maps/place/11th+Ward,+Gretna,+LA/@29.9313044,-90.0998935,14z/data=!3m1!4b1!4m6!3m5!1s0x8620a6f38cd45365:0xcc1baa95c307174b!8m2!3d29.9271996!4d-90.0831143!16s%2Fg%2F11j4dpd7wy';
    const l2 =
      'https://www.google.com/maps/place/Best+Buy/@29.9043388,-90.0559139,14z/data=!4m6!3m5!1s0x8620a6a290026ea9:0xc698fc5ab6dd143e!8m2!3d29.9053733!4d-90.067871!16s%2Fg%2F1tlz_jxc';
    const l3 =
      'https://www.google.com/maps/place/Ronald+Reagan+Washington+National+Airport/@38.8755598,-77.0829807,13.56z/data=!4m6!3m5!1s0x89b7b731402fe095:0x4168af016d076bad!8m2!3d38.851242!4d-77.0402315!16zL20vMDE4c3Ey';
    const r1 = getGoogleMapsLocation(l1);
    const r2 = getGoogleMapsLocation(l2);
    const r3 = getGoogleMapsLocation(l3);
    expect(r1).toEqual({
      latitude: 29.931_304_4,
      longitude: -90.099_893_5,
    });
    expect(r2).toEqual({
      latitude: 29.904_338_8,
      longitude: -90.055_913_9,
    });
    expect(r3).toEqual({
      latitude: 38.875_559_8,
      longitude: -77.082_980_7,
    });
  });

  test('averageGeolocation', () => {
    const coords = [
      [29.931_304_4, -90.099_893_5],
      [38.875_559_8, -77.082_980_7],
      [33.942_536_1, -118.408_075_9],
      [44.977_753, -93.265_010_8],
    ];
    const r1 = averageGeolocation(coords);
    expect(r1).toMatchInlineSnapshot(`
      {
        "latitude": 37.89809213632149,
        "longitude": -94.89998951731825,
      }
    `);
  });

  test('degreesToRadians', () => {
    const r1 = degreesToRadians(90);
    const r2 = degreesToRadians(180);
    expect(r1).toBe(1.570_796_326_794_896_6);
    expect(r2).toBe(3.141_592_653_589_793);
  });

  test('findBezierPoints', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 34, y: 20 },
      { x: 68, y: 88 },
      { x: 100, y: 100 },
      { x: 4, y: 33 },
    ];
    const r1 = findBezierPoints(points);
    expect(r1).toMatchInlineSnapshot(`
      [
        {
          "x": 0,
          "y": 0,
        },
        {
          "x": 4.079872000000001,
          "y": 2.6237440000000003,
        },
        {
          "x": 8.158976,
          "y": 5.668352,
        },
        {
          "x": 12.236544,
          "y": 9.093888,
        },
        {
          "x": 16.311808000000003,
          "y": 12.860415999999999,
        },
        {
          "x": 20.384000000000004,
          "y": 16.928,
        },
        {
          "x": 24.452352,
          "y": 21.256704000000003,
        },
        {
          "x": 28.516096000000005,
          "y": 25.806592000000002,
        },
        {
          "x": 32.574464,
          "y": 30.537728,
        },
        {
          "x": 36.626688,
          "y": 35.410176,
        },
        {
          "x": 40.672000000000004,
          "y": 40.384,
        },
        {
          "x": 44.709632,
          "y": 45.419264,
        },
        {
          "x": 48.738816,
          "y": 50.476032,
        },
        {
          "x": 52.758784000000006,
          "y": 55.514368000000005,
        },
        {
          "x": 56.768768,
          "y": 60.494336000000004,
        },
        {
          "x": 60.768,
          "y": 65.376,
        },
        {
          "x": 64.755712,
          "y": 70.11942400000001,
        },
        {
          "x": 68.73113600000002,
          "y": 74.684672,
        },
        {
          "x": 72.693504,
          "y": 79.031808,
        },
        {
          "x": 76.642048,
          "y": 83.12089599999999,
        },
        {
          "x": 80.57600000000001,
          "y": 86.912,
        },
        {
          "x": 84.494592,
          "y": 90.365184,
        },
        {
          "x": 88.39705599999999,
          "y": 93.440512,
        },
        {
          "x": 92.282624,
          "y": 96.09804799999999,
        },
        {
          "x": 96.150528,
          "y": 98.297856,
        },
        {
          "x": 100,
          "y": 100,
        },
      ]
    `);
  });

  test('randomIntFromInterval', () => {
    const r1 = randomIntFromInterval(1, 10);
    expect(r1).toBeGreaterThanOrEqual(1);
    expect(r1).toBeLessThanOrEqual(10);
  });
});
