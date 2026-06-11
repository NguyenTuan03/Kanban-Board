"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/utils/url";

export async function signInWithGitHub() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const baseUrl = await getBaseUrl();

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

export async function signInWithFacebook() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      // Sau khi đăng nhập xong, Supabase sẽ redirect về URL này kèm mã auth code
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error signing in with Facebook:", error);
    return redirect("/login?error=true");
  }

  if (data.url) {
    return redirect(data.url); // Di chuyển đến trang đăng nhập của Facebook
  }
}

export async function signInWithGoogle() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error signing in with Google:", error);
    return redirect("/login?error=true");
  }

  if (data.url) {
    return redirect(data.url);
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  return redirect("/login");
}
