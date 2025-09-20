import { eq } from "drizzle-orm";
import { db } from "..";
import { users } from "../schema";

export type User = typeof users.$inferSelect;

export async function createUser(name: string): Promise<User> {
    const [result] = await db.insert(users).values({name}).returning();
    return result;
}

export async function getUserByName(name: string): Promise<User | null> {
    const [result] = await db.select().from(users).where(eq(users.name, name))
    return result;
}

export async function getUserByID(id: string) {
    const [result] = await db.select().from(users).where(eq(users.id, id))
    return result
}

export async function getUsers(): Promise<User[]> {
    const result = await db.select().from(users)
    return result;
}

export async function clearAllUsers(): Promise<void> {
    await db.delete(users);
}

export async function deleteUserByName(name: string) {
    await db.delete(users).where(eq(users.name, name));
}