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
    /**
     * @option pane: String = 'overlayPane'
     * @default 'overlayPane'
     * `Map pane` where the overlay layer will be added
     */
    pane?: string;
    /**
     * @option padding: Number = 0.1
     * How much to extend the clip area around the map view (relative to its size)
     * e.g. 0.1 would be 10% of map view in each direction
     */
    padding?: number;
    /**
     * @option forceCanvas: Boolean = false
     * Force use of a 2d-canvas
     */
    forceCanvas?: boolean;
    /**
     * @option doubleBuffering: Boolean = false
     * Help to prevent flicker when refreshing display on some devices (e.g. iOS devices)
     * It is ignored if rendering is done with 2d-canvas
     */
    doubleBuffering?: boolean;
    /**
     * @option resolution: Number = 1
     * Resolution of the renderer canvas
     */
    resolution?: number;
    /**
     * @option projectionZoom(map: map): Number
     * @param map
     * return the layer projection zoom level
     */
    projectionZoom?: (map: L.Map) => number;
    /**
     * @option destroyInteractionManager: Boolean = false
     * Destroy PIXI Interaction Manager
     */
    destroyInteractionManager?: boolean;
    /**
     * @option
     * Customize PIXI Interaction Manager autoPreventDefault property
     * This option is ignored if destroyInteractionManager is set
     */
    autoPreventDefault?: boolean;
    /**
     * @option resolution: Boolean = false
     * Enables drawing buffer preservation
     */
    preserveDrawingBuffer?: boolean;
    /**
     * @option resolution: Boolean = true
     * Clear the canvas before the new render pass
     */
    clearBeforeRender?: boolean;
    /**
     * @option shouldRedrawOnMove(e: moveEvent): Boolean
     * @param e
     * filter move events that should trigger a layer redraw
     */
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
