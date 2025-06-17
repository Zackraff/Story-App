import "./notifications-page.css";

export default class NotificationsPage {
  async render() {
    return `
      <section class="notifications-container">
        <h1>Pengaturan Notifikasi</h1>
        <div id="message" class="message" style="display: none;"></div>
        <div id="notification-status" class="notification-status">
          <p>Status: <span id="status-text">Memeriksa...</span></p>
          <button id="subscribe-button" class="notification-button">Aktifkan Notifikasi</button>
          <button id="unsubscribe-button" class="notification-button" style="display: none;">Nonaktifkan Notifikasi</button>
        </div>
      </section>
    `;
  }

  async afterRender(presenter) {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("Token tidak ditemukan, mengarahkan ke halaman login.");
      window.location.hash = "/login";
      return;
    }

    const statusText = document.getElementById("status-text");
    const subscribeButton = document.getElementById("subscribe-button");
    const unsubscribeButton = document.getElementById("unsubscribe-button");
    const messageElement = document.getElementById("message");

    const vapidPublicKey = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    if (Notification.permission === "denied") {
      statusText.textContent = "Notifikasi diblokir oleh browser.";
      subscribeButton.style.display = "none";
      unsubscribeButton.style.display = "none";
      messageElement.textContent = "Silakan izinkan notifikasi di pengaturan browser.";
      messageElement.style.color = "red";
      messageElement.style.display = "block";
      return;
    }

    let subscription = null;
    try {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          statusText.textContent = "Notifikasi aktif";
          subscribeButton.style.display = "none";
          unsubscribeButton.style.display = "block";
        } else {
          statusText.textContent = "Notifikasi tidak aktif";
          subscribeButton.style.display = "block";
          unsubscribeButton.style.display = "none";
        }
      } else {
        statusText.textContent = "Push notification tidak didukung di browser ini.";
        subscribeButton.style.display = "none";
        unsubscribeButton.style.display = "none";
      }
    } catch (error) {
      console.error("Error checking notification status:", error);
      statusText.textContent = "Gagal memeriksa status notifikasi.";
      messageElement.textContent = `Error: ${error.message}`;
      messageElement.style.color = "red";
      messageElement.style.display = "block";
    }

    subscribeButton.addEventListener("click", async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          throw new Error("Izin notifikasi tidak diberikan.");
        }

        const registration = await navigator.serviceWorker.ready;
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const subscriptionObject = subscription.toJSON();
        await presenter.subscribeToNotifications(subscriptionObject);

        statusText.textContent = "Notifikasi aktif";
        subscribeButton.style.display = "none";
        unsubscribeButton.style.display = "block";
        messageElement.textContent = "Berhasil mengaktifkan notifikasi!";
        messageElement.style.color = "green";
        messageElement.style.display = "block";
      } catch (error) {
        console.error("Gagal mengaktifkan notifikasi:", error);
        statusText.textContent = "Gagal mengaktifkan notifikasi.";
        messageElement.textContent = `Gagal mengaktifkan notifikasi: ${error.message}. Jika error CORS muncul, coba deploy ke server publik.`;
        messageElement.style.color = "red";
        messageElement.style.display = "block";
      }
    });

    unsubscribeButton.addEventListener("click", async () => {
      try {
        if (subscription) {
          await presenter.unsubscribeFromNotifications(subscription.endpoint);
          await subscription.unsubscribe();
          subscription = null;

          statusText.textContent = "Notifikasi tidak aktif";
          subscribeButton.style.display = "block";
          unsubscribeButton.style.display = "none";
          messageElement.textContent = "Berhasil menonaktifkan notifikasi!";
          messageElement.style.color = "green";
          messageElement.style.display = "block";
        }
      } catch (error) {
        console.error("Gagal menonaktifkan notifikasi:", error);
        statusText.textContent = "Gagal menonaktifkan notifikasi.";
        messageElement.textContent = `Gagal menonaktifkan notifikasi: ${error.message}. Jika error CORS muncul, coba deploy ke server publik.`;
        messageElement.style.color = "red";
        messageElement.style.display = "block";
      }
    });
  }
}
