declare module 'togeojson' {
  export function kml(xml: Document): FeatureCollection;
  export function gpx(xml: Document): FeatureCollection;
}

