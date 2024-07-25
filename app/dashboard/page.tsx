import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutForm";
import { Alert, Button, CircularProgress } from "@mui/material";

export default async function Dashboard() {
  let session = null;
  let error = null;

  try {
    session = await getServerSession();
    if (!session) {
      redirect("/login");
    }
  } catch (err) {
    console.error("Error fetching session:", err);
    error = "An error occurred. Please try again.";
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {session ? (
        <>
          <h1 className="text-4xl font-bold mb-8">
            Welcome to your dashboard, {session.user?.name}
          </h1>
          <LogoutButton />
        </>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
}
