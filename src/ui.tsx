import * as React from "react";
import * as ReactDOM from "react-dom";

import Home from "./views/home";
import "./ui.css";

const App = (props) => {
  const renderPage = () => {
    return <Home />;
  };

  return renderPage();
};

ReactDOM.render(<App />, document.getElementById("react-page"));
