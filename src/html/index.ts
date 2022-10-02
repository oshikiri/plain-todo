import * as fs from "fs";

import dayjs = require("dayjs");
import { marked } from "marked";
import { JSDOM } from "jsdom";

const browserSync = require("browser-sync");

marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false,
  sanitize: false,
  smartypants: false,
  xhtml: false,
});

import * as io from "../io";
import { Arguments, Task } from "../types";
import * as utils from "../utils";
import path = require("path");

export function mainHtml(argv: Arguments) {
  if (argv.watch) {
    if (argv.out) {
      console.log(`Overwrite argv.out because of watch mode`);
    }
    const dir = "/tmp/plain-todo";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    argv.out = `${dir}/index.html`;
  }

  let prevHtml = "";
  function loop() {
    const yamlPath = argv.file;
    if (!io.fileExists(yamlPath)) {
      console.log(`Specified file does not exist: ${yamlPath}`);
      return;
    }
    const yml = io.loadYaml(yamlPath);

    const maxLengthTaskName = 100;
    let tasks = utils.extractSubtree(yml.tasks, argv.subtree);
    tasks = utils.fillParentsInformations(
      tasks,
      "",
      [undefined],
      [undefined],
      maxLengthTaskName,
      yamlPath
    );

    tasks = utils
      .flattenTasks(tasks)
      .filter((t) => t.status != "todo")
      .sort((t1, t2) => dayjs(t1.end).diff(dayjs(t2.end)));

    const nextHtml = toHtml(yml.title, tasks);
    if (prevHtml != nextHtml) {
      fs.writeFileSync(argv.out, nextHtml);
      browserSync.reload(argv.out);
      prevHtml = nextHtml;
    }
  }
  loop();
  if (argv.watch) {
    browserSync.init({
      server: path.dirname(argv.out),
      snippetOptions: {},
      open: false,
    });
    setInterval(loop, 1000);
  }
}

function toHtml(title: string, tasks: Task[]): string {
  const doc = new JSDOM("<!DOCTYPE html>");
  const document = doc.window.document;

  document.head.appendChild(
    JSDOM.fragment(`
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0">
    <link rel="icon" href="data:;base64,=">
    <title>${title}</title>
  `)
  );

  const body = doc.window.document.body;
  body.appendChild(
    JSDOM.fragment(`
    <div id="scroll_to_bottom"></div>
    <script async src="/browser-sync/browser-sync-client.js"></script>
    <style>
        ${fs.readFileSync(__dirname + "/style.css", "utf8")}
    </style>
    <div class="tasks"></div>
    <script>
      ${fs.readFileSync(__dirname + "/utils.js", "utf8")}
    </script>
  `)
  );

  const tasksElement = body.querySelector("div.tasks");
  for (const task of tasks) {
    const taskRoot = JSDOM.fragment('<div class="task"></div>');
    const taskFragment = taskRoot.firstChild;

    const start = task.start ? dayjs(task.start).format("YYYY-MM-DD") : "";
    const end = task.end ? dayjs(task.end).format("YYYY-MM-DD") : "";
    taskFragment.appendChild(
      JSDOM.fragment(`
      <div class="task-name">${task.absolutePath}</div>
      <div class="task-dates">
        <span class="task-date">${start}</span> ― <span class="task-date">${end}</span>
        <span class="task-status">${task.status}</span>
      </div>
    `)
    );
    if (task.memo) {
      taskFragment.appendChild(JSDOM.fragment(marked.parse(task.memo)));
    }

    tasksElement.appendChild(taskFragment);
  }

  return doc.serialize();
}
