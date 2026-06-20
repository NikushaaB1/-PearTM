-- Platform features: cases, trust, donations, reports, partners

CREATE TABLE IF NOT EXISTS cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid text,
    title text NOT NULL,
    city text,
    diagnosis text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS case_id uuid REFERENCES cases(id);
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS verification_note text;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS document_urls text[] DEFAULT '{}';
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS bog_link text;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS tbc_link text;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS paypal_link text;
ALTER TABLE help_requests ADD COLUMN IF NOT EXISTS sos_post_id uuid;

ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS case_id uuid REFERENCES cases(id);
ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS help_request_id uuid;
ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';
ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS verification_note text;
ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS document_urls text[] DEFAULT '{}';
ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS bog_link text;
ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS tbc_link text;
ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS paypal_link text;
ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS kisa_link text;
ALTER TABLE sos_posts ADD COLUMN IF NOT EXISTS last_updated_at timestamptz;

CREATE TABLE IF NOT EXISTS donation_updates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid REFERENCES cases(id),
    sos_post_id uuid,
    help_request_id uuid,
    amount numeric NOT NULL CHECK (amount > 0),
    note text,
    donor_name text,
    created_by text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type text NOT NULL CHECK (content_type IN ('sos_post', 'help_request')),
    content_id uuid NOT NULL,
    reporter_uid text,
    reason text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    role text NOT NULL,
    description text,
    logo_url text,
    sort_order int DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_help_requests_case_id ON help_requests(case_id);
CREATE INDEX IF NOT EXISTS idx_sos_posts_case_id ON sos_posts(case_id);
CREATE INDEX IF NOT EXISTS idx_donation_updates_sos ON donation_updates(sos_post_id);
CREATE INDEX IF NOT EXISTS idx_donation_updates_help ON donation_updates(help_request_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);

INSERT INTO partners (name, role, description, sort_order)
SELECT v.name, v.role, v.description, v.sort_order
FROM (VALUES
    ('PearTM', 'ტექნოლოგიური პარტნიორი', 'პლატფორმის ტექნიკური მხარდაჭერა და განვითარება', 1),
    ('იმედის რუკა', 'ქველმოქმედი ინიციატივა', 'საქართველოს ბავშვების დახმარების რუკა', 2),
    ('ჩერნოვეცკის ფონდი', 'პარტნიორი ფონდი', 'სოციალური დახმარების პროექტები', 3)
) AS v(name, role, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM partners LIMIT 1);
