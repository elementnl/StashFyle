"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/supabase";
import { usersRepo } from "@/lib/db/repositories/users";
import { filesRepo } from "@/lib/db/repositories/files";
import { deleteFromR2 } from "@/lib/r2/client";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateName(name: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const trimmedName = name.trim();

    await usersRepo.update(user.id, {
      name: trimmedName || null,
    });

    revalidatePath("/settings");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update name",
    };
  }
}

export async function deleteAllFiles(): Promise<ActionResult> {
  try {
    const user = await requireUser();

    const { files } = await filesRepo.findByUser(user.id, { limit: 1000 });

    for (const file of files) {
      await deleteFromR2(file.storage_key);
      await filesRepo.softDelete(file.id);
    }

    revalidatePath("/settings");
    revalidatePath("/files");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete files",
    };
  }
}
