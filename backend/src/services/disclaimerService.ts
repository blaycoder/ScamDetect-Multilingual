import { supabase } from "../utils/supabase";

export interface InsertAcknowledgmentInput {
  userId?: string;
  anonId?: string;
  ipAddress: string;
  userAgent: string;
  language: string;
  disclaimerVersion: string;
}

export async function insertAcknowledgment(
  input: InsertAcknowledgmentInput,
): Promise<string> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const { data, error } = await supabase
    .from("disclaimer_acknowledgments")
    .insert({
      user_id: input.userId ?? null,
      anon_id: input.anonId ?? null,
      ip_address: input.ipAddress,
      user_agent: input.userAgent,
      language: input.language,
      disclaimer_version: input.disclaimerVersion,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to record disclaimer acknowledgment");
  }

  return data.id as string;
}

export async function mergeAnonToUser(
  anonId: string,
  userId: string,
): Promise<number> {
  if (!supabase) {
    throw new Error("Database unavailable");
  }

  const { data, error } = await supabase
    .from("disclaimer_acknowledgments")
    .update({ user_id: userId })
    .eq("anon_id", anonId)
    .is("user_id", null)
    .select("id");

  if (error) {
    throw new Error("Failed to merge disclaimer acknowledgment");
  }

  return data?.length ?? 0;
}
