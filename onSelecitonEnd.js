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
    const clickHandler = () => {
      console.warn("click");
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
  console.log('select', Select);
  console.log('Option', Option);

  const AIAgentSelect = () => {
    const handleChange = (value) => {
      console.log("Selected:", value);
    };

    return (
      <Select
        defaultValue="optionGPT" // 默认值设置为第一个选项的值
        style={{ width: 70 }}
        onChange={handleChange}
      >
        <Option value="optionGPT">GPT</Option>
        <Option value="optionSearch">Search</Option>
        <Option value="optionRead">Read</Option>
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

window.initSelectionEnd = function () {
  window.btnId;
  window.btnDispose;
  univerAPI.addEvent(univerAPI.Event.SelectionMoveEnd, (p) => {
    console.log(p);
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
  const rsWeb = sheet.addFloatDomToColumnHeader(
    3,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      props: {
        a: 1,
      },
      data: {
        aa: "128",
      },
    },
    { width: 100, height: 40, x: 0, y: 0 },
    "ai-web" // dom id
  );

  const rsGPT = sheet.addFloatDomToColumnHeader(
    2,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      props: {
        a: 1,
      },
      data: {
        aa: "128",
      },
    },
    { width: 100, height: 40, x: 0, y: 0 },
    "ai-gpt" // dom id
  );
};

function onOpen() {
  setTimeout(() => {
    registerAIButton();
    registerHeaderAgent();
    initSelectionEnd();
    initColumnAgent();
  }, 2000)
}
