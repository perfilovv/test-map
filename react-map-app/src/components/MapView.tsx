import { useEffect, useState, type FC } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LayerZWS from './LayerZWS';
import { getZwsLayers, type ZwsLayer } from '../services/zwsService';

const MapView: FC = () => {
  const [layers, setLayers] = useState<ZwsLayer[]>([]);
  const allowedLayers = ['example:demo', 'world:world'];

  useEffect(() => {
    async function getLayers() {
      const layers = await getZwsLayers();
      setLayers(layers);
    }
    getLayers();
  }, []);

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

