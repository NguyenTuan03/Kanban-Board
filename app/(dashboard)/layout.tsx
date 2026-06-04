import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "@/app/(auth)/login/action";
import DashboardShell from "@/components/layout/dashboard-shell";

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceMemberResponse {
  workspaces: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Kiểm tra bảo mật: Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
  if (!user) {
    redirect("/login");
  }

  // Lấy danh sách Workspace người dùng đang tham gia
  let userWorkspaces: WorkspaceItem[] = [];

  try {
    const { data, error } = await supabase
      .from("workspace_members")
      .select(`
        workspaces (
          id,
          name,
          slug
        )
      `)
      .eq("user_id", user.id);

    if (!error && data) {
      const rawData = data as unknown as WorkspaceMemberResponse[];
      userWorkspaces = rawData
        .map((item) => item.workspaces)
        .filter((ws): ws is WorkspaceItem => ws !== null);
    }
  } catch (err) {
    console.error("Lỗi khi truy vấn danh sách Workspaces:", err);
  }

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <DashboardShell
      user={user}
      userWorkspaces={userWorkspaces}
      signOutAction={handleSignOut}
    >
      {children}
    </DashboardShell>
  );
}
