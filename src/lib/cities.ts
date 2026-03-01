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
];

export function getCityById(id: string): CityConfig | undefined {
  return CITIES.find((c) => c.id === id);
}

export function getCityByGemeenteCode(code: string): CityConfig | undefined {
  return CITIES.find((c) => c.gemeenteCode === code);
}
