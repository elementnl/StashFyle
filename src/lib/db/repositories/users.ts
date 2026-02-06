import { db } from "../client";
import type { User, UserInsert, UserUpdate } from "../types";

export const usersRepo = {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await db
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await db
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async create(user: UserInsert): Promise<User> {
    const { data, error } = await db
      .from("users")
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await db
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
