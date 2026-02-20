"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = { workspaceId: string };

export default function ChatInput({ workspaceId }: Props) {
  const [content, setContent] = useState("");
  const supabase = createClient();

  const sendMessage = async () => {
    if (!content.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("messages").insert({
      workspace_id: workspaceId,
      user_id: user.id,
      content: content.trim(),
    });
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div
        style={{
          backgroundColor: "#40444b",
          borderRadius: "8px",
          display: "flex",
          alignItems: "flex-end",
          gap: "8px",
          padding: "10px 16px",
        }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지 보내기..."
          rows={1}
          style={{
            flex: 1,
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            color: "#dcddde",
            fontSize: "14px",
            resize: "none",
            lineHeight: "1.5",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: "#5865f2",
            border: "none",
            borderRadius: "4px",
            color: "white",
            padding: "6px 12px",
            fontSize: "13px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          전송
        </button>
      </div>
      <p
        style={{
          fontSize: "11px",
          color: "#72767d",
          marginTop: "4px",
          paddingLeft: "4px",
        }}
      >
        Enter로 전송, Shift+Enter로 줄바꿈
      </p>
    </div>
  );
}
