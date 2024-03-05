// @realvjy

import { convertToSVG } from './components/helpers';

// 3 March, 2024
export type PluginSettings = {
  framework: 'react';
  jsx: boolean;
};

export const run = async (settings: PluginSettings) => {
  const selection = figma.currentPage.selection;
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({
      type: 'empty',
    });
    return;
  }
  let result = '';
  let svgCode = null;
  const selectedNode = selection[0];
  switch (settings.framework) {
    case 'react':
      result = 'react';
      svgCode = await convertToSVG(selectedNode);
      console.log(svgCode, 'svg here');
  }

  figma.ui.postMessage({
    type: 'code',
    data: result,
    settings: svgCode,
  });
};
switch (figma.mode) {
  case 'default':
  case 'inspect':
    figma.showUI(__html__, { width: 450, height: 550, themeColors: true });

    console.log('Inspect mode');
    run({ framework: 'react', jsx: true });
    break;
  case 'codegen':
    console.log('Codegen mode');

    break;
  default:
    break;
}
