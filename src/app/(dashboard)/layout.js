import { SidebarProvider } from "../../components/SidebarProvider";
import DashboardClientLayout from "../../components/DashboardClientLayout";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <DashboardClientLayout sessionUser={session.user}>
        {children}
      </DashboardClientLayout>
    </SidebarProvider>
  );
}
