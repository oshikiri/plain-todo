const blessed = require("neo-blessed");

import * as utils from "../utils";
import { statuses as allStatuses } from "../constants/statuses";

import { createSortedByDateStr, CompareTask } from "./date";
import { createTreeStr } from "./tree";
import * as io from "./io";
import { Arguments, Configs } from "../types";

const sortTypes = ["default", "start", "end"];

export function mainPrint(argv: Arguments) {
  const yamlPath = argv.file;
  if (!io.fileExists(yamlPath)) {
    console.log(`Specified file does not exist: ${yamlPath}`);
    return;
  }

  const targetStatuses: string[] = argv.include.includes("all")
    ? allStatuses
    : argv.include;
  let lastModifiedAt = new Date(0);

  let showMemo = argv.memo;
  const configs: Configs = {
    showStats: argv.stats,
    watch: argv.watch,
    sortType: argv.sort,
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
      tags: true,
    });

    screen.key("q", function () {
      clearInterval(intervalId);
      return screen.destroy();
    });
    screen.key("m", function () {
      showMemo = !showMemo;
      lastModifiedAt = new Date(0);
    });
    screen.key("s", function () {
      configs.showStats = !configs.showStats;
      lastModifiedAt = new Date(0);
    });
    screen.key("r", function () {
      const i = sortTypes.indexOf(configs.sortType);
      configs.sortType = sortTypes[(i + 1) % sortTypes.length];
      lastModifiedAt = new Date(0);
    });
  }

  function loop() {
    const modifiedAt = io.getLastModifiedAt(yamlPath);
    if (modifiedAt > lastModifiedAt) {
      lastModifiedAt = modifiedAt;
      let screenContent = "";

      try {
        const yml = io.loadYaml(yamlPath);
        const maxLengthTaskName = yml.configs?.["max-length-task-name"] || 20;
        let tasks = utils.extractSubtree(yml.tasks, argv.subtree);
        tasks = utils.fillParentsInformations(
          tasks,
          "",
          [undefined],
          maxLengthTaskName,
          yamlPath
        );

        if (argv.watch) {
          screenContent += `${" ".repeat(7) + yml.title}\n${"=".repeat(60)}\n`;
        }

        const dateFormat = yml?.configs?.["date-format"] || "MMDD";
        if (configs.sortType != "default") {
          let compare: CompareTask;
          if (configs.sortType == "end") {
            compare = utils.compareDateEndStr;
          } else if (configs.sortType == "start") {
            compare = utils.compareDateStartStr;
          } else {
            throw new Error(`Unknown --sort option: ${configs.sortType}`);
          }
          screenContent += createSortedByDateStr(
            tasks,
            dateFormat,
            targetStatuses,
            showMemo,
            compare
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
