// World in Numbers — router and views.
// Hash routes: #/ (overview), #/countries, #/country/<code>,
// #/compare, #/rankings, #/sources. Every control on every page works.

var appEl = document.getElementById('app');
var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a'));

var INDICATORS = [
  { key: 'population', label: 'Population', unit: 'million', fmt: fmtPop, text: function (c) { return fmtPop(c.population); } },
  { key: 'gdp', label: 'GDP', unit: 'US$ billion', fmt: fmtMoney, text: function (c) { return fmtMoney(c.gdp); } },
  { key: 'gdppc', label: 'GDP per capita', unit: 'US$', fmt: function (v) { return '$' + fmtInt(v); }, text: function (c) { return '$' + fmtInt(c.gdppc); } },
  { key: 'life', label: 'Life expectancy', unit: 'years', fmt: function (v) { return v.toFixed(1) + ' yrs'; }, text: function (c) { return c.life.toFixed(1) + ' yrs'; } },
  { key: 'area', label: 'Land area', unit: 'km\u00b2', fmt: function (v) { return fmtInt(v) + ' km\u00b2'; }, text: function (c) { return fmtInt(c.area) + ' km\u00b2'; } },
  { key: 'urban', label: 'Urban population', unit: '%', fmt: function (v) { return v + '%'; }, text: function (c) { return c.urban + '%'; } },
  { key: 'medianAge', label: 'Median age', unit: 'years', fmt: function (v) { return v.toFixed(0) + ' yrs'; }, text: function (c) { return c.medianAge + ' yrs'; } }
];

function indicator(key) {
  return INDICATORS.find(function (i) { return i.key === key; }) || INDICATORS[0];
}

function setActiveNav(route) {
  navLinks.forEach(function (a) {
    var r = a.getAttribute('data-route');
    a.classList.toggle('active', r === route || (route === 'country' && r === 'countries'));
  });
}

function sourceFootnote() {
  return '<p class="hint">Figures are rounded; population and GDP: World Bank, 2023. ' +
    'Life expectancy, median age, population history: UN World Population Prospects 2024. ' +
    'Area: UN Demographic Yearbook. See <a href="#/sources">Sources &amp; methods</a>.</p>';
}

function statTile(num, lbl, sub, cls) {
  return '<div class="stat-tile ' + (cls || '') + '"><div class="num">' + num + '</div>' +
    '<div class="lbl">' + lbl + '</div><div class="sub">' + sub + '</div></div>';
}

// ---------- overview ----------
function viewOverview() {
  setActiveNav('overview');
  var topPop = sortedBy('population', true).slice(0, 5);
  var topGdp = sortedBy('gdp', true).slice(0, 5);
  appEl.innerHTML =
    '<div class="page-head"><h1>The world, in numbers</h1>' +
    '<p class="lede">Twelve of the world\u2019s largest countries, side by side: how many people live there, ' +
    'how big their economies are, and how long people live. Every figure carries its source and year.</p></div>' +
    '<div class="stat-grid">' +
    statTile('8.12 bn', 'World population, 2023', 'UN World Population Prospects 2024', '') +
    statTile('12', 'Countries profiled', 'Over 60% of humanity between them', 'amber') +
    statTile('$105 tn', 'Combined world GDP, 2023', 'World Bank, current US$', 'green') +
    statTile('71.4 yrs', 'World life expectancy, 2023', 'UN World Population Prospects 2024', 'navy') +
    '</div>' +
    '<div class="two-col"><div class="section"><div class="card"><h3>Most populous countries, 2023</h3>' +
    '<div id="pop-chart"></div>' + sourceFootnote() + '</div></div>' +
    '<div class="section"><div class="card"><h3>Largest economies, 2023</h3>' +
    '<table class="data"><thead><tr><th>Country</th><th>GDP</th><th>Per capita</th></tr></thead><tbody>' +
    topGdp.map(function (c) {
      return '<tr><td><a href="#/country/' + c.code + '">' + c.name + '</a></td><td>' + fmtMoney(c.gdp) + '</td><td>' + '$' + fmtInt(c.gdppc) + '</td></tr>';
    }).join('') +
    '</tbody></table><p class="hint" style="margin-top:10px"><a href="#/rankings">See all rankings &rarr;</a></p></div></div></div>' +
    '<div class="section"><h2>Browse the countries</h2><p class="hint">Pick a country for its full profile, charts and sources.</p>' +
    '<div class="country-grid">' + countryCards(COUNTRIES) + '</div></div>';
  barChart(document.getElementById('pop-chart'), topPop.map(function (c) {
    return { label: c.name, value: c.population, text: fmtPop(c.population) };
  }), { accent: '#0e7490' });
}

