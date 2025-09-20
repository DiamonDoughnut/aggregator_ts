import { and, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, feeds, users } from "../schema";
import { User } from "./users";
import { Feed } from "./feeds";

export type FeedFollows = typeof feedFollows.$inferSelect;
export type FullFollows = {
    feedFollow: FeedFollows;
    user: User;
    feed: Feed;
}

export async function createFeedFollow(userId: string, feedId: string) {
    const [result] = await db.insert(feedFollows).values({userId, feedId}).returning();
    const [joined]: FullFollows[] = await db.select({feedFollow: feedFollows, user: users, feed: feeds}).from(feedFollows).innerJoin(users, eq(users.id, result.userId)).innerJoin(feeds, eq(feeds.id, result.feedId)).where(eq(feedFollows.id, result.id));
    return joined;
}

export async function getFeedFollowsByUser(userId: string) {
    const results = await db.select().from(feedFollows).where(eq(feedFollows.userId, userId));
    return results;
}

export async function getFeedFollowsByFeed(feedId: string) {
    const results = await db.select().from(feedFollows).where(eq(feedFollows.feedId, feedId));
    return results;
}

export async function getFeedByURLUserID(userID: string, url: string) {
    const [result] = await db.select({feedFollow: feedFollows}).from(feedFollows).innerJoin(users, eq(users.id, feedFollows.userId)).innerJoin(feeds, eq(feeds.id, feedFollows.feedId)).where(and(eq(feedFollows.userId, userID), eq(feeds.url, url)))
    return result
}

export async function deleteFeedFollowByURLUserId(userId: string, url: string) {
    const feed = await getFeedByURLUserID(userId, url);
    if (!feed) {
        throw new Error("You do not follow the feed at " + url)
    }
    await db.delete(feedFollows).where(eq(feedFollows.id, feed.feedFollow.id));
}