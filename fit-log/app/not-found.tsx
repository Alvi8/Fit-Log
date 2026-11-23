import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fitlog not-found-content">
      <p className="eyebrow">ERROR / 404</p>

      <h1>
        PAGE NOT
        <br />
        <span style={{ color: "var(--lime)" }}>FOUND.</span>
      </h1>

      <p className="section-subtitle">
        Looks like this page does not exist.
        <br />
        Let&apos;s get you back to training.
      </p>

      <Link href="/" className="primary-button">
        BACK TO HOME ↗
      </Link>
    </main>
  );
}
