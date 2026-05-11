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

---

# Data sources for the Strike Events map (Figure 3)

`strike-events.csv` is a separate long-format file: one row per distinct strike event or geographically-clustered same-day event group, covering October 2023 — May 2026. Each row carries `attributed_source` (US / Israel / US+Israel / Iran / unknown), `target_type` (10 categorical values), `severity`, `tier`, and `source_id`. Rows tagged with `attributed_source = unknown` and `target_type = other` are predominantly inverse-direction events (Iranian or Houthi retaliation strikes on US/Israeli/Gulf targets) included so the map can show two-way kinetic activity, not only Western strikes. Coverage is densest where the underlying corpus is densest: October 2024 Israeli campaign on Iranian air defenses, September 2024 Hezbollah decapitation, June 2025 Twelve-Day War, and the 28 February 2026 — May 2026 Iran war / Hormuz dual blockade phase. Coverage is sparser for routine strikes during the long October 2023 — September 2024 attrition phase in Lebanon and the routine US/UK Operation Poseidon Archer 2024 Yemen strikes — those rows aggregate sustained tempo rather than enumerating each strike.

## ACLED 2026 Iran war event database (`ACLED-2026`)

Armed Conflict Location & Event Data Project (ACLED), academic-licensed event database, accessed via Iran-2026 country page at acleddata.com (May 2026). Provides geocoded events with attribution, date, location, fatality estimates, and source citations for the 2026 Iran war and its Stage 0 precursors. ACLED's methodology aggregates wire-service, government, and OSINT reporting; events typically appear in the database within 5-10 days of occurrence. The strike-events CSV uses ACLED-2026 as the cross-validation anchor for event-existence (date and location) but does not lift fatality figures or precise lat/lon directly. ACLED's "17 Iranian warships destroyed" running total is conservative relative to CENTCOM's "60+ ships" claim; both figures are reflected in the corpus.

## Institute for the Study of War — Iran Project (`ISW-IRAN-2026`)

Institute for the Study of War, *Iran Update* daily series, published since June 2025 with continuous coverage from 28 February 2026, accessed at understandingwar.org/research/iran-project. Daily situation reports with maps, target descriptions, weapons systems identification, and assessment of operational tempo. ISW maps are the primary open-source tool for tracking specific dated strike clusters during the war (e.g. 7 May 2026 Bandar Abbas / Qeshm coast strikes, 4 May 2026 UAE Fujairah attack). ISW reporting is generally one named source — tagged T2 here unless corroborated by a second outlet within 24 hours.

## Bellingcat / GeoConfirmed OSINT (`OSINT-2026`)

Aggregate label for OSINT verification work by Bellingcat (bellingcat.com), GeoConfirmed (geoconfirmed.azurewebsites.net), and the loose community of geolocation analysts on X/Mastodon. Their work is the primary tool for verifying specific strike coordinates and weapons signatures. Used here as a cross-reference for lat/lon precision rather than as a primary attribution source. Where lat/lon in the CSV are precise to 2 decimal places near a named target (Natanz 32.78/51.51, Khorramabad 33.49/48.36), GeoConfirmed-equivalent OSINT is the underlying anchor; coordinates flagged at city-centroid level are intentionally left at that resolution.

## IDF press releases (`IDF-PR-YYYY-MM`)

Israel Defense Forces, Spokesperson's Unit press releases, accessed at idf.il/en/mini-sites/spokesperson and via the IDF X/Telegram feeds, various dates 2023-2026. Primary-source attribution for Israeli-claimed strikes. The IDF claims attribution for most named strikes within hours; non-attribution is itself a signal (e.g. the 2024 pager attack went publicly unclaimed for weeks). Where a row's `attributed_source` is `Israel` and the only cited source is IDF-PR, tier is T2; where IDF claim is matched by a Lebanese/Iranian state acknowledgment plus an independent wire (Reuters/AFP/AP) report within 24 hours, tier is T1 ("multi" listed as `source_id`).

## DOD/CENTCOM press releases (`DOD-PR-YYYY-MM`)

US Department of Defense + US Central Command (CENTCOM) press releases and operational updates, accessed at defense.gov/News/Releases and centcom.mil (the centcom.mil domain returned HTTP 403 for several attempts during the May 2026 research period; the project corpus relies on Pentagon-press-pool readouts via Reuters/AP/Bloomberg as a secondary channel). Used for primary-source attribution of US strikes. Specific operations cited: Operation Prosperity Guardian (Dec 2023 onward), Operation Poseidon Archer (Jan 2024 onward), Operation Rough Rider (Mar-May 2025), Operation Midnight Hammer (22 Jun 2025), Operation Epic Fury (28 Feb 2026 onward), Operation Project Freedom (4 May 2026 onward). Where a row's `attributed_source` includes `US` and the only cited source is DOD-PR, tier is T2.

