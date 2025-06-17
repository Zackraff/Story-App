import View from "../../views/view";

export default class AboutPage {
  #view;

  constructor() {
    this.#view = new View();
  }

  async render() {
    return this.#view.renderAbout();
  }

  async afterRender() {}
}
