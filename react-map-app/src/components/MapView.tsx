import { useEffect, useRef, useState, type FC } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LayerZWS from './LayerZWS';
import { getElemByXYWithGeometry, getZwsLayers, type ZwsLayer } from '../services/zwsService';
import L from 'leaflet';
import { kml } from 'togeojson';

interface Data {
  elemId?: string;
  attrs?: Record<string, string> | null;
}

const MapView: FC = () => {
  const [layers, setLayers] = useState<ZwsLayer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<Data>({});
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

      const { elemId, geometryKML, attrs } = await getElemByXYWithGeometry('world:world', lat, lng, scale);

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

      setSelectedData({ elemId, attrs });
      setModalVisible(true);
    };

    map.on('click', handleClick);
  }, [mapRef.current]);

  return (
    <>
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

      {modalVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 400,
          }}
          onClick={() => setModalVisible(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '20px',
              width: '250px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0px' }}>Информация об объекте</h3>
            {selectedData.attrs ? (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {Object.entries(selectedData.attrs).map(([key, val]) => (
                  <li
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px',
                    }}
                  >
                    <b>{key}:</b>

                    <span>{val}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Нет данных об атрибутах</p>
            )}
            <button
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#518ac4ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => setModalVisible(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MapView;

