"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ChatInput from "./chat-input";

type Message = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { name: string | null; email: string | null } | null;
};

type Props = {
  workspaceId: string;
  currentUserId: string;
};

export default function Chat({ workspaceId, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, profiles(name, email)")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from("messages")
            .select("*, profiles(name, email)")
            .eq("id", payload.new.id)
            .single();
          if (data) setMessages((prev) => [...prev, data as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDisplayName = (msg: Message) => {
    return msg.profiles?.name ?? msg.profiles?.email ?? "알 수 없음";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#ffffff",
      }}
    >
      {/* 메시지 목록 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#9b9b9b",
              fontSize: "14px",
              marginTop: "32px",
            }}
          >
            아직 메시지가 없어요. 첫 메시지를 보내봐요!
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.user_id === currentUserId;
          const prevMsg = messages[i - 1];
          const isSameUser = prevMsg?.user_id === msg.user_id;
          const showName = !isSameUser;

          return (
            <div key={msg.id} style={{ marginTop: showName ? "16px" : "1px" }}>
              {showName && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginBottom: "4px",
                    paddingLeft: "44px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: isMe ? "#5865f2" : "#1a1a1a",
                    }}
                  >
                    {getDisplayName(msg)}
                  </span>
                  <span style={{ fontSize: "11px", color: "#c0c0c0" }}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                {showName ? (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: isMe ? "#5865f2" : "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: isMe ? "white" : "#555",
                      flexShrink: 0,
                    }}
                  >
                    {getDisplayName(msg)[0]?.toUpperCase()}
                  </div>
                ) : (
                  <div style={{ width: "32px", flexShrink: 0 }} />
                )}
                <div
                  style={{
                    fontSize: "14px",
                    color: "#1a1a1a",
                    lineHeight: "1.5",
                    padding: "2px 0",
                    wordBreak: "break-word",
                    maxWidth: "calc(100% - 44px)",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <ChatInput workspaceId={workspaceId} />
    </div>
  );
}
