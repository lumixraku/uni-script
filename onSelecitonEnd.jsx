/**
 * aiAgentMapColumn optionGPT, optionSearch, optionRead
 */
const aiAgentMapColumn = (window.aiAgentMapColumn = new Map());
/**
 * search agent result should saved. show this info when user click the cell.
 * row{ col: {}}
 */

window.searchAgentResult = {};

const univerLayoutTime = 500;
const COLUMN_HEADER_HEIGHT = 56;

window.initDomLayout = function () {
  const domLoading = document.createElement("div");
  domLoading.id = "dom-loading";
  domLoading.style.position = "fixed";
  domLoading.style.top = "0";
  domLoading.style.left = "0";
  domLoading.style.width = "100%";
  domLoading.style.height = "100%";
  domLoading.style.background = "#fff";
  domLoading.style.zIndex = "9999";
  document.body.appendChild(domLoading);

  function initBanner() {
    function CustomHeader() {
      return (
        <div
          className="custom-header"
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            paddingLeft: 20,
          }}
        >
          <img
            alt="logo"
            loading="lazy"
            width="106"
            height="32"
            decoding="async"
            className="mr-[44px]"
            style={{color:'transparent'}}
            src="https://univer.ai/_next/static/media/logo.cac2ea9f.svg"
          ></img>
          <div
            className="custom-header-title"
            style={{
              fontSize: 20,
              position: "relative",
              color: "#fff",
              marginLeft: 20
            }}
          >
            AI Complete Sheet
          </div>
        </div>
      );
    }

    univerAPI.registerUIPart("custom-header", CustomHeader);
  }

  initBanner();

  function animationBg(gradientBg) {
    let position = 0;
    const speed = 0.5;
    const interval = 30;
    let direction = 1;

    function animateGradient() {
        position += speed * direction;

        if (position > 100) {
            direction = -1;
            position = 100;
        } else if (position < 0) {
            direction = 1;
            position = 0;
        }

        gradientBg.style.backgroundPosition = `0% ${position}%`;
    }

    setInterval(animateGradient, interval);
  }

  setTimeout(() => {
    document.querySelectorAll("header")[0].style.display = "none";
    document.querySelectorAll("header")[1].style.display = "none";
    document.querySelectorAll(".univer-formula-box")[0].style.display = "none";
    document.querySelectorAll("footer")[0].style.display = "none";

    const bg = document.querySelectorAll(
      ".h-dvh > .flex.size-full.flex-col"
    )[0];
    bg.style.background = `linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 5.89%, rgba(0, 0, 80, 0.6) 18.48%, rgba(0, 0, 100, 0.8) 30.52%, rgba(0, 0, 80, 0.8) 40.83%, rgba(0, 0, 100, 0.8) 46.32%, rgba(0, 0, 80, 0.6) 50.5%, rgba(0, 0, 100, 0.8) 63.06%, rgba(0, 0, 80, 0.8) 73.75%, rgba(0, 0, 0, 0.6) 82.38%, rgba(0, 0, 0, 1) 100%)`;
    bg.style.backgroundSize = '200% 200%';
    // bg.style.backgroundPosition = '0% 50%';
    animationBg(bg);

    const univerContainer = document.querySelector("section#univer-container");
    univerContainer.style.margin = "10px";
    univerContainer.style.border = "1px solid #fff";
    univerContainer.style.borderRadius = "20px";
    univerContainer.style.overflow = "hidden";
    univerContainer.style.background = "#F8FAFD";

    const corner = document.createElement("div");
    corner.id = "sheet-corner";
    corner.style.position = "absolute";
    corner.style.top = "0";
    corner.style.left = "0";
    corner.style.width = "46px";
    corner.style.height = `${COLUMN_HEADER_HEIGHT}px`;
    corner.style.background = "#f9f9f9";
    corner.style.zIndex = "9999";
    univerContainer.appendChild(corner);
  }, 200);
};