function countryCards(list) {
  return list.map(function (c, i) {
    return '<a class="country-card" href="#/country/' + c.code + '"><h3><span class="rank">#' + (sortedBy('population', true).indexOf(c) + 1) + '</span>' + c.name + '</h3>' +
      '<div class="region">' + c.region + ' &middot; capital ' + c.capital + '</div>' +
      '<div class="mini-stats"><div><b>' + fmtPop(c.population) + '</b><span>population</span></div>' +
      '<div><b>' + fmtMoney(c.gdp) + '</b><span>GDP</span></div>' +
      '<div><b>' + c.life.toFixed(1) + ' yrs</b><span>life expectancy</span></div></div></a>';
  }).join('');
}

// ---------- countries table ----------
var tableState = { q: '', region: 'All regions', sortKey: 'population', sortDesc: true };

function viewCountries() {
  setActiveNav('countries');
  var regions = ['All regions'].concat(COUNTRIES.map(function (c) { return c.region; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
  appEl.innerHTML =
    '<div class="page-head"><h1>All countries</h1>' +
    '<p>Search, filter by region, or sort any column. Click a country name for its full profile.</p></div>' +
    '<div class="controls"><input type="search" id="q" placeholder="Search a country or capital&hellip;" value="' + tableState.q + '" aria-label="Search countries">' +
    '<select id="region" aria-label="Filter by region">' +
    regions.map(function (r) { return '<option' + (r === tableState.region ? ' selected' : '') + '>' + r + '</option>'; }).join('') +
    '</select></div>' +
    '<div class="card"><div class="table-wrap"><table class="data" id="ctable"><thead><tr>' +
    '<th><button data-sort="name">Country</button></th>' +
    INDICATORS.map(function (ind) {
      return '<th><button data-sort="' + ind.key + '">' + ind.label + '</button></th>';
    }).join('') +
    '<th><button data-sort="density">Density</button></th>' +
    '</tr></thead><tbody id="tbody"></tbody></table></div>' +
    '<p class="hint" id="count-line" style="margin-top:12px"></p>' + sourceFootnote() + '</div>';
  document.getElementById('q').addEventListener('input', function (e) { tableState.q = e.target.value; renderTable(); });
  document.getElementById('region').addEventListener('change', function (e) { tableState.region = e.target.value; renderTable(); });
  Array.prototype.forEach.call(document.querySelectorAll('#ctable th button'), function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-sort');
      if (tableState.sortKey === k) { tableState.sortDesc = !tableState.sortDesc; }
      else { tableState.sortKey = k; tableState.sortDesc = true; }
      renderTable();
    });
  });
  renderTable();
}

