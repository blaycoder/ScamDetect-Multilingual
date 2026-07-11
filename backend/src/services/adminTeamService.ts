import { supabase } from "../utils/supabase";

export type AdminRole = "moderator" | "superadmin";

export interface AdminUserRow {
  id: string;
  user_id: string;
  role: AdminRole;
  added_by: string | null;
  created_at: string;
  email: string | null;
  addedByEmail: string | null;
}

async function emailForUserId(userId: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !data.user) return null;
    return data.user.email ?? null;
  } catch {
    return null;
  }
}

export async function resolveUserIdFromEmail(
  email: string,
): Promise<string | null> {
  if (!supabase) return null;
  const normalized = email.trim().toLowerCase();
  // Paginate lightly — sufficient for small auth user bases.
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error || !data.users) return null;
  const match = data.users.find(
    (u) => (u.email ?? "").toLowerCase() === normalized,
  );
  return match?.id ?? null;
}

export async function listAdmins(): Promise<AdminUserRow[]> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, user_id, role, added_by, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to list admins");
  }

  const rows = data ?? [];
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id as string,
      user_id: row.user_id as string,
      role: row.role as AdminRole,
      added_by: (row.added_by as string | null) ?? null,
      created_at: row.created_at as string,
      email: await emailForUserId(row.user_id as string),
      addedByEmail: row.added_by
        ? await emailForUserId(row.added_by as string)
        : null,
    })),
  );
}

export async function addAdmin(input: {
  userId: string;
  role: AdminRole;
  addedBy: string;
}): Promise<AdminUserRow> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      user_id: input.userId,
      role: input.role,
      added_by: input.addedBy,
    })
    .select("id, user_id, role, added_by, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      const conflict = new Error("User is already an admin");
      (conflict as Error & { statusCode: number }).statusCode = 409;
      throw conflict;
    }
    throw new Error("Failed to add admin");
  }

  return {
    id: data.id as string,
    user_id: data.user_id as string,
    role: data.role as AdminRole,
    added_by: (data.added_by as string | null) ?? null,
    created_at: data.created_at as string,
    email: await emailForUserId(data.user_id as string),
    addedByEmail: await emailForUserId(input.addedBy),
  };
}

export async function removeAdmin(
  targetUserId: string,
  actorUserId: string,
): Promise<void> {
  if (targetUserId === actorUserId) {
    const err = new Error("Cannot remove yourself from admin_users");
    (err as Error & { statusCode: number }).statusCode = 400;
    throw err;
  }

  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const { data, error } = await supabase
    .from("admin_users")
    .delete()
    .eq("user_id", targetUserId)
    .select("id");

  if (error) {
    throw new Error("Failed to remove admin");
  }

  if (!data || data.length === 0) {
    const err = new Error("Admin not found");
    (err as Error & { statusCode: number }).statusCode = 404;
    throw err;
  }
}

export { emailForUserId };
