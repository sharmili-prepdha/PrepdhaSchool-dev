import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        padding: "60px",
        textAlign: "center",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>404 - Page Not Found</h1>

      <p style={{ marginBottom: "24px", color: "#666" }}>
        The page you are looking for does not exist.
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
