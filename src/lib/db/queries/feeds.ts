import { eq } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";

export type Feed = typeof feeds.$inferSelect;

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({name, url, userId}).returning();
    return result;
}

export async function getFeedByUrl(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function getFeedByID(feedId: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.id, feedId));
    return result;
}

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result
}