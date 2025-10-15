import { useEffect, useRef, useState, type FC } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LayerZWS from './LayerZWS';
import { getElemByXYWithGeometry, getZwsLayers, type ZwsLayer } from '../services/zwsService';
import L from 'leaflet';
import { kml } from 'togeojson';

const MapView: FC = () => {
  const [layers, setLayers] = useState<ZwsLayer[]>([]);
  const allowedLayers = ['example:demo', 'world:world'];

  const mapRef = useRef<L.Map | null>(null);
  const highlightLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    async function getLayers() {
      const layers = await getZwsLayers();
      setLayers(layers);
    }
    getLayers();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const scale = 9783.939620222915;

      const { elemId, geometryKML } = await getElemByXYWithGeometry('world:world', lat, lng, scale);

      if (!elemId || !geometryKML) {
        console.error('Нет элемента по клику');
        return;
      }

      if (highlightLayerRef.current) {
        map.removeLayer(highlightLayerRef.current);
        highlightLayerRef.current = null;
      }

      const parser = new DOMParser();
      const kmlDoc = parser.parseFromString(geometryKML, 'text/xml');
      const geojson = kml(kmlDoc);

      const layer = L.geoJSON(geojson, {
        style: { color: 'red', weight: 2 },
      }).addTo(map);

      highlightLayerRef.current = layer;
    };

    map.on('click', handleClick);
  }, [mapRef.current]);

  return (
    <MapContainer
      center={[42.32248496780069, 69.57366943359376]}
      zoom={19}
      minZoom={3}
      maxBounds={[
        [-85, -Infinity],
        [85, Infinity],
      ]}
      maxBoundsViscosity={1.0}
      style={{ height: '100vh', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' tileSize={256} />

      {layers
        .filter((layer) => allowedLayers.includes(layer.name))
        .map((layer) => (
          <LayerZWS key={layer.name} layerName={layer.name} />
        ))}
    </MapContainer>
  );
};

export default MapView;

