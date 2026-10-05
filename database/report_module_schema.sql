-- ============================================================================
-- ERP-Ayantrai : Template Module Schema (PostgreSQL)
-- Lean, production-ready schema strictly for the Templates & Canvas Studio module.
-- All tables are fully connected via foreign keys with cascade/set null rules.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
CREATE TYPE section_kind       AS ENUM ('core', 'custom');
CREATE TYPE cell_block_type    AS ENUM ('metric-card', 'chart', 'insight', 'text', 'badge-strip', 'divider', 'element');
CREATE TYPE stamp_layer        AS ENUM ('front', 'back');
CREATE TYPE stamp_element_type AS ENUM ('stamp', 'chart', 'metric-card', 'text', 'insight', 'badge-strip');
CREATE TYPE template_status    AS ENUM ('draft', 'pending', 'active', 'rejected');
CREATE TYPE activity_type      AS ENUM ('template', 'section', 'admin', 'system');
CREATE TYPE watermark_place    AS ENUM ('center', 'corner', 'footer', 'tiled', 'top-right', 'bottom-right');

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 0. CORE PREREQUISITE TABLES (Referenced by Template Module)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id    integer,
  email      text UNIQUE NOT NULL,
  name       text NOT NULL,
  phone      text,
  status     text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sites (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  project_head_id   uuid REFERENCES users(id) ON DELETE SET NULL,
  location          text,
  active_workers    integer DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sites (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_id    uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, site_id)
);

-- ----------------------------------------------------------------------------
-- 1. ASSETS & WATERMARK BLUEPRINTS
-- ----------------------------------------------------------------------------

-- SVG Library (logos, stamps, shapes)
CREATE TABLE element_assets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  svg_content text NOT NULL,
  category    text,
  created_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Watermark Library
CREATE TABLE watermarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  tag         text,
  file_name   text,
  svg_content text NOT NULL,
  opacity     numeric(5,2) NOT NULL DEFAULT 10 CHECK (opacity BETWEEN 0 AND 100),
  rotation    numeric(6,2) NOT NULL DEFAULT 0,
  scale       numeric(6,2) NOT NULL DEFAULT 100,
  placement   watermark_place NOT NULL DEFAULT 'center',
  is_default  boolean NOT NULL DEFAULT false,
  description text,
  created_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. SECTIONS BLUEPRINT
-- ----------------------------------------------------------------------------

-- Master Section Blueprint (incorporates header/title rules & watermark)
CREATE TABLE library_sections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  title_html        text,
  title_style       jsonb,
  eyebrow           text,
  eyebrow_html      text,
  description       text,
  description_html  text,
  type              section_kind NOT NULL DEFAULT 'custom',
  icon              text,
  is_template       boolean NOT NULL DEFAULT false,
  header_spacing    text CHECK (header_spacing IN ('compact', 'normal', 'spacious')),
  section_style     jsonb,
  page_overrides    jsonb NOT NULL DEFAULT '{}', -- Per-page header/title rules
  watermark_id      uuid REFERENCES watermarks(id) ON DELETE SET NULL,
  created_by        uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. REUSABLE DATA ELEMENTS (Scoped or Global)
-- ----------------------------------------------------------------------------

-- Reusable Chart Catalog
CREATE TABLE library_charts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id        uuid REFERENCES library_sections(id) ON DELETE SET NULL,
  title             text NOT NULL,
  chart_type        text NOT NULL,       -- GraphType (bar, line, donut, pie, etc.)
  data_source       text,                -- Backend telemetry feed key (e.g. attendance_daily_shifts)
  data_source_field text,
  description       text,
  color             text,
  colors            jsonb,
  grid_rows         integer,
  grid_cols         integer,
  x_axis            jsonb,
  y_axis            jsonb,
  options           jsonb,
  series            jsonb,               -- [{id, name, color, data[]}]
  data_points       jsonb,               -- ChartDataPoint[]
  matrix_data       jsonb,
  matrix_row_labels jsonb,
  matrix_col_labels jsonb,
  table_columns     jsonb,
  table_rows        jsonb,
  created_by        uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Reusable Metric / KPI Cards
