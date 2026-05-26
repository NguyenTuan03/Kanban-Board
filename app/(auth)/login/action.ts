"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithGitHub() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Lấy baseUrl từ env hoặc fallback về localhost
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      // Sau khi đăng nhập xong, Supabase sẽ redirect về URL này kèm mã auth code
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error signing in:", error);
    return redirect("/login?error=true");
  }

  if (data.url) {
    return redirect(data.url); // Di chuyển đến trang đăng nhập của GitHub
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  return redirect("/login");
}
