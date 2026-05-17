"use server";

import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSession, deleteSession } from "@/lib/session";

export async function login(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username dan password wajib diisi" };
  }

  const admin = createAdminClient();
  const { data: user, error } = await admin
    .from("app_users")
    .select("*")
    .eq("username", username)
    .single();

  console.log("[login] username:", username, "found:", !!user, "db_error:", error?.message, "code:", error?.code);

  if (error || !user) {
    return { error: "Username atau password salah" };
  }

  const valid = await compare(password, user.password_hash);
  if (!valid) {
    return { error: "Username atau password salah" };
  }

  await createSession({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
