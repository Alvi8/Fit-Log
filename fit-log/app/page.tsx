"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Workout = {
  id: number | string;
  name: string;
  category: string[];
  equipment: string;
  duration: number;
  calories: number;
  rating: number;
  image: string;
};

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("duration");
  const [plan, setPlan] = useState<Workout[]>([]);
  const [saved, setSaved] = useState<Workout[]>([]);

  // FETCH WORKOUTS AND LOAD LOCAL STORAGE
  useEffect(() => {
    async function initialize() {
      try {
        // Load saved plan
        const storedPlan = localStorage.getItem("fitlog-plan");
        const storedSaved = localStorage.getItem("fitlog-saved");

        if (storedPlan) {
          const parsedPlan = JSON.parse(storedPlan);

          if (Array.isArray(parsedPlan)) {
            setPlan(parsedPlan);
          }
        }

        if (storedSaved) {
          const parsedSaved = JSON.parse(storedSaved);

          if (Array.isArray(parsedSaved)) {
            setSaved(parsedSaved);
          }
        }

        // Fetch API
        const response = await fetch("https://api.abcz.workers.dev/api/fitlog");

        if (!response.ok) {
          throw new Error("Failed to fetch workouts");
        }

        const data = await response.json();

        const list: unknown[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        // Format API data
        const formattedData: Workout[] = list.map(
          (rawItem: unknown, index: number) => {
            const item = rawItem as Record<string, unknown>;

            let category: string[] = [];

            if (Array.isArray(item.muscleGroups)) {
              category = item.muscleGroups.map(String);
            } else if (Array.isArray(item.category)) {
              category = item.category.map(String);
            } else if (item.category) {
              category = [String(item.category)];
            }

            return {
              id: (item.id as number | string) ?? index + 1,

              name: String(item.name ?? "Unknown Workout"),

              category,

              equipment: String(item.equipment ?? "Bodyweight"),

              duration: Number(item.duration) || 0,

              calories: Number(item.caloriesBurned ?? item.calories) || 0,

              rating: Number(item.rating) || 0,

              image: String(item.image || "/banner.png"),
            };
          },
        );

        setWorkouts(formattedData);
      } catch (error) {
        console.error("Workout fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  // ADD WORKOUT TO PLAN
  function addToPlan(workout: Workout) {
    if (plan.some((item) => item.id === workout.id)) {
      alert("Already added to today's plan!");
      return;
    }

    if (plan.length >= 5) {
      alert("You can add maximum 5 workouts!");
      return;
    }

    const updated = [...plan, workout];

    setPlan(updated);

    localStorage.setItem("fitlog-plan", JSON.stringify(updated));

    alert("Workout added to today's plan!");
  }

  // SAVE WORKOUT
  function saveWorkout(workout: Workout) {
    if (saved.some((item) => item.id === workout.id)) {
      alert("Already saved!");
      return;
    }

    const updated = [...saved, workout];

    setSaved(updated);

    localStorage.setItem("fitlog-saved", JSON.stringify(updated));

    alert("Workout saved successfully!");
  }

  // SEARCH AND SORT
  const filtered = workouts
    .filter((workout) =>
      `${workout.name} ${workout.category.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sort === "duration") {
        return a.duration - b.duration;
      }

      if (sort === "calories") {
        return a.calories - b.calories;
      }

      if (sort === "rating") {
        return b.rating - a.rating;
      }

      return 0;
    });

  return (
    <main className="fitlog">
      {/* NAVBAR */}
      <nav className="navbar">
        <Link href="/" className="logo">
          <span className="logo-icon">✳</span> FITLOG
        </Link>

        <div className="nav-links">
          <a href="#library" className="active">
            Workout
          </a>

          <Link href="/my-plan">My Plan</Link>
        </div>

        <div className="nav-badges">
          <Link href="/my-plan" className="plan-badge">
            PLAN <span>{plan.length}</span>
          </Link>

          <Link href="/my-plan" className="saved-badge">
            SAVED <span>{saved.length}</span>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">WORKOUT LIBRARY / 2026</p>

          <h1>
            TRAIN WITH
            <br />
            INTENT.
            <br />
            <span>LOG EVERY SET.</span>
          </h1>

          <p className="hero-description">
            FitLog is a dark, no-nonsense gym companion: pick a lift, lock it
            into today&apos;s plan, and watch the week&apos;s work add up.
          </p>

          <a href="#library" className="primary-button">
            BROWSE WORKOUTS ↗
          </a>
        </div>

        <div className="hero-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/banner.png" alt="Workout banner" />

          <div className="image-label">TRAIN HARD / LOG HONEST</div>
        </div>
      </section>

      {/* WORKOUT LIBRARY */}
      <section className="library" id="library">
        <div className="library-header">
          <div>
            <p className="eyebrow">01 / YOUR TRAINING STARTS HERE</p>

            <h2>
              THE LIBRARY<span>.</span>
            </h2>

            <p className="section-description">
              Twelve lifts covering every major muscle group.
            </p>
          </div>

          {/* SEARCH AND SORT */}
          <div className="library-controls">
            <input
              type="text"
              placeholder="Search workouts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="duration">Sort: Duration</option>

              <option value="calories">Sort: Calories</option>

              <option value="rating">Sort: Rating</option>
            </select>
          </div>
        </div>

        {/* LOADING AND WORKOUT RESULTS */}
        {loading ? (
          <div className="loading">LOADING WORKOUTS...</div>
        ) : workouts.length === 0 ? (
          <div className="loading">NO WORKOUTS FOUND.</div>
        ) : filtered.length === 0 ? (
          <div className="loading">NO MATCHING WORKOUTS FOUND.</div>
        ) : (
          /* WORKOUT CARDS */
          <div className="workout-grid">
            {filtered.map((workout) => (
              <article className="workout-card" key={workout.id}>
                {/* WORKOUT IMAGE */}
                <div className="workout-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={workout.image}
                    alt={workout.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/banner.png";
                    }}
                  />

                  <span className="category-tag">
                    {workout.category.join(" / ")}
                  </span>
                </div>

                {/* WORKOUT INFORMATION */}
                <div className="workout-info">
                  <h3>{workout.name}</h3>

                  <p className="equipment">{workout.equipment}</p>

                  {/* WORKOUT STATS */}
                  <div className="stats">
                    <span>◷ {workout.duration} min</span>

                    <span>🔥 {workout.calories} kcal</span>

                    <span>★ {workout.rating}</span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="card-actions">
                    <Link
                      href={`/workout/${workout.id}`}
                      className="details-button">
                      DETAILS ↗
                    </Link>

                    <button onClick={() => addToPlan(workout)}>+ PLAN</button>

                    <button
                      className="save-button"
                      onClick={() => saveWorkout(workout)}
                      title="Save workout">
                      ♡
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <Link href="/" className="logo">
          <span className="logo-icon">✳</span> FITLOG
        </Link>

        <p>© 2026 FitLog — Workout Library. Train hard, log honest.</p>
      </footer>
    </main>
  );
}
