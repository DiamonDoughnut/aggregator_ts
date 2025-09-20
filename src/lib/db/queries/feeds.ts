import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";
import { time } from "console";

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

export async function markFeedFetched(feedId: string) {
    await db.update(feeds).set({lastFetchedAt: new Date()}).where(eq(feeds.id, feedId))
}

export async function getNextFeedToFetch() {
    const [result] = await db.select().from(feeds).orderBy(sql`last_fetched_at ASC NULLS FIRST`).limit(1);
    return result;
}