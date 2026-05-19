import { NasaApiService } from '../api/nasa-api.js';

export class ApodComponent {
  static async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      // Check cache first
      const cached = localStorage.getItem('mars_apod');
      const cacheDate = localStorage.getItem('mars_apod_date');
      const today = new Date().toISOString().split('T')[0];

      let data;
      if (cached && cacheDate === today) {
        data = JSON.parse(cached);
      } else {
        data = await NasaApiService.getAPOD();
        // Cache result
        localStorage.setItem('mars_apod', JSON.stringify(data));
        localStorage.setItem('mars_apod_date', today);
      }

      this.buildHTML(container, data);
    } catch (error) {
      console.error('APOD Error:', error);
      container.innerHTML = `
        <div class="api-error">
          <p>通信エラー: Communication Error</p>
          <p>Failed to establish link with deep space imaging satellite.</p>
        </div>
      `;
    }
  }

  static buildHTML(container, data) {
    const isVideo = data.media_type === 'video';
    
    // Clear skeletons
    container.innerHTML = '';
    
    const content = document.createElement('div');
    content.className = 'apod-content';
    
    const mediaHTML = isVideo 
      ? `<iframe src="${data.url}" frameborder="0" allowfullscreen></iframe>`
      : `<img src="${data.url}" alt="${data.title}" loading="lazy">`;

    content.innerHTML = `
      <div class="apod-image-wrapper">
        ${mediaHTML}
      </div>
      <div class="apod-info">
        <h3>${data.title}</h3>
        <div class="apod-date">${data.date}</div>
        <p class="apod-desc">${data.explanation}</p>
      </div>
    `;

    container.appendChild(content);
  }
}
