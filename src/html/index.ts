import * as fs from "fs";

import dayjs = require("dayjs");
import * as marked from "marked";

const browserSync = require("browser-sync");

marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false,
  breaks: true,
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
    if (!fs.existsSync(dir)){
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
      .filter((t) => t.children.length == 0 && t.status != "todo")
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

function toHtml(title: string, tasks: Task[]) {
  // TODO: use DOM library
  const htmlTags = [];
  htmlTags.push(`
    <head>
      <meta charset="UTF-8">
      <link rel="icon" href="data:;base64,=">
      <title>${title}</title>
    </head>
    <body>
      <script async src="/browser-sync/browser-sync-client.js"></script>
  `);
  htmlTags.push(`
    <style>
        ${fs.readFileSync(__dirname + "/style.css", "utf8")}
    </style>
  `);
  htmlTags.push(`<div class="tasks">`);
  for (const task of tasks) {
    htmlTags.push(`<div class="task">`);
    htmlTags.push(`<div class="task-name">${task.absolutePath}</div>`);
    const start = task.start ? dayjs(task.start).format("YYYY-MM-DD") : "";
    const end = task.end ? dayjs(task.end).format("YYYY-MM-DD") : "";
    htmlTags.push(`<div class="task-dates">
      <span class="task-date">${start}</span> ― <span class="task-date">${end}</span>
      <span class="task-status">${task.status}</span>
    </div>`);
    if (task.memo) {
      htmlTags.push(marked.parse(task.memo));
    }
    htmlTags.push("</div>");
  }
  htmlTags.push("</div>");
  htmlTags.push("</body>");

  return htmlTags.join("\n");
}
