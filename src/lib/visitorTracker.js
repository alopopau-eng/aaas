import { base44 } from "@/api/base44Client";

const VISITOR_KEY = "via_visitor_id";

export async function trackVisitor() {
  const visitorId = localStorage.getItem(VISITOR_KEY);

  if (visitorId) {
    // Already registered — just mark as online
    await base44.entities.Visitor.update(visitorId, {
      online_status: "online",
      last_seen: new Date().toISOString(),
    }).catch(() => {});
    return visitorId;
  }

  // New visitor — create record
  const record = await base44.entities.Visitor.create({
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
  await base44.entities.Visitor.update(visitorId, {
    online_status: "offline",
    last_seen: new Date().toISOString(),
  }).catch(() => {});
}

export async function updateVisitorFromBooking(bookingData) {
  const visitorId = localStorage.getItem(VISITOR_KEY);
  if (!visitorId) return;
  await base44.entities.Visitor.update(visitorId, {
    full_name: bookingData.guest_name || "زائر",
    phone: bookingData.phone || "",
    email: bookingData.email || "",
    last_seen: new Date().toISOString(),
  }).catch(() => {});
}