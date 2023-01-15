import type { Container, Texture } from 'pixi.js';

export interface PixiUtils {
  getMap: () => {
    (): any;
    new (): any;
    getZoom: { (): any; new (): any };
    getCenter: { (): any; new (): any };
    getBounds: {
      (): {
        (): any;
        new (): any;
        contains: { (arg0: any[]): any; new (): any };
      };
      new (): any;
    };
  };
  getContainer: () => any;
  getRenderer: () => any;
  latLngToLayerPoint: any;
  getScale: (arg0?: number | undefined) => number;
}

export interface PixiLayer {
  key: string;
  location_id: string;
  utils: PixiUtils;

  _pixiContainer: Container;

  _renderer: any;
  redraw: any;
}

export interface LayerGroup {
  key: string;
}

export interface LiveGraphics {
  x1: number;
  y1: number;
  type: string;
  bezierParams: number[];
  wayPoints: number[];
  color: string;
  workTypeKey: string;
  currentPoint: number;
  live: boolean;
}

export interface LiveSprite {
  id: number;
  svi: number;
  index: number;
  color: string;
  strokeColor: string;
  basicTexture: Texture;
  detailedTexture: Texture;
  workTypeKey: string;
  x0: number;
  y0: number;
  type: string;
  live: boolean;
  attr: Record<string, any>;
  actor_blurred_location: any;
  patient_blurred_location: any;
  recipient_blurred_location: any;
  map_destination: 'actor' | 'patient' | 'recipient';
}