function renderTable() {
  var q = tableState.q.trim().toLowerCase();
  var rows = COUNTRIES.filter(function (c) {
    if (tableState.region !== 'All regions' && c.region !== tableState.region) return false;
    if (q && c.name.toLowerCase().indexOf(q) === -1 && c.capital.toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
  var k = tableState.sortKey;
  rows.sort(function (a, b) {
    var av = k === 'name' ? a.name : (k === 'density' ? density(a) : a[k]);
    var bv = k === 'name' ? b.name : (k === 'density' ? density(b) : b[k]);
    if (typeof av === 'string') return tableState.sortDesc ? bv.localeCompare(av) : av.localeCompare(bv);
    return tableState.sortDesc ? bv - av : av - bv;
  });
  var arrow = tableState.sortDesc ? ' \u25bc' : ' \u25b2';
  Array.prototype.forEach.call(document.querySelectorAll('#ctable th button'), function (b) {
    b.textContent = b.textContent.replace(/ [\u25bc\u25b2]$/, '');
    if (b.getAttribute('data-sort') === k) b.textContent += arrow;
  });
  document.getElementById('tbody').innerHTML = rows.map(function (c) {
    return '<tr><td><a href="#/country/' + c.code + '">' + c.name + '</a></td>' +
      INDICATORS.map(function (ind) { return '<td>' + ind.text(c) + '</td>'; }).join('') +
      '<td>' + fmtInt(density(c)) + ' /km\u00b2</td></tr>';
  }).join('') || '<tr><td colspan="9">No countries match that search.</td></tr>';
  document.getElementById('count-line').textContent =
    'Showing ' + rows.length + ' of ' + COUNTRIES.length + ' countries. Sorted by ' +
    (k === 'density' ? 'population density' : k === 'name' ? 'name' : indicator(k).label) +
    ' (' + (tableState.sortDesc ? 'highest first' : 'lowest first') + ').';
}

// ---------- country detail ----------
function viewCountry(code) {
  var c = byCode(code);
  if (!c) { location.hash = '#/countries'; return; }
  setActiveNav('country');
  var peers = sortedBy('gdppc', true);
  var rankPop = sortedBy('population', true).indexOf(c) + 1;
  var rankGdp = sortedBy('gdp', true).indexOf(c) + 1;
  appEl.innerHTML =
    '<div class="page-head"><div class="detail-head"><h1>' + c.name + '</h1>' +
    '<span class="region-tag">' + c.region + '</span></div>' +
    '<p>Capital: ' + c.capital + ' &middot; Ranked #' + rankPop + ' by population and #' + rankGdp + ' by GDP, of the 12 countries profiled.</p></div>' +
    '<div class="key-facts">' +
    '<div class="fact"><div class="num">' + fmtPop(c.population) + '</div><div class="lbl">Population (2023)</div><div class="src">World Bank</div></div>' +
    '<div class="fact"><div class="num">' + fmtMoney(c.gdp) + '</div><div class="lbl">GDP (2023, current US$)</div><div class="src">World Bank</div></div>' +
    '<div class="fact"><div class="num">$' + fmtInt(c.gdppc) + '</div><div class="lbl">GDP per capita (2023)</div><div class="src">World Bank</div></div>' +
    '<div class="fact"><div class="num">' + c.life.toFixed(1) + ' years</div><div class="lbl">Life expectancy at birth (2023)</div><div class="src">UN World Population Prospects 2024</div></div>' +
    '<div class="fact"><div class="num">' + fmtInt(c.area) + ' km\u00b2</div><div class="lbl">Land area</div><div class="src">UN Demographic Yearbook</div></div>' +
    '<div class="fact"><div class="num">' + fmtInt(density(c)) + ' /km\u00b2</div><div class="lbl">Population density</div><div class="src">Derived from the two figures above</div></div>' +
    '<div class="fact"><div class="num">' + c.urban + '%</div><div class="lbl">Urban population (2023)</div><div class="src">World Bank</div></div>' +
    '<div class="fact"><div class="num">' + c.medianAge + ' years</div><div class="lbl">Median age (2024)</div><div class="src">UN World Population Prospects 2024</div></div>' +
    '<div class="fact"><div class="num">' + c.life.toFixed(1) + ' vs ' + WORLD.life.toFixed(1) + '</div><div class="lbl">Life expectancy vs world average</div><div class="src">' + (c.life >= WORLD.life ? 'Above' : 'Below') + ' the world average</div></div>' +
    '</div>' +
    '<div class="note-box">' + c.note + '</div>' +
    '<div class="two-col"><div class="section"><div class="card"><h3>Population of ' + c.name + ', 1990&ndash;2023 (millions)</h3>' +
    '<div id="trend-chart"></div><p class="hint">Approximate figures, UN World Population Prospects 2024.</p></div></div>' +
    '<div class="section"><div class="card"><h3>GDP per capita &mdash; ' + c.name + ' vs the other eleven</h3>' +
    '<div id="gdppc-chart"></div><p class="hint">US$, World Bank 2023. ' + c.name + ' highlighted in amber.</p></div></div></div>' +
    '<div class="section"><p><a class="btn ghost" href="#/compare">&larr; Compare ' + c.name + ' with others</a> &nbsp; <a class="btn ghost" href="#/countries">All countries</a></p></div>';
  lineChart(document.getElementById('trend-chart'),
    [{ name: c.name, values: c.trend }],
    { xLabels: TREND_YEARS.map(String) });
  barChart(document.getElementById('gdppc-chart'), peers.map(function (p) {
    return { label: p.name, value: p.gdppc, text: '$' + fmtInt(p.gdppc), color: p.code === c.code ? '#b45309' : '#0e7490' };
  }), { barHeight: 26, labelWidth: 92 });
}

// ---------- compare ----------
var compareSel = ['chn', 'usa', 'ind'];

function viewCompare() {
  setActiveNav('compare');
  appEl.innerHTML =
    '<div class="page-head"><h1>Compare countries</h1>' +
    '<p>Pick two or three countries and see their numbers side by side. The chart updates as you pick.</p></div>' +
    '<div class="card"><h3>Choose countries</h3><div class="compare-pick">' +
    COUNTRIES.map(function (c) {
      return '<label><input type="checkbox" value="' + c.code + '"' + (compareSel.indexOf(c.code) !== -1 ? ' checked' : '') + '> ' + c.name + '</label>';
    }).join('') +
    '</div><p class="hint" id="compare-hint"></p></div>' +
    '<div class="section"><div class="card"><h3>Side by side</h3><div class="table-wrap" id="compare-table"></div></div></div>' +
    '<div class="section"><div class="card"><h3>GDP per capita (US$, 2023)</h3><div id="compare-chart"></div>' + sourceFootnote() + '</div></div>';
  Array.prototype.forEach.call(document.querySelectorAll('.compare-pick input'), function (box) {
    box.addEventListener('change', function () {
      if (box.checked) {
        if (compareSel.length >= 3) { box.checked = false; return; }
        compareSel.push(box.value);
      } else {
        if (compareSel.length <= 2) { box.checked = true; return; }
        compareSel.splice(compareSel.indexOf(box.value), 1);
      }
      renderCompare();
    });
  });
  renderCompare();
}

function renderCompare() {
  var sel = compareSel.map(byCode);
  document.getElementById('compare-hint').textContent =
    sel.length + ' selected (' + sel.map(function (c) { return c.name; }).join(', ') + '). Pick 2 or 3.';
  var rows = INDICATORS.map(function (ind) {
    return '<tr><td>' + ind.label + '</td>' + sel.map(function (c) { return '<td>' + ind.text(c) + '</td>'; }).join('') + '</tr>';
  }).join('');
  rows += '<tr><td>Population density</td>' + sel.map(function (c) { return '<td>' + fmtInt(density(c)) + ' /km\u00b2</td>'; }).join('') + '</tr>';
  document.getElementById('compare-table').innerHTML =
    '<table class="data"><thead><tr><th>Indicator (2023)</th>' +
    sel.map(function (c) { return '<th><a href="#/country/' + c.code + '">' + c.name + '</a></th>'; }).join('') +
    '</tr></thead><tbody>' + rows + '</tbody></table>';
  barChart(document.getElementById('compare-chart'), sel.map(function (c, i) {
    return { label: c.name, value: c.gdppc, text: '$' + fmtInt(c.gdppc), color: ['#0e7490', '#b45309', '#166534'][i] };
  }), { accent: '#0e7490' });
}

// ---------- rankings ----------
function viewRankings() {
  setActiveNav('rankings');
  appEl.innerHTML =
    '<div class="page-head"><h1>Rankings</h1>' +
    '<p>All twelve countries, ranked by the indicator you choose. Bars are scaled to the leader.</p></div>' +
    '<div class="controls"><select id="rank-ind" aria-label="Rank by indicator">' +
    INDICATORS.map(function (ind) { return '<option value="' + ind.key + '">' + ind.label + '</option>'; }).join('') +
    '</select></div>' +
    '<div class="card"><h3 id="rank-title"></h3><div id="rank-list"></div>' + sourceFootnote() + '</div>';
  document.getElementById('rank-ind').addEventListener('change', renderRankings);
  renderRankings();
}

function renderRankings() {
  var key = document.getElementById('rank-ind').value;
  var ind = indicator(key);
  var rows = sortedBy(key, true);
  var max = rows[0][key];
  document.getElementById('rank-title').textContent = ind.label + ' \u2014 highest first (' + ind.unit + ', 2023)';
  document.getElementById('rank-list').innerHTML = rows.map(function (c, i) {
    return '<div class="rank-row"><span class="rank-num">' + (i + 1) + '</span>' +
      '<span class="rank-name"><a href="#/country/' + c.code + '">' + c.name + '</a></span>' +
      '<span class="rank-bar"><i style="width:' + Math.max(2, c[key] / max * 100).toFixed(1) + '%"></i></span>' +
      '<span class="rank-val">' + ind.text(c) + '</span></div>';
  }).join('');
}

// ---------- sources ----------
function viewSources() {
  setActiveNav('sources');
  appEl.innerHTML =
    '<div class="page-head"><h1>Sources &amp; methods</h1>' +
    '<p>Where every number on this site comes from, and how it was prepared.</p></div>' +
    '<div class="card"><h3>Sources</h3><ul class="source-list">' +
    SOURCES.map(function (s) {
      return '<li><b>' + s.name + '</b> \u2014 ' + s.what + ' (' + s.url + ').</li>';
    }).join('') +
    '</ul><h3 style="margin-top:20px">Methods</h3><ul class="source-list">' +
    '<li>Figures are rounded for display: populations to the nearest million, GDP to the nearest US$ billion, GDP per capita to the nearest US$10.</li>' +
    '<li>Population history (1990, 2000, 2010, 2023) is approximate, taken from UN estimates and rounded to the nearest million.</li>' +
    '<li>Population density is derived on this site from the population and area figures shown, not quoted from a source.</li>' +
    '<li>All figures describe the year shown next to them. Nothing on this site is a forecast.</li>' +
    '<li>This site works fully offline: every figure, chart and page is in its own files.</li>' +
    '</ul></div>';
}

// ---------- router ----------
function route() {
  var hash = location.hash || '#/';
  var parts = hash.replace(/^#\//, '').split('/');
  window.scrollTo(0, 0);
  if (parts[0] === '' || parts[0] === 'overview') viewOverview();
  else if (parts[0] === 'countries') viewCountries();
  else if (parts[0] === 'country') viewCountry(parts[1]);
  else if (parts[0] === 'compare') viewCompare();
  else if (parts[0] === 'rankings') viewRankings();
  else if (parts[0] === 'sources') viewSources();
  else viewOverview();
}

window.addEventListener('hashchange', route);
route();
