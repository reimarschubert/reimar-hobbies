import { useState } from "react";

type View = "movies" | "wine" | "travel" | "running";

function MoviesView() {
  return (
    <section>
      <h2>Movies</h2>
      <p>Track films you&apos;ve watched, want to watch, and your favorites.</p>
    </section>
  );
}

function WineView() {
  return (
    <section>
      <h2>Wine</h2>
      <p>Keep simple notes on bottles you enjoy and regions you like.</p>
    </section>
  );
}

function TravelView() {
  return (
    <section>
      <h2>Travel</h2>
      <p>List past trips, dream destinations, and ideas for your next adventure.</p>
    </section>
  );
}

function RunningView() {
  return (
    <section>
      <h2>Running</h2>
      <p>Log routes, races, and milestones you&apos;re proud of.</p>
    </section>
  );
}

function ViewContainer({ current }: { current: View }) {
  switch (current) {
    case "movies":
      return <MoviesView />;
    case "wine":
      return <WineView />;
    case "travel":
      return <TravelView />;
    case "running":
      return <RunningView />;
    default:
      return null;
  }
}

export function App() {
  const [view, setView] = useState<View>("movies");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, #1e90ff 0, #0b1020 45%, #020409 100%)",
        color: "#f9fafb",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "2rem 1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          borderRadius: "1.5rem",
          background: "rgba(15, 23, 42, 0.94)",
          boxShadow:
            "0 24px 60px rgba(15, 23, 42, 0.85), inset 0 0 0 1px rgba(148, 163, 184, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            padding: "1.25rem 1.75rem",
            borderBottom: "1px solid rgba(148, 163, 184, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              My Hobbies
            </h1>
            <p
              style={{
                marginTop: "0.25rem",
                fontSize: "0.85rem",
                color: "#9ca3af",
              }}
            >
              A tiny single-page app for things you love.
            </p>
          </div>
          <nav
            aria-label="Hobby navigation"
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {[
              { id: "movies", label: "Movies" },
              { id: "wine", label: "Wine" },
              { id: "travel", label: "Travel" },
              { id: "running", label: "Running" },
            ].map((item) => {
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id as View)}
                  style={{
                    padding: "0.45rem 0.9rem",
                    borderRadius: "999px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    backgroundColor: isActive ? "#22c55e" : "rgba(15,23,42,0.9)",
                    color: isActive ? "#022c22" : "#e5e7eb",
                    boxShadow: isActive
                      ? "0 10px 22px rgba(34, 197, 94, 0.45)"
                      : "0 0 0 rgba(0,0,0,0)",
                    transition:
                      "background-color 0.12s ease-out, color 0.12s ease-out, box-shadow 0.12s ease-out, transform 0.08s ease-out",
                  }}
                  onMouseDown={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(1px) scale(0.98)";
                  }}
                  onMouseUp={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "translateY(0) scale(1)";
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </header>

        <section
          style={{
            padding: "1.75rem 1.75rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <ViewContainer current={view} />
        </section>
      </div>
    </main>
  );
}

