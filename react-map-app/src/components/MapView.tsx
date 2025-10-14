import { type FC } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

const MapView: FC = () => {
  return (
    <MapContainer center={[55.751244, 37.618423]} zoom={10} style={{ height: '100vh' }}>
      <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
    </MapContainer>
  );
};

export default MapView;

