import type { Booking } from "@/types/booking";

// URL for API
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get all bookings for admin/overview
export async function fetchBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Kunde inte hämta bokningar");
  return await res.json();
}

// Get all bookings for logged in user
export async function fetchMyBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${BASE_URL}/api/bookings/myBookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Kunde inte hämta mina bokningar");
  return await res.json();
}

//Creates a booking for a resource, currently set for now -> 1 hour.
//Can change so input manually is possible.
export async function createBooking(token: string, resourceId: number) {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      resourceId,
      bookingDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }),
  });
  if (!res.ok) throw new Error("Kunde inte skapa bokning");
  return res.json();
}

// Cancels a booking
export async function cancelBooking(token: string, bookingId: number) {
  const res = await fetch(`${BASE_URL}/api/bookings/cancel/${bookingId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Kunde inte avboka");
}

//Deletes a booking
export async function deleteBooking(token: string, bookingId: number) {
  const res = await fetch(`${BASE_URL}/api/bookings/delete/${bookingId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Kunde inte radera bokning");
}