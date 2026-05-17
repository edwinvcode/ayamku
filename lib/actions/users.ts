"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

export async function getMyRole(): Promise<string | null> {
  const session = await getSession();
  return session?.role ?? null;
}

export async function getAllUsers() {
  const role = await getMyRole();
  if (role !== "superadmin") return { data: null, error: "Unauthorized" };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("app_users")
    .select("id, username, name, role, created_at")
    .order("created_at", { ascending: true });
  return { data, error: error?.message ?? null };
}

export async function createUser(formData: FormData) {
  const role = await getMyRole();
  if (role !== "superadmin") return { success: false, error: "Unauthorized" };

  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim() || null;
  const newRole = (formData.get("role") as string) || "admin";

  if (!username || !password) return { success: false, error: "Username dan password wajib diisi" };
  if (password.length < 6) return { success: false, error: "Password minimal 6 karakter" };

  const password_hash = await hash(password, 10);
  const admin = createAdminClient();
  const { error } = await admin.from("app_users").insert({ username, password_hash, name, role: newRole });
  if (error) {
    if (error.code === "23505") return { success: false, error: "Username sudah dipakai" };
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserRole(userId: string, newRole: "superadmin" | "admin") {
  const role = await getMyRole();
  if (role !== "superadmin") return { success: false, error: "Unauthorized" };
  const admin = createAdminClient();
  const { error } = await admin.from("app_users").update({ role: newRole }).eq("id", userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const role = await getMyRole();
  if (role !== "superadmin") return { success: false, error: "Unauthorized" };

  const session = await getSession();
  if (session?.id === userId) return { success: false, error: "Tidak bisa hapus akun sendiri" };

  const admin = createAdminClient();
  const { error } = await admin.from("app_users").delete().eq("id", userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updatePassword(userId: string, newPassword: string) {
  const role = await getMyRole();
  if (role !== "superadmin") return { success: false, error: "Unauthorized" };
  if (newPassword.length < 6) return { success: false, error: "Password minimal 6 karakter" };

  const password_hash = await hash(newPassword, 10);
  const admin = createAdminClient();
  const { error } = await admin.from("app_users").update({ password_hash }).eq("id", userId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}
