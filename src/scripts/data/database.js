import { openDB } from "idb";

const DB_NAME = "CeritaAppDB";
const STORE_NAME = "savedStories";
const DB_VERSION = 1;

async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    },
  });
}

export async function saveStory(story) {
  console.log("Received story object:", story);

  if (!story || typeof story !== "object" || Array.isArray(story)) {
    console.error("Invalid story object (not a valid object):", story);
    throw new Error("Cerita tidak valid: Objek cerita kosong atau bukan objek yang valid.");
  }

  if (!story.id || typeof story.id !== "string" || story.id.trim() === "") {
    console.error("Invalid story ID (null, undefined, not a string, or empty):", story.id);
    throw new Error("Cerita tidak memiliki ID yang valid.");
  }

  console.log("Saving story with ID:", story.id, "Type of ID:", typeof story.id);

  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  try {
    await store.put(story);
    await tx.done;
    console.log("Story successfully saved to IndexedDB with ID:", story.id);
    return story;
  } catch (error) {
    await tx.abort();
    console.error("Failed to save story to IndexedDB:", error);
    throw new Error("Gagal menyimpan cerita: " + error.message);
  }
}

export async function deleteSavedStory(storyId) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await store.delete(storyId);
  await tx.done;
  console.log("Story deleted from IndexedDB with ID:", storyId);
}

export async function getAllSavedStories() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const stories = await store.getAll();
  await tx.done;
  console.log("Retrieved saved stories from IndexedDB:", stories);
  return stories.length > 0 ? stories : [];
}
