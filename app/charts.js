// World in Numbers — small SVG chart builders (no libraries, no network).
// barChart(el, rows, opts) renders a horizontal bar chart.
// lineChart(el, series, opts) renders a multi-series line chart.
// Both return nothing; they replace the element's innerHTML.

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function barChart(el, rows, opts) {
  opts = opts || {};
  var max = Math.max.apply(null, rows.map(function (r) { return r.value; }));
  var w = opts.width || 640, barH = opts.barHeight || 30, labelW = opts.labelWidth || 110;
  var h = rows.length * barH + 14;
  var accent = opts.accent || '#0e7490';
  var out = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img" aria-label="Bar chart">';
  rows.forEach(function (r, i) {
    var y = 7 + i * barH;
    var bw = Math.max(2, (w - labelW - 90) * r.value / max);
    var fill = r.color || accent;
    out += '<text x="0" y="' + (y + 15) + '" class="chart-label">' + esc(r.label) + '</text>';
    out += '<rect x="' + labelW + '" y="' + y + '" width="' + bw.toFixed(1) + '" height="20" rx="4" fill="' + fill + '"/>';
    out += '<text x="' + (labelW + bw + 8) + '" y="' + (y + 15) + '" class="chart-value">' + esc(r.text) + '</text>';
  });
  out += '</svg>';
  el.innerHTML = out;
}

function lineChart(el, series, opts) {
  opts = opts || {};
  var w = opts.width || 640, h = opts.height || 260;
  var padL = 52, padR = 16, padT = 14, padB = 30;
  var all = [];
  series.forEach(function (s) { s.values.forEach(function (v) { all.push(v); }); });
  var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
  var span = max - min || 1;
  min -= span * 0.12; max += span * 0.12;
  var xs = opts.xLabels;
  function X(i) { return padL + (w - padL - padR) * i / (xs.length - 1); }
  function Y(v) { return padT + (h - padT - padB) * (1 - (v - min) / (max - min)); }
  var colors = ['#0e7490', '#b45309', '#166534', '#7c3aed', '#be185d', '#334155'];
  var out = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img" aria-label="Line chart">';
  // gridlines with value labels
  for (var g = 0; g <= 4; g++) {
    var gv = min + (max - min) * g / 4;
    var gy = Y(gv);
    out += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + gy.toFixed(1) + '" stroke="#e2e8f0" stroke-width="1"/>';
    out += '<text x="' + (padL - 6) + '" y="' + (gy + 4).toFixed(1) + '" class="chart-axis" text-anchor="end">' + fmtInt(Math.round(gv)) + '</text>';
  }
  xs.forEach(function (x, i) {
    out += '<text x="' + X(i).toFixed(1) + '" y="' + (h - 8) + '" class="chart-axis" text-anchor="middle">' + esc(x) + '</text>';
  });
  series.forEach(function (s, si) {
    var pts = s.values.map(function (v, i) { return X(i).toFixed(1) + ',' + Y(v).toFixed(1); }).join(' ');
    var c = colors[si % colors.length];
    out += '<polyline points="' + pts + '" fill="none" stroke="' + c + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    s.values.forEach(function (v, i) {
      out += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3.5" fill="' + c + '"/>';
    });
    var last = s.values[s.values.length - 1];
    out += '<text x="' + (w - padR + 2) + '" y="' + (Y(last) + 4).toFixed(1) + '" class="chart-legend" fill="' + c + '"></text>';
  });
  out += '</svg>';
  // legend under the chart
  out += '<div class="chart-legend-row">' + series.map(function (s, si) {
    return '<span class="legend-item"><span class="legend-swatch" style="background:' + colors[si % colors.length] + '"></span>' + esc(s.name) + '</span>';
  }).join('') + '</div>';
  el.innerHTML = out;
}
