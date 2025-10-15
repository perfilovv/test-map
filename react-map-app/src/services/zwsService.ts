import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { API_CONFIG } from '../config/api';

export interface ZwsLayer {
  name: string;
  title: string;
}

export async function getZwsLayers(): Promise<ZwsLayer[]> {
  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
                    <zulu-server service="zws" version="1.0.0">
                      <Command>
                        <GetLayerList/>
                      </Command>
                    </zulu-server>`;

  try {
    const res = await axios.post(API_CONFIG.ZWS_URL, xmlBody);

    const parser = new XMLParser({ trimValues: true });
    const json = parser.parse(res.data);

    let layersData = json.zwsResponse?.GetLayerList?.Layer;
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

