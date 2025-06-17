import "./stories-page.css";
import View from "../../views/view";

export default class StoriesPage {
  #view;

  constructor() {
    this.#view = new View();
  }

  async render() {
    return `<section class="stories-container"><h1>Memuat Cerita...</h1></section>`;
  }

  async afterRender(presenter) {
    this.#view.setPresenter(presenter);
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.hash = "/login";
      return;
    }

    try {
      const stories = await presenter.handleStories();
      console.log("Available stories in stories-page:", stories);
      this.#view.displayStories(stories);
    } catch (error) {
      this.#view.showError("Gagal memuat cerita: " + (error.message || "Terjadi kesalahan"), true);
    }
  }
}