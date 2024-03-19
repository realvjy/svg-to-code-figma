// @realvjy
import { useEffect, useState, useRef } from "react";
import { convertToCamelCase, convertToSVG } from "./components/helpers";
import svgToJsx from "./lib/svg-to-jsx";
const template = require("lodash.template");

import * as selection from "./lib/selection";

/**
 * current selection stored so its accessible later
 */
let SelectionNodes: readonly SceneNode[] = [];

// 3 March, 2024
export type PluginSettings = {
  framework: "react";
  jsx: boolean;
};

async function getUserModePreference() {
  const storedMode = await figma.clientStorage.getAsync("preferredMode");
  return storedMode || "light"; // Default to light mode if no preference exists
}

async function setUserModePreference(mode: "light" | "dark") {
  await figma.clientStorage.setAsync("preferredMode", mode);
}

export const standardMode = async (settings: PluginSettings) => {
  figma.showUI(__html__, { width: 400, height: 850, themeColors: true });
  // Subscribe to the selectionchange event to run the code when the selection changes
  onSelectionChange();
  figma.on("selectionchange", async () => {
    // Code that should run when the selection changes
    onSelectionChange();
  });

  async function onSelectionChange() {
    console.log("changed");
    SelectionNodes = selection.onChange();

    if (SelectionNodes.length === 0) {
      figma.ui.postMessage({
        type: "empty",
      });
      return;
    }

    let result = "";
    let svgCode = null;
    const selectedNode = SelectionNodes[0];
    switch (settings.framework) {
      case "react":
        result = "react";
        svgCode = await convertToSVG(selectedNode);
        break;
    }

    figma.ui.postMessage({
      type: "code",
      name: selectedNode.name,
      data: result,
      settings: svgCode,
    });
  }
};

function reactify(svg, { type = "functional", name }) {
  const data = {
    parentComponent: `React.Component`,
    componentName: `${name}`,
  };

  const compile = template(TEMPLATES[type]);
  const component = compile({
    ...data,
    svg,
  });

  return component;
}

figma.ui.onmessage = (msg) => {};
const TEMPLATES = {
  functional: `// Generated from SVG to React Figma Plugin
import React from "react";
    
export const <%= componentName %> = (props) => (
<%=  svg %>
);
`,
};
let code = "";
const codegenMode = async (settings: PluginSettings) => {
  figma.codegen.on("generate", async (e) => {
    code = await onSelectionChange(e.node);
    return [
      {
        title: "SVG to JSX",
        language: "JAVASCRIPT",
        code: code,
      },
    ];
  });

  async function onSelectionChange(node) {
    if (!node) {
      figma.ui.postMessage({
        type: "empty",
      });
      return "";
    }

    const svgCode = await convertToSVG(node);
    const jsxCode = await new Promise<void>((resolve, reject) => {
      svgToJsx(svgCode, function (error, jsx) {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(jsx);
        }
      });
    });

    const componentName = convertToCamelCase(node.name);
    return reactify(jsxCode, {
      type: "functional",
      name: componentName,
    });
  }
};

figma.ui.on("message", async (msg) => {});

switch (figma.mode) {
  case "default":
  case "inspect":
    console.log("Inspect mode");
    SelectionNodes = selection.onChange();

    standardMode({ framework: "react", jsx: true });
    break;
  case "codegen":
    console.log("Codegen mode");
    codegenMode({ framework: "react", jsx: true });
    break;
  default:
    break;
}

// run timerwatch when plugin starts
// selection.timerWatch();

figma.on("close", () => {
  console.log("closing");

  selection.setPluginClose(true);
});
