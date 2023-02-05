// GoogleMutant by Iván Sánchez Ortega <ivan@sanchezortega.es>

// Based on https://github.com/shramov/leaflet-plugins
// GridLayer like https://avinmathew.com/leaflet-and-google-maps/ , but using MutationObserver instead of jQuery

/*
"THE BEER-WARE LICENSE":
<ivan@sanchezortega.es> wrote this file. As long as you retain this notice you
can do whatever you want with this stuff. If we meet some day, and you think
this stuff is worth it, you can buy me a beer in return.
*/

import { LRUMap } from './lru_map';

function waitForAPI(callback, context) {
  let checkCounter = 0,
    intervalId = null;

  intervalId = setInterval(function () {
    if (checkCounter >= 20) {
      clearInterval(intervalId);
      throw new Error('window.google not found after 10 seconds');
    }
    if (!!window.google && !!window.google.maps && !!window.google.maps.Map) {
      clearInterval(intervalId);
      callback.call(context);
    }
    ++checkCounter;
  }, 500);
}

// 🍂class GridLayer.GoogleMutant
// 🍂extends GridLayer
L.GridLayer.GoogleMutant = L.GridLayer.extend({
  _attachObserver: function _attachObserver(node) {
    if (!this._observer)
      this._observer = new MutationObserver(this._onMutations.bind(this));

    // pass in the target node, as well as the observer options
    this._observer.observe(node, { childList: true, subtree: true });

    // if we are reusing an old _mutantContainer, we must manually detect
    // all existing tiles in it
    Array.prototype.forEach.call(
      node.querySelectorAll('img'),
      this._boundOnMutatedImage,
    );
  },

  _checkZoomLevels: function () {
    //setting the zoom level on the Google map may result in a different zoom level than the one requested
    //(it won't go beyond the level for which they have data).
    const zoomLevel = this._map.getZoom(),
      gMapZoomLevel = this._mutant.getZoom();

    if (!zoomLevel || !gMapZoomLevel) return;

    if (
      gMapZoomLevel !== zoomLevel || //zoom levels are out of sync, Google doesn't have data
      gMapZoomLevel > this.options.maxNativeZoom
    ) {
      //at current location, Google does have data (contrary to maxNativeZoom)
      //Update maxNativeZoom
      this._setMaxNativeZoom(gMapZoomLevel);
    }
  },

  _clone: function (imgNode) {
    const clonedImgNode = imgNode.cloneNode(true);
    clonedImgNode.style.visibility = 'visible';
    return clonedImgNode;
  },

  _initMutant: function () {
    if (this._mutant) {
      return;
    }

    const map = new google.maps.Map(this._mutantContainer, {
      center: { lat: 0, lng: 0 },
      zoom: 0,
      tilt: 0,
      mapTypeId: this.options.type,
      disableDefaultUI: true,
      keyboardShortcuts: false,
      draggable: false,
      disableDoubleClickZoom: true,
      scrollwheel: false,
      styles: this.options.styles || [],
      backgroundColor: 'transparent',
    });

    this._mutant = map;

    this._update();

    // 🍂event spawned
    // Fired when the mutant has been created.
    this.fire('spawned', { mapObject: map });

    this._waitControls();
    this.once('controls_ready', this._setupAttribution);
  },

  // 🍂method addGoogleLayer(name: String, options?: Object): this
  // Adds layer with the given name and options to the google Map instance.
  // `name`: one of the google maps API layers, with it's constructor available in `google.maps` object.
  // currently following values supported: 'TrafficLayer', 'TransitLayer', 'BicyclingLayer'.
  // `options`: see https://developers.google.com/maps/documentation/javascript/reference/map
  _initMutantContainer: function () {
    if (!this._mutantContainer) {
      this._mutantContainer = L.DomUtil.create(
        'div',
        'leaflet-google-mutant leaflet-top leaflet-left',
      );
      this._mutantContainer.id =
        '_MutantContainer_' + L.Util.stamp(this._mutantContainer);
      this._mutantContainer.style.pointerEvents = 'none';
      this._mutantContainer.style.visibility = 'hidden';

      L.DomEvent.off(this._mutantContainer);
    }
    this._map.getContainer().append(this._mutantContainer);

    this.setOpacity(this.options.opacity);
    const style = this._mutantContainer.style;
    if (this._map.options.zoomSnap < 1) {
      // Fractional zoom needs a bigger mutant container in order to load more (smaller) tiles
      style.width = '180%';
      style.height = '180%';
    } else {
      style.width = '100%';
      style.height = '100%';
    }
    style.zIndex = -1;

    this._attachObserver(this._mutantContainer);
  },

  // 🍂method removeGoogleLayer(name: String): this
  // Removes layer with the given name from the google Map instance.
  _onMutatedImage: function _onMutatedImage(imgNode) {
    let coords;
    let match = imgNode.src.match(this._roadRegexp);
    let sublayer = 0;

    if (match) {
      coords = {
        z: match[1],
        x: match[2],
        y: match[3],
      };
      if (this._imagesPerTile > 1) {
        imgNode.style.zIndex = 1;
        sublayer = 1;
      }
    } else {
      match = imgNode.src.match(this._satRegexp);
      if (match) {
        coords = {
          x: match[1],
          y: match[2],
          z: match[3],
        };
      }
      // imgNode.style.zIndex = 0;
      sublayer = 0;
    }

    if (coords) {
      const tileKey = this._tileCoordsToKey(coords);
      imgNode.style.position = 'absolute';

      const key = tileKey + '/' + sublayer;
      // Cache img so it can also be used in subsequent tile requests
      this._lru.set(key, imgNode);

      if (key in this._tileCallbacks && this._tileCallbacks[key]) {
        // Use the tile for *all* pending callbacks. They'll be cloned anyway.
        for (const callback of this._tileCallbacks[key]) callback(imgNode);
        delete this._tileCallbacks[key];
      }
    }
  },

  _onMutations: function _onMutations(mutations) {
    for (const mutation of mutations) {
      for (let j = 0; j < mutation.addedNodes.length; ++j) {
        const node = mutation.addedNodes[j];

        if (node instanceof HTMLImageElement) {
          this._onMutatedImage(node);
        } else if (node instanceof HTMLElement) {
          Array.prototype.forEach.call(
            node.querySelectorAll('img'),
            this._boundOnMutatedImage,
          );
        }
      }
    }
  },

  _roadRegexp: /!1i(\d+)!2i(\d+)!3i(\d+)!/,

  _satRegexp: /x=(\d+)&y=(\d+)&z=(\d+)/,

  _setMaxNativeZoom: function (zoomLevel) {
    if (zoomLevel !== this.options.maxNativeZoom) {
      this.options.maxNativeZoom = zoomLevel;
      this._resetView();
    }
  },

  _setupAttribution: function (ev) {
    if (!this._map) {
      return;
    }
    // https://developers.google.com/maps/documentation/javascript/reference/control#ControlPosition
    const pos = google.maps.ControlPosition;
    const ctr = (this._attributionContainer = ev.positions.get(
      pos.BOTTOM_RIGHT,
    ));
    L.DomUtil.addClass(ctr, 'leaflet-control leaflet-control-attribution');
    L.DomEvent.disableClickPropagation(ctr);
    ctr.style.height = '14px';
    this._map._controlCorners.bottomright.append(ctr);

    this._logoContainer = ev.positions.get(pos.BOTTOM_LEFT);
    this._logoContainer.style.pointerEvents = 'auto';
    this._map._controlCorners.bottomleft.append(this._logoContainer);
  },

  _staticRegExp: /StaticMapService\.GetMapImage/,

  // Only images which 'src' attrib match this will be considered for moving around.
  // Looks like some kind of string-based protobuf, maybe??
  // Only the roads (and terrain, and vector-based stuff) match this pattern
  _update: function (center) {
    // zoom level check needs to happen before super's implementation (tile addition/creation)
    // otherwise tiles may be missed if maxNativeZoom is not yet correctly determined
    if (this._mutant) {
      center = center || this._map.getCenter();
      const _center = new google.maps.LatLng(center.lat, center.lng),
        zoom = Math.round(this._map.getZoom()),
        mutantZoom = this._mutant.getZoom();

      this._mutant.setCenter(_center);

      //ignore fractional zoom levels
      if (zoom !== mutantZoom) {
        this._mutant.setZoom(zoom);

        if (this._mutantIsReady) this._checkZoomLevels();
        //else zoom level check will be done later by 'idle' handler
      }
    }

    L.GridLayer.prototype._update.call(this, center);
  },

  // On the other hand, raster imagery matches this other pattern
  _waitControls: function () {
    const id = setInterval(() => {
      const layoutManager = this._mutant.__gm.layoutManager;
      if (!layoutManager) {
        return;
      }
      clearInterval(id);
      let positions;
      // iterate through obfuscated key names to find positions set (atm: layoutManager.o)
      for (const key of Object.keys(layoutManager)) {
        const el = layoutManager[key];
        if (el.get && el.get(1) instanceof Node) {
          positions = el;
        }
      }
      // 🍂event controls_ready
      // Fired when controls positions get available (passed in `positions` property).
      this.fire('controls_ready', { positions });
    }, 50);
  },

  // On small viewports, when zooming in/out, a static image is requested
  // This will not be moved around, just removed from the DOM.
  addGoogleLayer: function (googleLayerName, options) {
    if (!this._subLayers) this._subLayers = {};
    this.whenReady(() => {
      const Constructor = google.maps[googleLayerName];
      const googleLayer = new Constructor(options);
      googleLayer.setMap(this._mutant);
      this._subLayers[googleLayerName] = googleLayer;
    });
    return this;
  },

  createTile: function (coords, done) {
    const key = this._tileCoordsToKey(coords),
      tileContainer = L.DomUtil.create('div');

    tileContainer.style.textAlign = 'left';
    tileContainer.dataset.pending = this._imagesPerTile;
    done = done.bind(this, null, tileContainer);

    for (let i = 0; i < this._imagesPerTile; ++i) {
      const key2 = key + '/' + i,
        imgNode = this._lru.get(key2);
      if (imgNode) {
        tileContainer.append(this._clone(imgNode));
        --tileContainer.dataset.pending;
      } else {
        this._tileCallbacks[key2] = this._tileCallbacks[key2] || [];
        this._tileCallbacks[key2].push(
          function (c /*, k2*/) {
            return function (imgNode) {
              c.append(this._clone(imgNode));
              --c.dataset.pending;
              if (!Number.parseInt(c.dataset.pending)) {
                done();
              }
            }.bind(this);
          }.bind(this)(tileContainer /*, key2*/),
        );
      }
    }

    if (!Number.parseInt(tileContainer.dataset.pending)) {
      L.Util.requestAnimFrame(done);
    }
    return tileContainer;
  },

  initialize: function (options) {
    L.GridLayer.prototype.initialize.call(this, options);

    // Couple data structures indexed by tile key
    this._tileCallbacks = {}; // Callbacks for promises for tiles that are expected
    this._lru = new LRUMap(100); // Tile LRU cache

    this._imagesPerTile = this.options.type === 'hybrid' ? 2 : 1;

    this._boundOnMutatedImage = this._onMutatedImage.bind(this);
  },

  onAdd: function (map) {
    L.GridLayer.prototype.onAdd.call(this, map);
    this._initMutantContainer();

    // Attribution and logo nodes are not mutated a second time if the
    // mutant is removed and re-added to the map, hence they are
    // not cleaned up on layer removal, so they can be added here.
    if (this._logoContainer) {
      map._controlCorners.bottomleft.append(this._logoContainer);
    }
    if (this._attributionContainer) {
      map._controlCorners.bottomright.append(this._attributionContainer);
    }

    waitForAPI(() => {
      if (!this._map) {
        return;
      }
      this._initMutant();

      //handle layer being added to a map for which there are no Google tiles at the given zoom
      google.maps.event.addListenerOnce(this._mutant, 'idle', () => {
        if (!this._map) {
          return;
        }
        this._checkZoomLevels();
        this._mutantIsReady = true;
      });
    });
  },

  onRemove: function (map) {
    L.GridLayer.prototype.onRemove.call(this, map);
    this._observer.disconnect();
    this._mutantContainer.remove();
    if (this._logoContainer) {
      L.DomUtil.remove(this._logoContainer);
    }
    if (this._attributionContainer) {
      L.DomUtil.remove(this._attributionContainer);
    }
    if (this._mutant) {
      google.maps.event.clearListeners(this._mutant, 'idle');
    }
  },

  options: {
    maxZoom: 21, // can be 23, but ugly if more than maxNativeZoom
    // 🍂option type: String = 'roadmap'
    // Google's map type. Valid values are 'roadmap', 'satellite' or 'terrain'. 'hybrid' is not really supported.
    type: 'roadmap',
    maxNativeZoom: 21,
  },

  removeGoogleLayer: function (googleLayerName) {
    this.whenReady(() => {
      const googleLayer = this._subLayers && this._subLayers[googleLayerName];
      if (googleLayer) {
        googleLayer.setMap(null);
        delete this._subLayers[googleLayerName];
      }
    });
    return this;
  },

  // @method whenReady(fn: Function, context?: Object): this
  // Runs the given function `fn` when the mutant gets initialized, or immediately
  // if it's already initialized, optionally passing a function context.
  whenReady: function (callback, context) {
    if (this._mutant) {
      callback.call(context || this, { target: this });
    } else {
      this.on('spawned', callback, context);
    }
    return this;
  },
});

// 🍂factory gridLayer.googleMutant(options)
// Returns a new `GridLayer.GoogleMutant` given its options
L.gridLayer.googleMutant = function (options) {
  return new L.GridLayer.GoogleMutant(options);
};

export default null;