window.initData = function () {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  let range = sheet.getRange("A2");
  range.setValue("Description");

  range = sheet.getRange("A3");
  range.setValue("Apple");
  range = sheet.getRange("A4");
  range.setValue("Google");
  range = sheet.getRange("A5");
  range.setValue("Microsoft");
  range = sheet.getRange("A6");
  range.setValue("Meta");

  range = sheet.getRange("B1");
  range.setValue("CEO");

  range = sheet.getRange("C1");
  range.setValue("Foundation time");

  range = sheet.getRange("D1");
  range.setValue("Income of 2024");

  range = sheet.getRange("E1");
  range.setValue("Profit of 2024");

  range = sheet.getRange("F1");
  // range.setValue("Financial Report Link");

  range = sheet.getRange("G1");
  range.setValue("Web Summary");

  // range = sheet.getRange("D2");
  // range.setValue("in form of $333,333");

  // range = sheet.getRange("E2");
  // range.setValue("in form of $333,333");

  for (let i = 0; i < 10; i++) {
    sheet.setColumnWidth(i, 210);
  }
  univerAPI
    .getActiveWorkbook()
    .getActiveSheet()
    .getRange("A1:H10")
    .setWrap(true);
  for (let i = 0; i < 100; i++) {
    sheet.autoFitRow(i);
    sheet.setRowHeight(i, 30);
  }

  sheet.setRowHeight(0, 40);
  // sheet.getRange('B3:T300').setBackgroundColor('#F8FAFD')

  univerAPI.customizeColumnHeader({
    headerStyle: { textAlign: "left", fontSize: 12, size: COLUMN_HEADER_HEIGHT },
  });

  univerAPI
    .getActiveWorkbook()
    .getActiveSheet()
    .getRange("A1:J1")
    .setBackgroundColor("#5683f3");
  univerAPI
    .getActiveWorkbook()
    .getActiveSheet()
    .getRange("A1:J1")
    .setFontColor("#eeeeee");

  sheet.setFrozenColumns(1);
  sheet.setFrozenRows(2);
};

window.initAssets = function() {

}

window.getCellText = function getCellText(row, col) {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  const r = sheet.getRange(row, col);
  let text = r.getValue();
  if(text) return text;

  const richValue = r.getRichTextValue();
  if(richValue) {
    const rs = richValue._data.body.dataStream;
    return rs.replace('\r\n', '');
  }
  return null;
}
/**
 * @param {row, column} cell
 */
window.getAIPromptByCell = function getAIPromptByCell(cell) {

  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  // row === 1 is description
  if (cell.row === 1) {
    return { prompt: "", promptWord: null, valueWord: null, missing: true };
  }
  const valueWord = getCellText(cell.row, 0);
  const promptWord = getCellText(0, cell.column);
  const detailText = getCellText(1, cell.column);
  let prompt = `${promptWord} of ${valueWord}`;
  if (detailText) {
    prompt += ` (${detailText})`;
  }

  console.log("prompt cell", cell.row, cell.column);
  console.log(
    window.aiAgentMapColumn.get(cell.column) + "prompt~~~ " + prompt + " ~~~"
  );
  const rs = { prompt, promptWord, valueWord };
  if (!rs.promptWord || !rs.valueWord) {
    rs.missing = true;
  }
  return rs;
};

/**
 *
 * @param {*} param0
 * @param {*} info
 */
window.saveSearchResult = function ({ row, col }, info) {
  if(info.result === "Failed") return;

  if (!window.saveSearchResult[row]) {
    window.searchAgentResult[row] = {};
  }

  window.searchAgentResult[row][col] = info;
  console.log("save new search result", window.searchAgentResult);
};

window.getSearchResult = function ({ row, col }) {
  if (window.searchAgentResult[row]) {
    return searchAgentResult[row][col];
  }
};

