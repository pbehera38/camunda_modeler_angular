import CustomPalette from './CustomPalette';
import CustomRenderer from './CustomRenderer';
import CustomPaletteProvider from './CustomPaletteProvider';
import CustomContextPadProvider from './CustomContextPadProvider';

export default {
  __init__: ['customPalette', 'customRenderer','paletteProvider', 'contextPadProvider'],
  customPalette: [ 'type', CustomPalette ],
  customRenderer: [ 'type', CustomRenderer ],
  paletteProvider: ["type", CustomPaletteProvider],
  contextPadProvider: [ 'type', CustomContextPadProvider ]
};