## Wikipedia 2026 Iran war article and cross-references (`WIKI-2026-IRAN`)

Wikipedia, *2026 Iran war* article and related pages: *List of attacks during the 2026 Iran war*, *List of ships attacked during the 2026 Iran war*, *2026 Strait of Hormuz crisis*, *Operation Epic Fury*, *Operation Project Freedom*, *Twelve-Day War*, *October 2024 Israeli strikes on Iran*, *Israel–Hezbollah conflict (2023–present)*, *2025 Israeli attacks in Yemen*, en.wikipedia.org, accessed May 2026. Wikipedia is used as the primary aggregator for low-tempo events and as a route to underlying citations. Where a row cites WIKI-2026-IRAN as `source_id`, the underlying Wikipedia citations have generally been spot-checked but not fully traced; this is the basis for tier T2 (single named aggregator) on those rows.

## Multi-source convention (`multi`)

`source_id = multi` indicates that the event is corroborated by two or more named sources within the corpus, typically: an IDF/DOD primary-source claim, a wire-service report, and an independent OSINT verification. T1 tier requires at least two of these three legs; the convention is that `multi` is reserved for tier T1 events. The Iran_war project corpus at `C:/Claude/Projects/Iran_war/output/precursors/`, `C:/Claude/Projects/Iran_war/output/hormuz/`, `C:/Claude/Projects/Iran_war/output/israel_factions/`, and `C:/Claude/Projects/Iran_war/output/iran_factions/` (~250 underlying source pieces in total) is the working set. Where a `multi` row's specific underlying citations are needed, the project corpus INDEX files at those paths route to the named primary sources.

---

## Strike-events tier discipline (specific to `strike-events.csv`)

- **T1** — multi-source primary attribution: IDF/DOD claim + wire-service report + OSINT/ISW corroboration within 24 hours. ~45% of rows. Examples: 27 Sep 2024 Nasrallah strike, 22 Jun 2025 Operation Midnight Hammer, 28 Feb 2026 opening Khamenei strike (the strike itself; specific Khamenei-killed claim is T2 per regime succession ambiguity), 4 Apr 2026 IRIS Dena torpedoing.
- **T2** — single named source attribution: IDF press release alone, ISW reporting alone, or Wikipedia 2026 Iran war article alone. ~52% of rows. This is the modal tier and applies especially to (a) sustained low-tempo strikes during long campaigns where each individual strike is not separately newsworthy, (b) post-ceasefire-violation strikes that the IDF claims but receive limited Western media coverage, and (c) routine Iranian retaliation strikes on Gulf targets where attribution is acknowledged but specific weapon and lat/lon are not OSINT-verified.
- **T3** — inferred attribution from open-source pattern: ~2% of rows. Used where a strike "fits the pattern" of an attributed actor's campaign but no specific claim exists. Example: late-September 2025 INSS-documented ceasefire violations (the strikes are documented but each is not individually attributed in primary IDF channels).
- **T4** — uncertain: <1% of rows. Reserved for events that occurred but where attribution is genuinely disputed, or where the post-cutoff status of the data makes the event itself uncertain. Example: 17 Oct 2023 Al-Ahli Hospital blast (attribution disputed between IDF and PIJ); the 2026-04-15 Bushehr "context" row (event_count=0) flagging the politically-significant Russian-staff non-targeting decision.

## Strike-events coverage gaps

- **Routine Iraqi-militia strikes 2024-2025** are aggregated at the campaign level rather than enumerated; the Iran_war corpus has stronger Lebanon/Yemen/Iran coverage than Iraq/Syria.
- **Mid-2024 to early-2025 Yemen US strikes (Operation Poseidon Archer)** are aggregated to ~7 monthly cluster rows; underlying ACLED detail is much denser.
- **Sustained-attrition Israel-Hezbollah cross-border fires (Oct 2023 — Sept 2024)** are mostly captured by the ~10,200 cross-border-attack figure cited in the Iran_war corpus; the CSV aggregates these into a few large-event rows rather than enumerating ~10,000 micro-events.
- **Specific casualty counts** are not in the CSV schema; the corpus aggregates total casualties at the operation level (1,100+ Iranian dead in 12-Day War, ~6,000 Lebanese dead by March 2025, etc).
- **Post-Day-71 events (10 May 2026 onward)** are out of scope for this CSV vintage; the Iran_war corpus working date is 9-10 May 2026.
- **Iran-aligned militia strikes in Iraq/Syria targeting US bases** (Tower 22 Jan 2024, etc.) are partially captured as inverse events; the underlying corpus has stronger US-strikes-on-them than them-strikes-on-US coverage.
