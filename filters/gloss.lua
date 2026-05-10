-- gloss.lua — Quarto Lua filter for glossary popovers.
--
-- Transforms `[term text]{.gloss data-gloss="id"}` spans into Bootstrap-popover
-- buttons whose title and content come from `meta.glossary` (loaded via
-- `metadata-files: [glossary.yml]` in _quarto.yml).
--
-- The popover is initialized client-side by assets/gloss-init.js.

local glossary = {}

-- Helper: stringify a Pandoc meta value, defaulting to empty string.
local function meta_to_string(val)
  if val == nil then return "" end
  return pandoc.utils.stringify(val)
end

-- Helper: HTML-attribute-escape (single + double quotes, ampersand, angle brackets).
local function attr_escape(s)
  if s == nil then return "" end
  s = s:gsub("&", "&amp;")
  s = s:gsub("<", "&lt;")
  s = s:gsub(">", "&gt;")
  s = s:gsub('"', "&quot;")
  s = s:gsub("'", "&#39;")
  -- Collapse newlines/whitespace runs so YAML block scalars don't introduce
  -- raw line breaks into the data-attribute value.
  s = s:gsub("[\r\n]+", " ")
  s = s:gsub("%s+", " ")
  return s
end

-- Pass 1: read meta.glossary into the local lookup table.
function Meta(meta)
  if meta.glossary == nil then return nil end
  for _, entry in ipairs(meta.glossary) do
    local id = meta_to_string(entry.id)
    if id ~= "" then
      glossary[id] = {
        title  = meta_to_string(entry.title),
        body   = meta_to_string(entry.body),
        primer = entry.primer and meta_to_string(entry.primer) or nil,
      }
    end
  end
  return nil
end

-- Pass 2: transform .gloss spans into popover triggers.
function Span(span)
  if not span.classes:includes("gloss") then return nil end

  local id = span.attributes["data-gloss"]
  if id == nil or id == "" then
    io.stderr:write("[gloss.lua] WARNING: .gloss span missing data-gloss attribute; left untouched\n")
    return nil
  end

  local entry = glossary[id]
  if entry == nil then
    io.stderr:write(string.format("[gloss.lua] WARNING: .gloss span references unknown id '%s'; left untouched\n", id))
    return nil
  end

  -- Term text shown to the reader is whatever was inside the span.
  local term_text = pandoc.utils.stringify(span.content)
  -- We DO NOT escape term_text — pandoc will emit it as text inside the button.
  -- But we do need attr-escape it if we wanted to, since it goes inside HTML below.
  local term_text_safe = attr_escape(term_text)

  local title_attr = attr_escape(entry.title)
  local body_html  = attr_escape(entry.body)

  if entry.primer then
    local primer_safe = attr_escape(entry.primer)
    body_html = body_html ..
      '&lt;br&gt;&lt;br&gt;&lt;a href=&quot;' .. primer_safe .. '&quot; class=&quot;gloss-primer-link&quot;&gt;' ..
      'Read full primer &amp;rarr;&lt;/a&gt;'
  end

  local html = string.format(
    '<button type="button" class="gloss-trigger" ' ..
    'data-bs-toggle="popover" data-bs-trigger="focus hover" data-bs-html="true" ' ..
    'data-bs-placement="top" data-bs-title="%s" data-bs-content="%s" ' ..
    'aria-label="Glossary: %s" tabindex="0">' ..
    '%s<span class="gloss-icon" aria-hidden="true">&#9432;</span>' ..
    '</button>',
    title_attr, body_html, title_attr, term_text_safe
  )

  return pandoc.RawInline("html", html)
end

-- Run Meta first, then Span, in that order.
return {
  { Meta = Meta },
  { Span = Span },
}
