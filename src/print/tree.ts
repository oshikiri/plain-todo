import { Configs, Task } from "./../types";
import * as utils from "./../utils";
import { statusSymbols } from "./../constants/status_symbols";
import { sizes } from "./format";

function buildLineModeTree(
  task: Task,
  dateFormat: string,
  configs: Configs,
  maxLengthTaskName: number
): string {
  const date: string = task.end
    ? utils.stringifyDate(task.end, dateFormat)
    : "";

  const status: string = task.hasActiveChildren()
    ? ""
    : statusSymbols[task.status];

  let taskName = task.name;
  if (taskName.length > maxLengthTaskName) {
    taskName = taskName.slice(0, maxLengthTaskName - 2) + "…";
  }

  let line =
    date.padEnd(dateFormat.length + sizes.afterDate, " ") +
    status.padEnd(sizes.widthStatus + sizes.afterStatus, " ") +
    " ".repeat(sizes.depthSize * (task.depth - 1)) +
    taskName;

  if (
    configs["watch"] &&
    (task.status == "done" || task.status == "cancelled")
  ) {
    line = `{grey-fg}${line}{/}`;
  }

  if (configs.showStats && task.children && task.children.length > 0) {
    const countTasks = (taskStatus: string): number => {
      return task.children.filter((task) => task.status === taskStatus).length;
    };
    const counts: { [name: string]: number } = {};
    Object.keys(statusSymbols).forEach((task) => {
      counts[task] = countTasks(task);
    });
    const statuses = ["todo", "doing", "waiting", "done", "cancelled"];
    line += ` (${statuses
      .map((status) => `${statusSymbols[status]}${counts[status]}`)
      .join("/")})`;
  }

  return line;
}

export function createTreeStr(
  tasks: Task[],
  dateFormat: string,
  targetStatuses: string[],
  aliases: { [name: string]: Task },
  showMemo: boolean,
  maxLengthTaskName: number,
  configs: Configs
): string {
  let content = "";
  for (const task of tasks) {
    if (!targetStatuses.includes(task.status)) {
      continue;
    }

    content +=
      buildLineModeTree(task, dateFormat, configs, maxLengthTaskName) + "\n";

    if (showMemo && task.memo) {
      const indent = " ".repeat(
        dateFormat.length +
          sizes.afterDate +
          sizes.widthStatus +
          sizes.afterStatus +
          sizes.depthSize * (task.depth - 1) +
          sizes.beforeMemo
      );
      content += task.memo.replace(/\n$/, "").replace(/^/gm, indent) + "\n";
    }

    if (task.hasChildren()) {
      content += createTreeStr(
        task.children,
        dateFormat,
        targetStatuses,
        aliases,
        showMemo,
        maxLengthTaskName,
        configs
      );
    }
    if (task.requires) {
      const requires = task.requires.map((alias: string) => aliases[alias]);
      for (const require of requires) {
        const requireTask = new Task(require);
        requireTask.name = "@" + (require.absolutePath || requireTask.name);
        requireTask.depth = task.depth + 1;

        if (targetStatuses.includes(requireTask.status)) {
          content +=
            buildLineModeTree(
              requireTask,
              dateFormat,
              configs,
              maxLengthTaskName
            ) + "\n";
        }
      }
    }
  }
  return content;
}
