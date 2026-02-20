"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Status = {
  id: string;
  name: string;
  color: string;
  order: number;
};

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

type Props = {
  item: Item;
  statuses: Status[];
  onClose: () => void;
};

export default function ItemPanel({ item, statuses, onClose }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [statusId, setStatusId] = useState(item.status_id ?? "");
  const [priority, setPriority] = useState(item.priority);
  const [startAt, setStartAt] = useState(item.start_at?.split("T")[0] ?? "");
  const [endAt, setEndAt] = useState(item.end_at?.split("T")[0] ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase
      .from("items")
      .update({
        title,
        description,
        status_id: statusId || null,
        priority,
        start_at: startAt || null,
        end_at: endAt || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
    setSaving(false);
    router.refresh();
  };

  const deleteItem = async () => {
    if (!confirm("아이템을 삭제할까요?")) return;
    await supabase.from("items").delete().eq("id", item.id);
    onClose();
    router.refresh();
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.2)",
          zIndex: 40,
        }}
      />

      {/* 패널 */}
      <div
        className="fixed right-0 top-0 h-screen w-[480px] bg-white shadow-2xl z-50 flex flex-col"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: "480px",
          backgroundColor: "white",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button
            onClick={onClose}
            style={{ cursor: "pointer" }}
            className="text-gray-400 hover:text-black text-sm"
          >
            ✕ 닫기
          </button>
          <div className="flex gap-2">
            <button
              onClick={deleteItem}
              style={{ cursor: "pointer" }}
              className="text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded-lg border border-red-200 hover:border-red-400 transition-colors "
            >
              삭제
            </button>
            <button
              onClick={save}
              style={{ cursor: "pointer" }}
              disabled={saving}
              className="bg-black text-white text-sm px-3 py-1 rounded-lg hover:bg-gray-800 disabled:opacity-50 "
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
          {/* 제목 */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold outline-none border-b pb-2 focus:border-black transition-colors"
            placeholder="제목"
          />

          {/* 상태 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">상태</label>
            <div className="flex gap-2 flex-wrap">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusId(s.id)}
                  className={`px-3 py-1 rounded-full text-white text-xs transition-opacity  ${
                    statusId === s.id
                      ? "opacity-100 ring-2 ring-offset-1"
                      : "opacity-50"
                  }`}
                  style={{ backgroundColor: s.color, cursor: "pointer" }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* 우선순위 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">
              우선순위
            </label>
            <div className="flex gap-2 flex-wrap">
              {["none", "low", "medium", "high", "urgent"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{ cursor: "pointer" }}
                  className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                    priority === p
                      ? "bg-black text-white border-black"
                      : "hover:border-black"
                  }`}
                >
                  {p === "none"
                    ? "없음"
                    : p === "low"
                      ? "낮음"
                      : p === "medium"
                        ? "보통"
                        : p === "high"
                          ? "높음"
                          : "긴급"}
                </button>
              ))}
            </div>
          </div>

          {/* 날짜 */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-400 font-medium">
                시작일
              </label>
              <input
                type="date"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-400 font-medium">
                마감일
              </label>
              <input
                type="date"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* 설명 */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-400 font-medium">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black resize-none flex-1 min-h-40"
              placeholder="설명을 입력하세요..."
            />
          </div>
        </div>
      </div>
    </>
  );
}
