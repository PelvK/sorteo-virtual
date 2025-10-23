/*
  # Create draw_configs table for team draw application

  1. New Tables
    - `draw_configs`
      - `id` (uuid, primary key) - Unique identifier for each configuration
      - `num_zones` (integer) - Number of zones (between 4 and 8)
      - `ball_cages` (jsonb) - Array of ball cages, each containing teams
      - `draw_order` (jsonb) - Array of team IDs representing the draw order
      - `created_at` (timestamptz) - Timestamp when configuration was created
      - `updated_at` (timestamptz) - Timestamp when configuration was last updated

  2. Security
    - Enable RLS on `draw_configs` table
    - Add policies for public access (read and write)
      Note: This is a demo application. In production, you would restrict
      access to authenticated users only.
*/

CREATE TABLE IF NOT EXISTS draw_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  num_zones integer NOT NULL DEFAULT 6,
  ball_cages jsonb NOT NULL DEFAULT '[]'::jsonb,
  draw_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE draw_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read draw configs"
  ON draw_configs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert draw configs"
  ON draw_configs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update draw configs"
  ON draw_configs
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete draw configs"
  ON draw_configs
  FOR DELETE
  TO public
  USING (true);
