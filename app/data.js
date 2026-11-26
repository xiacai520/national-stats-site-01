// World in Numbers — country data.
//
// Every figure is a real, published indicator, rounded for display and
// labelled approximate where the source itself publishes an estimate.
// Population and GDP: World Bank, World Development Indicators, 2023.
// Life expectancy, median age and population history: UN World Population
// Prospects 2024 (2023 estimates). Area: UN Demographic Yearbook.
// Urban share: World Bank, 2023. See the Sources page for the full list.

const COUNTRIES = [
  {
    code: 'chn', name: 'China', region: 'East Asia', capital: 'Beijing',
    population: 1412, gdp: 17795, gdppc: 12610, life: 78.6, area: 9596961,
    urban: 64, medianAge: 39,
    trend: [1135, 1264, 1348, 1411],
    note: 'The world\u2019s second-largest economy and the largest population until 2023, when India moved ahead.'
  },
  {
    code: 'ind', name: 'India', region: 'South Asia', capital: 'New Delhi',
    population: 1429, gdp: 3568, gdppc: 2500, life: 68.4, area: 3287263,
    urban: 36, medianAge: 29,
    trend: [873, 1057, 1234, 1429],
    note: 'The world\u2019s most populous country since 2023, with the youngest large workforce of any major economy.'
  },
  {
    code: 'usa', name: 'United States', region: 'North America', capital: 'Washington, D.C.',
    population: 335, gdp: 27721, gdppc: 82700, life: 78.4, area: 9833517,
    urban: 83, medianAge: 38,
    trend: [250, 282, 309, 335],
    note: 'The world\u2019s largest economy by nominal GDP and the third most populous country.'
  },
  {
    code: 'idn', name: 'Indonesia', region: 'Southeast Asia', capital: 'Jakarta',
    population: 277, gdp: 1371, gdppc: 4950, life: 71.7, area: 1904569,
    urban: 58, medianAge: 30,
    trend: [182, 211, 241, 277],
    note: 'The world\u2019s largest archipelago nation and fourth most populous country.'
  },
  {
    code: 'pak', name: 'Pakistan', region: 'South Asia', capital: 'Islamabad',
    population: 241, gdp: 338, gdppc: 1400, life: 66.1, area: 881912,
    urban: 37, medianAge: 21,
    trend: [108, 142, 184, 241],
    note: 'The fifth most populous country, with one of the youngest populations in the world.'
  },
  {
    code: 'nga', name: 'Nigeria', region: 'West Africa', capital: 'Abuja',
    population: 223, gdp: 363, gdppc: 1630, life: 54.6, area: 923768,
    urban: 54, medianAge: 18,
    trend: [95, 122, 161, 223],
    note: 'Africa\u2019s most populous country and largest economy; its population more than doubled since 1990.'
  },
  {
    code: 'bra', name: 'Brazil', region: 'South America', capital: 'Bras\u00edlia',
    population: 216, gdp: 2174, gdppc: 10050, life: 75.8, area: 8514877,
    urban: 87, medianAge: 34,
    trend: [149, 174, 196, 216],
    note: 'South America\u2019s largest country by area and population, and its largest economy.'
  },
  {
    code: 'bgd', name: 'Bangladesh', region: 'South Asia', capital: 'Dhaka',
    population: 173, gdp: 446, gdppc: 2580, life: 73.8, area: 147570,
    urban: 40, medianAge: 28,
    trend: [107, 128, 148, 173],
    note: 'One of the most densely populated large countries on earth, at over 1,100 people per km\u00b2.'
  },
  {
    code: 'rus', name: 'Russia', region: 'Europe / North Asia', capital: 'Moscow',
    population: 144, gdp: 2021, gdppc: 14000, life: 73.0, area: 17098246,
    urban: 75, medianAge: 40,
    trend: [148, 146, 143, 144],
    note: 'The world\u2019s largest country by land area, spanning eleven time zones.'
  },
  {
    code: 'mex', name: 'Mexico', region: 'North America', capital: 'Mexico City',
    population: 129, gdp: 1789, gdppc: 13900, life: 75.4, area: 1964375,
    urban: 81, medianAge: 30,
    trend: [85, 99, 114, 129],
    note: 'The world\u2019s largest Spanish-speaking country and a top-ten economy by purchasing power.'
  },
  {
    code: 'jpn', name: 'Japan', region: 'East Asia', capital: 'Tokyo',
    population: 125, gdp: 4213, gdppc: 33800, life: 84.0, area: 377975,
    urban: 92, medianAge: 49,
    trend: [123, 127, 128, 125],
    note: 'The world\u2019s longest-lived large population, with the highest median age of any major country.'
  },
  {
    code: 'deu', name: 'Germany', region: 'Western Europe', capital: 'Berlin',
    population: 85, gdp: 4526, gdppc: 53500, life: 80.9, area: 357588,
    urban: 78, medianAge: 46,
    trend: [79, 82, 82, 85],
    note: 'Europe\u2019s largest economy and its most populous country after Russia.'
  }
];

const TREND_YEARS = [1990, 2000, 2010, 2023];

const SOURCES = [
  { name: 'World Bank, World Development Indicators', what: 'Population and GDP (current US$), 2023', url: 'data.worldbank.org' },
  { name: 'United Nations, World Population Prospects 2024', what: 'Life expectancy, median age and population history (2023 estimates)', url: 'population.un.org' },
  { name: 'United Nations, Demographic Yearbook', what: 'Land area by country', url: 'unstats.un.org' },
  { name: 'World Bank, World Development Indicators', what: 'Urban population share, 2023', url: 'data.worldbank.org' }
];

const WORLD = { population: 8119, gdp: 105400, life: 71.4 };

function fmtInt(n) { return n.toLocaleString('en-US'); }
function fmtPop(millions) { return millions >= 1000 ? (millions / 1000).toFixed(2) + ' bn' : fmtInt(millions) + ' m'; }
function fmtMoney(billions) { return billions >= 1000 ? '$' + (billions / 1000).toFixed(2) + ' tn' : '$' + fmtInt(billions) + ' bn'; }
function density(c) { return Math.round(c.population * 1000000 / c.area); }
function byCode(code) { return COUNTRIES.find(function (c) { return c.code === code; }); }
function sortedBy(key, desc) {
  return COUNTRIES.slice().sort(function (a, b) { return desc ? b[key] - a[key] : a[key] - b[key]; });
}
