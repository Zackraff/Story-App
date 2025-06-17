import "./maps-page.css";
import View from "../../views/view";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default class MapsPage {
  #view;

  constructor() {
    this.#view = new View();
  }

  async render() {
    return this.#view.renderMaps();
  }

  async afterRender(presenter) {
    try {
      const { html, stories } = await presenter.handleMaps();
      document.querySelector("#main-content").innerHTML = html;

      if (stories.length === 0) {
        document.getElementById("map").innerHTML = "<p>Tidak ada cerita dengan lokasi yang tersedia.</p>";
        return;
      }

      const firstStory = stories[0];
      const map = L.map("map").setView([firstStory.lat, firstStory.lon], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      stories.forEach((story) => {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(`<b>${story.name}</b><br>Latitude: ${story.lat}, Longitude: ${story.lon}`);
      });
    } catch (error) {
      this.#view.showError("Gagal memuat peta: " + error.message);
    }
  }
}