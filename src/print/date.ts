import { Task } from "./../types";
import * as utils from "./../utils";
import { statusSymbols } from "./../constants/status_symbols";
import { sizes } from "./format";

function buildLineModeDate(task: Task, dateFormat: string): string {
  const dateStart: string = task.start
    ? utils.stringifyDate(task.start, dateFormat)
    : "";
  const dateEnd: string = task.end
    ? utils.stringifyDate(task.end, dateFormat)
    : "";

  const status = task.isDefaultStatus ? "" : statusSymbols[task.status];

  const line =
    dateStart.padEnd(dateFormat.length + 1, " ") +
    dateEnd.padEnd(dateFormat.length + sizes.afterDate, " ") +
    status.padEnd(sizes.widthStatus + sizes.afterStatus, " ") +
    task.absolutePath;

  return line;
}

export function printSortedByDate(
  tasks: Task[],
  dateFormat: string,
  targetStatuses: string[],
  showMemo: boolean
) {
  const flattened = utils.flattenTasks(tasks);
  flattened.sort(utils.compareDateStr);

  for (const task of flattened) {
    const isExcludedStatus = !targetStatuses.includes(task.status);
    if (isExcludedStatus || task.hasActiveChildren()) {
      continue;
    }
    const lineStr = buildLineModeDate(task, dateFormat);
    console.log(lineStr);

    if (showMemo && task.memo) {
      const indent = " ".repeat(sizes.beforeMemo);
      utils.printGrey(task.memo.replace(/\n$/, "").replace(/^/gm, indent));
    }
  }
}
