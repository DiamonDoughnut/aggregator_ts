import { readConfig, writeConfig } from "./config";
import { fetchFeed } from "./fetcher";
import { createFeedFollow, deleteFeedFollowByURLUserId, getFeedFollowsByUser } from "./lib/db/queries/feedFollows";
import { createFeed, Feed, getFeedByID, getFeedByUrl, getFeeds, getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";
import { clearAllUsers, createUser, getUserByID, getUserByName, getUsers, User } from "./lib/db/queries/users";

export async function unfollowHandler(user: User, _cmdname: string, url: string, ..._args: string[]) {
    await deleteFeedFollowByURLUserId(user.id, url);
    console.log(`${user.name} unfollowed the feed at ${url}`);
}

export async function followingHandler(user: User, _cmdname: string, ..._args: string[]) {
    const follows = await getFeedFollowsByUser(user.id);
    if (follows.length === 0) {
        console.log("Not following anything!")
        return;
    }
    for (const follow of follows) {
        const feed = await getFeedByID(follow.feedId)
        if (!feed) {
            console.log("FEED NOT FOUND");
        }
        console.log(` - ${feed.name}`);
    }
}

export async function followHandler(user: User, _cmdname: string, url: string, ..._args: string[]) {
    if (!url) {
        throw new Error("must include url of feed to follow");
    }
    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error("Feed or User not found - please try again")
    }
    const newFollow = await createFeedFollow(user.id, feed.id)
    if (!newFollow) {
        throw new Error("Error creating new feed follow")
    }
    console.log(newFollow.feedFollow.createdAt);
    console.log(`New follow created for ${user.name}`);
    console.log(`Now following ${feed.name}`)
    
}

export async function feedsHandler(_cmdname: string, ..._args: string[]) {
    const feeds = await getFeeds();
    for (const feed of feeds) {
        const user = await getUserByID(feed.userId);
        console.log(feed.name);
        console.log(feed.url);
        console.log(user.name);
    }
}

export async function addFeedHandler(user: User, _cmdname: string, name: string, url: string, ..._args: string[]) {
    if (!name) {
        throw new Error("Must give feed name and URL")
    }
    if (!url) {
        throw new Error("Must give feed name and URL")
    }
    const newFeed = await createFeed(name, url, user!.id)
    await createFeedFollow(user.id, newFeed.id)
    printFeed(newFeed, user);
}

export async function aggHandler(_cmdname: string, time_between_reqs: string, ..._args: string[]) {
    const timeout = parseDuration(time_between_reqs);
    await scrapeFeeds()
    const interval = setInterval(() => {
        scrapeFeeds();
    }, timeout);

    await new Promise<void>((resolve) => {
        process.on('SIGINT', () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        })
    })
}

function parseDuration(duration: string) {
    const regex = /^(\d+)(ms|s|m|h)$/;
    const match = duration.match(regex);
    if (!match) {
        throw new Error("Duration must be in the format <number><ms | s | m | h>");
    }
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case "ms": 
            console.log(`Collecting feeds every ${value}ms`)
            return value;
        case "s": 
            console.log(`Collecting feeds every ${value}s`)
            return value * 1000;
        case "m": 
            console.log(`Collecting feeds every ${value}m0s`)
            return value * 60 * 1000;
        case "h": 
            console.log(`Collecting feeds every ${value}h0m0s`)
            return value * 60 * 60 * 1000;
        default: throw new Error("Invalid unit");
    }
}

async function scrapeFeeds() {
  const nextFeed = await getNextFeedToFetch();
  await markFeedFetched(nextFeed.id);
  const rssFeed = await fetchFeed(nextFeed.url);
  console.log(`Scraping feed ${rssFeed.channel.title}`);
  const feedItems = rssFeed.channel.item;
  for (const item of feedItems) {
    console.log(` - ${item.title}`);
  }
}

export async function resetHandler(_cmdname: string, ..._args: string[]) {
    try {
        await clearAllUsers();
        console.log("All users deleted!")
    } catch (error) {
        throw new Error("Error deleting users table");
    }
}

export async function usersHandler(_cmdname: string, ..._args: string[]) {
    try {
        const currentUser = await getExistingUser();
        const users = await getUsers();
        for (const user of users) {
            if (user.name === currentUser) {
                console.log(` * ${user.name} (current)`)
            } else {
                console.log(` * ${user.name}`)
            }
        }

    } catch (error) {
        throw error;
    }
}

export async function loginHandler(_cmdname: string, ...args: string[]) {
    if (args.length === 0 ) {
        throw new Error("Please provide a username")
    }
    const name = args[0];
    if (await checkExistingUser(name)) {
        const newCfg = await setConfigUser(name);
        console.log(`Logged in as user: ${newCfg.currentUserName}`)
    } else {
        throw new Error(`User ${name} does not exist`)
    }
}

export async function registerHandler(cmdname: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("Please provide a username")
    }
    const name = args[0];
    if (await checkExistingUser(name)) {
        throw new Error("User already exists - Please login or choose a different username.")
    }
    const newUser = await createUser(name);
    const newCfg = await setConfigUser(name)
    console.log(`User ${newCfg.currentUserName} created at ${newUser.createdAt.toLocaleTimeString()} with id ${newUser.id}`)
}

async function setConfigUser(name: string) {
    const cfg = readConfig()
    if (!cfg) {
        throw new Error("Cannot read config file")
    }
    cfg.currentUserName = name
    writeConfig(cfg);
    const newCfg = readConfig();
    if (!newCfg) {
        throw new Error("Failure in config read-write: check file perms")
    }
    return newCfg;
}

export async function getExistingUser() {
    const cfg = readConfig()
    if (!cfg) {
        throw new Error("Failed to read config")
    }
    return cfg.currentUserName
}

async function checkExistingUser(name: string): Promise<boolean> {
    const existingUser = await getUserByName(name);
    if (existingUser) {
        return true
    }
    return false
}

async function printFeed(feed: Feed, user: User) {
    console.log(feed.name);
    console.log(feed.createdAt);
    console.log(feed.url);
    console.log(user.name);
}