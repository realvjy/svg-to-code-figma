const isString = require("lodash.isstring");
import { formatter, stringify } from "./svgutil";
import { parse } from "svg-parser";
const nativeCSS = require("css-to-object");
const camelCase = require("lodash.camelcase");

const CUSTOM_ATTRIBUTES = {
  class: "className",
};

function transformStyle(style) {
  const transformed = nativeCSS(style, {
    numbers: true,
    camelCase: true,
  });

  return transformed;
}

export function transform(node) {
  // console.log(node.children[0], 'node here');

  // if (isString(node)) {
  //   return node;
  // }
  if (!node || !node.children || node.children.length === 0) {
    console.error("Invalid SVG object structure.");
    return {};
  }

  const svgElement = node.children.find((child) => child.tagName === "svg");

  if (!svgElement) {
    console.error("SVG element not found in the SVG object.");
    return {};
  }

  const attributeNames = Object.keys(svgElement.properties);
  console.log(attributeNames, "attributeNames here");
  const attributes = attributeNames.reduce((accumulator, attributeName) => {
    const attribute = svgElement.properties[attributeName];

    return {
      ...accumulator,
      [attributeName]: attribute,
    };
  }, {});

  console.log(attributes, "attributes here");

  const children = node.children.map((child) => {
    console.log(child, "child here");

    if (child.children) {
      return transform(child); // Recursively extract attributes for nested children
    } else {
      return child; // If there are no further children, return the child as is
    }
  });

  return {
    ...node,
    children,
    attributes,
  };

  // const attributeNames = Object.values(node.children[0].children[0].properties);
  // const attributes = attributeNames.reduce((accumulator, attributeName) => {
  //   const attribute = svgElement.getAttribute(attributeName);
  //   const isStyleAttribute = attributeName === 'style';
  //   const isDataAttribute = attributeName.startsWith('data-');
  //   console.log(attribute, 'attribute here');
  //   if (isDataAttribute) {
  //     return {
  //       ...accumulator,
  //       [attributeName]: attribute,
  //     };
  //   }

  //   if (isStyleAttribute) {
  //     return {
  //       ...accumulator,
  //       [attributeName]: transformStyle(attribute),
  //     };
  //   }

  //   return {
  //     ...accumulator,
  //     [camelCase(attributeName)]: attribute,
  //   };
  // }, {});

  // const children = node.children.map(transform);
  // return {
  //   ...node,
  //   children,
  //   attributes,
  // };
  // const attributes = attributeNames.reduce((accumulator, attributeName) => {
  //   const attribute = node.attributes[attributeName];
  //   const isStyleAttribute = attributeName === 'style';
  //   const isDataAttribute = attributeName.startsWith('data-');
  //   if (isDataAttribute) {
  //     return {
  //       ...accumulator,
  //       [attributeName]: attribute,
  //     };
  //   }
  //   if (isStyleAttribute) {
  //     return {
  //       ...accumulator,
  //       [attributeName]: transformStyle(attribute),
  //     };
  //   }
  //   if (CUSTOM_ATTRIBUTES[attributeName]) {
  //     return {
  //       ...accumulator,
  //       [CUSTOM_ATTRIBUTES[attributeName]]: attribute,
  //     };
  //   }
  //   return {
  //     ...accumulator,
  //     [camelCase(attributeName)]: attribute,
  //   };
  // }, {});
  // const children = node.children.map(transform);
  // return {
  //   ...node,
  //   children,
  //   attributes,
  // };
}

/**
 * Clean-up and transform SVG into valid JSX.
 * @param {string} svg SVG string
 * @param {Object} config Output component type and Prettier options.
 * @returns {string}
 */
export async function transformer(svg, config = {}) {
  console.log(svg, "svg here");
  // Define optimization options
  const svgoOptions = {
    plugins: [
      // Remove unused IDs
    ],
  };
  // const cleaned = new SVGO(svgoOptions);
  // const finals =  cleaned.optimize(svg).data;
  // const cleaned = await clean(svg, config);
  // const parsed = parse(cleaned.data);
  const parsed = parse(svg);
  const transformed = transform(parsed);
  console.log(transformed, "transformed here");

  // const morphed = stringify(transformed);
  // const formatted = formatter(morphed, config);

  return "formatted";
}
