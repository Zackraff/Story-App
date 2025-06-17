import { login, register, getStories, getStoryDetail, addStory, subscribeToNotifications, unsubscribeFromNotifications } from "../data/api";
import { saveStory as dbSaveStory, deleteSavedStory as dbDeleteSavedStory, getAllSavedStories } from "../data/database";

export default class Model {
  static async loginUser(email, password) {
    try {
      const loginResult = await login(email, password);
      localStorage.setItem("token", loginResult.token);
      localStorage.setItem("userId", loginResult.userId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async registerUser(name, email, password) {
    try {
      const message = await register(name, email, password);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async getStories() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User is not logged in");
    }

    try {
      const stories = await getStories(token, 1, 10, 1);
      console.log("Stories from Model:", stories);
      return stories;
    } catch (error) {
      throw new Error("Failed to fetch stories: " + error.message);
    }
  }

  static async getStoryDetail(storyId) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User is not logged in");
    }

    try {
      const story = await getStoryDetail(token, storyId);
      return story || {};
    } catch (error) {
      throw new Error("Failed to fetch story detail: " + error.message);
    }
  }

  static async addStory(formData) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User is not logged in");
    }

    try {
      await addStory(token, formData);
    } catch (error) {
      throw new Error("Failed to add story: " + error.message);
    }
  }

  static async saveStory(storyId) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User is not logged in");
    }

    try {
      const stories = await this.getStories();
      const story = stories.find((s) => s.id === storyId);
      if (!story) {
        throw new Error("Cerita tidak ditemukan");
      }

      const savedStories = await getAllSavedStories();
      if (savedStories.some((s) => s.id === storyId)) {
        throw new Error("Cerita sudah disimpan sebelumnya");
      }

      await dbSaveStory(story);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getSavedStories() {
    const savedStories = await getAllSavedStories();
    if (!Array.isArray(savedStories)) {
      return [];
    }
    return savedStories;
  }

  static async deleteSavedStory(storyId) {
    await dbDeleteSavedStory(storyId);
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  }

  static async subscribeToNotifications(subscription) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User is not logged in");
    }

    try {
      const result = await subscribeToNotifications(token, subscription);
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async unsubscribeFromNotifications(endpoint) {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User is not logged in");
    }

    try {
      const result = await unsubscribeFromNotifications(token, endpoint);
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
