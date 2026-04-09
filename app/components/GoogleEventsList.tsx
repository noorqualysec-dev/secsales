"use client";

import { useGoogleEvents } from "../hooks/useGoogleEvents";

function formatEventDate(dateTime?: string, date?: string) {
  const value = dateTime || date;
  if (!value) return "No date";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString();
}

export const GoogleEventsList = () => {
  const { events, loading, error, refetch } = useGoogleEvents();

  if (loading) {
    return <div className="text-sm">Loading events...</div>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={refetch}
          className="px-3 py-2 rounded-md border text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">No upcoming events found.</p>
        <button
          onClick={refetch}
          className="px-3 py-2 rounded-md border text-sm"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={refetch}
          className="px-3 py-2 rounded-md border text-sm cursor-pointer"
        >
          Refresh Events
        </button>
      </div>

      {events.map((event) => (
        <div key={event.id} className="rounded-xl border p-4 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-medium">
              {event.summary || "Untitled Event"}
            </h3>

            <div className="flex gap-3 text-sm">
              {event.hangoutLink ? (
                <a
                  href={event.hangoutLink}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Join Meet
                </a>
              ) : null}

              {event.htmlLink ? (
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Open in Google
                </a>
              ) : null}
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Start: {formatEventDate(event.start?.dateTime, event.start?.date)}
          </p>

          <p className="text-sm text-gray-600">
            End: {formatEventDate(event.end?.dateTime, event.end?.date)}
          </p>

          {event.location ? (
            <p className="text-sm">Location: {event.location}</p>
          ) : null}

          {event.attendees?.length ? (
            <div className="text-sm">
              Attendees:{" "}
              {event.attendees
                .map((a) => a.email || a.displayName || "Unknown")
                .join(", ")}
            </div>
          ) : null}

          {event.description ? (
            <p className="text-sm text-gray-600">{event.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};