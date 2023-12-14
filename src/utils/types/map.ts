import type { LeafletPixiOverlayUtils } from 'leaflet-pixi-overlay';
import type { Container, Texture, DisplayObject } from 'pixi.js';

export interface PixiLayer {
  key: string;
  location_id: string;
  utils: LeafletPixiOverlayUtils;

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

export type PixiDisplayObjectWithCachedProps = {
  currentScale?: number;
  targetScale?: number;
  texture: Texture;
  detailedTexture: Texture;
  basicTexture: Texture;
  frame?: number | undefined;
  type?: string;
  clear: () => void;
  remove: () => void;
} & DisplayObject;
