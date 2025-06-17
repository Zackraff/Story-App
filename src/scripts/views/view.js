import Router from "../router.js";

export default class View {
  renderLoginForm() {
    return `
      <section class="login-container">
        <h1>Login</h1>
        <div id="error-message" class="error-message"></div>
        <div id="success-message" class="success-message"></div>
        <form id="login-form" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Masukkan email Anda" class="login-input"/>
          </div>
          <div class="form-group">
            <label for="password">Kata Sandi</label>
            <input type="password" id="password" name="password" required placeholder="Masukkan kata sandi Anda" class="login-input"/>
          </div>
          <button type="submit" class="login-btn">Login</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  }

  displayLoginForm() {
    document.querySelector("#main-content").innerHTML = this.renderLoginForm();
    const form = document.getElementById("login-form");
    const submitButton = form.querySelector(".login-btn");
    let isSubmitting = false;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;
      submitButton.disabled = true;

      const email = form.email.value;
      const password = form.password.value;
      try {
        await this.presenter.handleLogin(email, password);
        this.showSuccess("Login berhasil!", true);
        Router.navigateTo("/stories");
      } catch (error) {
        this.showError("Login gagal: " + (error.message || "Terjadi kesalahan"), true);
      } finally {
        isSubmitting = false;
        submitButton.disabled = false;
      }
    });
  }

  renderRegisterForm() {
    return `
      <section class="register-container">
        <h1>Daftar</h1>
        <div id="error-message" class="error-message"></div>
        <div id="success-message" class="success-message"></div>
        <form id="register-form" class="register-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" required placeholder="Masukkan nama Anda" class="register-input"/>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Masukkan email Anda" class="register-input"/>
          </div>
          <div class="form-group">
            <label for="password">Kata Sandi</label>
            <input type="password" id="password" name="password" required placeholder="Masukkan kata sandi Anda" class="register-input"/>
          </div>
          <button type="submit" class="register-btn">Daftar</button>
        </form>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }

