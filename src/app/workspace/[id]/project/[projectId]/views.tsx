"use client";

import { useState, useEffect } from "react";
import CalendarView from "./calendar-view";
import GanttView from "./gantt-view";
import ItemPanel from "./item-panel";

type Status = { id: string; name: string; color: string; order: number };
type Item = {
  id: string;
  title: string;
  description: string | null;
  status_id: string | null;
  priority: string;
  start_at: string | null;
  end_at: string | null;
  start_includes_time: boolean;
  end_includes_time: boolean;
};
type Props = { statuses: Status[]; items: Item[] };

export default function Views({ statuses, items }: Props) {
  const [view, setView] = useState<"테이블" | "칸반" | "캘린더" | "간트">(
    "테이블",
  );
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  //   const [mounted, setMounted] = useState(false);

  //   useEffect(() => {
  //     setMounted(true);
  //   }, []);

  //   if (!mounted) return null;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {(["테이블", "칸반", "캘린더", "간트"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              view === v
                ? "bg-black text-white border-black"
                : "bg-white hover:border-black"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "테이블" && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  제목
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  상태
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  우선순위
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  마감일
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                    onMouseDown={() => setSelectedItem(item)}
                  >
                    <td className="px-4 py-3">{item.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-white text-xs"
                        style={{
                          backgroundColor:
                            statuses.find((s) => s.id === item.status_id)
                              ?.color ?? "#6B7280",
                        }}
                      >
                        {statuses.find((s) => s.id === item.status_id)?.name ??
                          "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.priority === "none" ? "-" : item.priority}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.end_at
                        ? new Date(item.end_at).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    아직 아이템이 없어요
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === "칸반" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => {
            const statusItems = items.filter((i) => i.status_id === status.id);
            return (
              <div key={status.id} className="min-w-64 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm font-medium">{status.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {statusItems.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {statusItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border rounded-xl px-4 py-3 text-sm hover:border-black transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <p className="font-medium">{item.title}</p>
                      {item.end_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(item.end_at).toLocaleDateString("ko-KR")}
                        </p>
                      )}
                    </div>
                  ))}
                  {statusItems.length === 0 && (
                    <div className="border border-dashed rounded-xl px-4 py-6 text-center text-xs text-gray-400">
                      없음
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "캘린더" && <CalendarView items={items} statuses={statuses} />}
      {view === "간트" && <GanttView statuses={statuses} items={items} />}

      {selectedItem && (
        <ItemPanel
          item={selectedItem}
          statuses={statuses}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
