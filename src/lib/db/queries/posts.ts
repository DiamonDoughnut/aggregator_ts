import { desc, eq, sql } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, posts } from "../schema";

export type Post = typeof posts.$inferSelect;

export async function createPost(url: string, feedId: string, title: string, description?: string, publishedAt?: Date | null) {
    const [result] = await db.insert(posts).values({url, feedId, title, description, publishedAt}).returning();
    return result;
}

export async function getPostsForUser(user: string, limit: number) {
    const results = await db.select({posts}).from(posts).innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId)).where(eq(feedFollows.userId, user)).orderBy(sql`published_at DESC NULLS LAST`).limit(limit);
    return results.map(result => result.posts);
}

export async function getPosts() {
    const results = await db.select().from(posts).limit(10);
    return results
}