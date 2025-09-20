import { addFeedHandler, aggHandler, feedsHandler, followHandler, followingHandler, getExistingUser, loginHandler, registerHandler, resetHandler, unfollowHandler, usersHandler } from "./handlers";
import { getUserByName, User } from "./lib/db/queries/users";

export type CommandHandler = (cmdname: string, ...args: string[]) => Promise<void>;
export type UserCommandHandler = (user: User, cmdname: string, ...args: string[]) => Promise<void>

export type CommandRegistry = Record<string, CommandHandler>
export type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const commands: CommandRegistry = {
    login: loginHandler,
    register: registerHandler,
    reset: resetHandler,
    users: usersHandler,
    agg: aggHandler,
    addfeed: middleware(addFeedHandler),
    feeds: feedsHandler,
    follow: middleware(followHandler),
    following: middleware(followingHandler),
    unfollow: middleware(unfollowHandler)
}

export function RegisterCommand(registry: CommandRegistry, cmdname: string, handler: CommandHandler) {
    registry[cmdname] = handler;
}

export async function RunCommand(registry: CommandRegistry, cmdname: string, ...args: string[]) {
    if (registry[cmdname]) {
        await registry[cmdname](cmdname, ...args)
    }
}

export function middleware(handler: UserCommandHandler) {
    return async (cmdname: string, ...args: string[]) => {
        const currentUser = await getExistingUser();
        if (currentUser === "") {
            throw new Error("No user logged in - please log in");
        }
        const user = await getUserByName(currentUser);
        if (!user) {
            throw new Error(`User ${currentUser} not found!`);
        }
        await handler(user, cmdname, ...args);
    }
}
