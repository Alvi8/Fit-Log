import WorkoutDetailsClient from "./workout-details-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkoutDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return <WorkoutDetailsClient id={id} />;
}
