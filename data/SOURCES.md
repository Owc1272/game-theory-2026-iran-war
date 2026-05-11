# Data sources for the Timelines page

Every row in `country-metrics.csv` carries a `source_id` resolving to one of the entries below. The `source_tier` column flags how confident we are in the value: T1 (multi-source agreement, ~5%), T2 (single named authoritative source), T3 (derived inference), T4 (rough estimate or war-period flux).

The CSV covers two families of metrics:

- **Energy** (`oil_exports`, `oil_production`, `gas_exports`, `gas_production`) — sourced from the energy series below (`EI-2024`, `EIA-IES-2025`, `EIA-STEO-2026`, `OPEC-ASB-2024`, `IEA-OMR-2026`, `PROJ-DB`).
- **Demographics, wealth, and military** (`population`, `gdp_nominal_usd`, `gdp_per_capita_usd`, `gdp_per_capita_ppp`, `oil_rents_pct_gdp`, `trade_pct_gdp`, `unemployment_rate`, `military_spending_usd`, `military_spending_pct_gdp`) — sourced from `WB-WDI-2024` (World Bank) and `SIPRI-MILEX-2024`. IMF WEO October 2024 (`IMF-WEO-2024-Oct`) is the intended cross-validation source but its public API is bot-blocked, so it is currently used only as a citation anchor in the page footer.

---

## Energy Institute Statistical Review of World Energy (`EI-2024`)

Energy Institute, in collaboration with KPMG and Kearney, *Statistical Review of World Energy 2024*, 73rd edition (June 2024). The successor series to the BP Statistical Review of World Energy (BP transferred stewardship to the Energy Institute in 2023). Public PDF and Excel workbook at energyinst.org/statistical-review. Provides annual oil and gas production, consumption, and trade by country from 1965 to 2023, with consistent methodology and unit conversions across the series. This is the canonical multi-decade cross-country reference used throughout academic and industry analysis.

## EIA International Energy Statistics (`EIA-IES-2025`)

US Energy Information Administration, *International Energy Statistics database*, accessed May 2026. eia.gov/international. Country-level petroleum and natural gas production, consumption, exports, and imports, generally 1980 onward. Used here for 2024 actuals (where the EI vintage stops at 2023) and to validate or supplement the EI series. The two are largely consistent within ~5% on annual aggregates, which is the basis of T1 tagging.

## EIA Short-Term Energy Outlook (`EIA-STEO-2026`)

US Energy Information Administration, *Short-Term Energy Outlook*, April 2026 release. eia.gov/outlooks/steo. Forward-looking forecast for 2025-2026 covering production, consumption, and prices for major countries. Used for 2025-2026 forecast values where war-period data are not yet final. Tagged T2 (single authoritative forecast) or T4 (war-period flux where pre-war forecast is overtaken by events).

## OPEC Annual Statistical Bulletin (`OPEC-ASB-2024`)

Organization of the Petroleum Exporting Countries, *Annual Statistical Bulletin 2024* (June 2024). opec.org/data-graphs. OPEC member-country detail on production, exports, refinery throughput, and proven reserves. Used here as a cross-reference for OPEC member 2024 export figures (Saudi Arabia, UAE, Kuwait, Qatar) where it agrees with EI within ~5%.

## IEA Oil Market Report (`IEA-OMR-2026`)

International Energy Agency, *Oil Market Report*, monthly editions, March and April 2026. iea.org/reports/oil-market-report. The canonical monthly tracking of OPEC+ output, OECD inventories, and the supply-demand balance. Used here for 2026 war-period country-level production deltas, drawn through the project's internal `oil_gas_db` (the IEA OMR April 2026 edition documents the post-28-Feb-2026 collapse in Gulf production: Iraq -66%, Saudi Arabia -30%, UAE -35%, Kuwait -53%, Qatar oil -80%, Bahrain to zero).

## Project internal database (`PROJ-DB`)

Internal project database at `Iran_war/output/oil_gas_db/database.csv` (419 rows, built May 2026). Aggregates IEA, EIA, OPEC, JODI, Kpler, Vortexa, Reuters, Bloomberg, and national agency values for war-period 2024-2026 detail. Each underlying value carries its own confidence flag in the source database. Used here for 2024-2026 annual values that the public reference series have not yet absorbed (notably the Iran 2024-2025 Kpler-tracked export series and the war-period flux figures for 2026).

## World Bank World Development Indicators (`WB-WDI-2024`)

World Bank, *World Development Indicators*, 2024 vintage (databank.worldbank.org/source/world-development-indicators), accessed via the public REST API at api.worldbank.org/v2 in May 2026. Provides annual country-level series for population (`SP.POP.TOTL`, 1960-onward), nominal GDP in current US dollars (`NY.GDP.MKTP.CD`), GDP per capita in current US dollars (`NY.GDP.PCAP.CD`), GDP per capita at PPP in current international dollars (`NY.GDP.PCAP.PP.CD`, 1990-onward), oil rents as a share of GDP (`NY.GDP.PETR.RT.ZS`), trade as a share of GDP (`NE.TRD.GNFS.ZS`), and the modeled ILO unemployment rate (`SL.UEM.TOTL.ZS`, 1991-onward). The Bank's country aggregates use national accounts data harmonised against the System of National Accounts 2008 framework. Coverage gaps in the Russian Federation series before 1989, in pre-2003 Iraq, and in conflict-period Syria and Yemen reflect the underlying national agencies, not the API.

## IMF World Economic Outlook, October 2024 (`IMF-WEO-2024-Oct`)

