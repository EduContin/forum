import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

export default async function NotFound() {
  const session = await getServerSession();

  if (session) {
    redirect("/");
  } else {
    redirect("/login");
  }
}
