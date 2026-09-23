import { TAMIL_NADU_BOUNDS, TAMIL_NADU_BOUNDARY_COORDS } from '../../data/tamilNaduRegions';

export const MAP_CANVAS_WIDTH = 960;
export const MAP_CANVAS_HEIGHT = 1060;
export const PADDING_X = 55;
export const PADDING_Y = 50;

/**
 * Projects a [longitude, latitude] coordinate into SVG pixel coordinates [x, y].
 * Matches true EPSG:4326 geographic coordinates to the SVG viewBox [0 0 960 1060].
 */
export function projectGeoToSvg(lng: number, lat: number): [number, number] {
  const normX = (lng - TAMIL_NADU_BOUNDS.minLng) / (TAMIL_NADU_BOUNDS.maxLng - TAMIL_NADU_BOUNDS.minLng);
  const normY = (lat - TAMIL_NADU_BOUNDS.minLat) / (TAMIL_NADU_BOUNDS.maxLat - TAMIL_NADU_BOUNDS.minLat);

  // Longitude increases left to right
  const x = PADDING_X + normX * (MAP_CANVAS_WIDTH - PADDING_X * 2);
  // Latitude increases south to north, but SVG Y increases top to bottom
  const y = MAP_CANVAS_HEIGHT - PADDING_Y - normY * (MAP_CANVAS_HEIGHT - PADDING_Y * 2);

  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

/**
 * Converts SVG pixel coordinates back to [lng, lat].
 */
export function unprojectSvgToGeo(x: number, y: number): [number, number] {
  const normX = (x - PADDING_X) / (MAP_CANVAS_WIDTH - PADDING_X * 2);
  const normY = (MAP_CANVAS_HEIGHT - PADDING_Y - y) / (MAP_CANVAS_HEIGHT - PADDING_Y * 2);

  const lng = TAMIL_NADU_BOUNDS.minLng + normX * (TAMIL_NADU_BOUNDS.maxLng - TAMIL_NADU_BOUNDS.minLng);
  const lat = TAMIL_NADU_BOUNDS.minLat + normY * (TAMIL_NADU_BOUNDS.maxLat - TAMIL_NADU_BOUNDS.minLat);

  return [lng, lat];
}

/**
 * Generates the SVG path string for Tamil Nadu's exact geographic boundary.
 */
export function getTamilNaduBoundarySvgPath(): string {
  return (
    TAMIL_NADU_BOUNDARY_COORDS.map((coord, idx) => {
      const [x, y] = projectGeoToSvg(coord[0], coord[1]);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z'
  );
}

/**
 * Generates the Coromandel Coast & Gulf of Mannar coastline path.
 */
export function getTamilNaduCoastlineSvgPath(): string {
  // Coastline indices in TAMIL_NADU_BOUNDARY_COORDS:
  // From Kanyakumari (index 37) to Pulicat Lake (index 62)
  const coastCoords = TAMIL_NADU_BOUNDARY_COORDS.slice(37);
  return coastCoords
    .map((coord, idx) => {
      const [x, y] = projectGeoToSvg(coord[0], coord[1]);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export interface SatelliteTile {
  key: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Converts lon/lat to Slippy Map tile coordinates
 */
export function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

export function lat2tile(lat: number, zoom: number): number {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

/**
 * Converts tile coordinates to geographic bounding box
 */
export function tile2boundingBox(x: number, y: number, z: number) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  const maxLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  const n2 = Math.PI - (2 * Math.PI * (y + 1)) / Math.pow(2, z);
  const minLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n2) - Math.exp(-n2)));
  const minLng = (x / Math.pow(2, z)) * 360 - 180;
  const maxLng = ((x + 1) / Math.pow(2, z)) * 360 - 180;
  return { minLng, minLat, maxLng, maxLat };
}

/**
 * Computes ESRI World Imagery tiles covering Tamil Nadu at zoom level 7 or 8.
 */
export function getSatelliteTilesForTamilNadu(zoom: number = 7): SatelliteTile[] {
  const minTileX = lon2tile(TAMIL_NADU_BOUNDS.minLng, zoom);
  const maxTileX = lon2tile(TAMIL_NADU_BOUNDS.maxLng, zoom);
  const minTileY = lat2tile(TAMIL_NADU_BOUNDS.maxLat, zoom);
  const maxTileY = lat2tile(TAMIL_NADU_BOUNDS.minLat, zoom);

  const tiles: SatelliteTile[] = [];

  for (let tx = minTileX; tx <= maxTileX; tx++) {
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      const bbox = tile2boundingBox(tx, ty, zoom);
      const [svgX1, svgY1] = projectGeoToSvg(bbox.minLng, bbox.maxLat);
      const [svgX2, svgY2] = projectGeoToSvg(bbox.maxLng, bbox.minLat);

      const width = svgX2 - svgX1;
      const height = svgY2 - svgY1;

      tiles.push({
        key: `${zoom}_${tx}_${ty}`,
        url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ty}/${tx}`,
        x: Math.round(svgX1 * 10) / 10,
        y: Math.round(svgY1 * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10,
      });
    }
  }

  return tiles;
}
