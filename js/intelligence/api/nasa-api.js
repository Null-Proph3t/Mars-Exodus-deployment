import { FetchWrapper } from '../utilities/fetch-wrapper.js';

const DEMO_KEY = 'POznBgGICcRHpso1T2kAEeKu2L3UBERfbHSIiOzg'; // Using DEMO_KEY, but can be replaced if user has a real key
const BASE_URL = 'https://api.nasa.gov';

export class NasaApiService {
  /**
   * Fetch Astronomy Picture of the Day
   */
  static async getAPOD() {
    const url = `${BASE_URL}/planetary/apod?api_key=${DEMO_KEY}`;
    return await FetchWrapper.get(url);
  }

  /**
   * Fetch Near Earth Object Web Service (NeoWs) feed for today
   */
  static async getNeoWsFeed() {
    // Get today's date in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const url = `${BASE_URL}/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${DEMO_KEY}`;
    return await FetchWrapper.get(url);
  }
}
