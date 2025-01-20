const aiAgentMapColumn = (window.aiAgentMapColumn = {
  // 1: "optionGPT",
  // 2: "optionGPT",
  // 3: "optionSearch",
  // 4: "optionSearch",
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

  // range = sheet.getRange("D2");
  // range.setValue("in form of $333,333");

  // range = sheet.getRange("E2");
  // range.setValue("in form of $333,333");

  for (let i = 0; i < 10; i++) {
    sheet.setColumnWidth(i, 210);
  }
  for (let i = 2; i < 8; i++) {
    sheet.autoFitRow(i);
  }
  sheet.setRowHeight(0, 50);
  univerAPI.customizeColumnHeader({
    headerStyle: { textAlign: "left", fontSize: 9 },
  });
};

/**
 * @param {row, column} cell
 */
window.getAIPromptByCell = function getAIPromptByCell(cell) {
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  // row === 1 is description
  if (cell.row === 1) {
    return { prompt: "", promptWord: null, valueWord: null, missing: true };
  }
  const valueWord = sheet.getRange(cell.row, 0).getValueAndRichTextValue();
  const promptWord = sheet.getRange(0, cell.column).getValueAndRichTextValue();
  const detailText = sheet.getRange(1, cell.column).getValueAndRichTextValue();
  let prompt = `${promptWord} of ${valueWord}`;
  if (detailText) {
    prompt += ` (${detailText})`;
  }

  console.log("prompt cell", cell.row, cell.column);
  console.log("prompt::: " + prompt + " :::");
  const rs = { prompt, promptWord, valueWord };
  if (!rs.promptWord || !rs.valueWord) {
    rs.missing = true;
  }
  return rs;
};

/**
 * search agent result should saved. show this info when user click the cell.
 * row{ col: {}}
 */

window.searchAgentResult = {};

/**
 *
 * @param {*} param0
 * @param {*} info
 */
// demo info

window.saveSearchResult = function ({ row, col }, info) {
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
  optionGPT: async (cell) => {
    const { prompt, missing } = getAIPromptByCell(cell);
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

    return { row: cell.row, col: cell.column, result: serverResp };
  },

  optionSearch: async (cell) => {
    const { prompt, missing } = getAIPromptByCell(cell);
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
        console.error("GPT req err", e);
        serverResp = { result: "Error" };
        searchStatus = false;
      }
    } else {
      serverResp = { result: serverRespStr };
    }

    const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
    const range = sheet.getRange(cell.row, cell.column);
    range.setValue(serverResp.result);
    // {"result":"$99.8 billion","sources":["https://www.visualcapitalist.com/cp/charting-apples-profit-100-billion-2022/"]}
    window.saveSearchResult({ row: cell.row, col: cell.column }, serverResp);
    // showSearchListPanel if req is only one
    // if (searchStatus) {
    //   showSearchListPanel(serverResp);
    // }
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

  // optionSearchCallback: async (reqs, results) => {
  //   if (results.length === 1) {
  //     const searchResult = results[0];
  //     if (searchResult) {
  //       window.showSearchListPanel(searchResult);
  //     }
  //   }
  // },
});

window.registerLoading = function registerLoading() {
  const LoadingIcon = univerAPI.UI.Icon.Loading;
  const RangeLoading = () => {
    const divStyle = {
      width: "100%",
      height: "100%",
      backgroundColor: "#d2d9f9",
      border: "1px solid #6678e9",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      opacity: 0.8,
    };

    return (
      <div className="loading-wrapper">
        <div className="loading-container">
          <LoadingIcon spin className="loading-icon" />
          <span className="loading-text">Loading...</span>
        </div>
        <style>
          {`
            .loading-wrapper {
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #d2d9f9;
              opacity: 0.8;
            }
            .loading-container {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .loading-text {
              color: #666;
              font-size: 14px;
            }
          .loading-icon {
            color: #1890ff;
            font-size: 24px;
            animation: rotate 1s linear infinite;
          }
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          `}
        </style>
      </div>
    );
  };
  univerAPI.registerComponent("RangeLoading", RangeLoading);
};

