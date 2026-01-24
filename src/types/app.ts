// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

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

export const APP_IDS = {
  BESTELLUNG: '6974bfff33b1830867bd937b',
  AUFTRAGSBESTAETIGUNG: '6974c0030c018953722d51d8',
  AUTOMATISCHER_ABGLEICH: '6974c003a5ae425a8e64d3b3',
} as const;

// Helper Types for creating new records
export type CreateBestellung = Bestellung['fields'];
export type CreateAuftragsbestaetigung = Auftragsbestaetigung['fields'];
export type CreateAutomatischerAbgleich = AutomatischerAbgleich['fields'];