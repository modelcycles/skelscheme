"use client";

import { createProject } from "../../actions";

type Project = { id: string; name: string };

type Props = {
  workspaceId: string;
  workspaceName: string;
  projects: Project[];
  userEmail: string;
  userId: string;
};

export default function Sidebar({
  workspaceId,
  workspaceName,
  projects,
  userEmail,
  userId,
}: Props) {
  return (
    <div
      style={{
        width: "240px",
        backgroundColor: "#2f3136",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* 워크스페이스 이름 */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #26282c",
          fontWeight: 700,
          color: "white",
          fontSize: "15px",
        }}
      >
        {workspaceName}
      </div>

      {/* 프로젝트 목록 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        <p
          style={{
            fontSize: "11px",
            color: "#72767d",
            fontWeight: 700,
            padding: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          프로젝트
        </p>
        {projects?.map((p) => (
          <a
            key={p.id}
            href={`/workspace/${workspaceId}/project/${p.id}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#393c43";
              e.currentTarget.style.color = "#dcddde";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#8e9297";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 8px",
              borderRadius: "4px",
              color: "#8e9297",
              fontSize: "14px",
              textDecoration: "none",
              marginBottom: "2px",
            }}
          >
            # {p.name}
          </a>
        ))}

        {/* 프로젝트 추가 */}
        <form action={createProject} style={{ marginTop: "8px" }}>
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input
            name="name"
            placeholder="+ 프로젝트 추가"
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "#72767d",
              fontSize: "13px",
              padding: "6px 8px",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </form>
      </div>

      {/* 하단 유저 영역 */}
      <div
        style={{
          padding: "8px",
          backgroundColor: "#292b2f",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#5865f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 600,
            color: "white",
            flexShrink: 0,
          }}
        >
          {userEmail?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "white",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {userEmail}
          </p>
        </div>
        <a
          href="/dashboard"
          style={{ color: "#72767d", fontSize: "12px", textDecoration: "none" }}
        >
          ←
        </a>
      </div>
    </div>
  );
}
