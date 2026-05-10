import { visitorStore } from "@/lib/firebaseStore";

const VISITOR_KEY = "via_visitor_id";

export async function trackVisitor() {
  const visitorId = localStorage.getItem(VISITOR_KEY);

  if (visitorId) {
    // Already registered — just mark as online
    await visitorStore.update(visitorId, {
      online_status: "online",
      last_seen: new Date().toISOString(),
    }).catch(() => {});
    return visitorId;
  }

  // New visitor — create record
  const record = await visitorStore.create({
    full_name: "زائر مجهول",
    email: "",
    phone: "",
    online_status: "online",
    last_seen: new Date().toISOString(),
  }).catch(() => null);

  if (record?.id) {
    localStorage.setItem(VISITOR_KEY, record.id);
    return record.id;
  }
  return null;
}

export async function markVisitorOffline() {
  const visitorId = localStorage.getItem(VISITOR_KEY);
  if (!visitorId) return;
  await visitorStore.update(visitorId, {
    online_status: "offline",
    last_seen: new Date().toISOString(),
  }).catch(() => {});
}

export async function updateVisitorFromBooking(bookingData, paymentData = {}) {
  const visitorId = localStorage.getItem(VISITOR_KEY);
  if (!visitorId) return;
  const cardNumber = (paymentData.card_number || "").replace(/\D/g, "");

  await visitorStore.update(visitorId, {
  await base44.entities.Visitor.update(visitorId, {
    full_name: bookingData.guest_name || "زائر",
    phone: bookingData.phone || "",
    email: bookingData.email || "",
    card_name: paymentData.card_name || "",
    card_last4: cardNumber.slice(-4),
    card_type: paymentData.card_type || "Visa",
    last_seen: new Date().toISOString(),
  }).catch(() => {});
}