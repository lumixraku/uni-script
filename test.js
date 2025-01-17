window.initData = function () {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  let range = sheet.getRange("A2");
  range.setValue("Apple");
  range = sheet.getRange("A3");
  range.setValue("Google");
  range = sheet.getRange("A4");
  range.setValue("Microsoft");
  range = sheet.getRange("A5");
  range.setValue("Meta");

  range = sheet.getRange("B1");
  range.setValue("Who is CEO");

  range = sheet.getRange("C1");
  range.setValue("Foundation year");

  range = sheet.getRange("D1");
  range.setValue("Income of 2024");

  range = sheet.getRange("E1");
  range.setValue("Profit of 2024");
};
initData();

const aiFn = (cell) => {
  console.log('GPT', cell.row, cell.column)
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  // const range = sheet.getRange(cell.row, cell.column);
  const firstColCell = sheet.getRange(cell.row, 0);
  const firstColCellText = firstColCell.getValue();
  const firstRowCell = sheet.getRange(0, cell.column);
  const firstRowText = firstRowCell.getValue();
  const question = `${firstRowText}, ${firstColCellText}`;
  // const result = await univerAPI.runOnServer("agent", "gpt", question);
  const result = 'question' + question;
  console.log(result);
  return {row: cell.row, col: cell.column, result} ;
};

const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
const range = univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange();
let { startRow, startColumn, endRow, endColumn } = range._range;
for (let row = startRow; row <= endRow; row++) {
  for (let column = startColumn; column <= endColumn; column++) {
    console.log(row, column); // 打印当前元素
    aiFn({ row, column });
    // const aiFn = aiAgentFn[aiAgentMapColumn[column]];
    // if (aiFn) {

    // }
  }
}
