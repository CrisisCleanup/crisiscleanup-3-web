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


