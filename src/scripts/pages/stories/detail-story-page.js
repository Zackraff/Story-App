import View from "../../views/view";
import { getStoryDetail } from "../../data/api";
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

export default class DetailStoryPage {
  #view;

  constructor(storyId) {
    this.storyId = storyId;
    this.#view = new View();
  }

  async render() {
    return `
      <section class="detail-story-container">
        <h1>Detail Cerita</h1>
        <div id="error-message" class="error-message"></div>
        <div id="story-detail" class="story-detail"></div>
        <div id="map" style="height: 400px;"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "/login";
      return;
    }

    try {
      const story = await getStoryDetail(token, this.storyId);
      const storyDetail = document.getElementById("story-detail");
      storyDetail.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto dari ${story.name}" class="story-photo" />
        <div class="story-details">
          <h3 class="story-title">${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <p class="story-date">Dibuat pada: ${new Date(story.createdAt).toLocaleDateString()}</p>
          <p class="story-coordinates">
            📍 Latitude: ${story.lat || "Tidak ada"}, Longitude: ${story.lon || "Tidak ada"}
          </p>
        </div>
      `;

      if (story.lat && story.lon) {
        const map = L.map("map").setView([story.lat, story.lon], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(`<b>${story.name}</b><br>Latitude: ${story.lat}, Longitude: ${story.lon}`).openPopup();
      } else {
        document.getElementById("map").innerHTML = "<p>Peta tidak tersedia karena lokasi tidak ada.</p>";
      }
    } catch (error) {
      this.#view.showError("Gagal memuat detail cerita: " + error.message);
    }
  }
}