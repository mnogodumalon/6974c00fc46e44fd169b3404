// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Auftragsbestaetigung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    ab_pdf?: string;
    ab_ocr_status?: boolean;
    ab_nummer?: string;
    ab_lieferant?: string;
    ab_datum?: string; // Format: YYYY-MM-DD oder ISO String
    ab_positionen?: string;
  };
}

export interface Bestellung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    bestellung_pdf?: string;
    bestellung_ocr_status?: boolean;
    bestellung_nummer?: string;
    bestellung_lieferant?: string;
    bestellung_datum?: string; // Format: YYYY-MM-DD oder ISO String
    bestellung_positionen?: string;
  };
}

export interface AutomatischerAbgleich {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    abgleich_bestellung?: string; // applookup -> URL zu 'Bestellung' Record
    abgleich_ab?: string; // applookup -> URL zu 'Auftragsbestaetigung' Record
    abgleich_status?: boolean;
    abgleich_abweichungen?: string;
  };
}

export interface AbgleichStarten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    abgleich_bestellung?: string; // applookup -> URL zu 'Bestellung' Record
    abgleich_ab?: string; // applookup -> URL zu 'Auftragsbestaetigung' Record
  };
}

export interface Abgleichsergebnis {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    ergebnis_abgleich_referenz?: string; // applookup -> URL zu 'AbgleichStarten' Record
    abgleich_status?: boolean;
    abgleich_abweichungen?: string;
    abgleich_weiter?: boolean;
  };
}

export const APP_IDS = {
  AUFTRAGSBESTAETIGUNG: '6974c0030c018953722d51d8',
  BESTELLUNG: '6974bfff33b1830867bd937b',
  AUTOMATISCHER_ABGLEICH: '6974c003a5ae425a8e64d3b3',
  ABGLEICH_STARTEN: '697b99e079c6ebbe2c0b68c2',
  ABGLEICHSERGEBNIS: '697b99e14b5173ee3695e8cf',
} as const;

// Helper Types for creating new records
export type CreateAuftragsbestaetigung = Auftragsbestaetigung['fields'];
export type CreateBestellung = Bestellung['fields'];
export type CreateAutomatischerAbgleich = AutomatischerAbgleich['fields'];
export type CreateAbgleichStarten = AbgleichStarten['fields'];
export type CreateAbgleichsergebnis = Abgleichsergebnis['fields'];