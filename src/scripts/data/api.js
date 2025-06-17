const API_ENDPOINT = "https://story-api.dicoding.dev/v1";

export async function login(email, password) {
  const response = await fetch(`${API_ENDPOINT}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal login");
  return data.loginResult;
}

export async function register(name, email, password) {
  const response = await fetch(`${API_ENDPOINT}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  console.log("API Response for register:", data);
  if (!response.ok || data.error) {
    throw new Error(data.message || "Gagal registrasi");
  }
  return data.message;
}

export async function getStories(token, page = 1, perPage = 10, withLocation = 0) {
  try {
    const response = await fetch(`${API_ENDPOINT}/stories?page=${page}&size=${perPage}&location=${withLocation}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    });
    const data = await response.json();
    console.log("API Response for getStories:", data);
    if (!response.ok) throw new Error(data.message || "Gagal mengambil cerita");
    if (!data.listStory || !Array.isArray(data.listStory)) {
      throw new Error("Invalid API response: listStory is not an array");
    }
    return data.listStory;
  } catch (error) {
    console.error("Error fetching stories:", error.message);
    throw new Error(error.message);
  }
}

export async function getStoryDetail(token, storyId) {
  try {
    const response = await fetch(`${API_ENDPOINT}/stories/${storyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    });
    const data = await response.json();
    console.log("API Response for getStoryDetail:", data);
    if (!response.ok) throw new Error(data.message || "Gagal mengambil detail cerita");
    return data.story;
  } catch (error) {
    console.error("Error fetching story detail:", error.message);
    throw new Error(error.message);
  }
}

export async function addStory(token, formData) {
  try {
    const response = await fetch(`${API_ENDPOINT}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    console.log("API Response for addStory:", data);
    if (!response.ok) throw new Error(data.message || "Gagal menambahkan cerita");
    return data;
  } catch (error) {
    console.error("Error adding story:", error.message);
    throw new Error(error.message);
  }
}

export async function subscribeToNotifications(token, subscription) {
  try {
    const response = await fetch(`${API_ENDPOINT}/notifications/subscribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      }),
    });
    const data = await response.json();
    console.log("API Response for subscribeToNotifications:", data);
    if (!response.ok) throw new Error(data.message || "Gagal berlangganan notifikasi");
    return data;
  } catch (error) {
    console.error("Error subscribing to notifications:", error.message);
    throw new Error(error.message);
  }
}

export async function unsubscribeFromNotifications(token, endpoint) {
  try {
    const response = await fetch(`${API_ENDPOINT}/notifications/subscribe`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint }),
    });
    const data = await response.json();
    console.log("API Response for unsubscribeFromNotifications:", data);
    if (!response.ok) throw new Error(data.message || "Gagal membatalkan langganan notifikasi");
    return data;
  } catch (error) {
    console.error("Error unsubscribing from notifications:", error.message);
    throw new Error(error.message);
  }
}
