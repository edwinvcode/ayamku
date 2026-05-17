"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getMyRole(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("role").eq("id", user.id).single();
  return data?.role ?? null;
}

export async function getAllUsers() {
  const role = await getMyRole();
  if (role !== "superadmin") return { data: null, error: "Unauthorized" };
  const admin = createAdminClient();
  const { data, error } = await admin.from("profiles").select("*").order("created_at", { ascending: true });
  return { data, error: error?.message ?? null };
}

export async function createUser(formData: FormData) {
  const role = await getMyRole();
  if (role !== "superadmin") return { success: false, error: "Unauthorized" };

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const newRole = (formData.get("role") as string) || "admin";

  if (!email || !password) return { success: false, error: "Email dan password wajib diisi" };
  if (password.length < 6) return { success: false, error: "Password minimal 6 karakter" };

  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) return { success: false, error: authError.message };

  await admin.from("profiles").update({ name: name || null, role: newRole }).eq("id", authData.user.id);

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserRole(userId: string, newRole: "superadmin" | "admin") {
  const role = await getMyRole();
  if (role !== "superadmin") return { success: false, error: "Unauthorized" };
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role: newRole }).eq("id", userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const role = await getMyRole();
  if (role !== "superadmin") return { success: false, error: "Unauthorized" };

  // Prevent deleting yourself
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === userId) return { success: false, error: "Tidak bisa hapus akun sendiri" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}
