"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

function KanbanCard({ item, onClick }: { item: Item; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "12px 16px",
        fontSize: "14px",
      }}
    >
      <p style={{ fontWeight: 500 }}>{item.title}</p>
      {item.end_at && (
        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
          {new Date(item.end_at).toLocaleDateString("ko-KR")}
        </p>
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  items,
  onSelectItem,
}: {
  status: Status;
  items: Item[];
  onSelectItem: (item: Item) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${status.id}` });

  return (
    <div style={{ minWidth: "256px", flexShrink: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: status.color,
          }}
        />
        <span style={{ fontSize: "14px", fontWeight: 500 }}>{status.name}</span>
        <span
          style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "auto" }}
        >
          {items.length}
        </span>
      </div>
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minHeight: "120px",
            borderRadius: "12px",
            padding: "4px",
            backgroundColor: isOver ? "#f3f4f6" : "transparent",
            transition: "background-color 0.2s",
          }}
        >
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              onClick={() => onSelectItem(item)}
            />
          ))}
          {items.length === 0 && (
            <div
              style={{
                border: "1px dashed #e5e7eb",
                borderRadius: "12px",
                padding: "24px 16px",
                textAlign: "center",
                fontSize: "12px",
                color: "#9ca3af",
              }}
            >
              없음
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

type Props = {
  statuses: Status[];
  items: Item[];
  onSelectItem: (item: Item) => void;
  onItemsChange: (items: Item[]) => void;
};

export default function KanbanView({
  statuses,
  items,
  onSelectItem,
  onItemsChange,
}: Props) {
  const [localItems, setLocalItems] = useState(items);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const item = localItems.find((i) => i.id === event.active.id);
    if (item) setActiveItem(item);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeItem = localItems.find((i) => i.id === activeId);
    if (!activeItem) return;

    if (overId.startsWith("col-")) {
      const newStatusId = overId.replace("col-", "");
      if (activeItem.status_id === newStatusId) return;
      const next = localItems.map((item) =>
        item.id === activeId ? { ...item, status_id: newStatusId } : item,
      );
      setLocalItems(next);
      onItemsChange(next);
      return;
    }

    const overItem = localItems.find((i) => i.id === overId);
    if (!overItem) return;

    if (activeItem.status_id !== overItem.status_id) {
      const next = localItems.map((item) =>
        item.id === activeId
          ? { ...item, status_id: overItem.status_id }
          : item,
      );
      setLocalItems(next);
      onItemsChange(next);
    } else {
      const columnItems = localItems.filter(
        (i) => i.status_id === activeItem.status_id,
      );
      const oldIndex = columnItems.findIndex((i) => i.id === activeId);
      const newIndex = columnItems.findIndex((i) => i.id === overId);
      if (oldIndex === newIndex) return;
      const reordered = arrayMove(columnItems, oldIndex, newIndex);
      const otherItems = localItems.filter(
        (i) => i.status_id !== activeItem.status_id,
      );
      const next = [...otherItems, ...reordered];
      setLocalItems(next);
      onItemsChange(next);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active } = event;
    setActiveItem(null);

    const activeId = active.id as string;
    const updatedItem = localItems.find((i) => i.id === activeId);
    if (!updatedItem) return;

    await supabase
      .from("items")
      .update({ status_id: updatedItem.status_id })
      .eq("id", activeId);

    const columnItems = localItems.filter(
      (i) => i.status_id === updatedItem.status_id,
    );
    await Promise.all(
      columnItems.map((item, index) =>
        supabase.from("items").update({ order: index }).eq("id", item.id),
      ),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "16px",
        }}
      >
        {statuses.map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            items={localItems.filter((i) => i.status_id === status.id)}
            onSelectItem={onSelectItem}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <div
            style={{
              backgroundColor: "white",
              border: "1px solid #000",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 500,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              cursor: "grabbing",
            }}
          >
            <p style={{ fontWeight: 500 }}>{activeItem.title}</p>
            {activeItem.end_at && (
              <p
                style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}
              >
                {new Date(activeItem.end_at).toLocaleDateString("ko-KR")}
              </p>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
