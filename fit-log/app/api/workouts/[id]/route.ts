import { NextResponse } from "next/server";

const API_URL = "https://api.abcz.workers.dev/api/fitlog";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Workout ID is required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          message: "Failed to fetch workout",
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Workout API Error:", error);

    return NextResponse.json(
      {
        message: "Unable to connect to workout API",
      },
      { status: 502 },
    );
  }
}