CREATE TABLE library_metric_cards (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id        uuid REFERENCES library_sections(id) ON DELETE SET NULL,
  label             text NOT NULL,
  value             text NOT NULL,
  data_source_field text,
  tint_color        text NOT NULL DEFAULT 'blue',
  trend_direction   text NOT NULL DEFAULT 'no-change' CHECK (trend_direction IN ('up', 'down', 'no-change')),
  trend_value       text,
  icon              text,
  created_by        uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Reusable Key Insights / Takeaways
CREATE TABLE library_key_insights (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id   uuid REFERENCES library_sections(id) ON DELETE SET NULL,
  text         text NOT NULL,
  variant      text,                      -- bullet-observations, quote-card, vision-banner, etc.
  title        text,
  badge_number integer,
  items        jsonb,
  quote        jsonb,
  banner       jsonb,
  created_by   uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. CANVAS STUDIO LAYOUT & PLACEMENT
-- ----------------------------------------------------------------------------

-- Ordered Rows inside a Section Canvas
CREATE TABLE canvas_rows (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id           uuid NOT NULL REFERENCES library_sections(id) ON DELETE CASCADE,
  order_index          integer NOT NULL,
  page_break_before    boolean NOT NULL DEFAULT false,
  style                jsonb,
  section_name         text,
  section_name_html    text,
  section_eyebrow      text,
  section_eyebrow_html text,
  UNIQUE (section_id, order_index) DEFERRABLE INITIALLY DEFERRED
);

-- Cells inside a Row (holds a Chart, Metric Card, Insight, Element, Text, etc.)
CREATE TABLE canvas_cells (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  row_id         uuid NOT NULL REFERENCES canvas_rows(id) ON DELETE CASCADE,
  parent_cell_id uuid REFERENCES canvas_cells(id) ON DELETE CASCADE,  -- Hierarchical stacked sub-cells
  order_index    integer NOT NULL DEFAULT 0,
  col_span       smallint NOT NULL DEFAULT 1 CHECK (col_span BETWEEN 1 AND 4),
  custom_width   numeric(5,2) CHECK (custom_width BETWEEN 15 AND 100),
  custom_height  integer CHECK (custom_height > 0),
  block_type     cell_block_type NOT NULL,
  style          jsonb,
  chart_id       uuid REFERENCES library_charts(id) ON DELETE SET NULL,
  metric_card_id uuid REFERENCES library_metric_cards(id) ON DELETE SET NULL,
  insight_id     uuid REFERENCES library_key_insights(id) ON DELETE SET NULL,
  asset_id       uuid REFERENCES element_assets(id) ON DELETE SET NULL,
  content        jsonb,                   -- Text block / badge strip payload
  CONSTRAINT cell_ref_matches_type CHECK (
    (block_type = 'chart'       OR chart_id       IS NULL) AND
    (block_type = 'metric-card' OR metric_card_id IS NULL) AND
    (block_type = 'insight'     OR insight_id     IS NULL) AND
    (block_type = 'element'     OR asset_id       IS NULL)
  )
);

-- Free-floating Stamps on Canvas Pages (Bring to Front / Send to Back)
CREATE TABLE section_stamps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      uuid NOT NULL REFERENCES library_sections(id) ON DELETE CASCADE,
  source_asset_id uuid REFERENCES element_assets(id) ON DELETE SET NULL,
  name            text NOT NULL,
  svg_content     text,
  page_index      integer NOT NULL CHECK (page_index >= 0),
  x               numeric(8,2) NOT NULL,
  y               numeric(8,2) NOT NULL,
  width           numeric(8,2) NOT NULL CHECK (width > 0),
  height          numeric(8,2) NOT NULL CHECK (height > 0),
  rotation        numeric(6,2) NOT NULL DEFAULT 0,
  opacity         numeric(5,2) NOT NULL DEFAULT 100 CHECK (opacity BETWEEN 0 AND 100),
  layer           stamp_layer NOT NULL DEFAULT 'front',
  z_index         integer NOT NULL DEFAULT 0,
  locked          boolean NOT NULL DEFAULT false,
  element_type    stamp_element_type NOT NULL DEFAULT 'stamp',
  content         jsonb
);

-- ----------------------------------------------------------------------------
-- 5. TEMPLATES & ASSEMBLY
-- ----------------------------------------------------------------------------

-- Main Report Template Blueprint (includes fixed pages: Cover, TOC, Back Cover)
CREATE TABLE report_templates (
  id                      text PRIMARY KEY,     -- e.g. TPL-001
  name                    text NOT NULL,
  description             text,
  site_id                 uuid REFERENCES sites(id) ON DELETE SET NULL,
  status                  template_status NOT NULL DEFAULT 'draft',
  version                 text NOT NULL DEFAULT 'v1.0',
  category                text,
  frequency               text,
  compliance_standards    text[] NOT NULL DEFAULT '{}',
  has_audit_hash          boolean NOT NULL DEFAULT false,
  remarks                 text,
  canvas_section_id       uuid REFERENCES library_sections(id) ON DELETE SET NULL,
  cover_page_data         jsonb,                -- Cover page layout & details
  table_of_contents_data  jsonb,                -- TOC layout & section listing
  back_cover_data         jsonb,                -- Back cover layout & branding
  created_by              uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_by             uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at             timestamptz,
  rejection_reason        text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS template_id_seq START 1;
ALTER TABLE report_templates
  ALTER COLUMN id SET DEFAULT 'TPL-' || lpad(nextval('template_id_seq')::text, 3, '0');

-- Sections included in a Template (ordered & togglable)
CREATE TABLE template_sections (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id          text NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
  section_id           uuid NOT NULL REFERENCES library_sections(id) ON DELETE RESTRICT,
  order_index          integer NOT NULL,
  enabled              boolean NOT NULL DEFAULT true,
  block_type           text,                    -- e.g. attendance_trends, key_metrics
  title_override       text,
  description_override text,
  UNIQUE (template_id, section_id),
  UNIQUE (template_id, order_index) DEFERRABLE INITIALLY DEFERRED
);

-- ----------------------------------------------------------------------------
-- 6. AUDIT TRAIL
-- ----------------------------------------------------------------------------
CREATE TABLE activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_name  text NOT NULL,
  role        text,
  action      text NOT NULL,
  target      text,
  type        activity_type NOT NULL,
  template_id text REFERENCES report_templates(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_canvas_rows_section       ON canvas_rows(section_id);
CREATE INDEX idx_canvas_cells_row          ON canvas_cells(row_id);
CREATE INDEX idx_canvas_cells_parent       ON canvas_cells(parent_cell_id);
CREATE INDEX idx_canvas_cells_chart        ON canvas_cells(chart_id);
CREATE INDEX idx_canvas_cells_metric       ON canvas_cells(metric_card_id);
CREATE INDEX idx_canvas_cells_insight      ON canvas_cells(insight_id);
CREATE INDEX idx_canvas_cells_asset        ON canvas_cells(asset_id);
CREATE INDEX idx_charts_section            ON library_charts(section_id);
CREATE INDEX idx_metrics_section           ON library_metric_cards(section_id);
CREATE INDEX idx_insights_section          ON library_key_insights(section_id);
CREATE INDEX idx_section_stamps_page       ON section_stamps(section_id, page_index);
CREATE INDEX idx_section_stamps_asset      ON section_stamps(source_asset_id);
CREATE INDEX idx_template_sections_tpl     ON template_sections(template_id);
CREATE INDEX idx_template_sections_sec     ON template_sections(section_id);
CREATE INDEX idx_templates_site_status     ON report_templates(site_id, status);
CREATE INDEX idx_activity_created          ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_template         ON activity_logs(template_id);

-- ----------------------------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------------------------
CREATE TRIGGER trg_wm_upd        BEFORE UPDATE ON watermarks        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_sections_upd  BEFORE UPDATE ON library_sections  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_charts_upd    BEFORE UPDATE ON library_charts    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_templates_upd BEFORE UPDATE ON report_templates  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
