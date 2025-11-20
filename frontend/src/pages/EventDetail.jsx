import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getEventById } from "../api/events";

const EventDetail = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imageError, setImageError] = useState(false);
  const [eventCountdown, setEventCountdown] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0
  });
  const [deadlineCountdown, setDeadlineCountdown] = useState({
    d: 0,
    h: 0,
    m: 0,
    s: 0
  });

  // -----------------------------
  // FETCH EVENT ONCE
  // -----------------------------
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await getEventById(id);
        setEvent(response.data);
      } catch (err) {
        setError("Could not fetch event details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Compute dates only after event loads
  const eventDate = event ? new Date(event.date) : null;
  const deadline = event?.registrationDeadline
    ? new Date(event.registrationDeadline)
    : null;

  // -----------------------------
  // COUNTDOWN EFFECT (safe)
  // -----------------------------
  useEffect(() => {
    if (!eventDate) return;

    const tick = () => {
      const now = Date.now();

      const evtMs = Math.max(0, eventDate.getTime() - now);
      const dlMs = Math.max(0, (deadline ? deadline.getTime() : 0) - now);

      const toObj = (ms) => {
        const d = Math.floor(ms / (1000 * 60 * 60 * 24));
        const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const m = Math.floor((ms / (1000 * 60)) % 60);
        const s = Math.floor((ms / 1000) % 60);
        return { d, h, m, s };
      };

      setEventCountdown(toObj(evtMs));
      setDeadlineCountdown(toObj(dlMs));
    };

    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [eventDate, deadline]);

  // -----------------------------
  // SAFE RETURNS
  // -----------------------------
  if (loading) {
    return <div className="text-center mt-10">Loading Event...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!event) {
    return <div className="text-center mt-10">Event not found.</div>;
  }

  // -----------------------------
  // DERIVED DATA
  // -----------------------------
  const now = new Date();
  const isPast = eventDate < now;
  const isRegistrationClosed = deadline && deadline < now;

  const verifiedCount = Array.isArray(event.attendees)
    ? event.attendees.filter((a) => a.isVerified).length
    : 0;

  const fallbackCover = `https://placehold.co/1600x500/111827/ffffff?text=${event.title.replace(
    /\s+/g,
    "+"
  )}`;

  const coverImage =
    !imageError && event.coverImageUrl ? event.coverImageUrl : fallbackCover;

  const mapLocationUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    event.location
  )}&output=embed`;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <img
          src={coverImage}
          onError={() => setImageError(true)}
          alt={event.title}
          className="w-full h-[340px] object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

        <div className="absolute inset-0 px-6 md:px-10 py-6 flex items-end">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            <div className="lg:col-span-2 text-white">
              <div className="flex gap-2 mb-3">
                {event.type && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur border border-white/30">
                    {event.type === "online" ? "Online" : "In-person"}
                  </span>
                )}

                {event.category && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-600">
                    {event.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                {event.title}
              </h1>

              {event.shortDescription && (
                <p className="text-sm md:text-base text-gray-200">
                  {event.shortDescription}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-200">
                Organized by{" "}
                <span className="font-semibold">{event.organizer?.name}</span>
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg">
              <p className="text-xs text-gray-500">Event starts in</p>

              <div className="mt-1 text-2xl md:text-3xl font-bold text-gray-900 tracking-wider">
                {eventCountdown.d}d:
                {String(eventCountdown.h).padStart(2, "0")}h:
                {String(eventCountdown.m).padStart(2, "0")}m:
                {String(eventCountdown.s).padStart(2, "0")}s
              </div>

              {deadline && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">
                    Registration closes in
                  </p>

                  <div className="text-sm font-semibold text-gray-800">
                    {deadlineCountdown.d}d:
                    {String(deadlineCountdown.h).padStart(2, "0")}h:
                    {String(deadlineCountdown.m).padStart(2, "0")}m:
                    {String(deadlineCountdown.s).padStart(2, "0")}s
                  </div>
                </div>
              )}

              <div className="mt-3">
                {isPast ? (
                  <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
                    Event ended
                  </span>
                ) : isRegistrationClosed ? (
                  <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    Registration closed
                  </span>
                ) : event.capacity != null &&
                  verifiedCount >= event.capacity ? (
                  <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                    Event full
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                    Registration open
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">About this event</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {event.description || "No description provided."}
          </p>
        </section>

        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm">
            <p className="font-semibold text-gray-800 mb-1">Event overview</p>

            <p className="text-gray-700">
              <strong>Date & time:</strong> {eventDate.toLocaleString()}
            </p>

            <p className="text-gray-700">
              <strong>Location:</strong> {event.location}
            </p>

            {event.capacity != null && (
              <p className="text-gray-700">
                <strong>Capacity:</strong> {verifiedCount}/{event.capacity}{" "}
                verified attendees
              </p>
            )}

            {deadline && (
              <p className="text-gray-700">
                <strong>Registration closes:</strong>{" "}
                {deadline.toLocaleString()}
              </p>
            )}
          </div>

          {event.type === "in_person" && event.location && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Location on map
              </h3>

              <div className="w-full h-56 rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  title="Event location map"
                  src={mapLocationUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700">
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Event details
            </h3>

            <p>
              <strong>Created:</strong>{" "}
              {new Date(event.createdAt).toLocaleString()}
            </p>

            <p>
              <strong>Last updated:</strong>{" "}
              {new Date(event.updatedAt).toLocaleString()}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventDetail;
