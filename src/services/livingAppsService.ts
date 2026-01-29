// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Abgleichsergebnis, Auftragsbestaetigung, Bestellung, AbgleichStarten, AutomatischerAbgleich } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- ABGLEICHSERGEBNIS ---
  static async getAbgleichsergebnis(): Promise<Abgleichsergebnis[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.ABGLEICHSERGEBNIS}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getAbgleichsergebni(id: string): Promise<Abgleichsergebnis | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.ABGLEICHSERGEBNIS}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createAbgleichsergebni(fields: Abgleichsergebnis['fields']) {
    return callApi('POST', `/apps/${APP_IDS.ABGLEICHSERGEBNIS}/records`, { fields });
  }
  static async updateAbgleichsergebni(id: string, fields: Partial<Abgleichsergebnis['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.ABGLEICHSERGEBNIS}/records/${id}`, { fields });
  }
  static async deleteAbgleichsergebni(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.ABGLEICHSERGEBNIS}/records/${id}`);
  }

  // --- AUFTRAGSBESTAETIGUNG ---
  static async getAuftragsbestaetigung(): Promise<Auftragsbestaetigung[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.AUFTRAGSBESTAETIGUNG}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getAuftragsbestaetigungEntry(id: string): Promise<Auftragsbestaetigung | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.AUFTRAGSBESTAETIGUNG}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createAuftragsbestaetigungEntry(fields: Auftragsbestaetigung['fields']) {
    return callApi('POST', `/apps/${APP_IDS.AUFTRAGSBESTAETIGUNG}/records`, { fields });
  }
  static async updateAuftragsbestaetigungEntry(id: string, fields: Partial<Auftragsbestaetigung['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.AUFTRAGSBESTAETIGUNG}/records/${id}`, { fields });
  }
  static async deleteAuftragsbestaetigungEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.AUFTRAGSBESTAETIGUNG}/records/${id}`);
  }

  // --- BESTELLUNG ---
  static async getBestellung(): Promise<Bestellung[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.BESTELLUNG}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getBestellungEntry(id: string): Promise<Bestellung | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.BESTELLUNG}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createBestellungEntry(fields: Bestellung['fields']) {
    return callApi('POST', `/apps/${APP_IDS.BESTELLUNG}/records`, { fields });
  }
  static async updateBestellungEntry(id: string, fields: Partial<Bestellung['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.BESTELLUNG}/records/${id}`, { fields });
  }
  static async deleteBestellungEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.BESTELLUNG}/records/${id}`);
  }

  // --- ABGLEICH_STARTEN ---
  static async getAbgleichStarten(): Promise<AbgleichStarten[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.ABGLEICH_STARTEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getAbgleichStartenEntry(id: string): Promise<AbgleichStarten | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.ABGLEICH_STARTEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createAbgleichStartenEntry(fields: AbgleichStarten['fields']) {
    return callApi('POST', `/apps/${APP_IDS.ABGLEICH_STARTEN}/records`, { fields });
  }
  static async updateAbgleichStartenEntry(id: string, fields: Partial<AbgleichStarten['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.ABGLEICH_STARTEN}/records/${id}`, { fields });
  }
  static async deleteAbgleichStartenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.ABGLEICH_STARTEN}/records/${id}`);
  }

  // --- AUTOMATISCHER_ABGLEICH ---
  static async getAutomatischerAbgleich(): Promise<AutomatischerAbgleich[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.AUTOMATISCHER_ABGLEICH}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getAutomatischerAbgleichEntry(id: string): Promise<AutomatischerAbgleich | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.AUTOMATISCHER_ABGLEICH}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createAutomatischerAbgleichEntry(fields: AutomatischerAbgleich['fields']) {
    return callApi('POST', `/apps/${APP_IDS.AUTOMATISCHER_ABGLEICH}/records`, { fields });
  }
  static async updateAutomatischerAbgleichEntry(id: string, fields: Partial<AutomatischerAbgleich['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.AUTOMATISCHER_ABGLEICH}/records/${id}`, { fields });
  }
  static async deleteAutomatischerAbgleichEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.AUTOMATISCHER_ABGLEICH}/records/${id}`);
  }

}