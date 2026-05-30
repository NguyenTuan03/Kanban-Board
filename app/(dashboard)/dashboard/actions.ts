"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { WorkspaceRole } from "@/types/kanban";

// Hàm chuyển đổi Tên tiếng Việt thành Slug thân thiện với URL
function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu tiếng Việt
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/[^\w\-]+/g, "") // Loại bỏ tất cả ký tự không phải chữ cái/số/gạch ngang
    .replace(/\-\-+/g, "-"); // Thay thế nhiều dấu gạch ngang liên tiếp bằng một dấu
}

export async function createNewWorkspace(name: string) {
  if (!name || !name.trim()) {
    return { success: false, message: "Tên không gian làm việc không được để trống." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Xác thực người dùng
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Bạn cần đăng nhập để thực hiện thao tác này." };
  }

  const slug = `${slugify(name)}-${Date.now().toString().slice(-4)}`;

  // Bước A: Tạo Workspace mới trong bảng workspaces
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({
      name: name.trim(),
      slug,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (wsError || !workspace) {
    return {
      success: false,
      message: `Lỗi tạo không gian làm việc: ${wsError?.message || "Không xác định"}`,
    };
  }

  // Bước B1: Truy vấn động lấy UUID của vai trò ADMIN từ bảng roles
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .or(`name.ilike.${WorkspaceRole.ADMIN},name.ilike.admin`)
    .maybeSingle();

  if (roleError || !role) {
    // Rollback: Xóa workspace vừa tạo nếu lỗi truy vấn vai trò để tránh rác DB
    try {
      await supabase.from("workspaces").delete().eq("id", workspace.id);
    } catch (rollbackErr) {
      console.error("Lỗi khi rollback workspace:", rollbackErr);
    }

    return {
      success: false,
      message: `Không tìm thấy vai trò ADMIN trong hệ thống. Lỗi: ${roleError?.message || "Không tìm thấy vai trò phù hợp"}.`,
    };
  }

  // Bước B2: Tự động thêm người tạo làm ADMIN vào bảng workspace_members sử dụng UUID tìm được
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role_id: role.id,
    });

  if (memberError) {
    // Rollback: Xóa workspace vừa tạo nếu lỗi phân quyền thành viên để tránh rác DB
    try {
      await supabase.from("workspaces").delete().eq("id", workspace.id);
    } catch (rollbackErr) {
      console.error("Lỗi khi rollback workspace:", rollbackErr);
    }

    return {
      success: false,
      message: `Lỗi phân quyền thành viên: ${memberError.message}`,
    };
  }

  // Làm mới cache và cập nhật giao diện hiển thị cho các trang
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true };
}
