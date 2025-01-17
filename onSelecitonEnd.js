const aiAgentMapColumn = window.aiAgentMapColumnColumn = {
  1: 'optionGPT',
  2: 'optionGPT',
  3: 'optionGPT',
  4: 'optionGPT',
}

const aiAgentFn = window.aiAgentFn = {
  optionGPT: async (cell) => {
    console.log('GPT')
    const sheet = univerAPI.getActiveWorkbook().getActiveSheet();
    const range = sheet.getRange(cell.row, cell.column);
    const cellText = range.getValue();

    const firstRowText = sheet.getRange(0, cell.column);
    const question = `${firstRowText}, ${cellText}`;
    // const result = await univerAPI.runOnServer("agent", "gpt", question);
    const result = 'question' + question;
    console.log(result);
    return {row: cell.row, col: cell.column, result} ;
  }
}

window.initData = function() {
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
}

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
      const range = univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange();
      let {startRow, startColumn, endRow, endColumn} = range._range;
      for (let row = startRow; row <= endRow; row++) {
        for (let column = startColumn; column <= endColumn; column++) {
            // console.log(matrix[row][column]); // 打印当前元素
            const aiFn = aiAgentFn[aiAgentMapColumn[column]];
            if (aiFn) {
              reqs.push(aiFn({row, column}));
            }
        }
      }
      try {
        // 等待所有请求完成
        const results = await Promise.all(reqs);
        console.log('所有请求的结果:', results);
        alert('所有请求已完成！');
    } catch (error) {
        console.error('请求出错:', error);
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
  console.log('select', Select);
  console.log('Option', Option);

  const AIAgentSelect = (props) => {
    console.log('select props', props)
    const column = props.column;
    const handleChange = (value) => {
      aiAgentMapColumn[column] = value;
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

window.initSelectionEnd = function () {
  window.btnId;
  window.btnDispose;
  univerAPI.addEvent(univerAPI.Event.SelectionMoveEnd, (p) => {
    console.log('select end', p.selections);
    if(!p.selections[0]) return;
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
  const rsGPT = sheet.addFloatDomToColumnHeader(
    2,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      props: {
        column: 3,
      },
      data: {
        aa: "128",
      },
    },
    { width: 100, height: 40, x: 0, y: 0 },
    "ai-gpt" // dom id
  );

  const rsWeb = sheet.addFloatDomToColumnHeader(
    3,
    {
      allowTransform: false,
      componentKey: "AIAgentSelect", // React comp key registered in ComponentManager
      props: {
        column: 2,
      },
      data: {
        aa: "128",
      },
    },
    { width: 100, height: 40, x: 0, y: 0 },
    "ai-web" // dom id
  );
};

function onOpen() {
  setTimeout(() => {
    initData();
    registerAIButton();
    registerHeaderAgent();
    initSelectionEnd();
    initColumnAgent();
  }, 2000)
}
