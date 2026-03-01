// Popular neighborhood names → 4-digit postcodes that belong to that area.
// CBS uses fine-grained buurt names (e.g. "Anjeliersbuurt-Noord") instead of
// popular names (e.g. "Jordaan"). This mapping lets users search by the names
// they actually know. Applied during data processing via postcode matching.

export interface AreaAlias {
  name: string;
  postcodes: string[]; // 4-digit postcodes that fall within this area
}

// Keyed by city ID
export const NEIGHBORHOOD_ALIASES: Record<string, AreaAlias[]> = {
  amsterdam: [
    { name: "Jordaan", postcodes: ["1015", "1016"] },
    { name: "De Pijp", postcodes: ["1072", "1073"] },
    { name: "Oud-West", postcodes: ["1054", "1053"] },
    { name: "Oud-Zuid", postcodes: ["1071", "1072", "1073", "1074", "1075", "1076", "1077"] },
    { name: "Centrum", postcodes: ["1011", "1012", "1013", "1014", "1015", "1016", "1017"] },
    { name: "De Wallen", postcodes: ["1012"] },
    { name: "Rivierenbuurt", postcodes: ["1078", "1079"] },
    { name: "Bos en Lommer", postcodes: ["1055", "1056", "1057"] },
    { name: "Westerpark", postcodes: ["1013", "1014", "1015"] },
    { name: "Museumkwartier", postcodes: ["1071"] },
    { name: "Vondelbuurt", postcodes: ["1054", "1071"] },
    { name: "Overtoom", postcodes: ["1054"] },
    { name: "Kinkerbuurt", postcodes: ["1053"] },
    { name: "Oosterparkbuurt", postcodes: ["1091", "1092"] },
    { name: "Indische Buurt", postcodes: ["1094", "1095"] },
    { name: "Dapperbuurt", postcodes: ["1093"] },
    { name: "Watergraafsmeer", postcodes: ["1097", "1098"] },
    { name: "IJburg", postcodes: ["1087"] },
    { name: "Zuidas", postcodes: ["1082", "1083"] },
    { name: "Buitenveldert", postcodes: ["1081", "1082", "1083"] },
    { name: "Amstelveen", postcodes: ["1186", "1187"] },
    { name: "Noord", postcodes: ["1031", "1032", "1033", "1034", "1035", "1036"] },
    { name: "Nieuw-West", postcodes: ["1061", "1062", "1063", "1064", "1065", "1066", "1067", "1068", "1069"] },
    { name: "Zuidoost", postcodes: ["1101", "1102", "1103", "1104", "1105", "1106", "1107", "1108", "1109"] },
    { name: "Bijlmer", postcodes: ["1101", "1102", "1103", "1104", "1105"] },
    { name: "Slotermeer", postcodes: ["1063", "1064"] },
    { name: "Osdorp", postcodes: ["1068", "1069"] },
    { name: "Slotervaart", postcodes: ["1065", "1066"] },
    { name: "Geuzenveld", postcodes: ["1067"] },
    { name: "Plantagebuurt", postcodes: ["1018"] },
    { name: "Negen Straatjes", postcodes: ["1016"] },
    { name: "Leidseplein", postcodes: ["1017"] },
    { name: "Rembrandtplein", postcodes: ["1017"] },
    { name: "Spaarndammerbuurt", postcodes: ["1013"] },
    { name: "Staatsliedenbuurt", postcodes: ["1055"] },
  ],
  haarlem: [
    { name: "Centrum", postcodes: ["2011", "2012"] },
    { name: "Schalkwijk", postcodes: ["2034", "2035", "2036"] },
    { name: "Noord", postcodes: ["2013", "2014", "2015"] },
    { name: "Schoten", postcodes: ["2023", "2024"] },
  ],
};
