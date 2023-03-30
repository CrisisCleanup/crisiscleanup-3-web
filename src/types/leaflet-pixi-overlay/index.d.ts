// Types originally added from
// https://github.com/joshuahhh/strava-atlas/blob/0866e626aa62b950b98530e5ab6c01d726fcede2/src/types.d.ts
declare module 'leaflet-pixi-overlay' {
  import type * as PIXI from 'pixi.js';
  import type * as L from 'leaflet';

  type LeafletPixiOverlay = {
    key: string;
    redraw: (data?: any) => void;
  } & L.Layer;

  type LeafletPixiOverlayOptions = {
    pane?: string;
    padding?: number;
    forceCanvas?: boolean;
    doubleBuffering?: boolean;
    resolution?: number;
    projectionZoom?: (map: L.Map) => number;
    destroyInteractionManager?: boolean;
    autoPreventDefault?: boolean;
    preserveDrawingBuffer?: boolean;
    clearBeforeRender?: boolean;
    shouldRedrawOnMove?: (e: L.LeafletEvent) => boolean;
  };

  type LeafletPixiOverlayUtils = {
    latLngToLayerPoint(latLng: L.LatLngExpression, zoom?: number): L.Point;
    layerPointToLatLng(point: L.Point, zoom?: number): L.LatLng;
    getScale(zoom?: number): number;
    getRenderer(): PIXI.Renderer;
    getContainer(): PIXI.Container;
    getMap(): L.Map;
  };

  module 'leaflet' {
    function pixiOverlay(
      drawCallback: (utils: LeafletPixiOverlayUtils) => void,
      container: PIXI.Container,
      options?: LeafletPixiOverlayOptions,
    ): LeafletPixiOverlay;
  }
}
