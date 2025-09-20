import { CommandRegistry, commands, RegisterCommand, RunCommand } from "./commands";
import { fetchFeed } from "./fetcher";
import { loginHandler, registerHandler, resetHandler } from "./handlers";
import { getNextFeedToFetch, markFeedFetched } from "./lib/db/queries/feeds";


async function main() {
  
  const commandsRegistry: CommandRegistry = {}
  registerCommands(commandsRegistry);

  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.log("No command entered")
    process.exit(1)
  } else {
    const command = args[0]
    let cmdArgs = args.slice(1) ?? [];
    if (command === 'addfeed' && cmdArgs.length > 2) {
      const url = cmdArgs[cmdArgs.length - 1];
      const name = cmdArgs.slice(0, -1).join(' ');
      cmdArgs = [name, url];
    }
    try {
      await RunCommand(commandsRegistry, command, ...cmdArgs)
    } catch (e) {
      console.log(e)
      process.exit(1)
    }
  }

  process.exit(0);
}

function registerCommands(commandsRegistry: CommandRegistry) {
  for (const name in commands) {
    RegisterCommand(commandsRegistry, name, commands[name])
  }
}



main();