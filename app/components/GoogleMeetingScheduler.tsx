"use client";

import { useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import { useLeads } from "@/app/hooks/useLeads";
import { useScheduleMeeting } from "@/app/hooks/useProductivity";
import { useGoogleIntegration } from "@/app/hooks/useGoogleIntegration";

type GoogleMeetingSchedulerProps = {
  onMeetingCreated?: () => void;
};

const createInitialDateTime = (offsetMinutes: number) => {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15 + offsetMinutes);
  return date.toISOString().slice(0, 16);
};

const parseAttendees = (value: string) =>
  value
    .split(/[\n,]/)
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email, type: "external" as const }));

export const GoogleMeetingScheduler = ({
  onMeetingCreated,
}: GoogleMeetingSchedulerProps) => {
  const { connected } = useGoogleIntegration();
  const { data: leadsData } = useLeads();
  const scheduleMeeting = useScheduleMeeting();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    subject: "",
    leadId: "",
    startTime: createInitialDateTime(30),
    endTime: createInitialDateTime(60),
    description: "",
    location: "",
    attendeeEmails: "",
  });

  const leads = leadsData?.data ?? [];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const startTime = new Date(form.startTime).getTime();
    const endTime = new Date(form.endTime).getTime();

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      setError("Please choose valid start and end times.");
      return;
    }

    if (startTime >= endTime) {
      setError("Meeting end time must be after the start time.");
      return;
    }

    try {
      await scheduleMeeting.mutateAsync({
        subject: form.subject.trim(),
        leadId: form.leadId,
        startTime,
        endTime,
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        attendees: parseAttendees(form.attendeeEmails),
      });

      setSuccess(
        connected
          ? "Meeting created and queued for Google Calendar sync."
          : "Meeting created in CRM. Connect Google to sync it to Calendar."
      );
      setForm({
        subject: "",
        leadId: "",
        startTime: createInitialDateTime(30),
        endTime: createInitialDateTime(60),
        description: "",
        location: "",
        attendeeEmails: "",
      });
      onMeetingCreated?.();
    } catch (err) {
      const apiError = err as AxiosError<{ message?: string }>;
      setError(
        apiError.response?.data?.message || "Failed to create the meeting."
      );
    }
  };

  return (
    <div className="border rounded-xl p-4 space-y-4">
      <div>
        <h2 className="text-lg font-medium">Create Meeting</h2>
        <p className="text-sm text-gray-500">
          Schedule a CRM meeting for a lead and sync it to Google Calendar when
          your account is connected.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Meeting title</label>
          <input
            value={form.subject}
            onChange={(event) =>
              setForm((current) => ({ ...current, subject: event.target.value }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Discovery call with Acme"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Lead</label>
          <select
            value={form.leadId}
            onChange={(event) =>
              setForm((current) => ({ ...current, leadId: event.target.value }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          >
            <option value="">Select a lead</option>
            {leads.map((lead) => (
              <option key={lead._id} value={lead._id}>
                {lead.firstName} {lead.lastName}
                {lead.company ? ` (${lead.company})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Start time</label>
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(event) =>
              setForm((current) => ({ ...current, startTime: event.target.value }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">End time</label>
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(event) =>
              setForm((current) => ({ ...current, endTime: event.target.value }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input
            value={form.location}
            onChange={(event) =>
              setForm((current) => ({ ...current, location: event.target.value }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Extra attendee emails
          </label>
          <input
            value={form.attendeeEmails}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                attendeeEmails: event.target.value,
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="client@company.com, manager@company.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="min-h-28 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Optional notes or agenda"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {!connected ? (
              <p className="text-sm text-amber-600">
                Google is not connected yet. The meeting will still be saved in
                CRM and can sync later.
              </p>
            ) : null}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}
          </div>

          <button
            type="submit"
            disabled={scheduleMeeting.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {scheduleMeeting.isPending ? "Creating..." : "Create meeting"}
          </button>
        </div>
      </form>
    </div>
  );
};
