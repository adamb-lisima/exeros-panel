const generateColorClass = variable => () => `var(--${variable})`;

const colors = {
  white: generateColorClass('white'),
  cultured: generateColorClass('cultured'),
  black: generateColorClass('black'),
  'chinese-white': generateColorClass('chinese-white'),
  'dust-storm': generateColorClass('dust-storm'),
  platinum: generateColorClass('platinum'),
  'light-steel-blue': generateColorClass('light-steel-blue'),
  'anti-flash-white': generateColorClass('anti-flash-white'),
  'chinese-silver': generateColorClass('chinese-silver'),
  manatee: generateColorClass('manatee'),
  'bright-gray': generateColorClass('bright-gray'),
  arsenic: generateColorClass('arsenic'),
  'dark-electric-blue': generateColorClass('dark-electric-blue'),
  'sonic-silver': generateColorClass('sonic-silver'),
  honeydew: generateColorClass('honeydew'),
  'outer-space': generateColorClass('outer-space'),
  'old-lace': generateColorClass('old-lace'),
  'dim-gray': generateColorClass('dim-gray'),
  quartz: generateColorClass('quartz'),
  carmel: generateColorClass('carmel'),
  transparent: generateColorClass('transparent'),
  'new-gray': generateColorClass('new-gray'),
  'new-gray-50': generateColorClass('new-gray-50'),
  'new-gray-100': generateColorClass('new-gray-100'),
  'new-gray-200': generateColorClass('new-gray-200'),
  'new-gray-300': generateColorClass('new-gray-300'),
  'new-gray-400': generateColorClass('new-gray-400'),
  'new-gray-500': generateColorClass('new-gray-500'),
  'new-gray-600': generateColorClass('new-gray-600'),
  'new-gray-700': generateColorClass('new-gray-700'),
  'new-gray-800': generateColorClass('new-gray-800'),
  'new-gray-900': generateColorClass('new-gray-900'),

  'main-primary': generateColorClass('main-primary'),
  'main-primary--10': generateColorClass('main-primary--10'),
  'main-primary--30': generateColorClass('main-primary--30'),
  'extra-one': generateColorClass('extra-one'),
  'extra-one--10': generateColorClass('extra-one--10'),
  'extra-one--30': generateColorClass('extra-one--30'),
  'extra-two': generateColorClass('extra-two'),
  'extra-two--10': generateColorClass('extra-two--10'),
  'extra-two--30': generateColorClass('extra-two--30'),
  'extra-three': generateColorClass('extra-three'),
  'extra-three--10': generateColorClass('extra-three--10'),
  'extra-three--30': generateColorClass('extra-three--30'),
  'extra-four': generateColorClass('extra-four'),
  'extra-four--10': generateColorClass('extra-four--10'),
  'extra-four--30': generateColorClass('extra-four--30')
};

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts,tsx}'],
  theme: {
    colors,
    flex: {
      auto: '1 1 auto',
      1: '1 1 0',
      2: '2 2 0'
    },
    fill: {
      current: 'currentColor'
    },
    stroke: {
      current: 'currentColor'
    },
    extend: {
      fontSize: {
        '2xs': ['0.625rem', '0.75rem']
      }
    }
  },
  plugins: []
};
