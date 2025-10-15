import axios from 'axios';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { API_CONFIG } from '../config/api';
import L from 'leaflet';

export interface ZwsLayer {
  name: string;
  title: string;
}

const parser = new XMLParser();

export async function getZwsLayers(): Promise<ZwsLayer[]> {
  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
                    <zulu-server service="zws" version="1.0.0">
                      <Command>
                        <GetLayerList/>
                      </Command>
                    </zulu-server>`;

  try {
    const res = await axios.post(API_CONFIG.ZWS_URL, xmlBody);

    const json = parser.parse(res.data);

    const layersData = json.zwsResponse?.GetLayerList?.Layer;
    if (!layersData) {
      return [];
    }

    return layersData.map((layer: { Name: string; Title: string }) => ({
      name: layer.Name,
      title: layer.Title,
    }));
  } catch (err) {
    console.error('Ошибка при загрузке слоёв ZWS:', err);
    return [];
  }
}

export async function selectElemByXY(
  layer: string,
  lat: number,
  lng: number,
  scale: number
): Promise<{ elemId?: string }> {
  const point = L.Projection.SphericalMercator.project({ lat, lng });

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
    <zulu-server service='zws' version='1.0.0'>
      <Command lang='ru'>
        <SelectElemByXY>
          <Layer>${layer}</Layer>
          <X>${point.y}</X>
          <Y>${point.x}</Y>
          <Scale>${scale}</Scale>
          <CRS>EPSG:3857</CRS>
          <Geometry>No</Geometry>
          <Attr>No</Attr>
          <ModeList>No</ModeList>
        </SelectElemByXY>
      </Command>
    </zulu-server>`;

  try {
    const res = await axios.post(API_CONFIG.ZWS_URL, xmlBody);
    const json = parser.parse(res.data);

    const elem = json?.zwsResponse?.SelectElemByXY?.Element;
    return { elemId: elem?.ElemID };
  } catch (err) {
    console.error('Ошибка при SelectElemByXY:', err);
    return {};
  }
}

export async function getElemByID(
  layer: string,
  elemId: string
): Promise<{
  kml: string;
  attrs: Record<string, string>;
} | null> {
  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
    <zulu-server service='zws' version='1.0.0'>
      <Command lang='ru'>
        <GetElemsByID>
          <Layer>${layer}</Layer>
          <ElemID>${elemId}</ElemID>
          <Geometry>Yes</Geometry>
          <Attr>Yes</Attr>
          <QueryList>No</QueryList>
          <ModeList>Yes</ModeList>
          <BookAsReference>Yes</BookAsReference>
          <GeometryLinks>EPSG:3857</GeometryLinks>
        </GetElemsByID>
      </Command>
    </zulu-server>`;

  try {
    const res = await axios.post(API_CONFIG.ZWS_URL, xmlBody);
    const json = parser.parse(res.data);

    const elem = json?.zwsResponse?.GetElemsByID?.Element;
    if (!elem?.Geometry?.KML) {
      return null;
    }

    const builder = new XMLBuilder();
    const kml = builder.build(elem.Geometry.KML);
    const attrs: Record<string, string> = {};
    const fields = elem?.Records?.Record?.Field;

    if (fields && Array.isArray(fields)) {
      fields.forEach((field) => {
        const key = field.UserName || field.Name;
        const value = field.Value;

        if (key && value) {
          attrs[key] = value;
        }
      });
    }
    return { kml, attrs };
  } catch (err) {
    console.error('Ошибка при GetElemsByID:', err);
    return null;
  }
}

export async function getElemByXYWithGeometry(layer: string, lat: number, lng: number, scale: number) {
  const { elemId } = await selectElemByXY(layer, lat, lng, scale);
  if (!elemId) {
    return { elemId: null };
  }

  const elemData = await getElemByID(layer, elemId);
  if (!elemData) {
    return { geometryKML: null, attrs: null };
  }
  const { kml, attrs } = elemData;

  return { elemId, geometryKML: kml, attrs };
}

