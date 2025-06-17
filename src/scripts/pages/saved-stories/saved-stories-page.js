import "./saved-stories-page.css";
import View from "../../views/view";

export default class SavedStoriesPage {
  #view;

  constructor() {
    this.#view = new View();
  }

  async render() {
    return `<section class="saved-stories-container"><h1>Memuat Cerita Tersimpan...</h1></section>`;
  }

  async afterRender(presenter) {
    this.#view.setPresenter(presenter);
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "/login";
      return;
    }

    try {
      const savedStories = await presenter.renderSavedStoriesPage();
      this.#view.displaySavedStories(savedStories);
    } catch (error) {
      this.#view.showError("Gagal memuat cerita tersimpan: " + (error.message || "Terjadi kesalahan"), true);
    }
  }
}
