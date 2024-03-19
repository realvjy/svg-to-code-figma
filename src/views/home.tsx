// home.tsx
// 3 March, 2024

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import svgToJsx from "../lib/svg-to-jsx";
import { SearchIcon, WrapIcon } from "../components/icons";
import styled from "styled-components";
import AceEditor from "react-ace";
const template = require("lodash.template");
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/theme-cloud9_night";
import "ace-builds/src-noconflict/ext-language_tools";
import ace from "ace-builds/src-noconflict/ace"; // Assuming you have Ace Editor installed
import { convertToCamelCase } from "../components/helpers";
import * as copy from "copy-to-clipboard";

const rgbToRgba = (rgb, a = 1) =>
  rgb.replace("rgb(", "rgba(").replace(")", `, ${a})`);

const TEMPLATES = {
  functional: `// Generated from SVG to Code Figma Plugin
import React from "react";
    
export const <%= componentName %> = (props) => (
<%=  svg %>
);
`,
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

const Home = (props) => {
  const canvasRef = useRef(null);
  const [state, setState] = useState({});
  const [svg, setSvg] = useState(null);
  const [svgCode, setSvgCode] = useState(null);
  const [viewCode, setViewCode] = useState(null);
  const [svgName, setSvgName] = useState(null);
  const [wrap, setWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);
  const [formattedCode, setFormattedCode] = useState("");
  const [numberOfLines, setNumberOfLines] = useState(0); // State to store line count
  useEffect(() => {
    onmessage = async (event) => {
      const message = event.data.pluginMessage;
      if (message != null) {
        setSvg(message.settings);
        let componentName = convertToCamelCase(message.name);
        setSvgName(componentName);
      }
    };
  }, []);

  useEffect(() => {
    setViewCode("// Generating code...");
    if (svg == null) {
      setViewCode("// Nothing Selected. Select any object");
      return;
    }

    // Perform the conversion using svgToJsx
    svgToJsx(svg, function (error, jsx) {
      let newCode = reactify(jsx, { type: "functional", name: svgName });
      setViewCode(newCode);
    });
  }, [svg, svgName]);

  function onChange(newValue) {
    console.log("change");
  }

  function toggleWrap() {
    setWrap(!wrap);
  }

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.editor; // Access the editor instance
      const lines = editor.session.getLength();
      setNumberOfLines(lines);
    } else {
      console.warn("Editor not yet initialized, ignoring line count update");
    }
  }, [viewCode]);

  const handleCopyReact = () => {
    console.log("copying");
    try {
      copy(viewCode);
      // This code block will be executed after copy(viewCode) completes
      setCopied(true);
      // setTimeout function is called after setCopied(true) has finished
      setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch (error) {
      // Handle any errors that may occur during the copy(viewCode) operation
      console.error("Copy failed:", error);
    }
  };

  return (
    <ViewWrapper>
      <Selectors>
        <LeftSide>
          <SelectBtn className="active">
            <span>React</span>
          </SelectBtn>
          <SelectBtn className="disable">
            <span>SwiftUI</span> <Badge>Soon</Badge>
          </SelectBtn>
        </LeftSide>
        <RightSide>
          <Counter>
            <h4>Line # {numberOfLines}</h4>
          </Counter>
          <ToggleBtn className={`${wrap ? "active" : ""}`}>
            <WrapIcon size={20} onClick={toggleWrap} />
          </ToggleBtn>
        </RightSide>
      </Selectors>
      <Editor>
        <AceEditor
          mode="javascript"
          theme="cloud9_night"
          onChange={onChange}
          name="SVG_EDITOR"
          style={{ width: "100%", height: "100%", fontWeight: 100 }}
          height={"100%"}
          value={viewCode}
          fontSize={14}
          ref={editorRef}
          wrapEnabled={wrap}
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            tabSize: 2,
            useWorker: false,
            readOnly: true,
          }}
        />
        <Notify className={`${copied ? "show" : ""}`}>
          React/JSX code copied
        </Notify>
      </Editor>
      <ActionButtons>
        <CopyBtn onClick={handleCopyReact}>Copy React Code</CopyBtn>
        <Credit>
          <h4> ♥ made by </h4> <a href="https://x.com/realvjy">realvjy</a>
        </Credit>
      </ActionButtons>
    </ViewWrapper>
  );
};
export default Home;