const aiAgentFnMap = (window.aiAgentFnMap = {
  optionTest: async (cell) => {
    const testvalue = await new Promise((resolve) =>
      setTimeout(() => resolve("a test"), 2000)
    );
    const range = sheet.getRange(cell.row, cell.column);
    range.setValue(testvalue);
    return { row: cell.row, col: cell.column, result: { result: testvalue } };
  },
  optionGPT: async (cell, promptObj) => {
    const { prompt, missing } = promptObj;
    if (missing) {
      // missing means that the promptWord/valueWord is empty
      return { row: cell.row, col: cell.column, missing };
    }
    const serverRespStr = await univerAPI.runOnServer("agent", "gpt", prompt);
    console.log("serverGPT:::", serverRespStr, "!!!!"); // a string: {"result":"1998"}

    let serverResp = {};
    if (serverRespStr[0] === "{") {
      try {
        serverResp = JSON.parse(serverRespStr);
      } catch (e) {
        console.error("GPT req err", e);
        serverResp = { result: "Error" };
      }
    } else {
      serverResp = { result: serverRespStr };
    }

    const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
    const range = sheet.getRange(cell.row, cell.column);
    range.setValue(serverResp.result);
    sheet.autoFitRow(cell.row);

    return { row: cell.row, col: cell.column, result: serverResp };
  },

  optionSearch: async (cell, promptObj) => {
    const { prompt, missing } = promptObj;
    if (missing) {
      // missing means that the promptWord/valueWord is empty
      return { row: cell.row, col: cell.column, missing };
    }
    const serverRespStr = await univerAPI.runOnServer(
      "agent",
      "web_search",
      prompt,
      "duckduckgo"
    );
    console.log("optionSearch.result:::", serverRespStr, "!!!"); // a string: {"result":"1998"}

    let serverResp = {};
    let searchStatus = false;
    if (serverRespStr[0] === "{") {
      try {
        serverResp = JSON.parse(serverRespStr);
        searchStatus = true;
      } catch (e) {
        console.error("Search req err", e);
        serverResp = { result: "Error" };
        searchStatus = false;
      }
    } else {
      serverResp = { result: serverRespStr };
    }

    const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
    const range = sheet.getRange(cell.row, cell.column);
    range.setValue(serverResp.result);
    sheet.autoFitRow(cell.row);
    // {"result":"$99.8 billion","sources":["https://www.visualcapitalist.com/cp/charting-apples-profit-100-billion-2022/"]}
    window.saveSearchResult({ row: cell.row, col: cell.column }, serverResp);
    return { row: cell.row, col: cell.column, result: serverResp };
  },

  optionRead: async (cell) => {
    const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
    let range = sheet.getRange(cell.row, cell.column - 1);
    const url = getCellText(cell.row, cell.column - 1);
    console.log("optionRead.url:::", url, "!!!"); // a string
    const serverRespStr = await univerAPI.runOnServer(
      "agent",
      "web_reader",
      url
    );
    console.log("optionRead.result:::", serverRespStr, "!!!"); // a string: {"result":"1998"}

    let serverResp = {};
    if (serverRespStr[0] === "{") {
      try {
        serverResp = JSON.parse(serverRespStr);
      } catch (e) {
        console.error("Read req err", e);
        serverResp = { result: "Error" };
      }
    } else {
      serverResp = { result: serverRespStr };
    }
    range = sheet.getRange(cell.row, cell.column);
    range.setValue(serverResp.result);
    console.log('option read set value', serverResp.result);
    return { row: cell.row, col: cell.column, result: serverResp };
  },
});

// for initSelectionEnd
window.newAIButton = function newAIButton() {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  // univerAPI.getActiveWorkbook().setActiveRange(range);
  const range = univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange();
  const { id, dispose } = sheet.addFloatDomToRange(
    range,
    {
      allowTransform: false,
      componentKey: "AIButton", // React comp key registered in ComponentManager
      props: {
        a: 1,
      },
      data: {
        aa: "128",
      },
    },
    {
      width: 100,
      height: 54, // actually 50
      marginX: "100%",
      marginY: "100%",
    },
    "AIButton"
  ); // dom id
  return {
    id,
    dispose,
  };
};

window.newLoadingRange = function newLoadingRange() {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  const range = univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange();
  let { id, dispose } = sheet.addFloatDomToRange(
    range,
    {
      allowTransform: false,
      componentKey: "RangeLoading", // React comp key registered in ComponentManager
      props: {
        a: 1,
      },
    },
    {},
    "RangeLoading" // dom id
  );
  if(!dispose) {
    dispose = () => {
      console.log('no loading dispose');
    }
  }
  return {
    id,
    dispose,
  };
};

