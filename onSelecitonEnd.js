const aiAgentMapColumn = (window.aiAgentMapColumnColumn = {
  1: "optionTest",
  2: "optionGPT",
  3: "optionGPT",
  4: "optionGPT",
});

/**
 * @param {row, column} cell
 */
window.getAIPromptByCell = function (cell) {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();

  const firstColCell = sheet.getRange(cell.row, 0);
  const firstColCellText = firstColCell.getValue();
  const firstRowCell = sheet.getRange(0, cell.column);
  const firstRowText = firstRowCell.getValue();
  const prompt = `${firstRowText} of ${firstColCellText}`;
  console.log("prompt cell", cell.row, cell.column);
  console.log("prompt::: " + prompt + " :::");
  return { prompt };
};

const aiAgentFnMap = (window.aiAgentFnMap = {
  optionTest: async (cell) => {
    const testvalue = await new Promise(resolve => setTimeout(() => resolve("a test"), 2000));
    range.setValue(testvalue);
    return { row: cell.row, col: cell.column, result: {result: testvalue} };
  },
  optionGPT: async (cell) => {
    const { prompt } = getAIPromptByCell(cell);
    const serverResp = await univerAPI.runOnServer("agent", "gpt", prompt);
    console.log("serverResp.result:::", serverResp.result, "!!!!"); // a string: {"result":"1998"}
    if (serverResp.result[0] === "{") {
      try {
        serverResp.resultObj = JSON.parse(serverResp.result);
      } catch (e) {
        console.error("GPT req err", e);
        serverResp.resultObj = { result: "Error" };
      }
    } else {
      serverResp.resultObj = { result: serverResp.result };
    }

    const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
    const range = sheet.getRange(cell.row, cell.column);
    range.setValue(serverResp.resultObj.result);

    return { row: cell.row, col: cell.column, result: serverResp.resultObj };
  },

  optionSearch: async (cell) => {
    const { prompt } = getAIPromptByCell(cell);
    const serverResp = await univerAPI.runOnServer(
      "agent",
      "web_search",
      prompt,
      "duckduckgo"
    );
    console.log("optionSearch.result:::", serverResp.result, "!!!"); // a string: {"result":"1998"}
    try {
      serverResp.resultObj = JSON.parse(serverResp.result);
    } catch (e) {
      console.error("Search req err", e);
      serverResp.resultObj = { result: "Error" };
    }

    const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
    const range = sheet.getRange(cell.row, cell.column);
    range.setValue(serverResp.resultObj.result);

    return { row: cell.row, col: cell.column, result: serverResp.resultObj };
  },
});

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
  range.setValue("Income of 2022");

  range = sheet.getRange("E1");
  range.setValue("Profit of 2022");
};

window.registerLoading = function () {
  const RangeLoading = () => {
    const divStyle = {
      width: "100%",
      height: "100%",
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    };

    return <div style={divStyle}>Loading...</div>;
  };
  univerAPI.registerComponent("RangeLoading", RangeLoading);
};

window.registerAIButton = function () {
  const AIButton = () => {
    const divStyle = {
      width: "80px",
      height: "50px",
      backgroundColor: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      borderRadius: "25px",
      border: "none",
      color: "white",
      cursor: "pointer",
      transition: "all 0.3s ease",

      background:
        "linear-gradient(90deg, #00C9FF 0%, #92FE9D 50%, #00C9FF 100%)",
      backgroundSize: "200% auto",
      animation: "gradient 3s linear infinite",

      ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 10px 20px rgba(0, 201, 255, 0.3)",
      },
    };
    const clickHandler = async () => {
      const reqs = [];
      const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
      const range = univerAPI
        .getActiveWorkbook()
        .getActiveSheet()
        .getActiveRange();

      const {dispose: loadingDispose } = window.newLoadingRange();
      let { startRow, startColumn, endRow, endColumn } = range._range;
      for (let row = startRow; row <= endRow; row++) {
        for (let column = startColumn; column <= endColumn; column++) {
          // console.log(matrix[row][column]); // 打印当前元素
          const aiFn =
            aiAgentFnMap[aiAgentMapColumn[column]] || aiAgentFnMap.optionGPT;
          if (aiFn) {
            reqs.push(aiFn({ row, column }));
          }
        }
      }
      try {
        const results = await Promise.all(reqs);
        console.info("所有请求的结果:", results);
        // 等待所有请求完成
        loadingDispose();
      } catch (error) {
        console.error("请求出错:", error);
      }
    };
    return (
      <button type="button" style={divStyle} onClick={clickHandler}>
        AI
        <style>
          {`
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }

                    button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(0, 201, 255, 0.3);
                    }
                `}
        </style>
      </button>
    );
  };

  univerAPI.registerComponent("AIButton", AIButton);
};

