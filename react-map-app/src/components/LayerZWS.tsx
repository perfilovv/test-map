import { type FC } from 'react';
import { TileLayer } from 'react-leaflet';
import { API_CONFIG } from '../config/api';

interface LayerZWSProps {
  layerName: string;
}

const LayerZWS: FC<LayerZWSProps> = ({ layerName }) => {
  const url = `${API_CONFIG.ZWS_URL}/GetLayerTile?Layer=${layerName}&x={x}&y={y}&z={z}`;
  return <TileLayer url={url} tileSize={256} opacity={0.8} />;
};

export default LayerZWS;

