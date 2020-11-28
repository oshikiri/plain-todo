export const statusSymbols: { [name: string]: string } = {
  todo: "-",
  doing: "*",
  done: "o",
  cancelled: "x",
  waiting: "?",
};

const statusSymbolsArray = [];
for (const key in statusSymbols) {
  statusSymbolsArray.push(`${key}:${statusSymbols[key]}`);
}

export const statusSymbolsStr = statusSymbolsArray.join(", ");