window.registerAIButton = function registerAIButton() {
  const AIButton = () => {
    const clickHandler = async () => {
      const reqs = []; // [{cell, aiFn, aiFnName}]
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
          const aiFnName = aiAgentMapColumn[column]; //  optionGPT, optionSearch, optionRead
          const aiFn = aiAgentFnMap[aiFnName] || aiAgentFnMap.optionGPT;
          if (aiFn) {
            const req = aiFn({ row, column });
            if (!(req.missing === true)) {
              reqs.push({ cell: { row, col: column }, req, aiFnName });
            }
          }
        }
      }
      try {
        if (reqs.length) {
          setTimeout(() => {
            loadingDispose();
          }, 10000);
          const reqAsyncFns = reqs.map((r) => r.req);
          const results = await Promise.all(reqAsyncFns);
          console.info("所有请求的结果:", results);
          loadingDispose();

          // for search result
          if (reqs.length === 1 && results.length === 1) {
            const req = reqs[0];
            if (req.aiFnName === "optionSearch") {
              if (results[0]) {
                window.showSearchListPanel(results[0].result);
              }
            }
          }
        }
      } catch (error) {
        console.error("请求出错:", error, error.stack);
        loadingDispose();
      }
    };
    const GPTIcon = univerAPI.UI.Icon.AiSingle;
    return (
      <button
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          border: "none",
          borderRadius: "20px",
          color: "white",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#4e67eb",
        }}
        onClick={clickHandler}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "200%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            animation: "shine 3s infinite linear",
          }}
        />
        <span style={{ position: "relative", zIndex: 1 }}>
          <GPTIcon />
        </span>
        <span style={{ position: "relative", zIndex: 1 }}>Run</span>
        <style>
          {`
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(50%); }
          }
          button {
            cursor: pointer;
          }
          button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(78, 103, 235, 0.3);
            cursor: pointer;
          }
          button:active {
            transform: translateY(0);
            cursor: pointer;
          }
        `}
        </style>
      </button>
    );
  };

  univerAPI.registerComponent("AIButton", AIButton);
};

window.registerAIAgentSelect = function registerAIAgentSelect() {
  const Option = univerAPI.UI.Select.Option;
  const Select = univerAPI.UI.Select;
  const SearchIcon = univerAPI.UI.Icon.Chrome;
  const ReadIcon = univerAPI.UI.Icon.WriteSingle;
  const GPTIcon = univerAPI.UI.Icon.AiSingle;

  const useState = univerAPI.UI.React.useState;
  // console.log('select', Select);
  // console.log('Option', Option);

  const AIAgentSelect = (props) => {
    console.log("select props", props.data);
    // const column = props.column ||;
    const selectWidth = props.data.selectWidth;
    const column = props.data.column;
    const defaultOption = props.data.defaultOption || "optionGPT";
    console.log("default OPT", column, defaultOption);
    const [selectedValue, setSelectedValue] = useState(defaultOption); // 初始默认值
    window.aiAgentMapColumn[column] = defaultOption;
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px",
          }}
        >
          {IconComponent && (
            <IconComponent
              style={{
                fontSize: 24,
                marginRight: 10,
              }}
            />
          )}
          <div>
            <div style={{ fontWeight: "bold" }}>{title}</div>
            <div style={{ color: "gray", fontSize: "12px" }}>{desc}</div>
          </div>
        </div>
      );
    };

    const getSelectedLabel = (value) => {
      const { icon: IconComponent, title } = agentDetail[value] || {};
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {IconComponent && (
            <IconComponent
              style={{
                fontSize: 20,
                marginRight: 8,
              }}
            />
          )}
          <span>{title}</span>
        </div>
      );
    };

    return (
      <div className="ai-agent-select-wrapper">
        <style>
          {`
          .ai-agent-select-wrapper {
            padding-left: 10px;
            padding-right: 10px;
          }
          .ant-select-selector {
            border-radius: 21px !important;
            height: 42px !important;
            padding: 0 16px !important;
            border: 1px solid #A4CAFE !important;
            background: #EBF5FF !important;
            color: #1C64F2 !important;
            transition: all 0.2s ease !important;
          }

          .ant-select:hover .ant-select-selector {
            box-shadow: 0 1px 6px rgba(32,33,36,0.28) !important;
          }

          .ant-select-focused .ant-select-selector {
            box-shadow: 0 2px 8px rgba(32,33,36,0.28) !important;
            border-color: rgba(223,225,229,0) !important;
          }

          .ant-select-selection-placeholder,
          .ant-select-selection-item {
            line-height: 42px !important;
          }

          .ant-select-selection-search-input {
            height: 42px !important;
          }

          .ant-select .ant-select-arrow{
            margin-top: 0px;
          }
        `}
        </style>
        <Select
          value={selectedValue}
          style={{ width: selectWidth || 120 }}
          dropdownStyle={{ width: 400 }} // 下拉菜单的宽度
          dropdownRender={dropdownRender}
          onChange={handleChange}
          onSelect={handleChange}
          optionLabelProp="label" // 指定使用 Option 的哪个 prop 作为选中显示
        >
          <Option value="optionGPT" label={getSelectedLabel("optionGPT")}>
            {getOptionLabel("optionGPT")}
          </Option>
          <Option value="optionSearch" label={getSelectedLabel("optionSearch")}>
            {getOptionLabel("optionSearch")}
          </Option>
          <Option value="optionRead" label={getSelectedLabel("optionRead")}>
            {getOptionLabel("optionRead")}
          </Option>
        </Select>
      </div>
    );
  };
  univerAPI.registerComponent("AIAgentSelect", AIAgentSelect);
};

