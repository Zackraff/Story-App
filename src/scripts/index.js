import "../styles/styles.css";
import App from "./pages/app";
import Model from "./models/model";
import View from "./views/view";
import Presenter from "./presenters/presenter";

document.addEventListener("DOMContentLoaded", async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker terdaftar dengan scope:", registration.scope);
    } catch (error) {
      console.error("Gagal mendaftarkan Service Worker:", error.message);
    }
  } else {
    console.log("Service Worker tidak didukung di browser ini.");
  }

  const presenter = new Presenter(Model, new View());
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
    presenter,
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        await app.renderPage();
      });
    } else {
      await app.renderPage();
    }
  });

  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        event.preventDefault();
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            window.location.hash = href.replace("#", "");
          });
        } else {
          window.location.hash = href.replace("#", "");
        }
      }
    });
  });
});
