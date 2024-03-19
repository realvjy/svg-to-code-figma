// 8 March, 24
// Selection Handle
// Author: @realvjy

/**
 * bool of whether or not currently selected is already a linked object
 */
export let isLinkedObject = false;

/**
 *
 */
export let prevData: string = "";

/**
 * @param setData
 */
export const prevDataChange = (setData): string => {
  return (prevData = setData);
};

/**
 * bool state of whether or not plugin is closed
 */
let pluginClose: boolean = false;

export const setPluginClose = (state: boolean) => {
  console.log("closed");

  pluginClose = state;
};

/**
 * do things on a selection change
 */
export const onChange = () => {
  const selection = figma.currentPage.selection;
  return selection;
};

/**
 * update ui only when selection is changed
 * @param value
 * @param selection
 * @param data
 */
export const send = (value: string, selection = null) => {
  console.log("send fuction", selection);
  if (selection != null) {
    // var svgdata = data.curve.vectorPaths[0].data;

    // if (data.curve.vectorPaths[0].data.match(/M/g).length > 1)
    //   value = "vectornetwork";
    // const width = 120;

    figma.ui.postMessage({
      type: "svg",
      selection: selection,
    });
  } else {
    figma.ui.postMessage({ type: "rest", value });
  }
};

/**
 * watch every set 300 milliseconds, if certain objects are selected, watch for changes
 */
export const timerWatch = () => {
  setTimeout(function () {
    if (!pluginClose) {
      let localselection = figma.currentPage.selection;

      send("selection", localselection);

      timerWatch();
    }
    return;
  }, 300);
};