window.initSelectionEnd = function initSelectionEnd() {
  window.btnId;
  window.btnDispose;
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  univerAPI.addEvent(univerAPI.Event.SelectionMoveEnd, (p) => {
    console.log("select end", p.selections);
    if (!p.selections[0]) return;
    const endRow = p.selections[0].endRow;
    const endCol = p.selections[0].endColumn;
    const startRow = p.selections[0].startRow;
    const startCol = p.selections[0].startColumn;

    let hasValue = false;
    for (let i = startRow; i <= endRow; i++) {
      const cellText = getCellText(i, 0);
      if (cellText) {
        hasValue = true;
      }
    }
    if (!hasValue) return;
    const { id, dispose } = newAIButton();
    window.btnId = id;
    window.btnDispose = dispose;
  });

  univerAPI.addEvent(univerAPI.Event.SelectionMoveStart, (p) => {
    console.log(p);
    window.btnDispose && window.btnDispose();
  });
};

/**
 * data: {result: string, sources: [{url: string, title: string, description: string}]}
 *
 * @param {*} data
 * @returns
 */
window.showSearchListPanel = function showSearchListPanel(data) {
  if(!data) return;
  if(data.result == 'Failed') return;

  // const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  const container = document.querySelector(
    "section#univer-container"
  ).parentElement;
  if (!container) return;
  const mountNode = document.createElement("div");
  mountNode.classList.add("search-wrapper");
  const rect = container.getBoundingClientRect();

  // 计算绝对位置
  const top = 16; // 16px 的偏移量
  const right = window.innerWidth - rect.right + 16; // 16px 的偏移量

  if (!document.getElementById("slide-panel-styles")) {
    const styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);
    styleSheet.id = "slide-panel-styles";
    styleSheet.textContent = `
    .panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .panel-enter {
        animation: slideIn 0.3s ease-out;
    }

    .panel-exit {
        animation: slideOut 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .panel-header {
        background: #3b82f6;
        padding: 16px;
        color: white;
        display: flex;
        justify-content: space-between;
    }

    .panel-content {
        padding: 24px;
    }

    .close-button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
    }
  `;
  }
  // 设置挂载节点样式
  mountNode.style.position = "absolute";
  mountNode.style.top = `${top}px`;
  mountNode.style.right = `${right}px`;
  mountNode.style.width = "480px";
  mountNode.style.zIndex = "9999"; // 确保在最顶层

  container.appendChild(mountNode);
  const panel = mountNode;
  panel.className = "panel panel-enter";

  const createRoot = univerAPI.UI.ReactDOM.createRoot;
  const root = createRoot(mountNode);
  // 定义关闭函数
  const dispose = () => {
    console.log("dispose search panel");
    panel.className = "panel panel-exit";
    panel.addEventListener("animationend", () => {
      root.unmount();
      if (mountNode.parentNode) {
        mountNode.parentNode.removeChild(mountNode);
      }
    });
  };
  window.disposeSearchPanel = dispose;
  const SearchListPanel = window.SearchListPanel;
  // 渲染组件
  console.log("root render");
  root.render(<SearchListPanel onClose={dispose} data={data} />);

  return {
    id: "SearchListPanel",
    dispose,
  };
};

