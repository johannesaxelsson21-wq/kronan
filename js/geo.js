// Rikets geografi: kustlinjer, sjöar, älvar, höjder och växtlighet.
// Allt räknas fram när spelet startar, ur några hundra handskrivna koordinater (longitud, latitud).
// Inget här rör sidan eller three.js, så filen går även att köra i node.
(function (root) {
  'use strict';
  const V = root.VASA = root.VASA || {};

  // ---- kartans mått -------------------------------------------------------------------------
  const LON0 = 9.8, LAT0 = 53.6;                 // sydvästra hörnet
  const S = 40;                                   // världsenheter per latitudgrad
  const SX = S * Math.cos(59.5 * Math.PI / 180);  // världsenheter per longitudgrad
  const CELL = 0.78, GW = 560, GH = 428;          // rutnät: GW x GH rutor, hörnen är (GW+1) x (GH+1)
  const W = GW * CELL, H = GH * CELL;
  const NX = GW + 1, NZ = GH + 1;
  const LAT1 = LAT0 + H / S, LON1 = LON0 + W / SX;

  function toWorld(lon, lat) { return [(lon - LON0) * SX - W / 2, H / 2 - (lat - LAT0) * S]; }
  function toLonLat(x, z) { return [(x + W / 2) / SX + LON0, (H / 2 - z) / S + LAT0]; }
  function toGrid(lon, lat) { return [(lon - LON0) * SX / CELL, (LAT1 - lat) * S / CELL]; }

  // ---- brus ---------------------------------------------------------------------------------
  function hash2(ix, iy, seed) {
    let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y, seed) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10), uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed), c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }
  function fbm(x, y, oct, seed) {
    let s = 0, a = 0.5, n = 0;
    for (let o = 0; o < oct; o++) { s += a * vnoise(x, y, seed + o * 17); n += a; x = x * 2.03 + 11.7; y = y * 2.03 - 5.3; a *= 0.5; }
    return s / n;
  }
  function rng(seed) {             // litet slumptal med frö (mulberry32)
    let a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // ---- kustlinjer (lon, lat) ----------------------------------------------------------------
  // Skandinaviska halvön, medurs från Bottenhavet.
  const LAND_SKAND = [17.9,62.6, 17.45,62.3, 17.4,62.0, 17.5,61.72, 17.15,61.62, 17.25,61.45, 17.15,61.25, 17.3,61.05, 17.2,60.9, 17.35,60.75, 17.2,60.68, 17.35,60.63,
    17.6,60.62, 17.95,60.6, 18.3,60.5, 18.45,60.35, 18.6,60.25, 18.75,60.12, 18.95,59.95, 19.05,59.85, 18.85,59.78, 18.75,59.76, 19.0,59.7, 19.05,59.6, 18.8,59.5,
    18.55,59.45, 18.35,59.4, 18.2,59.36, 18.12,59.33, 18.3,59.3, 18.55,59.33, 18.8,59.3, 18.75,59.15, 18.5,59.1, 18.35,59.0, 18.1,58.95, 17.95,58.9, 17.85,58.78,
    17.7,58.9, 17.55,58.88, 17.35,58.75, 17.1,58.73, 17.2,58.63, 16.95,58.62, 16.4,58.63, 16.25,58.6, 16.6,58.55, 16.9,58.5, 16.7,58.47, 16.4,58.48, 16.65,58.43,
    16.95,58.38, 16.75,58.25, 16.65,58.2, 16.8,58.1, 16.7,57.9, 16.65,57.76, 16.75,57.6, 16.55,57.4, 16.5,57.27, 16.55,57.1, 16.45,56.9, 16.38,56.68, 16.25,56.5,
    16.1,56.3, 15.95,56.15, 15.85,56.08, 15.6,56.17, 15.3,56.17, 14.9,56.16, 14.75,56.02, 14.6,56.0, 14.5,56.03, 14.35,55.95, 14.25,55.85, 14.2,55.7, 14.37,55.55,
    14.2,55.38, 13.82,55.42, 13.35,55.34, 13.1,55.37, 12.82,55.38, 12.95,55.5, 13.0,55.62, 12.9,55.75, 12.83,55.87, 12.68,56.05, 12.45,56.3, 12.8,56.25, 12.62,56.45,
    12.95,56.5, 12.85,56.67, 12.48,56.9, 12.24,57.1, 12.1,57.3, 12.0,57.45, 11.9,57.6, 11.85,57.68, 11.7,57.85, 11.75,58.0, 11.4,58.05, 11.35,58.25, 11.25,58.4,
    11.2,58.6, 11.15,58.8, 11.17,58.95, 11.1,59.1, 10.95,59.15, 10.7,59.4, 10.6,59.65, 10.72,59.9, 10.5,59.85, 10.45,59.6, 10.5,59.4, 10.4,59.2, 10.2,59.0, 10.0,59.0,
    9.7,58.95, 9.0,58.7, 9.0,62.6];
  // Fastlandet runt Östersjön: Jylland, tyska kusten, Preussen, Livland, Ingermanland, Karelen, Finland.
  const LAND_KONT = [10.6,57.75, 10.55,57.45, 10.5,57.2, 10.35,57.0, 10.3,56.7, 10.4,56.55, 10.95,56.42, 10.7,56.2, 10.5,56.28, 10.22,56.15, 10.25,55.95, 10.05,55.85,
    9.9,55.7, 9.78,55.57, 9.6,55.5, 9.5,55.3, 9.6,55.05, 9.75,54.9, 9.45,54.8, 9.9,54.75, 10.0,54.55, 9.85,54.47, 10.15,54.35, 10.3,54.42, 10.65,54.35, 11.05,54.37,
    11.1,54.2, 10.85,54.08, 10.87,53.97, 11.0,53.97, 11.25,53.95, 11.45,53.92, 11.6,54.05, 11.75,54.15, 12.1,54.18, 12.35,54.3, 12.5,54.47, 12.9,54.42, 13.1,54.3,
    13.2,54.2, 13.45,54.1, 13.75,54.13, 14.0,54.05, 14.25,53.93, 14.6,54.0, 15.0,54.1, 15.57,54.18, 16.0,54.25, 16.4,54.5, 16.9,54.6, 17.5,54.75, 18.0,54.83,
    18.35,54.83, 18.45,54.7, 18.55,54.52, 18.65,54.38, 19.0,54.35, 19.4,54.36, 19.65,54.45, 19.9,54.63, 19.98,54.96, 20.5,54.97, 20.95,55.3, 21.1,55.7, 21.05,55.95,
    21.0,56.5, 21.05,56.85, 21.4,57.1, 21.55,57.4, 21.75,57.6, 22.6,57.76, 22.9,57.55, 23.15,57.3, 23.2,57.05, 23.8,56.97, 24.1,57.05, 24.4,57.3, 24.35,57.75,
    24.4,58.1, 24.5,58.38, 24.1,58.3, 23.75,58.35, 23.5,58.57, 23.6,58.75, 23.5,58.95, 23.45,59.2, 24.05,59.38, 24.4,59.45, 24.75,59.45, 25.1,59.5, 25.6,59.62,
    25.9,59.6, 26.4,59.53, 27.0,59.45, 27.6,59.42, 28.05,59.47, 28.1,59.75, 28.5,59.8, 29.05,59.9, 29.7,59.92, 30.2,59.95, 30.0,60.02, 29.95,60.12, 29.6,60.18,
    29.2,60.2, 28.9,60.35, 28.6,60.37, 28.7,60.6, 28.75,60.7, 28.4,60.6, 28.0,60.5, 27.7,60.53, 27.2,60.55, 26.95,60.45, 26.5,60.4, 26.25,60.42, 25.66,60.38,
    25.3,60.22, 24.95,60.15, 24.6,60.1, 24.4,59.98, 24.0,60.0, 23.45,59.95, 23.2,59.85, 22.95,59.82, 23.0,60.0, 22.8,60.1, 22.5,60.15, 22.3,60.3, 22.25,60.43,
    21.95,60.48, 21.5,60.55, 21.3,60.75, 21.4,60.85, 21.45,61.13, 21.5,61.4, 21.45,61.6, 21.3,61.9, 21.2,62.6, 32.5,62.6, 32.5,53.0, 9.0,53.0, 9.0,57.3, 9.6,57.5, 10.2,57.6];
  const ISLANDS = [
    [16.4,56.2, 16.38,56.4, 16.45,56.6, 16.62,56.85, 16.85,57.1, 17.02,57.3, 17.1,57.37, 17.08,57.2, 16.98,57.0, 16.8,56.75, 16.65,56.5, 16.55,56.3, 16.45,56.2],            // Öland
    [18.15,56.92, 18.12,57.1, 18.2,57.38, 18.28,57.63, 18.5,57.82, 18.75,57.9, 18.9,57.93, 19.05,57.9, 19.15,57.97, 19.35,57.98, 19.25,57.88, 19.0,57.8, 18.85,57.72,
      18.8,57.5, 18.75,57.33, 18.55,57.15, 18.4,57.05, 18.3,56.93],                                                                                                     // Gotland
    [14.7,55.1, 14.72,55.25, 14.85,55.3, 15.1,55.2, 15.15,55.1, 15.05,55.0, 14.9,54.98],                                                                                 // Bornholm
    [19.55,60.2, 19.6,60.35, 19.85,60.42, 20.1,60.4, 20.3,60.3, 20.35,60.15, 20.1,60.02, 19.9,60.07, 19.7,60.1],                                                         // Åland
    [12.6,55.72, 12.62,56.03, 12.3,56.12, 11.9,55.97, 11.7,55.95, 11.35,56.0, 11.5,55.88, 11.2,55.75, 11.08,55.68, 11.2,55.5, 11.13,55.33, 11.25,55.2, 11.75,55.2,
      11.9,55.0, 12.15,55.12, 12.45,55.25, 12.25,55.35, 12.2,55.47, 12.4,55.6],                                                                                          // Själland
    [11.0,54.82, 11.1,54.95, 11.6,54.95, 11.9,54.9, 12.15,54.85, 12.05,54.6, 11.8,54.65, 11.45,54.62, 11.1,54.72],                                                       // Lolland och Falster
    [12.15,54.95, 12.3,55.03, 12.55,55.0, 12.4,54.88, 12.2,54.9],                                                                                                        // Mön
    [9.75,55.5, 9.9,55.55, 10.4,55.6, 10.6,55.62, 10.75,55.45, 10.8,55.3, 10.75,55.1, 10.6,55.05, 10.25,55.08, 9.9,55.25],                                               // Fyn
    [10.7,54.75, 10.75,54.95, 10.9,55.15, 10.95,55.05, 10.8,54.8],                                                                                                       // Langeland
    [10.55,55.78, 10.6,55.98, 10.7,55.9, 10.65,55.78],                                                                                                                   // Samsö
    [10.9,57.25, 11.0,57.32, 11.15,57.3, 11.05,57.22],                                                                                                                   // Läsö
    [11.02,54.45, 11.1,54.53, 11.3,54.48, 11.2,54.4],                                                                                                                    // Fehmarn
    [13.1,54.3, 13.15,54.55, 13.35,54.68, 13.6,54.6, 13.7,54.4, 13.75,54.28, 13.4,54.22],                                                                                // Rügen
    [21.85,58.3, 21.95,58.5, 22.3,58.6, 22.9,58.63, 23.3,58.5, 23.1,58.35, 22.75,58.25, 22.5,58.2, 22.3,58.1, 22.1,57.92, 22.0,58.0, 22.15,58.2],                        // Ösel
    [22.05,58.92, 22.4,59.05, 22.75,59.08, 23.05,58.92, 22.9,58.75, 22.5,58.72, 22.3,58.82]                                                                              // Dagö
  ];
  const LAKES = [
    [12.32,58.38, 12.45,58.6, 12.6,58.85, 12.75,59.05, 13.0,59.2, 13.2,59.3, 13.5,59.37, 13.9,59.33, 14.1,59.28, 14.05,59.05, 13.9,58.85, 13.85,58.7, 13.6,58.6,
      13.3,58.5, 13.15,58.48, 12.9,58.45, 12.6,58.42],                                                                                                                   // Vänern
    [14.12,57.77, 14.2,58.0, 14.27,58.3, 14.42,58.5, 14.55,58.7, 14.8,58.88, 14.95,58.85, 14.95,58.7, 15.05,58.55, 14.92,58.45, 14.75,58.3, 14.55,58.1, 14.45,57.95, 14.25,57.77], // Vättern
    [16.0,59.5, 16.3,59.55, 16.55,59.6, 16.9,59.57, 17.1,59.62, 17.3,59.55, 17.52,59.62, 17.58,59.78, 17.68,59.78, 17.72,59.62, 17.85,59.5, 17.95,59.4, 18.03,59.33,
      17.9,59.28, 17.65,59.2, 17.4,59.25, 17.22,59.25, 17.0,59.35, 16.7,59.4, 16.4,59.45, 16.15,59.42],                                                                  // Mälaren
    [15.25,59.27, 15.6,59.3, 16.0,59.3, 16.3,59.27, 16.2,59.15, 15.9,59.15, 15.6,59.2, 15.35,59.22],                                                                     // Hjälmaren
    [14.5,60.98, 14.62,60.99, 14.7,60.93, 14.9,60.9, 15.1,60.9, 15.08,60.82, 15.0,60.76, 14.85,60.77, 14.75,60.83, 14.62,60.85, 14.5,60.9],                              // Siljan
    [14.5,61.02, 14.6,61.02, 14.65,61.1, 14.55,61.12],                                                                                                                   // Orsasjön
    [15.6,60.6, 15.72,60.57, 15.75,60.5, 15.65,60.47, 15.55,60.52],                                                                                                      // Runn
    [13.6,56.82, 13.75,57.0, 13.85,56.95, 13.72,56.8],                                                                                                                   // Bolmen
    [14.6,56.6, 14.75,56.7, 14.85,56.62, 14.7,56.55],                                                                                                                    // Åsnen
    [15.0,57.95, 15.25,58.05, 15.3,57.98, 15.1,57.9],                                                                                                                    // Sommen
    [15.5,58.47, 15.7,58.52, 15.75,58.47, 15.55,58.44],                                                                                                                  // Roxen
    [13.38,57.72, 13.42,57.8, 13.47,57.78, 13.44,57.7],                                                                                                                  // Åsunden
    [16.65,60.55, 16.85,60.62, 16.9,60.56, 16.7,60.52],                                                                                                                  // Storsjön i Gästrikland
    [30.95,59.95, 30.9,60.2, 30.5,60.5, 30.15,61.0, 30.3,61.3, 30.7,61.7, 31.5,61.8, 32.5,61.5, 32.5,60.0, 31.5,59.9],                                                   // Ladoga
    [27.0,58.95, 27.6,59.0, 27.9,58.6, 27.5,58.35, 27.55,58.0, 27.3,58.1, 27.1,58.4, 26.95,58.7],                                                                        // Peipus
    [25.35,61.1, 25.65,61.15, 25.75,61.5, 25.95,61.9, 25.8,62.3, 25.45,62.3, 25.5,61.8, 25.3,61.4],                                                                      // Päijänne
    [28.0,61.05, 28.8,61.15, 29.3,61.4, 29.6,61.8, 29.0,62.0, 28.3,61.85, 27.8,61.6, 27.7,61.3],                                                                         // Saimen
    [23.7,61.5, 23.85,61.75, 24.0,61.9, 23.75,61.9, 23.6,61.6],                                                                                                          // Näsijärvi
    [24.0,61.2, 24.4,61.02, 24.5,61.08, 24.2,61.27]                                                                                                                      // Vanajavesi
  ];
  // Älvar som målas på marken (lon, lat, ...), med bredd i världsenheter.
  const RIVERS = [
    { name: 'Österdalälven', w: 0.36, p: [12.9,61.95, 13.4,61.7, 13.75,61.45, 14.04,61.23, 14.3,61.1, 14.5,61.0] },
    { name: 'Dalälven', w: 0.46, p: [15.0,60.75, 15.07,60.62, 15.13,60.56, 15.43,60.49, 15.58,60.45, 15.75,60.35, 15.98,60.28, 16.17,60.15, 16.3,60.1, 16.55,60.15, 16.8,60.2,
      16.88,60.29, 17.24,60.39, 17.4,60.5, 17.45,60.63] },
    { name: 'Västerdalälven', w: 0.36, p: [12.85,61.5, 13.1,61.3, 13.26,61.16, 13.36,60.94, 13.72,60.68, 14.22,60.51, 14.5,60.47, 14.8,60.45, 15.0,60.5, 15.13,60.56] },
    { name: 'Göta älv', w: 0.42, p: [12.32,58.38, 12.29,58.28, 12.13,58.13, 11.97,57.87, 11.97,57.71, 11.85,57.68] },
    { name: 'Klarälven', w: 0.34, p: [12.7,61.0, 12.87,60.73, 13.2,60.4, 13.5,60.17, 13.45,59.8, 13.5,59.38] },
    { name: 'Motala ström', w: 0.34, p: [15.03,58.54, 15.3,58.5, 15.52,58.47, 15.75,58.5, 15.95,58.6, 16.18,58.59, 16.25,58.6] },
    { name: 'Norrström', w: 0.5, p: [18.03,59.33, 18.07,59.335, 18.12,59.33] },
    { name: 'Kymmene älv', w: 0.36, p: [25.75,61.2, 26.2,61.0, 26.6,60.8, 26.9,60.5] },
    { name: 'Vuoksen', w: 0.36, p: [28.7,61.2, 29.2,61.0, 29.8,61.0, 30.15,61.0] },
    { name: 'Neva', w: 0.5, p: [30.95,59.95, 30.6,59.85, 30.2,59.95] },
    { name: 'Narva', w: 0.36, p: [27.75,59.0, 28.1,59.2, 28.2,59.38, 28.05,59.47] },
    { name: 'Weichsel', w: 0.5, p: [18.75,53.5, 18.8,53.9, 18.85,54.2, 18.95,54.35] },
    { name: 'Oder', w: 0.46, p: [14.4,53.4, 14.55,53.7, 14.5,53.9, 14.25,53.93] },
    { name: 'Trave', w: 0.3, p: [10.4,53.75, 10.69,53.87, 10.87,53.97] }
  ];

  // Landskap som styr höjd, kupering, skog och åker: [lon, lat, radie i grader, värde]
  const ELEV = [[11.8,61.95,0.8,3.2], [12.45,61.3,0.45,1.9], [10.9,61.0,1.1,2.8], [10.3,60.3,1.2,2.4], [9.8,59.5,1.2,2.4], [13.8,61.4,0.8,0.6], [13.7,60.5,0.8,0.7], [15.0,59.95,0.7,0.5],
    [14.6,57.4,0.95,0.9], [25.5,61.6,2.0,0.3], [16.2,61.6,0.9,0.6], [14.5,58.9,0.4,0.4], [16.3,58.75,0.35,0.3]];
  const RUG = [[12.2,61.7,1.4,1.3], [10.8,60.3,1.8,1.0], [14.4,61.0,1.2,0.7], [15.0,60.0,0.9,0.55], [14.6,57.4,1.2,0.6], [16.5,61.5,1.0,0.5], [26.0,61.4,2.5,0.3],
    [17.5,59.95,0.7,-0.28], [16.8,59.55,0.6,-0.2], [15.3,58.42,0.55,-0.28], [13.3,58.3,0.6,-0.22], [13.5,55.8,0.8,-0.3], [11.5,55.5,1.6,-0.3], [10.2,56.2,1.0,-0.25],
    [13.0,54.0,3.0,-0.25], [19.0,54.2,3.0,-0.25], [25.0,58.6,2.0,-0.22], [22.0,56.8,2.0,-0.2], [16.75,56.8,0.35,-0.3], [18.5,57.5,0.5,-0.25]];
  const FOREST = [[17.6,59.9,0.55,-0.5], [16.8,59.55,0.55,-0.42], [15.3,58.42,0.5,-0.55], [13.3,58.3,0.55,-0.5], [15.2,59.2,0.4,-0.38], [13.5,55.8,0.8,-0.6],
    [11.5,55.5,1.5,-0.65], [10.2,56.2,1.0,-0.5], [13.0,53.9,3.5,-0.42], [19.0,54.1,3.0,-0.4], [25.0,58.7,1.8,-0.28], [16.75,56.8,0.35,-0.5], [18.5,57.5,0.5,-0.32],
    [22.5,60.6,0.6,-0.3], [16.3,56.7,0.3,-0.3], [12.6,56.9,0.5,-0.35], [12.0,57.8,0.4,-0.3], [16.6,60.0,0.3,-0.2], [14.9,60.95,0.25,-0.22], [15.6,60.5,0.3,-0.22]];

  function blob(list, lon, lat) {
    let s = 0;
    for (let k = 0; k < list.length; k++) { const b = list[k], dx = (lon - b[0]) * 0.5075, dy = lat - b[1]; s += b[3] * Math.exp(-(dx * dx + dy * dy) / (b[2] * b[2])); }
    return s;
  }

  // ---- raster -------------------------------------------------------------------------------
  function fillPoly(mask, pts, val) {
    const n = pts.length / 2, gx = new Float64Array(n), gy = new Float64Array(n);
    let ymin = 1e9, ymax = -1e9;
    for (let k = 0; k < n; k++) { const g = toGrid(pts[2 * k], pts[2 * k + 1]); gx[k] = g[0]; gy[k] = g[1]; if (g[1] < ymin) ymin = g[1]; if (g[1] > ymax) ymax = g[1]; }
    const j0 = Math.max(0, Math.ceil(ymin)), j1 = Math.min(NZ - 1, Math.floor(ymax)), xs = [];
    for (let j = j0; j <= j1; j++) {
      xs.length = 0;
      for (let k = 0; k < n; k++) {
        const k2 = (k + 1) % n, ya = gy[k], yb = gy[k2];
        if ((ya <= j && yb > j) || (yb <= j && ya > j)) xs.push(gx[k] + (j - ya) / (yb - ya) * (gx[k2] - gx[k]));
      }
      xs.sort((a, b) => a - b);
      for (let q = 0; q + 1 < xs.length; q += 2) {
        const i0 = Math.max(0, Math.ceil(xs[q])), i1 = Math.min(NX - 1, Math.floor(xs[q + 1]));
        for (let i = i0; i <= i1; i++) mask[j * NX + i] = val;
      }
    }
  }

  // Exakt avståndstransform (Felzenszwalb och Huttenlocher). f: 0 där målet finns, annars stort.
  function edt(src) {
    const INF = 1e12, out = new Float64Array(NX * NZ), n = Math.max(NX, NZ);
    const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
    function pass(len) {
      let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
      for (let q = 1; q < len; q++) {
        let s;
        for (;;) { const p = v[k]; s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p); if (s <= z[k]) k--; else break; }
        k++; v[k] = q; z[k] = s; z[k + 1] = INF;
      }
      k = 0;
      for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; const p = v[k]; d[q] = (q - p) * (q - p) + f[p]; }
    }
    for (let i = 0; i < NX; i++) {
      for (let j = 0; j < NZ; j++) f[j] = src[j * NX + i] ? 0 : INF;
      pass(NZ);
      for (let j = 0; j < NZ; j++) out[j * NX + i] = d[j];
    }
    for (let j = 0; j < NZ; j++) {
      for (let i = 0; i < NX; i++) f[i] = out[j * NX + i];
      pass(NX);
      for (let i = 0; i < NX; i++) out[j * NX + i] = d[i];
    }
    return out;
  }
  function signedDist(land) {       // positivt inne på land, negativt ute på vatten, i världsenheter
    const water = new Uint8Array(NX * NZ);
    for (let k = 0; k < water.length; k++) water[k] = land[k] ? 0 : 1;
    const dw = edt(water), dl = edt(land), sd = new Float32Array(NX * NZ);
    for (let k = 0; k < sd.length; k++) sd[k] = (land[k] ? Math.sqrt(dw[k]) - 0.5 : -(Math.sqrt(dl[k]) - 0.5)) * CELL;
    return sd;
  }

  // Skärgårdar: här bryts kusten upp i öar och vikar.
  const SKARGARD = [[18.8,59.4,0.55,1], [18.3,58.9,0.4,0.8], [21.6,60.2,0.9,1.2], [20.8,60.25,0.6,1], [22.6,59.95,0.5,0.9], [16.8,58.3,0.35,0.8], [16.7,57.6,0.35,0.6],
    [15.5,56.1,0.4,0.8], [11.4,58.3,0.35,0.9], [11.6,57.7,0.25,0.7], [24.5,60.05,0.6,0.6], [26.5,60.35,0.8,0.7], [17.3,60.7,0.3,0.4], [28.3,60.5,0.4,0.6]];

  // ---- bygg hela kartan ---------------------------------------------------------------------
  function build() {
    const t0 = Date.now();
    const land = new Uint8Array(NX * NZ);
    fillPoly(land, LAND_SKAND, 1); fillPoly(land, LAND_KONT, 1);
    for (const p of ISLANDS) fillPoly(land, p, 1);
    const lake0 = new Uint8Array(NX * NZ);
    for (const p of LAKES) { fillPoly(land, p, 0); fillPoly(lake0, p, 1); }

    // 1. gör kusten levande: skjut gränsen med brus, mer i skärgårdarna
    let sd = signedDist(land);
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const k = j * NX + i, x = -W / 2 + i * CELL, z = -H / 2 + j * CELL, ll = toLonLat(x, z);
      const ark = Math.min(1.4, blob(SKARGARD, ll[0], ll[1]));
      let n = (fbm(x * 0.085, z * 0.085, 4, 11) - 0.5) * 2.2 + (fbm(x * 0.17, z * 0.17, 3, 23) - 0.5) * (0.8 + 5.5 * ark);
      if (ark > 0.05 && sd[k] < 0) n += ark * Math.max(0, fbm(x * 0.2, z * 0.2, 2, 5) - 0.5) * 34 * smooth(-11, -1, sd[k]);   // öar och skär
      land[k] = sd[k] + n > 0 ? 1 : 0;
    }
    // 2. småsjöar i skogsbygderna
    sd = signedDist(land);
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const k = j * NX + i; if (sd[k] < 2.2) continue;
      const x = -W / 2 + i * CELL, z = -H / 2 + j * CELL, ll = toLonLat(x, z);
      let dens = 0.015 + 0.1 * smooth(60.6, 62, ll[1]) * smooth(21.5, 24, ll[0]) + 0.1 * Math.exp(-(Math.pow((ll[0] - 27) * 0.5, 2) + Math.pow(ll[1] - 61.6, 2)) / 2.2)
        + 0.045 * Math.exp(-(Math.pow((ll[0] - 15) * 0.5, 2) + Math.pow(ll[1] - 57.3, 2)) / 1.2) + 0.035 * Math.exp(-(Math.pow((ll[0] - 14.8) * 0.5, 2) + Math.pow(ll[1] - 60.2, 2)) / 1.0)
        + 0.03 * Math.exp(-(Math.pow((ll[0] - 16.2) * 0.5, 2) + Math.pow(ll[1] - 61.6, 2)) / 1.0);
      if (ll[1] < 55.9) dens *= 0.3;
      const n = fbm(x * 0.1 + 40, z * 0.16 - 17, 3, 71) * 0.7 + fbm(x * 0.31, z * 0.31, 2, 73) * 0.3;
      if (n > 0.755 - dens) { land[k] = 0; lake0[k] = 1; }
    }
    // jämna ut avståndet så att stränderna blir mjuka kurvor i stället för trappsteg (två varv: det första tar bort småskräp)
    for (let round = 0; round < 2; round++) {
      sd = signedDist(land);
      for (let pass = 0; pass < 2; pass++) {
        const tmp = new Float32Array(sd);
        for (let j = 0; j < NZ; j++) for (let i = 1; i < NX - 1; i++) { const k = j * NX + i; tmp[k] = (sd[k - 1] + 2 * sd[k] + sd[k + 1]) / 4; }
        for (let j = 1; j < NZ - 1; j++) for (let i = 0; i < NX; i++) { const k = j * NX + i; sd[k] = (tmp[k - NX] + 2 * tmp[k] + tmp[k + NX]) / 4; }
      }
      for (let k = 0; k < land.length; k++) land[k] = sd[k] > 0 ? 1 : 0;
    }

    // 3. vad är sjö och vad är hav: allt vatten som inte når kartans kant är sött
    const fresh = new Uint8Array(NX * NZ), seen = new Uint8Array(NX * NZ), stack = [];
    const push = k => { if (!land[k] && !seen[k]) { seen[k] = 1; stack.push(k); } };
    for (let i = 0; i < NX; i++) { push(i); push((NZ - 1) * NX + i); }
    for (let j = 0; j < NZ; j++) { push(j * NX); push(j * NX + NX - 1); }
    while (stack.length) {
      const k = stack.pop(), i = k % NX, j = (k - i) / NX;
      if (i > 0) push(k - 1); if (i < NX - 1) push(k + 1); if (j > 0) push(k - NX); if (j < NZ - 1) push(k + NX);
    }
    for (let k = 0; k < fresh.length; k++) fresh[k] = (!land[k] && (!seen[k] || lake0[k])) ? 1 : 0;
    // vilken sorts strand ligger närmast: sjö (1) eller hav (0)? Sprids några steg in över land.
    const shoreF = new Float32Array(NX * NZ), lab = new Int8Array(NX * NZ).fill(-1);
    for (let k = 0; k < lab.length; k++) if (!land[k]) lab[k] = fresh[k];
    for (let pass = 0; pass < 5; pass++) {
      const nxt = new Int8Array(lab);
      for (let j = 1; j < NZ - 1; j++) for (let i = 1; i < NX - 1; i++) { const k = j * NX + i; if (lab[k] >= 0) continue; const a = Math.max(lab[k - 1], lab[k + 1], lab[k - NX], lab[k + NX]); if (a >= 0) nxt[k] = a; }
      lab.set(nxt);
    }
    for (let k = 0; k < lab.length; k++) shoreF[k] = lab[k] > 0 ? 1 : 0;

    // 4. älvar: avstånd till närmaste älv, för fåran och för målningen
    const rivers = RIVERS.map(r => { const pts = []; for (let k = 0; k < r.p.length; k += 2) pts.push(toWorld(r.p[k], r.p[k + 1])); return { name: r.name, w: r.w, pts: smoothLine(pts, 0.5, 31 + r.name.length) }; });
    const rdist = new Float32Array(NX * NZ).fill(99);
    for (const r of rivers) for (let q = 0; q + 1 < r.pts.length; q++) {
      const a = r.pts[q], b = r.pts[q + 1], pad = 3;
      const i0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - pad + W / 2) / CELL)), i1 = Math.min(NX - 1, Math.ceil((Math.max(a[0], b[0]) + pad + W / 2) / CELL));
      const j0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - pad + H / 2) / CELL)), j1 = Math.min(NZ - 1, Math.ceil((Math.max(a[1], b[1]) + pad + H / 2) / CELL));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const d = segDist(-W / 2 + i * CELL, -H / 2 + j * CELL, a, b) - r.w * 0.5, k = j * NX + i;
        if (d < rdist[k]) rdist[k] = d;
      }
    }

    // 5. höjder och växtlighet
    const height = new Float32Array(NX * NZ), forest = new Float32Array(NX * NZ), field = new Float32Array(NX * NZ), leaf = new Float32Array(NX * NZ), rock = new Float32Array(NX * NZ);
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const k = j * NX + i, x = -W / 2 + i * CELL, z = -H / 2 + j * CELL, ll = toLonLat(x, z), d = sd[k];
      if (d <= 0) {
        const dd = -d; let dep = 0.45 * (1 - Math.exp(-dd / 0.8)) + 0.75 * (1 - Math.exp(-dd / 16));
        if (fresh[k]) dep = Math.min(dep, 0.5);
        height[k] = -dep; continue;
      }
      const rug = Math.max(0.1, 0.42 + blob(RUG, ll[0], ll[1])), el = blob(ELEV, ll[0], ll[1]);
      const inl = smooth(0.2, 7, d), base = 0.3 * (1 - Math.exp(-d / 1.6));
      let h = base + 0.3 * smooth(2, 22, d);
      h += el * inl * (0.55 + 0.9 * fbm(x * 0.03, z * 0.03, 3, 3));
      h += (fbm(x * 0.05, z * 0.05, 4, 7) - 0.42) * 1.9 * rug * inl;
      h += (fbm(x * 0.21, z * 0.21, 3, 9) - 0.5) * 0.3 * rug * smooth(0.1, 2.5, d);
      const rv = rdist[k];
      if (rv < 7) { const vf = smooth(7, 0.3, rv); h = h * (1 - 0.5 * vf) - 0.1 * smooth(1.2, 0, rv) * Math.min(1, h * 3); }      // älvdal och fåra
      height[k] = Math.max(base * 0.6, h);
      const tree = smooth(3.3, 2.5, height[k]);        // trädgränsen på fjället
      let fo = 0.8 + blob(FOREST, ll[0], ll[1]);
      fo += (fbm(x * 0.06, z * 0.06, 3, 41) - 0.5) * 0.7;
      fo *= tree * smooth(0.25, 1.1, d);
      forest[k] = Math.max(0, Math.min(1, fo));
      field[k] = Math.max(0, Math.min(1, (0.62 - fo) * 1.8)) * tree * smooth(0.6, 2, d) * smooth(1.5, 0.6, height[k]);
      leaf[k] = Math.max(0, Math.min(1, smooth(58.6, 55.9, ll[1]) * 0.85 + 0.05 + (fbm(x * 0.09, z * 0.09, 2, 55) - 0.5) * 0.4 + field[k] * 0.25));
      rock[k] = Math.max(0, Math.min(1, (rug - 1.25) * 0.4 + (1 - tree) * 0.6 + blob(SKARGARD, ll[0], ll[1]) * 0.55 * smooth(2.5, 0.2, d)));
    }
    const G = { land, sd, fresh, shoreF, height, forest, field, leaf, rock, rdist, rivers, ms: Date.now() - t0 };
    return G;
  }

  function segDist(x, z, a, b) {
    const vx = b[0] - a[0], vz = b[1] - a[1], wx = x - a[0], wz = z - a[1], l2 = vx * vx + vz * vz;
    let t = l2 > 0 ? (wx * vx + wz * vz) / l2 : 0; t = Math.max(0, Math.min(1, t));
    const dx = wx - t * vx, dz = wz - t * vz; return Math.sqrt(dx * dx + dz * dz);
  }
  // Gör en kantig linje mjuk och lite slingrig (Catmull-Rom och brus).
  function smoothLine(pts, step, seed) {
    const out = [], n = pts.length, P = k => pts[Math.max(0, Math.min(n - 1, k))];
    for (let k = 0; k < n - 1; k++) {
      const p0 = P(k - 1), p1 = P(k), p2 = P(k + 1), p3 = P(k + 2), len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), m = Math.max(2, Math.ceil(len / step));
      for (let q = 0; q < m; q++) {
        const t = q / m, t2 = t * t, t3 = t2 * t;
        let x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        let z = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        if (seed) { const e = Math.sin(Math.PI * Math.min(1, (k + t) / 0.6)) * Math.sin(Math.PI * Math.min(1, (n - 1 - k - t) / 0.6)); x += (fbm(x * 0.22, z * 0.22, 2, seed) - 0.5) * 2.2 * e; z += (fbm(x * 0.22 + 9, z * 0.22, 2, seed + 1) - 0.5) * 2.2 * e; }
        out.push([x, z]);
      }
    }
    out.push(pts[n - 1].slice());
    return out;
  }

  // ---- uppslag ------------------------------------------------------------------------------
  let G = null;
  function sample(arr, x, z) {
    let fx = (x + W / 2) / CELL, fz = (z + H / 2) / CELL;
    fx = Math.max(0, Math.min(GW - 0.001, fx)); fz = Math.max(0, Math.min(GH - 0.001, fz));
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, k = j * NX + i;
    return arr[k] * (1 - u) * (1 - v) + arr[k + 1] * u * (1 - v) + arr[k + NX] * (1 - u) * v + arr[k + NX + 1] * u * v;
  }
  const Geo = V.Geo = {
    LON0, LAT0, LON1, LAT1, S, SX, CELL, GW, GH, NX, NZ, W, H,
    toWorld, toLonLat, fbm, vnoise, hash2, rng, smooth, segDist, smoothLine, blob,
    init() { if (!G) { G = build(); Geo.G = G; } return G; },
    heightAt(x, z) { return sample(G.height, x, z); },
    groundAt(x, z) { return Math.max(0, sample(G.height, x, z)); },      // is och vattenyta räknas som mark
    sdAt(x, z) { return sample(G.sd, x, z); },
    forestAt(x, z) { return sample(G.forest, x, z); },
    fieldAt(x, z) { return sample(G.field, x, z); },
    leafAt(x, z) { return sample(G.leaf, x, z); },
    freshAt(x, z) { return sample(G.fresh, x, z); },
    riverAt(x, z) { return sample(G.rdist, x, z); },
    place(lon, lat) { const p = toWorld(lon, lat); return { x: p[0], z: p[1] }; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Geo;
})(typeof window !== 'undefined' ? window : globalThis);
