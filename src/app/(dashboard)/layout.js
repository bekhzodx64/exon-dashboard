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

  return (
    <div className="flex min-h-screen">
      <Sidebar timeLeft={session.user.timeLeft || "01:54:12"} />
      <div className="md:ml-64 flex-1">
        <Navbar />
        <main className="min-h-[calc(100vh-64px)] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
