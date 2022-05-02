import { mainHtml } from "./html/index";
import { mainPrint } from "./print/index";
import { statusSymbolsStr } from "./constants/status_symbols";

require("yargs")
  .command(
    "print [file]",
    `Show TODOs using the following format
    "date  status_symbol  task_name"

    (${statusSymbolsStr})`,
    (yargs: any) => {
      yargs.positional("file", {
        describe: "YAML file",
      });
    },
    mainPrint
  )
  .command(
    "html [file]",
    "(experimental) Render as HTML",
    (yargs: any) => {
      yargs.positional("file", {
        describe: "YAML file",
      });
    },
    mainHtml
  )
  .option("memo", {
    type: "boolean",
    default: false,
    description: "Show memo or not",
  })
  .option("watch", {
    type: "boolean",
    default: false,
    description: `Show using watch mode.
      Re-render if the yaml file is updated.

      key binds:
        a: Show all statuses
        q: Quit
        m: Show memos
        s: Show statistics
        t: Switch --sort
        r: Reload
    `,
  })
  .option("include", {
    type: "array",
    default: ["todo", "doing", "waiting"],
    description: "Which statuses do you want to show?",
  })
  .option("sort", {
    type: "string",
    default: "default",
    description: `Display mode

      "default" : Show tree
      "start"   : Show flattened tasks sorted by start date
      "end"     : Show flattened tasks sorted by end date
    `,
  })
  .option("stats", {
    type: "boolean",
    default: false,
    description: `Show stats of parent tasks`,
  })
  .option("subtree", {
    type: "string",
    default: "/",
    description: "Show subtree",
  })
  .demandCommand(1).argv;