window.newSearchListPanel = function newSearchListPanel() {
  const SearchListPanel = (prop) => {
    const onClose = prop.onClose;
    const styles = {
      panel: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
      },
      header: {
        backgroundColor: "#3b82f6",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#fff",
      },
      closeButton: {
        background: "none",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        padding: "4px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      content: {
        padding: "24px",
      },
      section: {
        marginBottom: "20px",
      },
      title: {
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "8px",
        color: "#111827",
      },
      text: {
        color: "#4b5563",
        marginBottom: "16px",
        lineHeight: "1.5",
      },
      link: {
        color: "#3b82f6",
        textDecoration: "none",
      },
    };
    const data = prop.data; // { result, sources:[]}
    if(data.sources.length === 0){
      data.sources = []
    }
    return (
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>Source Information</div>
          <button
            style={styles.closeButton}
            onClick={() => {
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        <div style={styles.content}>
          <div style={styles.section}>
            <h2 style={styles.title}>Full Answer:</h2>
            <p style={styles.text}>{data.result}</p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.title}>Source URL:</h2>
            {data.sources.map((url, index) => (
              <div key={index} className="link-item">
                <a
                  href={url}
                  style={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  return SearchListPanel;
  // window.SearchListPanel = SearchListPanel;
  // univerAPI.registerComponent("SearchListPanel", SearchListPanel);
};

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

window.initSelectionEnd = function initSelectionEnd() {
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

window.showSearchListPanel = function showSearchListPanel(data) {
  // const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
  const container = document.querySelector("section#univer-container");
  if (!container) return;
  const mountNode = document.createElement("div");
  mountNode.classList.add("search-wrapper");
  const rect = container.getBoundingClientRect();

  // 计算绝对位置
  const top = 16; // 16px 的偏移量
  const right = window.innerWidth - rect.right + 16; // 16px 的偏移量

  // 设置挂载节点样式
  mountNode.style.position = "absolute";
  mountNode.style.top = `${top}px`;
  mountNode.style.right = `${right}px`;
  mountNode.style.width = "480px";
  mountNode.style.zIndex = "9999"; // 确保在最顶层

  container.appendChild(mountNode);

  const createRoot = univerAPI.UI.ReactDOM.createRoot;
  const root = createRoot(mountNode);
  // 定义关闭函数
  const dispose = () => {
    console.log("dispose search panel");
    root.unmount();
    if (mountNode.parentNode) {
      mountNode.parentNode.removeChild(mountNode);
    }
  };
  window.disposeSearchPanel = dispose;
  const SearchListPanel = window.newSearchListPanel();
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
      width: 134,
      height: 48,
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
      width: 134,
      height: 48,
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
      width: 174,
      height: 48,
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
      width: 174,
      height: 48,
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
      width: 174,
      height: 48,
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
        defaultOption: "optionSearch",
        column: 6,
        selectWidth: 160,
      },
      props: {
        defaultOption: "optionSearch",
        column: 6,
      },
    },
    {
      width: 174,
      height: 48,
      marginX: 0,
      marginY: 0,
      horizonOffsetAlign: "right",
    },
    "ai-select6" // dom id
  );
};

window.initCellClickEvent = (cell) => {
  univerAPI.addEvent(univerAPI.Event.SelectionMoveEnd, (p) => {
    // const { worksheet, workbook, row, column, value, isZenEditor } = params;
    if (!p.selections[0]) return;
    const endRow = p.selections[0].endRow;
    const endCol = p.selections[0].endColumn;

    const searchResult = window.getSearchResult({ row: endRow, col: endCol });
    console.log("initCellClickEvent", searchResult, endRow, endCol);
    if (searchResult) {
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
  setTimeout(() => {
    initData();
    registerLoading();
    registerAIButton();
    registerAIAgentSelect();
    initSelectionEnd();
    initCellClickEvent();
    initColumnAgent();

    // test

    window.saveSearchResult(
      { row: 0, col: 0 },
      {
        result: "$99.8 billion",
        sources: [
          "https://www.visualcapitalist.com/cp/charting-apples-profit-100-billion-2022/",
        ],
      }
    );
  }, 1000);
}
