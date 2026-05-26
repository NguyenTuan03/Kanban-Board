import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Chuyển hướng về trang chủ '/' hoặc path mong muốn sau khi đăng nhập thành công
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Chuyển hướng về trang đăng nhập với thông báo lỗi nếu thất bại
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
