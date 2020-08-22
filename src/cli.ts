#!/usr/bin/env node

import { mainPrint } from "./print/index";
import { statusSymbols } from "./constants/status_symbols";

const statusSymbolsArray = [];
for (const key in statusSymbols) {
  statusSymbolsArray.push(`${key}:${statusSymbols[key]}`);
}
const statusSymbolsStr = statusSymbolsArray.join(", ");

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
    `,
  })
  .option("include", {
    type: "array",
    default: ["todo", "doing", "waiting"],
    description: "Which statuses do you want to show?",
  })
  .option("mode", {
    type: "string",
    default: "tree",
    description: `Display mode

      "tree" : Show tree
      "date" : Show flattened tasks sorted by date
    `,
  })
  .demandCommand(1).argv;
