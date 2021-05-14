import { fillParentsInformations } from "./utils";
import { Task } from "./types";

const content = {
  name: "1",
  end: "2020-12-01",
  children: [
    {
      name: "1-1",
      end: "2020-12-02",
      children: [
        {
          name: "1-1-1",
        },
      ],
    },
  ],
};
const tasksFixture = [new Task(content as Task)];
const tasksFilled = fillParentsInformations(tasksFixture, "", [], [], 20, "");

test("when task.end exists and parent task.end exists, it should use the original task.end", () => {
  const actual = tasksFilled[0].children[0].end;
  expect(actual).toBe("2020-12-02");
});

test("when task.end does not exist and parent task.end exists, it should fill task.end using parent's task.end", () => {
  const actual = tasksFilled[0].children[0].children[0].end;
  expect(actual).toBe("2020-12-02");
});
