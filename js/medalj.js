// Medaljongerna i berättelserutan: små målade bilder av det som hände (en ny gruva, mark, män som kom hem).
// Samma stil som världen: platta färger med mörk kontur, lite kantigt. Varje bild är 50 x 50.
(function () {
  'use strict';
  const V = window.VASA = window.VASA || {};
  const K = 'stroke="#1e140b" stroke-width="1.8" stroke-linejoin="round"';
  const s = inner => '<svg viewBox="0 0 50 50"><g ' + K + '>' + inner + '</g></svg>';
  V.MED = {
    // gruvöppning i berget med timmer och en malmvagn
    gruva: s('<path d="M3 45L17 17l7 6 6-12 17 34z" fill="#9a8a74"/><path d="M17 17l7 6-4 3zM30 11l5 10-5-3z" fill="#b9ab94" stroke="none"/><path d="M16 45V29h18v16" fill="#2a1d12"/><path d="M14 45V28h22v17" fill="none" stroke="#a8743a" stroke-width="3.6"/><path d="M12 28h26" stroke="#c58a45" stroke-width="4.6" stroke-linecap="round"/><path d="M12 28h26" stroke-width="1"/><rect x="19" y="36" width="12" height="6.5" rx="1" fill="#d07a3a"/><path d="M20 36l1.6-2.6h6.8L30 36z" fill="#e89a50"/><circle cx="21.5" cy="44" r="1.8" fill="#4a4a4a"/><circle cx="28.5" cy="44" r="1.8" fill="#4a4a4a"/>'),
    // stad: borgarhus med röda tak och kyrktorn
    stad: s('<path d="M3 45V28l7-7 7 7v17z" fill="#efe6d2"/><path d="M1.5 29L10 20l8.5 9z" fill="#c4432f"/><path d="M19 45V16l5-9 5 9v29z" fill="#e2d6bc"/><path d="M18 17l6-12 6 12z" fill="#5a6d7a"/><path d="M31 45V30l8-8 8 8v15z" fill="#f2e8d4"/><path d="M29.5 31L39 21.5l9.5 9.5z" fill="#d0592f"/><path d="M8 45v-6h4v6M36 45v-6h5v6M22 45v-7h4v7" fill="#5a3a22"/><path d="M22 23h4v4h-4z" fill="#3a2a1c"/>'),
    // bygd: röd stuga med torvtak och en gran
    bygd: s('<path d="M38 45l-5-9h3l-4-8h3l-4-8 8 0" fill="none" stroke="none"/><path d="M40 8l-8 13h4l-6 10h5l-6 10h22l-6-10h5l-6-10h4z" fill="#3f6e3a"/><path d="M39 41h2v4h-2z" fill="#6a4a2a"/><path d="M5 45V29h24v16z" fill="#a8372a"/><path d="M2.5 30L17 18l14.5 12z" fill="#6f8a3a"/><path d="M14 45v-9h6v9" fill="#3a2414"/><path d="M8 33h4v4H8zM23 33h4v4h-4z" fill="#f2d98a"/><path d="M5 29h24" stroke="#efe6d2" stroke-width="1.2"/>'),
    // slott: stentorn med kungens fana
    slott: s('<path d="M24 4v12" /><path d="M24.5 4.5h13l-3 3.5 3 3.5h-13z" fill="#2f5ea8"/><path d="M28 6.5h2.5v3H28z" fill="#e8c040" stroke="none"/><path d="M5 45V24h5v3h4v-3h5v3h4v-3h5v21z" fill="#cfc6b4"/><path d="M15 45V16h4v3h4v-3h5v3h4v-3h4v29z" fill="#e4dccb"/><path d="M33 45V26h4v3h4v-3h5v19z" fill="#cfc6b4"/><path d="M21 45v-9c0-3 5-3 5 0v9z" fill="#3a2a1c"/><path d="M22 24h3v4h-3z" fill="#3a2a1c"/>'),
    // mark: en stapel silvermynt och ett mynt med kronan
    mark: s('<ellipse cx="19" cy="41" rx="13" ry="4.6" fill="#8f979f"/><path d="M6 41v-5h26v5" fill="#c8ced4"/><ellipse cx="19" cy="36" rx="13" ry="4.6" fill="#dde2e6"/><path d="M6 36v-5h26v5" fill="#c8ced4"/><ellipse cx="19" cy="31" rx="13" ry="4.6" fill="#eef1f3"/><circle cx="34" cy="20" r="12" fill="#e3e7ea" stroke-width="2"/><circle cx="34" cy="20" r="8" fill="none" stroke="#8f979f" stroke-width="1.3"/><path d="M29.5 23.5v-5.5l2.2 2 2.3-3.5 2.3 3.5 2.2-2v5.5z" fill="#e8c040" stroke-width="1.2"/>'),
    // män: tre dalkarlar, en med stålhatt
    man: s('<path d="M3 47c0-8 4-12 10-12s10 4 10 12z" fill="#6b7d4a"/><rect x="8" y="23" width="10" height="11" rx="2" fill="#e8b48c"/><path d="M7 24h12v-4c0-3-2.4-5-6-5s-6 2-6 5z" fill="#8a5a32"/><path d="M27 47c0-8 4-12 10-12s10 4 10 12z" fill="#7a5a3a"/><rect x="32" y="23" width="10" height="11" rx="2" fill="#e8b48c"/><path d="M31 24h12l-1.5-5h-9z" fill="#c64a3a"/><path d="M13 47c0-9 5-14 12-14s12 5 12 14z" fill="#3f5a7a"/><rect x="19" y="17" width="12" height="13" rx="2.5" fill="#f0c098"/><path d="M19 26.5h12v3c0 3-3 4.5-6 4.5s-6-1.5-6-4.5z" fill="#c08a4a"/><path d="M16.5 19c0-6 4-9.5 8.5-9.5s8.5 3.5 8.5 9.5z" fill="#b9c0c8"/><path d="M14.5 19h21" stroke-width="2.2"/>'),
    // krona
    krona: s('<path d="M6 38V16l9 9 10-15 10 15 9-9v22z" fill="#e8c040"/><path d="M6 38h38v6H6z" fill="#c9992e"/><circle cx="25" cy="10" r="2.6" fill="#c4432f"/><circle cx="6" cy="16" r="2.2" fill="#e8c040"/><circle cx="44" cy="16" r="2.2" fill="#e8c040"/><path d="M14 41h3M23.5 41h3M33 41h3" stroke="#c4432f" stroke-width="2.4"/>'),
    // pil uppåt över mynt: allt ger mer
    upp: s('<circle cx="25" cy="34" r="12" fill="#e3e7ea"/><circle cx="25" cy="34" r="8" fill="none" stroke="#8f979f" stroke-width="1.2"/><path d="M25 3l13 14h-7v12H19V17h-7z" fill="#f2cf5a" stroke="#6b4a12" stroke-width="2"/>'),
    // fart: en häst i språng
    fart: s('<path d="M2 20h8M1 27h7M3 34h6" stroke="#8a6a45" stroke-width="2" stroke-linecap="round"/><path d="M13 30c2-6 8-8 16-8l5-8c1-2 4-3 6-2l6 4-2 3-4-1-3 6c0 5-2 8-5 9l3 9h-3.5l-4-7h-7l-4 7H13.5l3-8c-2-1-3-2-3.5-4z" fill="#8a5a32"/><path d="M34 14c-3 1-5 4-6 8" fill="none" stroke-width="2.4" stroke="#3a2414"/><circle cx="41" cy="16" r="1" fill="#1e140b"/>'),
    // skuld: ett lånebrev med rött sigill
    skuld: s('<path d="M10 5h22l8 8v32H10z" fill="#f4ead0"/><path d="M32 5v8h8" fill="#dccca6"/><path d="M15 17h18M15 23h18M15 29h12" stroke="#8a6a45" stroke-width="1.8"/><circle cx="32" cy="37" r="7" fill="#b8312a"/><path d="M29 37h6M32 34v6" stroke="#7a1a14" stroke-width="1.4"/>'),
    // uppror: högaffel och fackla
    uppror: s('<path d="M14 46L34 8" stroke="#8a5a32" stroke-width="3.4" stroke-linecap="round"/><path d="M30 6l4.5 2.4M32 3l4.4 2.6M28 9l4.5 2.4" stroke-width="2"/><path d="M36 46L20 14" stroke="#6a4a2a" stroke-width="3.6" stroke-linecap="round"/><path d="M20 15c-5-3-5-9 0-13 0 4 4 4 4 8 2-1 2-3 2-4 3 4 1 10-6 9z" fill="#f29a2a"/><path d="M20.5 13c-2-2-1-5 0-6 1 2 3 3 2 5z" fill="#f7dc7a" stroke="none"/>'),
    // lugnt igen: stuga med en grön bock
    frid: s('<path d="M5 45V27h24v18z" fill="#a8372a"/><path d="M2.5 28L17 16l14.5 12z" fill="#6f8a3a"/><path d="M14 45v-9h6v9" fill="#3a2414"/><circle cx="37" cy="17" r="10" fill="#7fae3a"/><path d="M32 17l4 4 6.5-7.5" fill="none" stroke="#fff7df" stroke-width="3" stroke-linecap="round"/>'),
    // arv: en kista med guld
    kista: s('<path d="M6 24h38v20H6z" fill="#8a5a32"/><path d="M6 24c0-8 5-12 19-12s19 4 19 12z" fill="#a8743a"/><path d="M6 24h38" stroke-width="2.2"/><path d="M14 13v31M36 13v31" stroke="#c9a24a" stroke-width="3"/><path d="M21 27h8v7h-8z" fill="#e8c040"/><circle cx="25" cy="30.5" r="1.3" fill="#1e140b"/>'),
    // en lübsk kogg
    kogg: s('<path d="M4 32h42l-6 11H11z" fill="#8a5a32"/><path d="M4 32l3-5h6l1 5M46 32l-3-5h-6l-1 5" fill="#a8743a"/><path d="M25 32V5" stroke-width="2.2"/><path d="M13 9h24l-2 18H15z" fill="#f4ead0"/><path d="M19 12v12M31 12v12" stroke="#b8312a" stroke-width="3"/><path d="M2 47c4-2 8 2 12 0s8 2 12 0 8 2 12 0 8 2 10 0" fill="none" stroke="#3a78a8" stroke-width="2"/>'),
    // en kvinna i dok: Kristina Gyllenstierna
    kvinna: s('<path d="M9 47c0-10 7-15 16-15s16 5 16 15z" fill="#7a2a3a"/><path d="M14 28c0-10 5-17 11-17s11 7 11 17l-2 6H16z" fill="#f4ead0"/><rect x="18.5" y="16" width="13" height="15" rx="3" fill="#f0c098"/><path d="M18.5 22h13M20 16h10" fill="none" stroke="#f4ead0" stroke-width="3"/><circle cx="22.5" cy="23.5" r="1" fill="#1e140b"/><circle cx="27.5" cy="23.5" r="1" fill="#1e140b"/><path d="M22 34l3 3 3-3" fill="#e8c040"/>')
  };
})();