International Monetary Fund, *World Economic Outlook*, October 2024 vintage (imf.org/en/Publications/WEO), accessed via the WEO Database download. Used as the intended cross-validation source for nominal GDP, GDP per capita, and the 2025-2026 projection horizon that the World Bank does not yet publish. The IMF series is generally consistent with the World Bank to within ~5% on country-year cells where both report; where the two diverge by more, the difference is usually traceable to different exchange-rate handling for currencies under capital controls — most consequentially Iran, where the WEO October 2024 vintage uses the official rial rate, producing GDP figures that many analysts view as overstated. This source is currently held as a footer citation rather than a programmatic input because the IMF datamapper API blocks non-browser clients; future revisions can integrate the WEO Excel download directly.

## SIPRI Military Expenditure Database (`SIPRI-MILEX-2024`)

Stockholm International Peace Research Institute, *Military Expenditure Database*, 1949-2025 release v1.2 (April 2026), DOI 10.55163/CQGC9685, available at sipri.org/databases/milex. The canonical multi-decade cross-country reference for military spending. Provides figures in local currency, current US dollars, constant 2024 US dollars, share of GDP, share of government expenditure, and per capita. The CSV uses the Current US$ sheet for `military_spending_usd` (converted from millions to dollars) and the Share of GDP sheet for `military_spending_pct_gdp` (converted from fraction to percent). For Russia, the USSR aggregate is used for 1979-1991 and the Russia row from 1992 onward; SIPRI flags 1991-1992 as unavailable for both, which appears as a gap in the CSV. Iran 1979-1989 figures cover the revolution and Iran-Iraq war and are SIPRI estimates rather than reported budgets.

---

## Notes on tier discipline

- **T1** is reserved for values where two independent authoritative sources agree to within roughly five percent — for energy, the Energy Institute and EIA series; for demographics/wealth, World Bank and IMF WEO. Energy T1 applies to most 2000-2023 country-year cells for the major producers; the demographics/wealth metrics carry no T1 rows in the current vintage because the IMF WEO API is bot-blocked and we have not yet wired in the Excel download for cross-validation. All World-Bank-only and SIPRI-only rows are accordingly tagged T2.
- **T2** covers values published by a single named authoritative source — for energy, typically the EI series alone where EIA is silent (most 1979-1999 cells), or OPEC ASB for member-country exports detail; for demographics/wealth, the World Bank WDI rows; for military, the SIPRI MILEX rows. This is the modal tier in the CSV.
- **T3** flags genuinely derived values or values where the named source is itself imputing through extreme distortion. Energy: Iran's 1979-1989 production, Iraq's 1991-1995 sanctions-period exports (zero by sanction), Syria 2012-onward, Yemen 2015-onward. Demographics/wealth: Iran 2019-onward GDP-derived metrics (sanctions and parallel exchange rate distort the official rial-USD conversion that World Bank and IMF still use), Syria 2011-onward macro series, Yemen 2014-onward macro series, Iraq 1990-1995 macro series.
- **T4** flags rough estimates or war-period flux. Energy: Iran shadow-fleet exports under sanctions, 2025-2026 forecasts pre-empted by events, war-period 2026 monthly-to-annual smoothing. Demographics/wealth/military: USSR-era Russia rows 1979-1991 (SIPRI uses the USSR aggregate which materially includes non-Russian republics; the value is reported under "Russia" for visualization continuity but is structurally not the same entity).

## Notes on coverage gaps

- **Lebanon and Jordan** are absent from the energy metrics (oil/gas exports and production are negligible) but present in the demographics, wealth, and military metrics. This brings the data-bearing country count to 18.
- **Pre-1991 Russia** is reported using the USSR aggregate for both energy (EI series) and military spending (SIPRI USSR row), labeled `Russia` for visualization continuity. SIPRI flags 1991-1992 military spending as unavailable for both USSR and Russia, producing a two-year gap in the `military_spending_*` series that should not be linearly interpolated. World Bank macroeconomic series for Russia begin in 1989 (population) or 1990 (GDP); pre-1989 Russia is genuinely missing from the demographics/wealth columns.
- **Iran 1979-1981** energy production drops from the 5+ mb/d 1978 average to ~1.3 mb/d in 1981 — this reflects the revolution's disruption of the National Iranian Oil Company plus the Iran-Iraq war's Abadan refinery hit. T3 tier reflects that contemporaneous reporting was uncertain. On the demographics/wealth side, Iran's GDP series shows the 1986-1989 contraction associated with the war's late phase and the 2013-2015 sanctions trough; Iran 2019-onward GDP figures are tagged T3 because the official rial rate inflates the dollar conversion relative to market rates.
- **Syria post-2011** and **Yemen post-2014**: the World Bank stopped receiving regular macroeconomic submissions from these countries during the civil-war years. Where values are still reported, they are estimates with wide uncertainty; the CSV tags them T3 to surface this.
- **GDP per capita PPP** begins in 1990 across all countries because the World Bank PPP series is anchored to the 1990 ICP round.
- **Unemployment rate** begins in 1991 because the World Bank uses the modeled ILO series, which starts in 1991.
- **2025-2026 demographics/wealth projections** are not present because the World Bank vintage stops at 2024 and the IMF WEO API was not reachable. The page should expect these cells to be empty for the new metrics; the energy metrics still have 2025-2026 values from EIA-STEO and PROJ-DB. SIPRI provides 2025 military spending values which are present in the CSV.
- **2026 figures** for energy are necessarily provisional: the IEA OMR May edition releases 13 May 2026 and will revise the March-April actuals further. The CSV's 2026 rows should be treated as the best available snapshot as of 9 May 2026.
