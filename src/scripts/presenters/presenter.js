export default class Presenter {
  #model;
  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;
  }

  async handleLogin(email, password) {
    const loginResult = await this.#model.loginUser(email, password);
    return loginResult;
  }

  async handleRegister(name, email, password) {
    const registerResult = await this.#model.registerUser(name, email, password);
    return registerResult;
  }

  async handleStories() {
    const stories = await this.#model.getStories();
    return stories;
  }

  async handleAddStory(formData) {
    try {
      await this.#model.addStory(formData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async handleSavedStories() {
    const savedStories = await this.#model.getSavedStories();
    return savedStories;
  }

  async saveStory(storyId) {
    try {
      console.log("Attempting to save story with ID:", storyId, "Type:", typeof storyId);
      await this.#model.saveStory(storyId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async deleteSavedStory(storyId) {
    try {
      await this.#model.deleteSavedStory(storyId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  getSavedStories() {
    return this.#model.getSavedStories();
  }

  async handleMaps() {
    try {
      const stories = await this.#model.getStories();
      const storiesWithLocation = Array.isArray(stories) ? stories.filter((story) => story.lat && story.lon) : [];
      return {
        html: this.#view.renderMaps(),
        stories: storiesWithLocation,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  renderLoginPage() {
    const loginHTML = this.#view.renderLoginForm();
    return loginHTML;
  }

  renderRegisterPage() {
    const registerHTML = this.#view.renderRegisterForm();
    return registerHTML;
  }

  async renderStoriesPage() {
    const stories = await this.handleStories();
    return stories;
  }

  renderAddStoryPage() {
    const addStoryHTML = this.#view.renderAddStoryForm();
    return addStoryHTML;
  }

  async renderSavedStoriesPage() {
    const savedStories = await this.#model.getSavedStories();
    return savedStories;
  }

  async renderMapsPage() {
    const data = await this.handleMaps();
    return data;
  }

  renderAboutPage() {
    const aboutHTML = this.#view.renderAbout();
    return aboutHTML;
  }

  logout() {
    this.#model.logout();
    return { success: true };
  }

  async subscribeToNotifications(subscription) {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "User is not logged in" };
    }
    try {
      return await this.#model.subscribeToNotifications(subscription);
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async unsubscribeFromNotifications(endpoint) {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "User is not logged in" };
    }
    try {
      return await this.#model.unsubscribeFromNotifications(endpoint);
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
