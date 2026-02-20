"use client";

import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useState } from "react";

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
  start_at: string | null;
  end_at: string | null;
};

type Props = {
  statuses: Status[];
  items: Item[];
};

export default function GanttView({ statuses, items }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

  const tasks: Task[] = items
    .filter((item) => item.start_at && item.end_at)
    .map((item) => ({
      id: item.id,
      name: item.title,
      start: new Date(item.start_at!),
      end: new Date(item.end_at!),
      progress: item.status_id === statuses[statuses.length - 1]?.id ? 100 : 0,
      styles: {
        progressColor:
          statuses.find((s) => s.id === item.status_id)?.color ?? "#6B7280",
        progressSelectedColor:
          statuses.find((s) => s.id === item.status_id)?.color ?? "#6B7280",
      },
      type: "task",
      isDisabled: false,
    }));

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex gap-2 mb-4">
        {([ViewMode.Day, ViewMode.Week, ViewMode.Month] as const).map(
          (mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                viewMode === mode
                  ? "bg-black text-white border-black"
                  : "bg-white hover:border-black"
              }`}
            >
              {mode === ViewMode.Day
                ? "일"
                : mode === ViewMode.Week
                  ? "주"
                  : "월"}
            </button>
          ),
        )}
      </div>

      {tasks.length > 0 ? (
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          locale="ko"
          listCellWidth="200px"
        />
      ) : (
        <div className="py-16 text-center text-gray-400 text-sm">
          시작일과 마감일이 있는 아이템이 없어요
        </div>
      )}
    </div>
  );
}
