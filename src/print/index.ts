import * as utils from "../utils";
import { statuses as allStatuses } from "../constants/statuses";

import { printSortedByDate } from "./date";
import { printTree } from "./tree";
import * as io from "./io";

export function mainPrint(argv: any) {
  const yamlPath = argv.file;
  if (!io.fileExists(yamlPath)) {
    console.log(`Specified file does not exist: ${yamlPath}`);
    return;
  }

  const targetStatuses: string[] = argv.include.includes("all")
    ? allStatuses
    : argv.include;
  let lastModifiedAt = new Date(0);

  const showMemo = argv.memo;
  const configs = {
    showStats: argv.stats,
  };

  function loop() {
    const modifiedAt = io.getLastModifiedAt(yamlPath);
    if (modifiedAt > lastModifiedAt) {
      lastModifiedAt = modifiedAt;

      try {
        const yml: any = io.loadYaml(yamlPath);
        const tasks = utils.fillParentsInformations(yml.tasks, "", [undefined]);

        if (argv.watch) {
          console.clear();
          console.log(`${" ".repeat(7) + yml.title}\n${"=".repeat(60)}\n`);
        }

        const dateFormat =
          yml && yml.configs ? yml.configs["date-format"] : "MM/DD";
        if (argv.mode == "date") {
          printSortedByDate(tasks, dateFormat, targetStatuses, showMemo);
        } else {
          const aliases = utils.extractAliases(tasks);
          printTree(
            tasks,
            dateFormat,
            targetStatuses,
            aliases,
            showMemo,
            configs
          );
        }
      } catch (e) {
        console.clear();
        console.log(e.message);
      }
    }
  }

  loop();
  if (argv.watch) {
    setInterval(loop, 1000);
  }
}