const ViewWrapper = styled.div`
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const Selectors = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Editor = styled.div`
  /* Ace update */
  background-color: var(--bg-secondary);
  position: relative;
  padding-top: 16px;
  overflow: hidden;
  flex-grow: 1;
  .ace_editor {
    font-family: "Roboto Mono", Monaco, "Courier New", monospace;
    background-color: var(--bg-secondary);
    .ace_gutter {
      background: transparent;
      border-right: 1px solid var(--grey-alpha01);
      color: var(--grey-alpha06);
    }
  }
  .ace_scroller {
    bottom: 6px !important;
    right: 6px !important;
  }
  .ace_scrollbar {
    &::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      background-color: transparent; /* Matches ace monokai */
      border-radius: 0px;
      border-left: 1px solid var(--grey-alpha01);
      border-top: 1px solid var(--grey-alpha01);
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--grey-alpha06);
      border-radius: 10px;
      &:hover {
        background-color: var(--grey-alpha05);
      }
    }
  }
`;

const LeftSide = styled.div`
  position: relative;
`;

const RightSide = styled.div`
  display: flex;
  padding-right: 12px;
  align-items: center;
  gap: 12px;
`;

const Counter = styled.div`
  h4 {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
    color: var(--grey-alpha06);
  }
`;

const Btn = styled.button`
  appearance: none;
  border: 0px;
  box-shadow: none;
  cursor: pointer;
  white-space: nowrap;
  text-align: center;
  user-select: none;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
`;

const SelectBtn = styled(Btn)`
  font-size: 13px;
  padding: 4px 16px;
  line-height: 16px;
  display: inline-flex;
  white-space: nowrap;
  user-select: none;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  min-height: 36px;
  background: transparent;
  color: var(--text-secondary);
  gap: 4px;
  border-radius: 0;
  &.active {
    background-color: var(--bg-secondary);
    color: var(--white);
    font-weight: 600;
  }
  &.disable {
    color: var(--text-disable);
  }
`;

const Badge = styled.div`
  background: var(--purple);
  color: var(--text-primary);
  text-transform: uppercase;
  font-weight: 500;
  font-size: 10px;
  line-height: 11px;
  border-radius: 3px;
  padding: 2px 6px;
`;

const ActionButtons = styled.div`
  position: relative;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CopyBtn = styled(Btn)`
  border-radius: 0;
  width: 100%;
  appearance: none;
  border: 0px;
  box-shadow: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  padding: 4px 16px;
  line-height: 16px;
  display: inline-flex;
  white-space: nowrap;
  text-align: center;
  user-select: none;
  justify-content: center;
  border-radius: 4px;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  min-height: 36px;
  background: var(--blue);
  color: var(--white);
  gap: 4px;
  &:hover {
    background: var(--blue-dark);
  }

  &.active {
    background-color: var(--bg-secondary);
    color: var(--white);
    font-weight: 600;
  }
  &.disable {
    color: var(--text-disable);
  }
`;

const Credit = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  h4 {
    margin: 0;
    color: var(--text-secondary);
    font-weight: 400;
    font-size: 12px;
  }
  a {
    font-weight: 600;
    font-size: 12px;
    text-decoration: none;
    margin: 0;
    color: var(--text-secondary);
    &:hover {
      color: var(--text-primary);
    }
  }
`;

const ToggleBtn = styled(Btn)`
  cursor: pointer;
  line-height: 20px;
  padding: 4px;
  display: inline-flex;
  white-space: nowrap;
  text-align: center;
  user-select: none;
  justify-content: center;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 2px;
  gap: 4px;
  &.active {
    background-color: var(--grey-alpha06);
    color: var(--white);
    font-weight: 600;
  }
  &:hover {
    background: var(--grey-alpha02);
    color: var(--white);
  }
  &.disable {
    color: var(--text-disable);
  }
`;

const Notify = styled.div`
  top: 50%;
  left: 50%;
  opacity: 0;
  transform: translate(-50%, -20%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  padding: 8px 14px;
  border-radius: 4px;
  position: absolute;
  background: var(--notify-bg);
  color: var(--white);
  z-index: 99;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease-in-out;
  &.show {
    top: 50%;
    opacity: 1;
    transform: translate(-50%, -50%);
  }
`;