  displayRegisterForm() {
    document.querySelector("#main-content").innerHTML = this.renderRegisterForm();
    const form = document.getElementById("register-form");
    const submitButton = form.querySelector(".register-btn");
    let isSubmitting = false;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;
      submitButton.disabled = true;

      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;

      if (password.length < 8) {
        this.showError("Kata sandi harus minimal 8 karakter.", true);
        isSubmitting = false;
        submitButton.disabled = false;
        return;
      }

      if (!this.isValidEmail(email)) {
        this.showError("Masukkan alamat email yang valid.", true);
        isSubmitting = false;
        submitButton.disabled = false;
        return;
      }

      try {
        await this.presenter.handleRegister(name, email, password);
        this.showSuccess("Registrasi berhasil! Silakan login.", true);
        Router.navigateTo("/login");
      } catch (error) {
        this.showError("Registrasi gagal: " + (error.message || "Terjadi kesalahan"), true);
      } finally {
        isSubmitting = false;
        submitButton.disabled = false;
      }
    });
  }

  isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  }

  renderStories(stories) {
    if (!Array.isArray(stories)) {
      return `
        <section class="stories-container">
          <h1>Cerita</h1>
          <div id="error-message" class="error-message">Data cerita tidak valid</div>
        </section>
      `;
    }

    return `
      <section class="stories-container">
        <h1>Cerita</h1>
        <div id="error-message" class="error-message"></div>
        <div class="stories-list">
          ${
            stories.length === 0
              ? "<p>Tidak ada cerita yang tersedia.</p>"
              : stories
                  .map(
                    (story) => `
                    <article class="story-card">
                      <img src="${story.photoUrl}" alt="Foto dari ${story.name}" class="story-photo"/>
                      <div class="story-details">
                        <h3 class="story-title">${story.name}</h3>
                        <p class="story-description">${story.description}</p>
                        <p class="story-date">Dibuat pada: ${new Date(story.createdAt).toLocaleDateString()}</p>
                        <p class="story-coordinates">
                          📍 Latitude: ${story.lat || "Tidak ada"}, Longitude: ${story.lon || "Tidak ada"}
                        </p>
                        <button class="detail-button" data-id="${story.id}">Detail Cerita</button>
                        <button class="save-button" data-id="${story.id}">Simpan</button>
                      </div>
                    </article>
                  `
                  )
                  .join("")
          }
        </div>
      </section>
    `;
  }

  displayStories(stories) {
    try {
      if (!Array.isArray(stories)) {
        this.showError("Stories data is not an array", true);
        return;
      }

      if (!stories.every((story) => story.id !== null && story.id !== undefined)) {
        console.error("Some stories are missing ID:", stories);
        this.showError("Beberapa cerita tidak memiliki ID yang valid.", true);
        return;
      }

      document.querySelector("#main-content").innerHTML = this.renderStories(stories);

      const processedButtons = new Set();

      document.querySelectorAll(".detail-button").forEach((button) => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
      });

      document.querySelectorAll(".save-button").forEach((button) => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
      });

      document.querySelectorAll(".detail-button").forEach((button) => {
        button.addEventListener("click", () => {
          const storyId = button.getAttribute("data-id");
          Router.navigateTo(`/stories/${storyId}`);
        });
      });

      document.querySelectorAll(".save-button").forEach((button) => {
        const storyId = button.getAttribute("data-id");

        if (processedButtons.has(storyId)) {
          return;
        }

        processedButtons.add(storyId);

        let isProcessing = false;

        button.addEventListener("click", async (event) => {
          event.stopPropagation();
          if (isProcessing) return;
          isProcessing = true;
          button.disabled = true;

          const story = stories.find((s) => s.id === storyId);
          console.log("Story to save:", story);

          if (!story) {
            this.showError("Cerita tidak ditemukan di daftar.", true);
            isProcessing = false;
            button.disabled = false;
            return;
          }

          try {
            await this.presenter.saveStory(storyId);
            this.showSuccess("Cerita disimpan!", true);
          } catch (error) {
            if (error.message === "Cerita sudah disimpan sebelumnya") {
              this.showError("Cerita ini sudah disimpan sebelumnya!", true);
            } else {
              this.showError("Gagal menyimpan cerita: " + (error.message || "Terjadi kesalahan"), true);
            }
          } finally {
            isProcessing = false;
            button.disabled = false;
          }
        });
      });
    } catch (error) {
      this.showError("Gagal mengambil cerita: " + (error.message || "Terjadi kesalahan"), true);
    }
  }

  renderAddStoryForm() {
    return `
      <section class="add-story-container">
        <h1>Tambah Cerita Baru</h1>
        <div id="error-message" class="error-message"></div>
        <div id="success-message" class="success-message"></div>
        <form id="add-story-form" enctype="multipart/form-data">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" required placeholder="Tulis deskripsi cerita..."></textarea>
          </div>
          <div class="form-group">
            <label for="photo">Foto</label>
            <div class="photo-input">
              <button type="button" id="capture-photo">Ambil Foto dari Kamera</button>
              <input type="file" id="photo" name="photo" accept="image/*">
            </div>
            <div id="camera-preview" style="display: none;">
              <video id="video" autoplay></video>
              <button type="button" id="take-photo">Ambil Foto</button>
              <button type="button" id="close-camera">Tutup Kamera</button>
            </div>
            <canvas id="canvas" style="display: none;"></canvas>
            <img id="photo-preview" style="display: none;" alt="Pratinjau Foto">
          </div>
          <div class="form-group">
            <label>Lokasi</label>
            <div id="map" style="height: 400px;"></div>
          </div>
          <div class="form-group">
            <label for="latitude">Latitude</label>
            <input type="number" id="latitude" name="latitude" readonly>
          </div>
          <div class="form-group">
            <label for="longitude">Longitude</label>
            <input type="number" id="longitude" name="longitude" readonly>
          </div>
          <button type="submit">Tambah Cerita</button>
        </form>
      </section>
    `;
  }

  displayAddStoryForm() {
    document.querySelector("#main-content").innerHTML = this.renderAddStoryForm();

    const form = document.getElementById("add-story-form");
    const photoInput = document.getElementById("photo");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const description = document.getElementById("description").value;
      const photo = photoInput.files[0];
      const latitude = document.getElementById("latitude").value;
      const longitude = document.getElementById("longitude").value;

      if (!photo) {
        this.showError("Silakan unggah foto.", true);
        return;
      }

      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photo);
      formData.append("lat", latitude);
      formData.append("lon", longitude);

      try {
        await this.presenter.handleAddStory(formData);
        this.showSuccess("Cerita berhasil ditambahkan!", true);
        Router.navigateTo("/stories");
      } catch (error) {
        this.showError("Gagal menambahkan cerita: " + (error.message || "Terjadi kesalahan"), true);
      }
    });
  }

  renderMaps() {
    return `
      <section class="maps-container">
        <h1>Peta Cerita</h1>
        <div id="error-message" class="error-message"></div>
        <div id="map" style="height: 600px;"></div>
      </section>
    `;
  }

  displayMaps(data) {
    try {
      const { html, stories } = data;
      if (!Array.isArray(stories)) {
        this.showError("Stories data is not an array", true);
        return;
      }
      const storiesWithLocation = stories.filter((story) => story.lat && story.lon);
      if (storiesWithLocation.length === 0) {
        this.showError("Tidak ada cerita dengan lokasi yang tersedia.", true);
        return;
      }
      document.querySelector("#main-content").innerHTML = html;
    } catch (error) {
      this.showError("Gagal memuat peta: " + (error.message || "Terjadi kesalahan"), true);
    }
  }

  renderSavedStories(stories) {
    if (!Array.isArray(stories)) {
      return `
        <section class="saved-stories-container">
          <h1>Cerita Tersimpan</h1>
          <div id="error-message" class="error-message">Data cerita tersimpan tidak valid</div>
        </section>
      `;
    }

    return `
      <section class="saved-stories-container">
        <h1>Cerita Tersimpan</h1>
        <div id="error-message" class="error-message"></div>
        <div id="saved-stories-list" class="saved-stories-list">
          ${
            stories.length === 0
              ? "<p>Tidak ada cerita yang tersimpan.</p>"
              : stories
                  .map(
                    (story) => `
                    <article class="saved-story-card">
                      <img src="${story.photoUrl}" alt="Foto dari ${story.name}" class="saved-story-photo"/>
                      <div class="saved-story-details">
                        <h3 class="saved-story-title">${story.name}</h3>
                        <p class="saved-story-description">${story.description}</p>
                        <p class="story-date">Dibuat pada: ${new Date(story.createdAt).toLocaleDateString()}</p>
                        <p class="saved-story-coordinates">
                          📍 Latitude: ${story.lat || "Tidak ada"}, Longitude: ${story.lon || "Tidak ada"}
                        </p>
                        <button class="delete-button" data-id="${story.id}">Hapus</button>
                      </div>
                    </article>
                  `
                  )
                  .join("")
          }
        </div>
      </section>
    `;
  }

  displaySavedStories(stories) {
    try {
      if (!Array.isArray(stories)) {
        this.showError("Saved stories data is not an array", true);
        return;
      }
      document.querySelector("#main-content").innerHTML = this.renderSavedStories(stories);

      const processedButtons = new Set();

      document.querySelectorAll(".delete-button").forEach((button) => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
      });

      document.querySelectorAll(".delete-button").forEach((button) => {
        const storyId = button.getAttribute("data-id");

        if (processedButtons.has(storyId)) {
          return;
        }

        processedButtons.add(storyId);

        button.addEventListener("click", async () => {
          try {
            await this.presenter.deleteSavedStory(storyId);
            this.displaySavedStories(await this.presenter.getSavedStories());
            this.showSuccess("Cerita dihapus dari penyimpanan!", true);
          } catch (error) {
            this.showError("Gagal menghapus cerita: " + (error.message || "Terjadi kesalahan"), true);
          }
        });
      });
    } catch (error) {
      this.showError("Gagal mengambil cerita tersimpan: " + (error.message || "Terjadi kesalahan"), true);
    }
  }

  renderAbout() {
    return `
      <section class="about-container">
        <h1>Tentang</h1>
        <p>Aplikasi ini memungkinkan pengguna untuk berbagi cerita seputar Dicoding dengan fitur seperti unggah foto dan lokasi.</p>
      </section>
    `;
  }

  displayAbout() {
    document.querySelector("#main-content").innerHTML = this.renderAbout();
  }

  renderError(message) {
    return `
      <section class="error-container">
        <p class="error-message">${message}</p>
      </section>
    `;
  }

  showError(message, useAlert = true) {
    if (useAlert) {
      alert(`Error: ${message}`);
    } else {
      const errorElement = document.getElementById("error-message");
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
      }
    }
  }

  showSuccess(message, useAlert = true) {
    if (useAlert) {
      alert(message);
    } else {
      const successElement = document.getElementById("success-message");
      if (successElement) {
        successElement.textContent = message;
        successElement.style.display = "block";
      }
    }
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }
}
