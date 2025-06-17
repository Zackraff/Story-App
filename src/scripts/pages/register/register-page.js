import "./register-page.css";
import View from "../../views/view";

export default class RegisterPage {
  #view;

  constructor() {
    this.#view = new View();
  }

  async render() {
    return this.#view.renderRegisterForm();
  }

  async afterRender(presenter) {
    this.#view.setPresenter(presenter);
    this.#view.displayRegisterForm();
  }
}