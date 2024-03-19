const isPlainObject = require("lodash.isplainobject");
const isString = require("lodash.isstring");
const camelCase = require("lodash.camelcase");
const nativeCSS = require("css-to-object");
const template = require("lodash.template");

/**
 * React component templates.
 * @readonly
 * @type {Map<string, string>}
 */
const TEMPLATES = {
  class: `
    import React from "react";

    class Icon extends <%= parentComponent %> {
      render() {
        return <%= svg %>;
      }
    }

    export default Icon;
  `,
  functional: `
    import React from "react";
    
    function Icon() {
      return <%= svg %>;
    }

    export default <%= exportComponent %>;
  `,
};

/**
 * Creates React component.
 * @param {string} svg Transformed SVG string.
 * @param {string="functional","class"} config.type Desired component type.
 * @return {string}
 */
function reactify(svg, { type = "functional", memo }) {
  const data = {
    parentComponent: memo ? `React.PureComponent` : `React.Component`,
    exportComponent: memo ? `React.memo(Icon)` : `Icon`,
  };

  const compile = template(TEMPLATES[type]);
  const component = compile({
    ...data,
    svg,
  });

  return component;
}

/**
 * Stringify style.
 * @param {Object=} style Node style.
 * @returns {string}
 */
function stringifyStyle(style = {}) {
  const proprietyNames = Object.keys(style);

  return proprietyNames.reduce((accumulator, proprietyName) => {
    const propriety = style[proprietyName];
    const isStringPropriety = isString(propriety);

    if (isStringPropriety) {
      return accumulator + `${proprietyName}: "${propriety}", `;
    }

    return accumulator + `${proprietyName}: ${propriety}, `;
  }, String());
}

/**
 * Stringify attributes.
 * @param {Object=} attributes Node attributes.
 * @returns {string}
 */
function stringifyAttributes(attributes = {}) {
  const attributeNames = Object.keys(attributes);

  return attributeNames.reduce((accumulator, attributeName) => {
    const attribute = attributes[attributeName];
    const isStyleAttribute = isPlainObject(attribute);

    if (isStyleAttribute) {
      return (
        accumulator + ` ${attributeName}={{ ${stringifyStyle(attribute)} }}`
      );
    }

    return accumulator + ` ${attributeName}="${attribute}"`;
  }, String());
}

/**
 * Stringify SVG tree.
 * @param {Object} node Root node.
 * @returns {string}
 */
export function stringify(node) {
  if (isString(node)) {
    return node;
  }

  const attributes = stringifyAttributes(node.attributes);
  const buffer = `<${node.name}${attributes}>`;

  const childrensBuffer = node.children.reduce((accumulator, childrenNode) => {
    return accumulator + stringify(childrenNode);
  }, buffer);

  return childrensBuffer + `</${node.name}>`;
}
