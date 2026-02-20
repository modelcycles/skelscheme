"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

type Status = {
  id: string;
  name: string;
  color: string;
  order: number;
};

type Item = {
  id: string;
  title: string;
  status_id: string | null;
  priority: string;
  end_at: string | null;
};

type Props = {
  statuses: Status[];
  items: Item[];
};

export default function CalendarView({ statuses, items }: Props) {
  const events = items
    .filter((item) => item.end_at)
    .map((item) => ({
      id: item.id,
      title: item.title,
      date: item.end_at!.split("T")[0],
      backgroundColor:
        statuses.find((s) => s.id === item.status_id)?.color ?? "#6B7280",
      borderColor: "transparent",
    }));

  return (
    <div className="bg-white rounded-xl border p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ko"
        events={events}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
      />
    </div>
  );
}
