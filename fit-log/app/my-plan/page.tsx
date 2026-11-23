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

type TabType = "plan" | "saved";

export default function MyPlan() {
  const [plan, setPlan] = useState<Workout[]>([]);
  const [saved, setSaved] = useState<Workout[]>([]);
  const [done, setDone] = useState<(number | string)[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("plan");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // LOAD LOCAL STORAGE
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedPlan = localStorage.getItem("fitlog-plan");
        const storedSaved = localStorage.getItem("fitlog-saved");
        const storedDone = localStorage.getItem("fitlog-done");

        if (storedPlan) {
          const data = JSON.parse(storedPlan);

          if (Array.isArray(data)) {
            setPlan(data);
          }
        }

        if (storedSaved) {
          const data = JSON.parse(storedSaved);

          if (Array.isArray(data)) {
            setSaved(data);
          }
        }

        if (storedDone) {
          const data = JSON.parse(storedDone);

          if (Array.isArray(data)) {
            setDone(data);
          }
        }
      } catch (error) {
        console.error("LocalStorage error:", error);
      } finally {
        setLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // SAVE PLAN
  function updatePlan(updated: Workout[]) {
    setPlan(updated);
    localStorage.setItem("fitlog-plan", JSON.stringify(updated));
  }

  // SAVE SAVED WORKOUTS
  function updateSaved(updated: Workout[]) {
    setSaved(updated);
    localStorage.setItem("fitlog-saved", JSON.stringify(updated));
  }

  // TOAST NOTIFICATION
  function showToast(message: string) {
    window.dispatchEvent(
      new CustomEvent("fitlog-toast", {
        detail: message,
      }),
    );

    // Fallback notification
    console.log(message);
  }

  // REMOVE WORKOUT
  function removeWorkout(id: number | string) {
    if (activeTab === "plan") {
      const updated = plan.filter((item) => item.id !== id);

      updatePlan(updated);
      showToast("Workout removed from today's plan");
    } else {
      const updated = saved.filter((item) => item.id !== id);

      updateSaved(updated);
      showToast("Workout removed from saved list");
    }
  }

  // MARK AS DONE
  function markAsDone(id: number | string) {
    if (done.includes(id)) {
      showToast("Workout already completed!");
      return;
    }

    const updated = [...done, id];

    setDone(updated);
    localStorage.setItem("fitlog-done", JSON.stringify(updated));

    showToast("Workout marked as completed!");
  }

  // MOVE SAVED WORKOUT TO PLAN
  function addSavedToPlan(workout: Workout) {
    if (plan.some((item) => item.id === workout.id)) {
      showToast("Workout already in today's plan");
      return;
    }

    if (plan.length >= 5) {
      showToast("Maximum 5 workouts allowed!");
      return;
    }

    const updated = [...plan, workout];

    updatePlan(updated);
    showToast("Workout added to today's plan!");
  }

  // METRICS
  const totalExercises = plan.length;

  const totalMinutes = plan.reduce(
    (total, workout) => total + workout.duration,
    0,
  );

  const totalCalories = plan.reduce(
    (total, workout) => total + workout.calories,
    0,
  );

  // SEARCH
  const currentList = activeTab === "plan" ? plan : saved;

  const filteredWorkouts = currentList.filter((workout) =>
    `${workout.name} ${workout.category.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="fitlog">
      {/* NAVBAR */}

      <nav className="navbar">
        <Link href="/" className="logo">
          <span className="logo-icon">✳</span>
          FITLOG
        </Link>

        <div className="nav-links">
          <Link href="/">Workout</Link>

          <Link href="/my-plan" className="active">
            My Plan
          </Link>
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

      {/* MY PLAN HEADER */}

      <section className="my-plan-section">
        <div className="plan-header">
          <p className="eyebrow">02 / YOUR TRAINING LOG</p>

          <h1>
            MY PLAN<span>.</span>
          </h1>

          <p className="section-description">
            Cap of five lifts for today. Finish them, then load more.
          </p>
        </div>

        {/* METRICS */}

        <div className="metrics-grid">
          <div className="metric-card">
            <p>EXERCISES</p>
            <h2>{totalExercises}</h2>
            <span>Planned workouts</span>
          </div>

          <div className="metric-card">
            <p>MINUTES</p>
            <h2>{totalMinutes}</h2>
            <span>Total duration</span>
          </div>

          <div className="metric-card">
            <p>CALORIES</p>
            <h2>{totalCalories}</h2>
            <span>Estimated burn</span>
          </div>
        </div>

        {/* TABS */}

        <div className="plan-tabs">
          <button
            className={activeTab === "plan" ? "tab active-tab" : "tab"}
            onClick={() => {
              setActiveTab("plan");
              setSearch("");
            }}>
            TODAY&apos;S PLAN ({plan.length})
          </button>

          <button
            className={activeTab === "saved" ? "tab active-tab" : "tab"}
            onClick={() => {
              setActiveTab("saved");
              setSearch("");
            }}>
            SAVED ({saved.length})
          </button>
        </div>

        {/* SEARCH */}

        <div className="plan-search">
          <input
            type="text"
            placeholder="Search your workouts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="loading">LOADING WORKOUTS...</div>
        ) : filteredWorkouts.length === 0 ? (
          /* EMPTY STATE */

          <div className="empty-state">
            <div className="empty-icon">✳</div>

            <h2>
              NOTHING HERE<span>.</span>
            </h2>

            <p>
              {search
                ? "No matching workouts found."
                : "Browse the library and add a lift to get today moving."}
            </p>

            <Link href="/" className="primary-button">
              GO TO WORKOUTS ↗
            </Link>
          </div>
        ) : (
          /* WORKOUT LIST */

          <div className="plan-workout-list">
            {filteredWorkouts.map((workout) => (
              <article className="plan-workout-card" key={workout.id}>
                {/* IMAGE */}

                <div className="plan-workout-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={workout.image || "/banner.png"}
                    alt={workout.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/banner.png";
                    }}
                  />
                </div>

                {/* INFORMATION */}

                <div className="plan-workout-info">
                  <div className="plan-workout-heading">
                    <div>
                      <div className="plan-category">
                        {workout.category.join(" / ")}
                      </div>

                      <h3>{workout.name}</h3>

                      <p className="equipment">{workout.equipment}</p>
                    </div>

                    {activeTab === "plan" && done.includes(workout.id) && (
                      <span className="completed-badge">✓ COMPLETED</span>
                    )}
                  </div>

                  {/* STATS */}

                  <div className="stats">
                    <span>◷ {workout.duration} min</span>

                    <span>🔥 {workout.calories} kcal</span>

                    <span>★ {workout.rating}</span>
                  </div>

                  {/* ACTIONS */}

                  <div className="plan-card-actions">
                    <Link
                      href={`/workout/${workout.id}`}
                      className="details-button">
                      VIEW DETAILS ↗
                    </Link>

                    {activeTab === "plan" ? (
                      <button
                        className={
                          done.includes(workout.id)
                            ? "done-button completed"
                            : "done-button"
                        }
                        onClick={() => markAsDone(workout.id)}
                        disabled={done.includes(workout.id)}>
                        {done.includes(workout.id)
                          ? "✓ DONE"
                          : "✓ MARK AS DONE"}
                      </button>
                    ) : (
                      <button
                        className="done-button"
                        onClick={() => addSavedToPlan(workout)}>
                        + ADD TO PLAN
                      </button>
                    )}

                    <button
                      className="remove-button"
                      onClick={() => removeWorkout(workout.id)}
                      title="Remove workout">
                      ✕
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
          <span className="logo-icon">✳</span>
          FITLOG
        </Link>

        <p>© 2026 FitLog — Workout Library. Train hard, log honest.</p>
      </footer>

      {/* PAGE STYLES */}

      <style jsx>{`
        .my-plan-section {
          padding: 100px 7%;
          min-height: 75vh;
        }

        .plan-header {
          margin-bottom: 55px;
        }

        .plan-header h1 {
          font-size: clamp(48px, 6vw, 72px);
          font-weight: 900;
          letter-spacing: -3px;
          margin: 25px 0;
        }

        .plan-header h1 span,
        .empty-state h2 span {
          color: var(--lime);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 55px;
        }

        .metric-card {
          background: var(--card);
          border: 1px solid var(--border);
          padding: 28px;
        }

        .metric-card p {
          color: var(--gray);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .metric-card h2 {
          color: var(--lime);
          font-size: 42px;
          margin: 15px 0 8px;
          font-weight: 900;
        }

        .metric-card span {
          color: var(--gray);
          font-size: 12px;
        }

        .plan-tabs {
          display: flex;
          gap: 30px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 25px;
        }

        .tab {
          background: transparent;
          color: var(--gray);
          border: none;
          padding: 18px 0;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .active-tab {
          color: var(--lime);
          border-bottom: 2px solid var(--lime);
        }

        .plan-search {
          margin-bottom: 30px;
        }

        .plan-search input {
          width: 100%;
          max-width: 400px;
          height: 48px;
          padding: 0 15px;
          background: var(--card);
          color: white;
          border: 1px solid var(--border);
          outline: none;
        }

        .plan-search input:focus {
          border-color: var(--lime);
        }

        .plan-workout-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .plan-workout-card {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 25px;
          padding: 18px;
          background: var(--card);
          border: 1px solid var(--border);
          transition: 0.3s;
        }

        .plan-workout-card:hover {
          border-color: var(--lime);
        }

        .plan-workout-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #242724;
        }

        .plan-workout-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .plan-workout-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }

        .plan-workout-heading {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .plan-category {
          color: var(--lime);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .plan-workout-heading h3 {
          font-size: 23px;
          font-weight: 900;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .completed-badge {
          color: var(--lime);
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
        }

        .plan-card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .plan-card-actions button {
          cursor: pointer;
        }

        .done-button {
          background: var(--lime);
          color: #101110;
          border: none;
          padding: 12px 15px;
          font-size: 10px;
          font-weight: 900;
        }

        .done-button.completed {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .remove-button {
          background: transparent;
          border: 1px solid #555;
          color: white;
          padding: 10px 15px;
          font-size: 15px;
        }

        .remove-button:hover {
          border-color: red;
          color: red;
        }

        .empty-state {
          min-height: 350px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          border: 1px dashed var(--border);
          padding: 35px;
        }

        .empty-icon {
          color: var(--lime);
          font-size: 45px;
          margin-bottom: 15px;
        }

        .empty-state h2 {
          font-size: clamp(30px, 5vw, 48px);
          font-weight: 900;
          margin-bottom: 15px;
        }

        .empty-state p {
          color: var(--gray);
          font-size: 14px;
          margin-bottom: 25px;
          line-height: 1.7;
        }

        @media (max-width: 750px) {
          .my-plan-section {
            padding: 65px 5%;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .metric-card {
            padding: 22px;
          }

          .plan-workout-card {
            grid-template-columns: 1fr;
          }

          .plan-workout-image {
            height: 220px;
          }

          .plan-workout-heading h3 {
            font-size: 19px;
          }

          .plan-card-actions {
            gap: 8px;
          }
        }

        @media (max-width: 450px) {
          .plan-tabs {
            gap: 18px;
          }

          .tab {
            font-size: 10px;
          }

          .plan-card-actions > * {
            font-size: 9px;
          }
        }
      `}</style>
    </main>
  );
}