window.registerHeaderAgent = function () {
  const Option = univerAPI.UI.Select.Option;
  const Select = univerAPI.UI.Select;
  const useState = univerAPI.UI.React.useState;
  // console.log('select', Select);
  // console.log('Option', Option);

  const AIAgentSelect = (props) => {
    console.log("select props", props);
    // const column = props.column ||;
    const column = props.data.column;
    const defaultOption = props.data.defaultOption || "optionGPT";
    console.log("default OPT", column, defaultOption);
    const [selectedValue, setSelectedValue] = useState(defaultOption); // 初始默认值

    const handleChange = (value) => {
      // aiAgentMapColumn[column] = value;
      setSelectedValue(value);
      console.log("Selected:", value);
    };

    const handleClick = (value) => {
      setSelectedValue(value);
      console.log("Selected:", value);
    };
    const dropdownRender = (menu) => {
      // 确保直接返回原始的 menu
      return (
        <div style={{ zIndex: 1400, position: "relative" }}>
          {React.Children.map(menu.props.children, (child) => (
            <div
              onClick={() => handleClick(child.props.value)}
              style={{ padding: "8px", cursor: "pointer" }}
            >
              {child}
            </div>
          ))}
        </div>
      );
    };

    const dropdownRender0 = (menu) => (
      <div
        style={{ zIndex: 1000, position: "relative" }}
        onClick={() => handleClick("eee")}
      >
        {menu}
      </div>
    );

    return (
      <Select
        value={selectedValue}
        style={{ width: 70 }}
        dropdownStyle={{ width: 120 }}
        onChange={handleChange}
        onSelect={handleChange}
        dropdownRender={dropdownRender0}
      >
        <Option value="optionGPT">GPT</Option>
        <Option value="optionSearch">Search</Option>
        <Option value="optionRead">Read</Option>
        <Option value="optionFinance">Finance</Option>
      </Select>
    );
  };
  univerAPI.registerComponent("AIAgentSelect", AIAgentSelect);
};

// for initSelectionEnd
window.newAIButton = function () {
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
      x: "100%",
      y: "100%",
    },
    "AIButton"
  ); // dom id
  return {
    id,
    dispose,
  };
};

window.newLoadingRange = function() {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  const range = univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange();
  const { id, dispose } = sheet.addFloatDomToRange(
    range,
    {
      allowTransform: false,
      componentKey: "RangeLoading", // React comp key registered in ComponentManager
      props: {
        a: 1,
      },
    },
    {},
    "RangeLoading"  // dom id
  );
  return {
    id,
    dispose,
  };
}

window.initSelectionEnd = function () {
  window.btnId;
  window.btnDispose;
  univerAPI.addEvent(univerAPI.Event.SelectionMoveEnd, (p) => {
    console.log("select end", p.selections);
    if (!p.selections[0]) return;
    const endRow = p.selections[0].endRow;
    const endCol = p.selections[0].endColumn;
    const { id, dispose } = newAIButton();
    window.btnId = id;
    window.btnDispose = dispose;
  });

  univerAPI.addEvent(univerAPI.Event.SelectionMoveStart, (p) => {
    console.log(p);
    window.btnDispose && window.btnDispose();
  });
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
        agent: 'gpt',
      },
      data: {
        column: 1,
      },
    },
    { width: 100, height: 40, x: 0, y: 0 },
    "ai-gpt" // dom id
  );
  const rsGPT2 = sheet.addFloatDomToColumnHeader(
    2,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      props: {
        column: 2,
        agent: 'optionGPT',
      },
      data: {
        column: 2,
      },
    },
    { width: 100, height: 40, x: 0, y: 0 },
    "ai-select2" // dom id
  );

  const select3 = sheet.addFloatDomToColumnHeader(
    3,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      data: {
        column: 3,
        agent: 'optionSearch',
      },
      props: {
        column: 3,
      },
    },
    { width: 100, height: 40, x: 0, y: 0 },
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
      },
      props: {
        defaultOption: "optionSearch",
        column: 4,
      },
    },
    { width: 100, height: 40, x: 0, y: 0 },
    "ai-select4" // dom id
  );
};

function onOpen() {
  setTimeout(() => {
    initData();
    registerLoading();
    registerAIButton();
    registerHeaderAgent();
    initSelectionEnd();
    initColumnAgent();
  }, 1000);
}
