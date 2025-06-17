
import routes from "../routes/routes";
import { getActiveRoute, getRouteParams } from "../routes/url-parser";
import Router from "../router.js"; 

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #presenter = null;

  constructor({ navigationDrawer, drawerButton, content, presenter }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#presenter = presenter;

    this._setupDrawer();
    this._setupLogout();
    this._registerServiceWorker();
    this._setupSkipToContent();
  }

  _registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker terdaftar:", registration.scope);
    
          registration.update();
        })
        .catch((error) => console.error("Gagal mendaftarkan Service Worker:", error.message));
    }
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupLogout() {
    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", async () => {
      const result = await this.#presenter.logout();
      if (result.success) {
        alert("Berhasil logout!");
        Router.navigateTo("/login");
      }
    });
  }

  _setupSkipToContent() {
    const skipLink = document.querySelector(".skip-link");
    if (skipLink) {
      skipLink.addEventListener("click", (event) => {
        event.preventDefault();
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }

  _updateLogoutButtonVisibility() {
    const logoutButton = document.getElementById("logout-button");
    logoutButton.style.display = localStorage.getItem("token") ? "block" : "none";
  }

  _requireLogin() {
    return !!localStorage.getItem("token");
  }

  async renderPage(isSkipToContent = false) {
    const url = getActiveRoute();
    const params = getRouteParams();

    const protectedRoutes = [
      "/stories",
      "/add-story",
      "/maps",
      "/saved-stories",
      "/notifications",
    ];

    if (!isSkipToContent && protectedRoutes.includes(url) && !this._requireLogin()) {
      Router.navigateTo("/login");
      return;
    }

    try {
      if (url === "/login") {
        const loginPage = new (await import("./login/login-page")).default();
        this.#content.innerHTML = await loginPage.render();
        await loginPage.afterRender(this.#presenter);
      } else if (url === "/register") {
        const registerPage = new (await import("./register/register-page")).default();
        this.#content.innerHTML = await loginPage.render();
        await registerPage.afterRender(this.#presenter);
      } else if (url === "/stories") {
        const storiesPage = new (await import("./stories/stories-page")).default();
        this.#content.innerHTML = await storiesPage.render();
        await storiesPage.afterRender(this.#presenter);
      } else if (url === "/add-story") {
        const addStoryPage = new (await import("./add-story/add-story-page")).default();
        this.#content.innerHTML = await addStoryPage.render();
        await addStoryPage.afterRender(this.#presenter);
      } else if (url === "/maps") {
        const mapsPage = new (await import("./maps/maps-page")).default();
        this.#content.innerHTML = await mapsPage.render();
        await mapsPage.afterRender(this.#presenter);
      } else if (url === "/saved-stories") {
        const savedStoriesPage = new (await import("./saved-stories/saved-stories-page")).default();
        this.#content.innerHTML = await savedStoriesPage.render();
        await savedStoriesPage.afterRender(this.#presenter);
      } else if (url === "/about") {
        const aboutPage = new (await import("./about/about-page")).default();
        this.#content.innerHTML = await aboutPage.render();
        await aboutPage.afterRender(this.#presenter);
      } else if (url === "/notifications") {
        const notificationsPage = new (await import("./notifications/notifications-page")).default(); 
        this.#content.innerHTML = await notificationsPage.render();
        await notificationsPage.afterRender(this.#presenter);
      } else if (url === "/stories/:id" && params.id) {
        const page = routes[url](params.id);
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      } else {
        Router.navigateTo("/login");
      }
    } catch (error) {
      this.#content.innerHTML = `<p>Error: ${error.message}</p>`;
    }

    this._updateLogoutButtonVisibility();
  }
}

export default App;