import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        padding: "60px",
        textAlign: "center",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>403 - Unauthorized</h1>

      <p style={{ marginBottom: "24px", color: "#666" }}>
        You do not have permission to access this page.
      </p>

      <Link
        href="/login"
        style={{
          padding: "10px 20px",
          borderRadius: "6px",
          background: "#111",
          color: "#fff",
          textDecoration: "none",
        }}
      >
        Go to Login
      </Link>
    </div>
  );
}
