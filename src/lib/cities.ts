export interface CityConfig {
  id: string; // URL slug
  name: string;
  gemeenteCode: string; // CBS code without prefix
  center: [number, number]; // [lat, lng]
  zoom: number;
}

export const CITIES: CityConfig[] = [
  { id: "amsterdam", name: "Amsterdam", gemeenteCode: "0363", center: [52.3676, 4.9041], zoom: 12 },
  { id: "haarlem", name: "Haarlem", gemeenteCode: "0392", center: [52.3874, 4.6462], zoom: 13 },
  { id: "bloemendaal", name: "Bloemendaal", gemeenteCode: "0377", center: [52.4019, 4.6208], zoom: 13 },
  { id: "edam-volendam", name: "Edam-Volendam", gemeenteCode: "0385", center: [52.5075, 5.0517], zoom: 13 },
  { id: "purmerend", name: "Purmerend", gemeenteCode: "0439", center: [52.5050, 4.9597], zoom: 13 },
  { id: "zaanstad", name: "Zaanstad", gemeenteCode: "0479", center: [52.4550, 4.8125], zoom: 12 },
  { id: "haarlemmermeer", name: "Haarlemmermeer", gemeenteCode: "0394", center: [52.3030, 4.6970], zoom: 12 },
  { id: "amstelveen", name: "Amstelveen", gemeenteCode: "0362", center: [52.3013, 4.8648], zoom: 13 },
  { id: "diemen", name: "Diemen", gemeenteCode: "0384", center: [52.3400, 4.9600], zoom: 14 },
  { id: "ouder-amstel", name: "Ouder-Amstel", gemeenteCode: "0437", center: [52.2960, 4.9120], zoom: 13 },
  { id: "wijdemeren", name: "Wijdemeren", gemeenteCode: "1696", center: [52.2050, 5.0600], zoom: 13 },
  { id: "de-ronde-venen", name: "De Ronde Venen", gemeenteCode: "0736", center: [52.2150, 4.9000], zoom: 13 },
  { id: "tilburg", name: "Tilburg", gemeenteCode: "0855", center: [51.5555, 5.0913], zoom: 13 },
  { id: "rotterdam", name: "Rotterdam", gemeenteCode: "0599", center: [51.9225, 4.4792], zoom: 12 },
  { id: "den-haag", name: "Den Haag", gemeenteCode: "0518", center: [52.0705, 4.3007], zoom: 12 },
  // Limburg
  { id: "maastricht", name: "Maastricht", gemeenteCode: "0935", center: [50.8514, 5.6910], zoom: 13 },
  { id: "venlo", name: "Venlo", gemeenteCode: "0983", center: [51.3700, 6.1681], zoom: 13 },
  { id: "sittard-geleen", name: "Sittard-Geleen", gemeenteCode: "1883", center: [51.0107, 5.8229], zoom: 13 },
  { id: "heerlen", name: "Heerlen", gemeenteCode: "0917", center: [50.8837, 5.9815], zoom: 13 },
  { id: "weert", name: "Weert", gemeenteCode: "0988", center: [51.2517, 5.7069], zoom: 13 },
  { id: "roermond", name: "Roermond", gemeenteCode: "0957", center: [51.1942, 5.9875], zoom: 13 },
  { id: "venray", name: "Venray", gemeenteCode: "0984", center: [51.5250, 5.9750], zoom: 13 },
  { id: "kerkrade", name: "Kerkrade", gemeenteCode: "0928", center: [50.8658, 6.0625], zoom: 13 },
  { id: "brunssum", name: "Brunssum", gemeenteCode: "0899", center: [50.9467, 5.9708], zoom: 14 },
  { id: "landgraaf", name: "Landgraaf", gemeenteCode: "0882", center: [50.8950, 6.0200], zoom: 14 },
  { id: "stein", name: "Stein", gemeenteCode: "0971", center: [50.9692, 5.7667], zoom: 14 },
  { id: "beek", name: "Beek", gemeenteCode: "0888", center: [50.9408, 5.7972], zoom: 14 },
  { id: "meerssen", name: "Meerssen", gemeenteCode: "0938", center: [50.8875, 5.7500], zoom: 14 },
  { id: "vaals", name: "Vaals", gemeenteCode: "0981", center: [50.7700, 6.0175], zoom: 14 },
  { id: "valkenburg-aan-de-geul", name: "Valkenburg aan de Geul", gemeenteCode: "0994", center: [50.8652, 5.8321], zoom: 14 },
  { id: "simpelveld", name: "Simpelveld", gemeenteCode: "0965", center: [50.8342, 5.9820], zoom: 14 },
  { id: "voerendaal", name: "Voerendaal", gemeenteCode: "0986", center: [50.8780, 5.9300], zoom: 14 },
  { id: "gulpen-wittem", name: "Gulpen-Wittem", gemeenteCode: "1729", center: [50.8150, 5.8900], zoom: 14 },
  { id: "eijsden-margraten", name: "Eijsden-Margraten", gemeenteCode: "1903", center: [50.7900, 5.7700], zoom: 13 },
  { id: "beesel", name: "Beesel", gemeenteCode: "0889", center: [51.2697, 6.0468], zoom: 14 },
  { id: "bergen-lb", name: "Bergen (L.)", gemeenteCode: "0893", center: [51.6000, 6.0333], zoom: 13 },
  { id: "gennep", name: "Gennep", gemeenteCode: "0907", center: [51.6936, 5.9728], zoom: 14 },
  { id: "mook-en-middelaar", name: "Mook en Middelaar", gemeenteCode: "0944", center: [51.7510, 5.8812], zoom: 14 },
  { id: "nederweert", name: "Nederweert", gemeenteCode: "0946", center: [51.2860, 5.7510], zoom: 13 },
  { id: "leudal", name: "Leudal", gemeenteCode: "1640", center: [51.2500, 5.9000], zoom: 13 },
  { id: "maasgouw", name: "Maasgouw", gemeenteCode: "1641", center: [51.1600, 5.8800], zoom: 13 },
  { id: "horst-aan-de-maas", name: "Horst aan de Maas", gemeenteCode: "1507", center: [51.4500, 6.0500], zoom: 13 },
  { id: "roerdalen", name: "Roerdalen", gemeenteCode: "1669", center: [51.1400, 6.0700], zoom: 13 },
  { id: "echt-susteren", name: "Echt-Susteren", gemeenteCode: "1711", center: [51.1000, 5.8700], zoom: 13 },
  { id: "beekdaelen", name: "Beekdaelen", gemeenteCode: "1954", center: [50.9200, 5.8800], zoom: 13 },
];

export function getCityById(id: string): CityConfig | undefined {
  return CITIES.find((c) => c.id === id);
}

export function getCityByGemeenteCode(code: string): CityConfig | undefined {
  return CITIES.find((c) => c.gemeenteCode === code);
}
