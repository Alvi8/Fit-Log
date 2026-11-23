"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Workout {
  id: string | number;
  name?: string;
  title?: string;
  description?: string;
  muscleGroups?: string[] | string;
  category?: string;
  equipment?: string[] | string;
  duration?: number | string;
  caloriesBurned?: number;
  calories?: number;
  rating?: number;
  image?: string;
  instructions?: string[] | string;
}

interface Props {
  id: string;
}

export default function WorkoutDetailsClient({ id }: Props) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWorkout() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/workouts/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load workout details.");
        }

        const result = await response.json();

        const data = result.data ?? result.workout ?? result;

        if (!data || (!data.id && !data.name && !data.title)) {
          throw new Error("Workout not found.");
        }

        setWorkout(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Workout details error:", err);

        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchWorkout();

    return () => {
      controller.abort();
    };
  }, [id]);

  // Loading State
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-lime-500 mx-auto mb-4"></div>

          <p className="text-gray-600 font-medium">
            Loading workout details...
          </p>
        </div>
      </main>
    );
  }

  // Error State
  if (error || !workout) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm max-w-md w-full">
          <h1 className="text-3xl font-bold mb-3 text-gray-900">
            Workout Not Found
          </h1>

          <p className="text-gray-500 mb-6">
            {error || "Unable to find this workout."}
          </p>

          <Link
            href="/"
            className="inline-block bg-lime-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-lime-500 transition">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // Workout Information
  const workoutName = workout.name || workout.title || "Workout";

  const muscleGroups = Array.isArray(workout.muscleGroups)
    ? workout.muscleGroups.join(", ")
    : workout.muscleGroups || workout.category || "Not specified";

  const equipment = Array.isArray(workout.equipment)
    ? workout.equipment.join(", ")
    : workout.equipment || "Not specified";

  const instructions = Array.isArray(workout.instructions)
    ? workout.instructions
    : workout.instructions
      ? [workout.instructions]
      : [];

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}

        <Link
          href="/"
          className="inline-block mb-8 text-gray-600 hover:text-black font-medium transition">
          ← Back to Workouts
        </Link>

        {/* Main Card */}

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Workout Image */}

          {workout.image && (
            <div className="relative w-full h-72 md:h-96">
              <Image
                src={workout.image}
                alt={workoutName}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover"
              />
            </div>
          )}

          {/* Workout Content */}

          <div className="p-6 md:p-10">
            {/* Category and Rating */}

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="bg-lime-100 text-lime-800 px-4 py-2 rounded-full text-sm font-semibold">
                {muscleGroups}
              </span>

              {workout.rating !== undefined && (
                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                  ⭐ {workout.rating}
                </span>
              )}
            </div>

            {/* Workout Name */}

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5">
              {workoutName}
            </h1>

            {/* Description */}

            <p className="text-gray-600 text-lg leading-8 mb-8">
              {workout.description || "No description available."}
            </p>

            {/* Workout Statistics */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {/* Duration */}

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-gray-500 text-sm mb-2">Duration</p>

                <h3 className="text-2xl font-bold text-gray-900">
                  {workout.duration ?? "N/A"}
                  {typeof workout.duration === "number" ? " min" : ""}
                </h3>
              </div>

              {/* Calories */}

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-gray-500 text-sm mb-2">Calories Burned</p>

                <h3 className="text-2xl font-bold text-gray-900">
                  {workout.caloriesBurned ?? workout.calories ?? "N/A"}
                </h3>
              </div>

              {/* Equipment */}

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-gray-500 text-sm mb-2">Equipment</p>

                <h3 className="text-lg font-bold text-gray-900">{equipment}</h3>
              </div>
            </div>

            {/* Workout Instructions */}

            {instructions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Workout Instructions
                </h2>

                <div className="space-y-5">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <span className="bg-lime-400 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 text-black">
                        {index + 1}
                      </span>

                      <p className="text-gray-700 leading-7">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
