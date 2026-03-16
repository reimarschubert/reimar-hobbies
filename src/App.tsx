import { useEffect, useState } from "react";
import oscars2022 from "./oscars2022.json";
import oscars2023 from "./oscars2023.json";
import oscars2024 from "./oscars2024.json";
import oscars2025 from "./oscars2025.json";

type View = "movies" | "wine" | "travel" | "running";

type OscarCategory =
  | "Best Picture"
  | "Best Director"
  | "Best Actor"
  | "Best Actress"
  | "Best Supporting Actor"
  | "Best Supporting Actress"
  | "Best Original Screenplay"
  | "Best Adapted Screenplay";

type Edition = {
  id: number;
  name: string;
  edition: number;
  year: number;
};

type ApiCategory = {
  id: number;
  name: string;
};

type ApiNominee = {
  id: number;
  name: string;
  more?: string;
  note?: string | null;
  winner: boolean;
};

type CategoryResult = {
  category: OscarCategory;
  winner?: {
    title: string;
  };
  nominees: {
    title: string;
  }[];
};

type LocalYear = {
  year: number;
  results: CategoryResult[];
};

const LOCAL_OSCARS: LocalYear[] = [
  ...(oscars2022 as LocalYear[]),
  ...(oscars2023 as LocalYear[]),
  ...(oscars2024 as LocalYear[]),
  ...(oscars2025 as LocalYear[]),
];

const CATEGORY_CONFIG: {
  key: OscarCategory;
  apiNames: string[];
}[] = [
  { key: "Best Picture", apiNames: ["Best Picture"] },
  { key: "Best Director", apiNames: ["Directing"] },
  { key: "Best Actor", apiNames: ["Actor", "Actor In A Leading Role"] },
  { key: "Best Actress", apiNames: ["Actress", "Actress In A Leading Role"] },
  {
    key: "Best Supporting Actor",
    apiNames: ["Actor In A Supporting Role"],
  },
  {
    key: "Best Supporting Actress",
    apiNames: ["Actress In A Supporting Role"],
  },
  {
    key: "Best Original Screenplay",
    apiNames: [
      "Writing (Original Screenplay)",
      "Writing (Story And Screenplay--Written Directly For The Screen)",
      "Writing (Screenplay Written Directly For The Screen)",
    ],
  },
  {
    key: "Best Adapted Screenplay",
    apiNames: [
      "Writing (Adapted Screenplay)",
      "Writing (Screenplay Based On Material From Another Medium)",
    ],
  },
];

function MoviesView() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEditions() {
      try {
        setError(null);
        const res = await fetch("https://theawards.vercel.app/api/oscars/editions");
        if (!res.ok) {
          throw new Error(`Failed to load editions (${res.status})`);
        }
        const data = (await res.json()) as Edition[];
        const filtered = data.filter((e) => e.year >= 1970 && e.year <= 2021);
        filtered.sort((a, b) => b.year - a.year);
        if (!cancelled) {
          setEditions(filtered);
          if (!selectedYear && filtered.length > 0) {
            setSelectedYear(filtered[0].year);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError("Could not load Oscars editions. Please try again later.");
        }
      }
    }

    loadEditions();

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  useEffect(() => {
    let cancelled = false;

    async function loadYearData(year: number) {
      const local = LOCAL_OSCARS.find((y) => y.year === year);
      if (local) {
        setResults(local.results);
        return;
      }

      const edition = editions.find((e) => e.year === year);
      if (!edition) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const catRes = await fetch(
          `https://theawards.vercel.app/api/oscars/editions/${edition.id}/categories`,
        );
        if (!catRes.ok) {
          throw new Error(`Failed to load categories (${catRes.status})`);
        }
        const categories = (await catRes.json()) as ApiCategory[];

        const categoryMap: Record<OscarCategory, ApiCategory | undefined> = {
          "Best Picture": undefined,
          "Best Director": undefined,
          "Best Actor": undefined,
          "Best Actress": undefined,
          "Best Supporting Actor": undefined,
          "Best Supporting Actress": undefined,
          "Best Original Screenplay": undefined,
          "Best Adapted Screenplay": undefined,
        };

        for (const config of CATEGORY_CONFIG) {
          const match = categories.find((c) =>
            config.apiNames.some((name) => c.name === name),
          );
          if (match) {
            categoryMap[config.key] = match;
          }
        }

        const fetches = CATEGORY_CONFIG.map(async (config) => {
          const cat = categoryMap[config.key];
          if (!cat) {
            return {
              category: config.key,
              winner: undefined,
              nominees: [],
            } as CategoryResult;
          }

          const nomRes = await fetch(
            `https://theawards.vercel.app/api/oscars/editions/${edition.id}/categories/${cat.id}/nominees`,
          );
          if (!nomRes.ok) {
            throw new Error(`Failed to load nominees (${nomRes.status})`);
          }
          const nominees = (await nomRes.json()) as ApiNominee[];
          const winnerNom = nominees.find((n) => n.winner);
          const otherNominees = nominees.filter((n) => !n.winner);

          return {
            category: config.key,
            winner: winnerNom
              ? {
                  title: winnerNom.more
                    ? `${winnerNom.name} – ${winnerNom.more}`
                    : winnerNom.name,
                }
              : undefined,
            nominees: otherNominees.map((n) => ({
              title: n.more ? `${n.name} – ${n.more}` : n.name,
            })),
          } as CategoryResult;
        });

        const loaded = await Promise.all(fetches);
        if (!cancelled) {
          setResults(loaded);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Could not load winners and nominees for this year.");
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (selectedYear && editions.length > 0) {
      loadYearData(selectedYear);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedYear, editions]);

  const apiYears = editions.map((e) => e.year);
  const localYears = LOCAL_OSCARS.map((y) => y.year);
  const years = [...apiYears, ...localYears].sort((a, b) => b - a);

  return (
    <section>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "0.25rem" }}>Movies – Oscars</h2>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            Browse winners and nominees in top categories, 1970–2024.
          </p>
        </div>
        <label
          style={{
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span>Year:</span>
          <select
            value={selectedYear ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              setSelectedYear(Number.isNaN(value) ? undefined : value);
            }}
            style={{
              backgroundColor: "#020617",
              color: "#e5e7eb",
              borderRadius: "999px",
              border: "1px solid rgba(148, 163, 184, 0.6)",
              padding: "0.3rem 0.75rem",
              fontSize: "0.85rem",
            }}
          >
            {years.length === 0 && <option value="">Loading…</option>}
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error && (
        <p style={{ fontSize: "0.85rem", color: "#fca5a5", marginBottom: "0.75rem" }}>
          {error}
        </p>
      )}
      {loading && (
        <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.75rem" }}>
          Loading winners and nominees…
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {results.map((entry) => (
          <article
            key={entry.category}
            style={{
              padding: "1rem 1.1rem",
              borderRadius: "0.9rem",
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.4)",
            }}
          >
            <h3
              style={{
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.35rem",
                color: "#e5e7eb",
              }}
            >
              {entry.category}
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#bbf7d0",
                marginBottom: "0.5rem",
              }}
            >
              Winner:{" "}
              <strong>{entry.winner ? entry.winner.title : "Not available"}</strong>
            </p>
            {entry.nominees.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    marginBottom: "0.25rem",
                  }}
                >
                  Nominees:
                </p>
                <ul
                  style={{
                    listStyle: "disc",
                    paddingLeft: "1.1rem",
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.1rem",
                    fontSize: "0.8rem",
                  }}
                >
                  {entry.nominees.map((nominee) => (
                    <li key={nominee.title}>{nominee.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
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

