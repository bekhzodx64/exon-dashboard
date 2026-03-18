import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const currentUser = {
    role: session.user.role,
    name: session.user.name || session.user.email,
    timeLeft: "01:54:12" // Hardcoded for now, as in original
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role={currentUser.role} timeLeft={currentUser.timeLeft} />
      <div className="md:ml-64 flex-1">
        <Navbar role={currentUser.role} username={currentUser.name} />
        <main className="min-h-[calc(100vh-64px)] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