window.initColumnAgent = function () {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  const rsGPT1 = sheet.addFloatDomToColumnHeader(
    1,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      props: {
        column: 1,
      },
      data: {
        defaultOption: "optionGPT",
        column: 1,
      },
    },
    {
      width: 210, //  univer-float-dom-wrapper width 208 ai-gpt 206
      height: 58,
      marginX: 0,
      marginY: 0,
      horizonOffsetAlign: "right",
    },
    "ai-gpt" // dom id
  );
  const rsGPT2 = sheet.addFloatDomToColumnHeader(
    2,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      props: {
        column: 2,
      },
      data: {
        defaultOption: "optionGPT",
        column: 2,
      },
    },
    {
      width: 210,
      height: 58, // #ai-select2 is actually 42 ( there is -2 logic in FloatDom)
      marginX: 0,
      marginY: 0,
      horizonOffsetAlign: "right",
    },
    "ai-select2" // dom id
  );

  const select3 = sheet.addFloatDomToColumnHeader(
    3,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      data: {
        defaultOption: "optionSearch",
        column: 3,
        selectWidth: 160,
      },
      props: {
        column: 3,
      },
    },
    {
      width: 210,
      height: 58,
      marginX: 0,
      marginY: 0,
      horizonOffsetAlign: "right",
    },
    "ai-select3" // dom id
  );

  const select4 = sheet.addFloatDomToColumnHeader(
    4,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      data: {
        defaultOption: "optionSearch",
        column: 4,
        selectWidth: 160,
      },
      props: {
        defaultOption: "optionSearch",
        column: 4,
      },
    },
    {
      width: 210,
      height: 58,
      marginX: 0,
      marginY: 0,
      horizonOffsetAlign: "right",
    },
    "ai-select4" // dom id
  );

  const select5 = sheet.addFloatDomToColumnHeader(
    5,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      data: {
        defaultOption: "optionSearch",
        column: 5,
        selectWidth: 160,
      },
      props: {
        defaultOption: "optionSearch",
        column: 5,
      },
    },
    {
      width: 210,
      height: 58,
      marginX: 0,
      marginY: 0,
      horizonOffsetAlign: "right",
    },
    "ai-select5" // dom id
  );

  const select6 = sheet.addFloatDomToColumnHeader(
    6,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      data: {
        defaultOption: "optionRead",
        column: 6,
        selectWidth: 160,
      },
      props: {
        defaultOption: "optionRead",
        column: 6,
      },
    },
    {
      width: 210,
      height: 58,
      marginX: 0,
      marginY: 0,
      horizonOffsetAlign: "right",
    },
    "ai-select6" // dom id
  );
};

window.initCellClickEvent = () => {
  // univerAPI.addEvent(univerAPI.Event.CellClicked, (params)=> {
  //   const { worksheet, workbook, row, column, value, isZenEditor } = params;


  //   if (window.disposeSearchPanel) {
  //     window.disposeSearchPanel();
  //   }

  //   const searchResult = window.getSearchResult({ row, col });
  //   console.log("initCellClickEvent", searchResult, endRow, endCol);
  //   const option = aiAgentMapColumn.get(endCol);
  //   if (searchResult && option === "optionSearch") {
  //     console.log('search result', searchResult);
  //     const { id, dispose } = showSearchListPanel(searchResult);
  //     window.disposeSearchPanel = dispose;
  //   } else {
  //     if (window.disposeSearchPanel) {
  //       window.disposeSearchPanel();
  //     }
  //   }
  // });

  univerAPI.addEvent(univerAPI.Event.SelectionMoveEnd, (p) => {
    // const { worksheet, workbook, row, column, value, isZenEditor } = params;
    if (!p.selections[0]) return;
    const endRow = p.selections[0].endRow;
    const endCol = p.selections[0].endColumn;

    if (window.disposeSearchPanel) {
      window.disposeSearchPanel();
    }

    const searchResult = window.getSearchResult({ row: endRow, col: endCol });
    console.log("initCellClickEvent", searchResult, endRow, endCol);
    const option = aiAgentMapColumn.get(endCol);
    if (searchResult && option === "optionSearch") {
      console.log('search result', searchResult);
      const { id, dispose } = showSearchListPanel(searchResult);
      window.disposeSearchPanel = dispose;
    } else {
      if (window.disposeSearchPanel) {
        window.disposeSearchPanel();
      }
    }
  });
};

function onOpen() {
  initDomLayout();

  setTimeout(() => {
    initData();
    initComp();
    initSelectionEnd();
    initCellClickEvent();
    initColumnAgent();
    document.querySelector("#dom-loading").remove();
    // test

    // window.saveSearchResult(
    //   { row: 3, col: 3 },
    //   {
    //     result: "$99.8 billion",
    //     sources: [
    //       {
    //         description:
    //           "Apple Inc. Annual Income Statement showing financial data.",
    //         title: "AAPL | Apple Inc. Annual Income Statement - WSJ",
    //         url: "https://www.wsj.com/market-data/quotes/AAPL/financials/annual/income-statement",
    //       },
    //     ],
    //   }
    // );

    // window.newLoadingRange();
  }, univerLayoutTime);
}
