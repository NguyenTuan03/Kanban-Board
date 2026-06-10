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

interface MemberRoleSelect {
  role: {
    name: string;
  } | null;
}

export async function updateWorkspaceName(workspaceId: string, newName: string) {
  if (!workspaceId) {
    return { success: false, message: "ID không gian làm việc không hợp lệ." };
  }
  if (!newName || !newName.trim()) {
    return { success: false, message: "Tên không gian làm việc không được để trống." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Bạn cần đăng nhập để thực hiện thao tác này." };
  }

  // Kiểm tra xem người dùng có quyền ADMIN hoặc là người tạo không
  const { data: member } = await supabase
    .from("workspace_members")
    .select(`
      role:roles (
        name
      )
    `)
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: ws } = await supabase
    .from("workspaces")
    .select("created_by")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!ws) {
    return { success: false, message: "Không tìm thấy không gian làm việc." };
  }

  const typedMember = member as unknown as MemberRoleSelect | null;
  const isOwner = ws.created_by === user.id;
  const isAdmin = typedMember?.role?.name?.toUpperCase() === WorkspaceRole.ADMIN || typedMember?.role?.name?.toUpperCase() === "ADMIN";

  if (!isOwner && !isAdmin) {
    return { success: false, message: "Bạn không có quyền thực hiện thao tác này." };
  }

  // Cập nhật tên mới
  const { data: updateData, error: updateError } = await supabase
    .from("workspaces")
    .update({ name: newName.trim() })
    .eq("id", workspaceId)
    .select("id");

  if (updateError) {
    return { success: false, message: `Lỗi khi cập nhật tên: ${updateError.message}` };
  }

  if (!updateData || updateData.length === 0) {
    return { success: false, message: "Cập nhật thất bại. Vui lòng kiểm tra quyền RLS (Row Level Security) trên bảng workspaces." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true };
}

export async function deleteWorkspace(workspaceId: string) {
  if (!workspaceId) {
    return { success: false, message: "ID không gian làm việc không hợp lệ." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Bạn cần đăng nhập để thực hiện thao tác này." };
  }

  // Kiểm tra quyền
  const { data: member } = await supabase
    .from("workspace_members")
    .select(`
      role:roles (
        name
      )
    `)
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: ws } = await supabase
    .from("workspaces")
    .select("created_by")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!ws) {
    return { success: false, message: "Không tìm thấy không gian làm việc." };
  }

  const typedMember = member as unknown as MemberRoleSelect | null;
  const isOwner = ws.created_by === user.id;
  const isAdmin = typedMember?.role?.name?.toUpperCase() === WorkspaceRole.ADMIN || typedMember?.role?.name?.toUpperCase() === "ADMIN";

  if (!isOwner && !isAdmin) {
    return { success: false, message: "Bạn không có quyền thực hiện thao tác này." };
  }

  // Xóa tasks liên quan
  const { data: _, error: tasksErr } = await supabase
    .from("tasks")
    .delete()
    .eq("workspace_id", workspaceId)
    .select("id");

  if (tasksErr) {
    return { success: false, message: `Lỗi khi xóa các công việc: ${tasksErr.message}` };
  }

  // Xóa columns liên quan
  const { data: __, error: columnsErr } = await supabase
    .from("columns")
    .delete()
    .eq("workspace_id", workspaceId)
    .select("id");

  if (columnsErr) {
    return { success: false, message: `Lỗi khi xóa các cột: ${columnsErr.message}` };
  }

  // Xóa workspace_members liên quan
  const { data: ___, error: membersErr } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .select("id");

  if (membersErr) {
    return { success: false, message: `Lỗi khi xóa thành viên: ${membersErr.message}` };
  }

  // Cảnh báo nếu RLS chặn việc xóa thành viên (nếu có member nhưng không xóa được)
  // Thực tế nếu có CASCADE DELETE thì không cần các bước này.

  // Xóa workspace chính
  const { data: wsData, error: wsErr } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)
    .select("id");

  if (wsErr) {
    return { success: false, message: `Lỗi khi xóa không gian làm việc: ${wsErr.message}` };
  }

  if (!wsData || wsData.length === 0) {
    return { success: false, message: "Xóa thất bại. Vui lòng kiểm tra quyền RLS (Row Level Security) trên bảng workspaces." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true };
}
