window.registerLoading = function registerLoading() {
  const LoadingIcon = univerAPI.UI.Icon.Loading;
  const RangeLoading = () => {
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
              width: calc(100% + 4px);
              height: calc(100% + 4px);
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
      console.log("AIButton  AIButton  AIButton  AIButton clicked");

      const reqs = []; // [{cell, aiFn, aiFnName}]
      const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
      const range = univerAPI
        .getActiveWorkbook()
        .getActiveSheet()
        .getActiveRange();
      let { startRow, startColumn, endRow, endColumn } = range._range;
      console.log("range", range);
      for (let row = startRow; row <= endRow; row++) {
        for (let column = startColumn; column <= endColumn; column++) {
          const aiFnName = window.aiAgentMapColumn.get(column); //  optionGPT, optionSearch, optionRead
          const aiFn = aiAgentFnMap[aiFnName] || aiAgentFnMap.optionGPT;

          const cellPromptObj = getAIPromptByCell({ row, column });
          if (!cellPromptObj.missing) {
            // missing means that the promptWord/valueWord is empty
            if (aiFn) {
              const req = aiFn({ row, column }, cellPromptObj);
              reqs.push({ cell: { row, col: column }, req, aiFnName });
            }
          }
        }
      }

      let st;
      try {
        if (reqs.length) {
          const { dispose: loadingDispose } = window.newLoadingRange();
          st = setTimeout(() => {
            loadingDispose();
          }, 30000);
          const reqAsyncFns = reqs.map((r) => r.req);
          const results = await Promise.all(reqAsyncFns);
          console.info("所有请求的结果:", results);
          loadingDispose();

          // for search result
          if (reqs.length === 1 && results.length === 1) {
            const req = reqs[0];
            if (req.aiFnName === "optionSearch") {
              if (results[0]) {
                console.log("search_list", results[0]);
                // results[0].result ---> { result: '{..}', sources: [{...}]}
                window.showSearchListPanel(results[0].result);
              }
            }
          }
        }
      } catch (error) {
        console.error("请求出错:", error, error.stack);
        loadingDispose();
      } finally {
        clearTimeout(st);
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
          marginTop: "5px",
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
  const Icon = univerAPI.UI.AntIcon;
  const SearchIcon = univerAPI.UI.Icon.Chrome;
  const WriteIcon = univerAPI.UI.Icon.WriteSingle;
  const GPTIcon = univerAPI.UI.Icon.AiSingle;

  const useState = univerAPI.UI.React.useState;

  const AIAgentSelect = (props) => {
    console.log("select props", props.data);
    // const column = props.column ||;
    const selectWidth = props.data.selectWidth;
    const column = props.data.column;
    const defaultOption = props.data.defaultOption || "optionGPT";
    console.log("default OPT", column, defaultOption);
    const [selectedValue, setSelectedValue] = useState(defaultOption); // 初始默认值
    if (!window.aiAgentMapColumn.has(column)) {
      window.aiAgentMapColumn.set(column, defaultOption);
    }
    const handleChange = (value) => {
      window.aiAgentMapColumn.set(column, value);
      setSelectedValue(value);
      console.log(
        "Selected:",
        value,
        column,
        window.aiAgentMapColumn.get(column)
      );
    };

    // const handleClick = (value) => {
    //   setSelectedValue(value);
    //   console.log("Selected:", value);
    // };

    const agentDetail = {
      optionGPT: {
        icon: ColorGPTIcon,
        title: "GPT",
        desc: "Ask questions directly to the LLM.",
      },
      optionSearch: {
        icon: ColorGoogleIcon,
        title: "Web Search",
        desc: "Search the web for information.",
      },
      optionRead: {
        icon: ColorGoogleIcon,
        title: "Read",
        desc: "Read documents and extract information.",
      },
      optionCoze: {
        icon: ColorCozeIcon,
        title: "Coze Agent",
        desc: "A predefined Agent.",
      },
      optionDatabase: {
        icon: ColorDatabaseIcon,
        title: "Database",
        desc: "Extract database information by prompts.",
      },
      optionFinance: {
        icon: ColorGraphBarIcon,
        title: "YFinance",
        desc: "Combine financial data API questions and answers.",
      },
      optionUniver: {
        icon: ColorUniverIcon,
        title: "Save as Univer",
        desc: "Save the result as a child worksheet.",
      },
      optionPDF: {
        icon: ColorSlideIcon,
        title: "PDF",
        desc: "Answer questions based on the PDF content.",
      },
      optionApify: {
        icon: ColorApifyIcon,
        title: "Apify",
        desc: "Extract web content with Apify.",
      },
      optionImage: {
        icon: ColorImageIcon,
        title: "Image Generation",
        desc: "Generate images based on prompts.",
      },
      optionUserInput: {
        icon: ColorCozeIcon,
        title: "User Input",
        desc: "Put user input in this column",
      },
    };

    // 最简单的自定义 dropdownRender
    const dropdownRender = (menu) => {
      return (
        <div onWheel={(e) => e.stopPropagation()}>
          <div style={{ padding: "8px", borderBottom: "0px solid #ccc" }}></div>
          {menu}
          <div style={{ padding: "8px", borderTop: "0px solid #ccc" }}></div>
        </div>
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
          {console.log('Icon comp', IconComponent)}
          {IconComponent && (
            <IconComponent
              style={{
                fontSize: 24,
                marginRight: 10,
              }}
            />
          )}
          <div>
            <div style={{ color: "#0E111E", fontWeight: "bold" }}>{title}</div>
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
          <div
            className="icon-outline"
            style={{
              borderRadius: "50%",
              width: 24,
              height: 24,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
              boxShadow:
                "0px 1px 2px -1px rgba(30, 40, 77, 0.10), 0px 1px 3px 0px rgba(30, 40, 77, 0.10)",
            }}
          >
            {IconComponent && (
              <IconComponent
                style={{
                  fontSize: 20,
                }}
              />
            )}
          </div>
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
            position: absolute;
            right: 0;
            top:10px;
          }
          .ant-select .ant-select-selector {
            border-radius: 16px !important;
            height: 32px !important;
            padding: 0 16px 0 4px !important;
            border: 1px solid #A4CAFE !important;
            background: #EBF5FF !important;
            color: #1C64F2 !important;
            transition: all 0.2s ease !important;
          }

          .ant-select .ant-select-selection-item {
            font-weight: bold;
            display: flex;
            align-items: center;
          }

          .ant-select:hover .ant-select-selector {
            box-shadow: 0 1px 6px rgba(32,33,36,0.28) !important;
          }

          .ant-select-focused .ant-select-selector {
            box-shadow: 0 2px 8px rgba(32,33,36,0.28) !important;
          }

        `}
        </style>
        <Select
          listHeight={500} // 设置下拉列表的高度，默认是256
          value={selectedValue}
          style={{ width: selectWidth || 120 }}
          dropdownStyle={{ width: 400 }} // 下拉菜单的宽度
          dropdownRender={dropdownRender}
          onChange={handleChange}
          onSelect={handleChange}
          optionLabelProp="label" // 指定使用 Option 的哪个 prop 作为选中显示
        >
          <Option value="optionSearch" label={getSelectedLabel("optionSearch")}>
            {getOptionLabel("optionSearch")}
          </Option>
          <Option value="optionGPT" label={getSelectedLabel("optionGPT")}>
            {getOptionLabel("optionGPT")}
          </Option>
          <Option value="optionRead" label={getSelectedLabel("optionRead")}>
            {getOptionLabel("optionRead")}
          </Option>
          <Option value="optionCoze" label={getSelectedLabel("optionCoze")}>
            {getOptionLabel("optionCoze")}
          </Option>
          <Option
            value="optionDatabase"
            label={getSelectedLabel("optionDatabase")}
          >
            {getOptionLabel("optionDatabase")}
          </Option>
          <Option
            value="optionFinance"
            label={getSelectedLabel("optionFinance")}
          >
            {getOptionLabel("optionFinance")}
          </Option>
          <Option value="optionUniver" label={getSelectedLabel("optionUniver")}>
            {getOptionLabel("optionUniver")}
          </Option>
          <Option value="optionPDF" label={getSelectedLabel("optionPDF")}>
            {getOptionLabel("optionPDF")}
          </Option>
          <Option value="optionApify" label={getSelectedLabel("optionApify")}>
            {getOptionLabel("optionApify")}
          </Option>
          <Option value="optionImage" label={getSelectedLabel("optionImage")}>
            {getOptionLabel("optionImage")}
          </Option>
        </Select>
      </div>
    );
  };
  univerAPI.registerComponent("AIAgentSelect", AIAgentSelect);
};

window.initSearchListPanel = function initSearchListPanel() {
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
    console.log("source", data.sources);
    if (!data.sources) {
      data.sources = [];
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
            {data.sources.map((source, index) => {
              const { url, title, description } = source;

              return (
                <div key={index} className="link-item">
                  <a
                    href={url}
                    style={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {title}
                  </a>
                  <div>{description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  window.SearchListPanel = SearchListPanel;
  return SearchListPanel;

  // window.SearchListPanel = SearchListPanel;
  // univerAPI.registerComponent("SearchListPanel", SearchListPanel);
};

window.initComp = function initIconComp() {
  const Icon = univerAPI.UI.AntIcon;
  const ColorGPTIcon = (props) => <Icon component={ColorGPTSVG} {...props} />;

  const ColorCozeIcon = (props) => <Icon component={ColorCozeSVG} {...props} />;

  const ColorGoogleIcon = (props) => (
    <Icon component={ColorGoogleSVG} {...props} />
  );

  const ColorApifyIcon = (props) => (
    <Icon component={ColorApifySVG} {...props} />
  );

  const ColorDatabaseIcon = (props) => {
  console.log('database prop', props);
  return (
    <Icon component={ColorDatabaseSVG} {...props} />
  )};

  const ColorGraphBarIcon = (props) => (
    <Icon component={ColorGraphBarSVG} {...props} />
  );

  const ColorImageIcon = (props) => (
    <Icon component={ColorImageSVG} {...props} />
  );

  const ColorSlideIcon = (props) => (
    <Icon component={ColorSlideSVG} {...props} />
  );

  const ColorUniverIcon = (props) => (
    <Icon component={ColorUniverSVG} {...props} />
  );

  window.ColorGPTIcon = ColorGPTIcon;
  window.ColorGoogleIcon = ColorGoogleIcon;
  window.ColorCozeIcon = ColorCozeIcon;
  window.ColorApifyIcon = ColorApifyIcon;
  window.ColorDatabaseIcon = ColorDatabaseIcon;
  window.ColorGraphBarIcon = ColorGraphBarIcon;
  window.ColorImageIcon = ColorImageIcon;
  window.ColorSlideIcon = ColorSlideIcon;
  window.ColorUniverIcon = ColorUniverIcon;

  registerLoading();
  registerAIButton();
  registerAIAgentSelect();
  initSearchListPanel();
};
