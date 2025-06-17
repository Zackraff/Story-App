import "./add-story.css";
import View from "../../views/view";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Router from "../../router.js";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default class AddStoryPage {
  #view;
  #stream = null;

  constructor() {
    this.#view = new View();
  }

  async render() {
    return this.#view.renderAddStoryForm();
  }

  async afterRender(presenter) {
    this.#view.setPresenter(presenter);

    await this.#view.displayAddStoryForm();

    const map = L.map("map").setView([0, 0], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    let marker = L.marker([0, 0]).addTo(map);
    let currentPosition = { lat: 0, lon: 0 };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          currentPosition = { lat: latitude, lon: longitude };
          map.setView([latitude, longitude], 13);
          marker.setLatLng([latitude, longitude]).bindPopup("Lokasi Anda").openPopup();

          const latitudeInput = document.getElementById("latitude");
          const longitudeInput = document.getElementById("longitude");
          if (latitudeInput && longitudeInput) {
            latitudeInput.value = latitude;
            longitudeInput.value = longitude;
          } else {
            console.error("Elemen latitude atau longitude tidak ditemukan di DOM");
          }
        },
        () => {
          this.#view.showError("Gagal mendapatkan lokasi. Silakan pilih lokasi secara manual di peta.", false);
        }
      );
    }

    map.on("click", (e) => {
      currentPosition = { lat: e.latlng.lat, lon: e.latlng.lng };
      marker.setLatLng(e.latlng).bindPopup(`Lokasi: ${e.latlng.lat}, ${e.latlng.lng}`).openPopup();

      const latitudeInput = document.getElementById("latitude");
      const longitudeInput = document.getElementById("longitude");
      if (latitudeInput && longitudeInput) {
        latitudeInput.value = e.latlng.lat;
        longitudeInput.value = e.latlng.lng;
      } else {
        console.error("Elemen latitude atau longitude tidak ditemukan di DOM");
      }
    });

    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const photoPreview = document.getElementById("photo-preview");
    const captureButton = document.getElementById("capture-photo");
    const takePhotoButton = document.getElementById("take-photo");
    const closeCameraButton = document.getElementById("close-camera");
    const photoInput = document.getElementById("photo");

    captureButton.addEventListener("click", async () => {
      try {
        this.#stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = this.#stream;
        document.getElementById("camera-preview").style.display = "block";
      } catch (error) {
        this.#view.showError("Gagal mengakses kamera: " + error.message, true);
      }
    });

    takePhotoButton.addEventListener("click", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg");
      photoPreview.src = dataUrl;
      photoPreview.style.display = "block";
      document.getElementById("camera-preview").style.display = "none";

      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          photoInput.files = dataTransfer.files;
        })
        .catch((error) => {
          this.#view.showError("Gagal memproses foto dari kamera: " + error.message, true);
        });

      if (this.#stream) {
        this.#stream.getTracks().forEach((track) => track.stop());
        this.#stream = null;
      }
    });

    closeCameraButton.addEventListener("click", () => {
      if (this.#stream) {
        this.#stream.getTracks().forEach((track) => track.stop());
        this.#stream = null;
      }
      document.getElementById("camera-preview").style.display = "none";
    });

    photoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file && file.size > 1 * 1024 * 1024) {
        this.#view.showError("Ukuran file maksimum adalah 1MB.", true);
        event.target.value = "";
      } else if (file) {
        photoPreview.src = URL.createObjectURL(file);
        photoPreview.style.display = "block";
      }
    });

    window.addEventListener("beforeunload", () => {
      if (this.#stream) {
        this.#stream.getTracks().forEach((track) => track.stop());
        this.#stream = null;
      }
    });

    window.addEventListener("hashchange", () => {
      if (this.#stream) {
        this.#stream.getTracks().forEach((track) => track.stop());
        this.#stream = null;
        document.getElementById("camera-preview").style.display = "none";
      }
    });
  }
}
