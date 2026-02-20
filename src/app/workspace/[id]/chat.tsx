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
    // 기존 메시지 불러오기
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, profiles(name, email)")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();

    // 실시간 구독
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 메시지 목록 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#6b7280",
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
            <div key={msg.id} style={{ marginTop: showName ? "16px" : "2px" }}>
              {showName && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginBottom: "4px",
                    paddingLeft: "48px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: isMe ? "#5865f2" : "#fff",
                    }}
                  >
                    {getDisplayName(msg)}
                  </span>
                  <span style={{ fontSize: "11px", color: "#72767d" }}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  paddingLeft: "16px",
                }}
              >
                {showName ? (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: isMe ? "#5865f2" : "#747f8d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "white",
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
                    color: "#dcddde",
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

      {/* 입력창 */}
      <ChatInput workspaceId={workspaceId} />
    </div>
  );
}
