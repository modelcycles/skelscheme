"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

type Project = { id: string; name: string };

type Props = {
  workspaceId: string;
  workspaceName: string;
  projects: Project[];
  userEmail: string;
};

export default function GlobalSidebar({
  workspaceId,
  workspaceName,
  projects,
  userEmail,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div
      style={{
        width: collapsed ? "0px" : "240px",
        minWidth: collapsed ? "0px" : "240px",
        backgroundColor: "#f7f7f5",
        borderRight: "1px solid #e5e5e3",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        transition: "min-width 0.2s ease, width 0.2s ease",
        position: "relative",
      }}
    >
      {!collapsed && (
        <>
          {/* 워크스페이스 헤더 */}
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #e5e5e3",
            }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}
            >
              {workspaceName}
            </span>
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9b9b9b",
                fontSize: "16px",
                padding: "2px 4px",
                borderRadius: "4px",
              }}
            >
              ←
            </button>
          </div>

          {/* 트리 목록 */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {/* 프로젝트 섹션 */}
            <button
              onClick={() => setProjectsOpen(!projectsOpen)}
              style={{
                width: "100%",
                border: "none",
                background: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 16px",
                cursor: "pointer",
                color: "#9b9b9b",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <span style={{ fontSize: "10px" }}>
                {projectsOpen ? "▾" : "▸"}
              </span>
              프로젝트
            </button>

            {projectsOpen && (
              <div>
                {projects.map((p) => {
                  const isActive = pathname.includes(p.id);
                  return (
                    <a
                      key={p.id}
                      href={`/workspace/${workspaceId}/project/${p.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "5px 16px 5px 28px",
                        color: isActive ? "#1a1a1a" : "#6b6b6b",
                        backgroundColor: isActive ? "#e8e8e6" : "transparent",
                        fontSize: "13px",
                        textDecoration: "none",
                        borderRadius: "4px",
                        margin: "1px 4px",
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>📋</span>
                      {p.name}
                    </a>
                  );
                })}
                <a
                  href={`/workspace/${workspaceId}/new-project`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px 16px 5px 28px",
                    color: "#9b9b9b",
                    fontSize: "13px",
                    textDecoration: "none",
                    borderRadius: "4px",
                    margin: "1px 4px",
                  }}
                >
                  + 새 프로젝트
                </a>
              </div>
            )}

            {/* 채팅 섹션 */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              style={{
                width: "100%",
                border: "none",
                background: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 16px",
                marginTop: "8px",
                cursor: "pointer",
                color: "#9b9b9b",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <span style={{ fontSize: "10px" }}>{chatOpen ? "▾" : "▸"}</span>
              채팅
            </button>

            {chatOpen && (
              <div>
                <a
                  href={`/workspace/${workspaceId}/chat`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px 16px 5px 28px",
                    color:
                      pathname === `/workspace/${workspaceId}/chat`
                        ? "#1a1a1a"
                        : "#6b6b6b",
                    backgroundColor:
                      pathname === `/workspace/${workspaceId}/chat`
                        ? "#e8e8e6"
                        : "transparent",
                    fontSize: "13px",
                    textDecoration: "none",
                    borderRadius: "4px",
                    margin: "1px 4px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>💬</span>
                  일반
                </a>
              </div>
            )}
          </div>

          {/* 하단 유저 */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid #e5e5e3",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 600,
                color: "#555",
                flexShrink: 0,
              }}
            >
              {userEmail[0]?.toUpperCase()}
            </div>
            <span
              style={{
                fontSize: "12px",
                color: "#6b6b6b",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userEmail}
            </span>
            <a
              href="/dashboard"
              style={{
                color: "#9b9b9b",
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              ⌂
            </a>
          </div>
        </>
      )}

      {/* collapsed 상태일 때 열기 버튼 */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            position: "fixed",
            left: "8px",
            top: "12px",
            background: "#f7f7f5",
            border: "1px solid #e5e5e3",
            borderRadius: "4px",
            cursor: "pointer",
            color: "#9b9b9b",
            fontSize: "16px",
            padding: "2px 6px",
            zIndex: 100,
          }}
        >
          →
        </button>
      )}
    </div>
  );
}
