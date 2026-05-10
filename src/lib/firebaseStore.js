const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

function hasFirebaseConfig() {
  return Boolean(FIREBASE_PROJECT_ID && FIREBASE_API_KEY);
}

function ensureConfig() {
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase config missing: set VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_API_KEY");
  }
}

function collectionUrl(collection) {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}?key=${FIREBASE_API_KEY}`;
}

function docUrl(collection, id) {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${id}?key=${FIREBASE_API_KEY}`;
}

function documentToObject(doc) {
  const fields = doc.fields || {};
  const data = { id: doc.name?.split("/").pop() };

  for (const [key, value] of Object.entries(fields)) {
    if (value.stringValue !== undefined) data[key] = value.stringValue;
    else if (value.integerValue !== undefined) data[key] = Number(value.integerValue);
    else if (value.doubleValue !== undefined) data[key] = Number(value.doubleValue);
    else if (value.booleanValue !== undefined) data[key] = Boolean(value.booleanValue);
    else if (value.nullValue !== undefined) data[key] = null;
  }

  return data;
}

function toFirestoreFields(payload) {
  const fields = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) fields[key] = { nullValue: null };
    else if (typeof value === "number") fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    else if (typeof value === "boolean") fields[key] = { booleanValue: value };
    else fields[key] = { stringValue: String(value) };
  });
  return fields;
}

export async function createDoc(collection, payload) {
  ensureConfig();
  const body = { fields: toFirestoreFields({ ...payload, created_date: payload.created_date || new Date().toISOString() }) };
  const res = await fetch(collectionUrl(collection), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Failed to create ${collection} document`);
  return documentToObject(await res.json());
}

export async function listDocs(collection) {
  if (!hasFirebaseConfig()) return [];
  const res = await fetch(collectionUrl(collection));
  if (!res.ok) throw new Error(`Failed to list ${collection}`);
  const json = await res.json();
  return (json.documents || []).map(documentToObject).sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
}

export async function updateDoc(collection, id, payload) {
  ensureConfig();
  const updateMask = Object.keys(payload)
    .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
    .join("&");
  const res = await fetch(`${docUrl(collection, id)}${updateMask ? `&${updateMask}` : ""}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFirestoreFields(payload) }),
  });
  if (!res.ok) throw new Error(`Failed to update ${collection}/${id}`);
  return documentToObject(await res.json());
}

export async function deleteDoc(collection, id) {
  ensureConfig();
  const res = await fetch(docUrl(collection, id), { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete ${collection}/${id}`);
}

export const bookingStore = {
  create: (payload) => createDoc("bookings", payload),
  list: () => listDocs("bookings"),
  update: (id, payload) => updateDoc("bookings", id, payload),
};

export const visitorStore = {
  create: (payload) => createDoc("visitors", payload),
  list: () => listDocs("visitors"),
  update: (id, payload) => updateDoc("visitors", id, payload),
  delete: (id) => deleteDoc("visitors", id),
};
