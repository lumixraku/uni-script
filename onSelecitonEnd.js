const aiAgentMapColumn = (window.aiAgentMapColumn = {
  1: "optionGPT",
  2: "optionGPT",
  3: "optionSearch",
  4: "optionSearch",
});

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
  range.setValue("Income of 2022");

  range = sheet.getRange("E1");
  range.setValue("Profit of 2022");

  range = sheet.getRange("F1");
  range.setValue("Financial Report Link");

  range = sheet.getRange("G1");
  range.setValue("Financial Report Summary");

  range = sheet.getRange("D2");
  range.setValue("in form of $333,333");

  range = sheet.getRange("E2");
  range.setValue("in form of $333,333");

  for (let i = 0; i < 10; i++) {
    sheet.setColumnWidth(i, 130);
  }
  sheet.setRowHeight(0, 50);
};

/**
 * @param {row, column} cell
 */
window.getAIPromptByCell = function (cell) {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();

  const firstColCell = sheet.getRange(cell.row, 0);
  const firstColCellText = firstColCell.getValue();
  const firstRowCell = sheet.getRange(0, cell.column);
  const firstRowText = firstRowCell.getValue();
  const detailText = sheet.getRange(1, cell.column).getValue();
  const prompt = `${firstRowText} of ${firstColCellText} (${detailText})`;

  console.log("prompt cell", cell.row, cell.column);
  console.log("prompt::: " + prompt + " :::");
  return { prompt };
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
  optionGPT: async (cell) => {
    const { prompt } = getAIPromptByCell(cell);
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

    return { row: cell.row, col: cell.column, result: serverResp };
  },

  optionSearch: async (cell) => {
    const { prompt } = getAIPromptByCell(cell);
    const serverRespStr = await univerAPI.runOnServer(
      "agent",
      "web_search",
      prompt,
      "duckduckgo"
    );
    console.log("optionSearch.result:::", serverRespStr, "!!!"); // a string: {"result":"1998"}

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

    return { row: cell.row, col: cell.column, result: serverResp };
  },

  optionRead: async (cell) => {
    const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
    let range = sheet.getRange(cell.row, cell.column - 1);
    const url = range.getValue();

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
    return { row: cell.row, col: cell.column, result: serverResp };
  },
});

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
      let { startRow, startColumn, endRow, endColumn } = range._range;
      console.log("range", range);
      const { dispose: loadingDispose } = window.newLoadingRange();
      for (let row = startRow; row <= endRow; row++) {
        for (let column = startColumn; column <= endColumn; column++) {
          const aiFn =
            aiAgentFnMap[aiAgentMapColumn[column]] || aiAgentFnMap.optionGPT;
          if (aiFn) {
            reqs.push(aiFn({ row, column }));
          }
        }
      }
      try {
        setTimeout(() => {
          loadingDispose();
        }, 10000);
        const results = await Promise.all(reqs);
        console.info("所有请求的结果:", results);
        loadingDispose();
      } catch (error) {
        console.error("请求出错:", error, error.stack);
        loadingDispose();
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
  const SearchIcon = univerAPI.UI.Icon.Chrome;
  const ReadIcon = univerAPI.UI.Icon.WriteSingle;
  const GPTIcon = univerAPI.UI.Icon.AiSingle;

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
      aiAgentMapColumn[column] = value;
      setSelectedValue(value);
      console.log("Selected:", value);
    };

    const handleClick = (value) => {
      setSelectedValue(value);
      console.log("Selected:", value);
    };

    const agentDetail = {
      optionGPT: {
        icon: GPTIcon,
        title: "GPT",
        desc: "Ask questions directly to the LLM.",
      },
      optionSearch: {
        icon: SearchIcon,
        title: "Web Search",
        desc: "Search the web for information.",
      },
      optionRead: {
        icon: ReadIcon,
        title: "Read",
        desc: "Read documents and extract information.",
      },
    };

    // 最简单的自定义 dropdownRender
    const dropdownRender = (menu) => {
      // console.log('menu structure:', menu);  // 先看看 menu 的结构
      // const customMenu = React.cloneElement(menu, {
      //   children: React.Children.map(menu.props.children, (child) => {
      //     const value = child.props.value;
      //     const { icon: IconComponent, title, desc } = agentDetail[value] || {};
      //     console.log("child", child, value, IconComponent, title, desc);

      //     return React.cloneElement(child, {
      //       children: (
      //         <div
      //           style={{
      //             display: "flex",
      //             alignItems: "center",
      //             padding: "8px",
      //           }}
      //         >
      //           {IconComponent && (
      //             <IconComponent
      //               style={{
      //                 fontSize: 24,
      //                 marginRight: 10,
      //               }}
      //             />
      //           )}
      //           <div className="desc-part">
      //             <div style={{ fontWeight: "bold" }}>{title}</div>
      //             <div style={{ color: "gray", fontSize: "12px" }}>{desc}</div>
      //           </div>
      //         </div>
      //       ),
      //     });
      //   }),
      // });
      return (
        <>
          <div style={{ padding: "8px", borderBottom: "0px solid #ccc" }}></div>
          {menu}
          <div style={{ padding: "8px", borderTop: "0px solid #ccc" }}></div>
        </>
      );
    };

    // 自定义每个 Option 的内容
    const getOptionLabel = (value) => {
      const { icon: IconComponent, title, desc } = agentDetail[value] || {};
      return (
          <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px'
          }}>
              {IconComponent && (
                  <IconComponent style={{
                      fontSize: 24,
                      marginRight: 10
                  }} />
              )}
              <div>
                  <div style={{ fontWeight: 'bold' }}>{title}</div>
                  <div style={{ color: 'gray', fontSize: '12px' }}>{desc}</div>
              </div>
          </div>
      );
  };

  const getSelectedLabel = (value) => {
    const { icon: IconComponent, title } = agentDetail[value] || {};
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center'
        }}>
            {IconComponent && (
                <IconComponent style={{
                    fontSize: 20,
                    marginRight: 8
                }} />
            )}
            <span>{title}</span>
        </div>
    );
};

    return (
      <Select
        value={selectedValue}
        style={{ width: 120 }}
        dropdownStyle={{ width: 400 }} // 下拉菜单的宽度
        dropdownRender={dropdownRender}
        onChange={handleChange}
        onSelect={handleChange}
        optionLabelProp="label"  // 指定使用 Option 的哪个 prop 作为选中显示
      >
        <Option value="optionGPT" label={getSelectedLabel("optionGPT")}  >
          {getOptionLabel("optionGPT")}
        </Option>
        <Option value="optionSearch" label={getSelectedLabel("optionSearch")}  >
          {getOptionLabel("optionSearch")}
        </Option>
        <Option value="optionRead" label={getSelectedLabel("optionRead")}  >
          {getOptionLabel("optionRead")}
        </Option>
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

window.newLoadingRange = function () {
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
    "RangeLoading" // dom id
  );
  return {
    id,
    dispose,
  };
};

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
      },
      data: {
        defaultOption: "optionGPT",
        column: 1,
      },
    },
    { width: 124, height: 40, marginX: 0, marginY: 0, horizonOffsetAlign: "right" },
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
    { width: 124, height: 40, marginX: 0, marginY: 0, horizonOffsetAlign: "right" },
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
      },
      props: {
        column: 3,
      },
    },
    { width: 124, height: 40, marginX: 0, marginY: 0, horizonOffsetAlign: "right" },
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
    { width: 124, height: 40, marginX: 0, marginY: 0, horizonOffsetAlign: "right" },
    "ai-select4" // dom id
  );

  const select6 = sheet.addFloatDomToColumnHeader(
    6,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      data: {
        defaultOption: "optionSearch",
        column: 6,
      },
      props: {
        defaultOption: "optionSearch",
        column: 6,
      },
    },
    { width: 124, height: 40, marginX: 0, marginY: 0, horizonOffsetAlign: "right" },
    "ai-select6" // dom id
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
