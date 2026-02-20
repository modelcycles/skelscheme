"use client";

import { useState, useEffect } from "react";
import CalendarView from "./calendar-view";
import GanttView from "./gantt-view";
import ItemPanel from "./item-panel";
import KanbanView from "./kanban-view";

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

export default function Views({ statuses, items: initialItems }: Props) {
  const [view, setView] = useState<"테이블" | "칸반" | "캘린더" | "간트">(
    "테이블",
  );
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [items, setItems] = useState(initialItems);
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
            style={{ cursor: "pointer" }}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors  ${
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
                    className="border-b last:border-0 hover:bg-gray-50 "
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedItem(item)}
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
        <KanbanView
          statuses={statuses}
          items={items}
          onSelectItem={setSelectedItem}
          onItemsChange={setItems}
        />
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
