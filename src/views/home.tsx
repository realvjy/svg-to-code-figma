// home.tsx
// 3 March, 2024

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import generate from "babel-generator";
import { transform } from "@svgr/core";
import { renderToString } from "react-dom/server";
import svgToJsx from "svg-to-jsx";
import AceEditor from "react-ace";
const template = require("lodash.template");
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
// import babelParser from '@babel/parser';
const rgbToRgba = (rgb, a = 1) =>
  rgb.replace("rgb(", "rgba(").replace(")", `, ${a})`);

const TEMPLATES = {
  functional: `import React from "react";
    
export const <%= componentName %> = (props) => (
<%=  svg %>
);
`,
};

function reactify(svg, { type = "functional" }) {
  const data = {
    parentComponent: `React.Component`,
    componentName: `Cool`,
  };

  const compile = template(TEMPLATES[type]);
  const component = compile({
    ...data,
    svg,
  });

  return component;
}

const Home = (props) => {
  const canvasRef = useRef(null);
  const [state, setState] = useState({});
  const [svg, setSvg] = useState(null);
  const [svgCode, setSvgCode] = useState(null);
  const [viewCode, setViewCode] = useState(null);
  const editorRef = useRef(null);
  const [formattedCode, setFormattedCode] = useState("");

  useEffect(() => {
    onmessage = async (event) => {
      const message = event.data.pluginMessage;
      setSvg(message.settings);
      console.log("main here", message.settings);
    };
  }, []);

  useEffect(() => {
    if (svg == null) {
      return;
      console.log(svg, "svg here");
    }

    svgToJsx(svg, function (error, jsx) {
      let newCode = reactify(jsx, { type: "functional" });

      // let extra = extra + jsx;
      setViewCode(newCode);
    });
  }, [svg]);

  function onChange(newValue) {
    console.log("change", newValue);
  }
  const MyComponent = () => {
    return <div>Hello, World!</div>;
  };
  // const ast = require('@babel/parser').parse(MyComponent.toString(), {
  //   sourceType: 'module',
  //   plugins: ['jsx'],
  // });

  // const componentCode = generate(ast, {}, MyComponent.toString());
  // console.log(componentCode.code);

  console.log(formattedCode);

  return (
    <>
      <AceEditor
        mode="javascript"
        theme="monokai"
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        value={viewCode}
        fontSize={16}
        ref={editorRef}
        wrapEnabled={false}
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          tabSize: 2,
          hScrollBarAlwaysVisible: true,
          vScrollBarAlwaysVisible: true,
        }}
      />
    </>
  );
};
export default Home;
