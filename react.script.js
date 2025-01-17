// Univer Client Uniscript
// Uniscript is just JavaScript! And you can access Univer with the univerAPI object.
// Read https://docs.univer.ai/en-US/guides/sheets/getting-started/facade for instructions.

/**
 * This is a special hook function.
 *
 * It will automatically run when you open a new tab in your browser, and it
 * will run when the webpage loads and before the Univer Document is loaded.
 * So you can use this function to do some initialization work,
 * such as setting up menus.
 */
function onOpen() {
  window.univerAPI = univerAPI;

  // For example, you can register a custom function.
  univerAPI.registerFunction({
    calculate: [
      [
        function (...variants) {
          let sum = 0;

          for (const variant of variants) {
            sum += Number(variant) || 0;
          }

          return sum;
        },
        "CUSTOMSUM",
        "Custom sum function",
      ],
    ],
  });

  // Or create a custom menu.
  univerAPI
    .createMenu({
      id: "custom-menu",
      title: "Custom Menu",
      action: () => myFunction(), // You can directly call other functions.
    })
    .appendTo("ribbon.start.others");



    setTimeout(()=> {


      // window.registerInjectCompGLOBAL(Hello2);

      window.componentManager.register('univer.sheet.cell-hello2', Hello2);

      let sheet = univerAPI.getActiveWorkbook().getActiveSheet();
      let range = sheet.getRange(1, 1, 2, 2);
      sheet.setActiveRange(range);

      console.log('range')
      let disposable = range.attachPopup({
        componentKey: 'univer.sheet.cell-hello2',
        extraProps: { alert: { type: 0, title: 'This is an Info', message: 'This is an info message' } },
      });

    }, 2000)
}

/**
 * This is a special hook function.
 *
 * It will automatically run when you the opened Univer File is newly created.
 */
function onCreate() {}

/**
 * This is a special hook function.
 *
 * It will automatically run when you the opened Univer File is about to close.
 * You can use this function to do some clean-up work, or return false to
 * prevent the file from closing.
 */
function onClose() {}

/**
 * You can define as many functions as you want in this script. They will be come entry
 * points for the Uniscript runtime to execute.
 */
async function myFunction() {
  const workbook = univerAPI.getActiveWorkbook();

  // ...
}

function Hello2() {
  console.log("h222ello");
  return (
    <div style={{
      position: 'absolute',
      // top: '50%',
      // left: '20%',
      // transform: 'translate(-40%, -50%)',
      zIndex: 10,
    }}>
      <h1>Hello222 World222</h1>
    </div>
  );
}



function Comp() {
  const Spin = univerAPI.UI.Spin;

  window.univerAPI = univerAPI;
  console.log("===button", Spin);
  const React = univerAPI.UI.React;
  return React.createElement(Spin, null, "123");
}
