const tasks = document.querySelectorAll("div.task");
document.addEventListener("keydown", (event) => {
  const current = Array.from(tasks).find((task) => {
    const rect = task.getBoundingClientRect();
    return rect.top > 0;
  });

  let next;
  if (event.key == "j") {
    next = current.nextElementSibling;
  } else if (event.key == "k") {
    next = current.previousElementSibling;
  } else {
    return;
  }

  next.scrollIntoView({
    behavior: "smooth",
  });
});

const scrollToBottom = document.getElementById("scroll_to_bottom");
scrollToBottom.addEventListener("click", (event) => {
  const tailTask = tasks[tasks.length - 1];
  tailTask.scrollIntoView({
    behavior: "smooth",
  });
});
