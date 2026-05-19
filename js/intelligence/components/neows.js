import { NasaApiService } from '../api/nasa-api.js';

export class NeoWsComponent {
  static async render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const data = await NasaApiService.getNeoWsFeed();
      const nearEarthObjects = data.near_earth_objects;
      const today = new Date().toISOString().split('T')[0];
      
      let todaysAsteroids = nearEarthObjects[today] || [];
      if (todaysAsteroids.length === 0) {
        // Fallback to first available date key if today is empty
        const firstKey = Object.keys(nearEarthObjects)[0];
        todaysAsteroids = nearEarthObjects[firstKey] || [];
      }

      container.innerHTML = '';

      // Limit to max 6 for dashboard
      const displayAsteroids = todaysAsteroids.slice(0, 8);

      if (displayAsteroids.length === 0) {
        container.innerHTML = '<p>No orbital threats detected.</p>';
        return;
      }

      displayAsteroids.forEach(neo => {
        const isHazard = neo.is_potentially_hazardous_asteroid;
        const speedKph = parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour).toFixed(0);
        const missDistKm = parseFloat(neo.close_approach_data[0].miss_distance.kilometers).toFixed(0);
        const diameterMin = neo.estimated_diameter.meters.estimated_diameter_min.toFixed(1);
        const diameterMax = neo.estimated_diameter.meters.estimated_diameter_max.toFixed(1);

        const card = document.createElement('div');
        card.className = `neo-card ${isHazard ? 'hazard' : ''}`;
        
        card.innerHTML = `
          <div class="neo-name">${neo.name}</div>
          <div class="neo-stat">
            <span class="label">Hazard Status:</span>
            <span class="val" style="color: ${isHazard ? '#ff4c4c' : '#4caf50'}">${isHazard ? 'CRITICAL' : 'SAFE'}</span>
          </div>
          <div class="neo-stat">
            <span class="label">Velocity:</span>
            <span class="val">${formatNumber(speedKph)} km/h</span>
          </div>
          <div class="neo-stat">
            <span class="label">Miss Dist:</span>
            <span class="val">${formatNumber(missDistKm)} km</span>
          </div>
          <div class="neo-stat">
            <span class="label">Est. Size:</span>
            <span class="val">${diameterMin} - ${diameterMax} m</span>
          </div>
        `;

        container.appendChild(card);
      });

    } catch (error) {
      console.error('NeoWs Error:', error);
      container.innerHTML = `
        <div class="api-error" style="grid-column: 1/-1;">
          <p>Radar telemetry lost. Unable to scan orbital paths.</p>
        </div>
      `;
    }
  }
}

// Local helper for formatting numbers
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}
