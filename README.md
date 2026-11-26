# World in Numbers — National Statistics

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![Rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/xiacai520/national-stats-site-01/rank.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)
[![Reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/xiacai520/national-stats-site-01/reward.svg)](https://make.fun/c/best-national-statistics-site-20261126-0539)

A national statistics site that runs entirely offline in a desktop or phone
browser, from plain static files under `app/` — no build step, no network
requests. Twelve of the world's largest countries, side by side.

## What it does

- **Overview** — world totals, the five most populous countries as a bar
  chart, and the five largest economies in a table.
- **Countries** — search by country or capital, filter by region, and sort
  every column of the full indicator table.
- **Country profiles** — population, GDP, GDP per capita, life expectancy,
  land area, density, urban share and median age, with a 1990–2023
  population trend chart and a GDP-per-capita chart against the other
  eleven countries.
- **Compare** — pick two or three countries for a side-by-side table and
  chart.
- **Rankings** — all twelve countries ranked by any indicator.
- **Sources & methods** — where every figure comes from and how it was
  prepared.

## Data

Every figure is a real published indicator, rounded for display and dated:
population and GDP from the World Bank (World Development Indicators, 2023);
life expectancy, median age and population history from the UN World
Population Prospects 2024; land area from the UN Demographic Yearbook.
Population density is derived on the site from the population and area
figures shown. Nothing is a forecast.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored `vendor/makefun-frontend.ts`.

## License

MIT — see [LICENSE](LICENSE).
