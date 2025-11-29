export default function Page() {
  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">Starter</p>
        <h1>Next.js + NestJS</h1>
        <p className="muted">
          You now have a clean monorepo with a Next.js frontend and a NestJS API.
          Run `npm run dev` from the repo root to start both in Turbo.
        </p>
        <div className="actions">
          <a href="http://localhost:3000" className="button primary">Open frontend</a>
          <a href="http://localhost:3001" className="button ghost">API health</a>
        </div>
      </div>
    </main>
  );
}
