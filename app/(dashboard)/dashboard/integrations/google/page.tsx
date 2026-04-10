"use client";

import { useState } from "react";
import { GoogleConnectButton } from "@/app/components/GoogleConnectButton";
import { GoogleEventsList } from "@/app/components/GoogleEventsList";
import { GoogleMeetingScheduler } from "@/app/components/GoogleMeetingScheduler";
import { IntegrationStatusBadge } from "@/app/components/IntegrationStatusBadge";

export default function GoogleIntegrationPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Google Calendar Integration</h1>
        <p className="text-sm text-gray-500">
          Connect your Google account, view your events, and manage meetings from CRM.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <IntegrationStatusBadge />
        <GoogleConnectButton />
      </div>

      <GoogleMeetingScheduler
        onMeetingCreated={() => setRefreshKey((current) => current + 1)}
      />

      <div className="border rounded-xl p-4 space-y-4">
        <div>
          <h2 className="text-lg font-medium">Calendar Events</h2>
          <p className="text-sm text-gray-500">
            Upcoming events from your connected Google Calendar.
          </p>
        </div>

        <GoogleEventsList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
