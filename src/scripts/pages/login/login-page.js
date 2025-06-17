import "./login-page.css";
import View from "../../views/view";

export default class LoginPage {
  #view;

  constructor() {
    this.#view = new View();
  }

  async render() {
    return this.#view.renderLoginForm();
  }

  async afterRender(presenter) {
    this.#view.setPresenter(presenter);
    this.#view.displayLoginForm();
  }
}