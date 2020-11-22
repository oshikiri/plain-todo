const blessed = require("neo-blessed");

import * as utils from "../utils";
import { statuses as allStatuses } from "../constants/statuses";

import { createSortedByDateStr } from "./date";
import { createTreeStr } from "./tree";
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

  let intervalId: number;
  let screen: any;
  let tab: any;

  if (argv.watch) {
    screen = blessed.screen({
      smartCSR: false,
      warnings: false,
      fullUnicode: true,
    });

    tab = blessed.box({
      parent: screen,
      scrollable: true,
      keys: true,
      vi: true,
      alwaysScroll: true,
    });

    screen.key("q", function () {
      clearInterval(intervalId);
      return screen.destroy();
    });
  }

  function loop() {
    const modifiedAt = io.getLastModifiedAt(yamlPath);
    if (modifiedAt > lastModifiedAt) {
      lastModifiedAt = modifiedAt;
      let screenContent = "";

      try {
        const yml: any = io.loadYaml(yamlPath);
        const maxLengthTaskName = yml.configs?.["max-length-task-name"] || 20;
        let tasks = utils.extractSubtree(yml.tasks, argv.subtree);
        tasks = utils.fillParentsInformations(
          tasks,
          "",
          [undefined],
          maxLengthTaskName
        );

        if (argv.watch) {
          screenContent += `${" ".repeat(7) + yml.title}\n${"=".repeat(60)}\n`;
        }

        const dateFormat = yml?.configs?.["date-format"] || "MMDD";
        if (argv.mode == "date") {
          screenContent += createSortedByDateStr(
            tasks,
            dateFormat,
            targetStatuses,
            showMemo
          );
        } else {
          const aliases = utils.extractAliases(tasks);
          screenContent += createTreeStr(
            tasks,
            dateFormat,
            targetStatuses,
            aliases,
            showMemo,
            configs
          );
        }
      } catch (e) {
        screenContent += e.message + "\n";
      } finally {
        if (argv.watch) {
          tab.setContent(screenContent);
          screen.render();
        } else {
          process.stdout.write(screenContent);
        }
      }
    }
  }

  loop();
  if (argv.watch) {
    intervalId = <any>setInterval(loop, 1000);
  }
}
