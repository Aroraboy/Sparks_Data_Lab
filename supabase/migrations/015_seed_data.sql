-- All 53 pre-existing SPARKS DataLab datasets.
-- is_pre_existing = TRUE marks historical records.

INSERT INTO datasets (
  name, owner_name, company, market,
  request_type, is_pre_existing, created_at
) VALUES

('AI Automation framework - public portals for ground-up commercial construction permits',
 'Anjali, Monisha, Divyansh, Sacchi',
 'TX Sparks Construction','Texas — All Markets',
 'Permit Intelligence', TRUE, '2026-03-17'),

('Interior Build-Out and Ground-Up construction applications across DFW and Austin',
 'Anjali, Monisha, Divyansh',
 'TX Sparks Construction','DFW',
 'Permit Intelligence', TRUE, '2026-03-11'),

('National franchise owners and development team',
 'Varalaxmi, Anjali',
 'TX Sparks Construction','National',
 'Contact Database', TRUE, '2026-03-09'),

('Commercial Brokers, Residential Brokers, Real Estate Agents, Civil Engineers, Architects, Developers, Investors, Title Companies, Lenders, and Material Suppliers - Austin, DFW, San Jose, Phoenix, Houston',
 'Varalaxmi, Monisha, Anjali',
 'REF — Real Estate Forum','Multi-state',
 'Contact Database', TRUE, '2026-03-04'),

('Lot comps - 5301 Mira Lago Dr, Lago Vista, TX',
 'Nandini',
 'TX Sparks Construction','Austin',
 'Real Estate Comps', TRUE, '2026-02-25'),

('SC Texas and California - GCs, Developers, PMs, Construction Accountants, Civil Engineers, Architects, Municipal Officials, Home Builders',
 'Varalaxmi, Monisha, Iswarya, Anjali',
 'SuperConstruct','Multi-state',
 'Contact Database', TRUE, '2026-02-18'),

('Leezaspace - Commercial RE Brokers, Property Owners, Developers, Small Business Owners, Commercial Lenders',
 'Nandini, Varalaxmi, Iswarya, Anjali',
 'Leezaspace','Texas — All Markets',
 'Contact Database', TRUE, '2026-02-18'),

('Luxury Real Estate Magazine and Portal Data Collection',
 'Nandini',
 'REF — Real Estate Forum','Texas — All Markets',
 'Influencer & Media Research', TRUE, '2026-02-13'),

('200 Venture Capitalists',
 'Varalaxmi',
 'SuperConstruct','National',
 'Contact Database', TRUE, '2026-02-12'),

('Residential and commercial RE brokers and agents - Houston, Phoenix, San Jose, San Antonio',
 'Iswarya',
 'REF — Real Estate Forum','Multi-state',
 'Contact Database', TRUE, '2026-02-11'),

('Home price comps in Carillon Parc, Southlake',
 'Nandini, Iswarya',
 'TX Sparks Construction','DFW',
 'Real Estate Comps', TRUE, '2026-02-10'),

('REF February 16th Dallas Connect Campaign',
 'Anjali, Nandini',
 'REF — Real Estate Forum','DFW',
 'Event & REF Data', TRUE, '2026-02-05'),

('Custom Luxury Home Developers and Builders in North Austin',
 'Anjali, Nandini',
 'TX Sparks Construction','Austin',
 'Contact Database', TRUE, '2026-02-04'),

('Top-tier high-net-worth RE brokers and agents across California',
 'Varalaxmi',
 'REF — Real Estate Forum','California',
 'Contact Database', TRUE, '2026-02-02'),

('REF Contact and Attendees List',
 'Anjali',
 'REF — Real Estate Forum','Multi-state',
 'Event & REF Data', TRUE, '2026-02-02'),

('Fully Developed Single-Family Lot - Riviera, Leander',
 'Nandini, Anjali',
 'TX Sparks Construction','Austin',
 'Real Estate Comps', TRUE, '2026-02-02'),

('SuperConstruct - Builders contact info across DFW, Houston, Austin, San Antonio',
 'Anjali, Kavi, Nandini, Varalaxmi',
 'SuperConstruct','Texas — All Markets',
 'Contact Database', TRUE, '2026-01-28'),

('REF event - Engineering, Public Works, CIP, Town Council Members for Prosper, Celina, Aubrey, Pilot Point, Frisco, Plano, Little Elm',
 'Anjali, Nandini',
 'REF — Real Estate Forum','DFW',
 'Event & REF Data', TRUE, '2026-01-26'),

('Leezaspace comps 2026',
 'Sandeep, Anjali, Nandini',
 'Leezaspace','Austin',
 'Real Estate Comps', TRUE, '2026-01-05'),

('Magazine and Business Journal Advertising',
 'Anjali, Nandini',
 'General','Texas — All Markets',
 'Influencer & Media Research', TRUE, '2026-01-23'),

('Architects, MEP Engineers, Structural Engineers, Civil Engineers, Developers - ground-up construction and permitting in Texas',
 'Anjali, Nandini, Vinay, Varalaxmi',
 'TX Sparks Construction','Texas — All Markets',
 'Contact Database', TRUE, '2026-01-19'),

('Prosper city - Architects, Civil Engineers, Structural Engineers, Developers, Construction Companies',
 'Nandini',
 'TX Sparks Construction','DFW',
 'Contact Database', TRUE, '2026-01-19'),

('Events Recurring',
 'Anjali, Nandini',
 'REF — Real Estate Forum','Texas — All Markets',
 'Event & REF Data', TRUE, '2026-01-13'),

('National Franchise Recurring',
 'Anjali, Nandini',
 'TX Sparks Construction','National',
 'Contact Database', TRUE, '2026-01-13'),

('Contacts of Public Works and CIP',
 'Ravi',
 'REF — Real Estate Forum','DFW',
 'Contact Database', TRUE, '2026-01-12'),

('Top 30 real estate influencers - Austin and DFW',
 'Anjali, Nandini',
 'REF — Real Estate Forum','DFW',
 'Influencer & Media Research', TRUE, '2026-01-02'),

('TX State Realtors',
 'Anjali',
 'REF — Real Estate Forum','Texas — All Markets',
 'Contact Database', TRUE, NOW()),

('Cities Planning and Zoning Info',
 'Anjali, Vinay, Varalaxmi',
 'TX Sparks Construction','Texas — All Markets',
 'Permit Intelligence', TRUE, NOW()),

('City Officials Team Info',
 'Anjali, Venkatesh, Jaya',
 'REF — Real Estate Forum','Texas — All Markets',
 'Contact Database', TRUE, NOW()),

('TSC DataLab',
 'Anjali, Venkatesh, Reena',
 'TX Sparks Construction','Texas — All Markets',
 'Contact Database', TRUE, NOW()),

('Residential lands for North Dallas',
 'Anjali',
 'TX Sparks Construction','DFW',
 'Subdivision & Land Intelligence', TRUE, NOW()),

('Austin - Realtors, Homebuilders, Multi-Family Developers',
 'Anjali',
 'TX Sparks Construction','Austin',
 'Contact Database', TRUE, '2025-12-16'),

('Builders and Realtors data for Austin, Lago Vista, Manor, Lancaster',
 'Anjali',
 'TX Sparks Construction','Austin',
 'Contact Database', TRUE, '2025-12-22'),

('Frisco Chambers data November 2025',
 'Anjali, Venkatesh, Jaya, Vinay',
 'REF — Real Estate Forum','DFW',
 'Contact Database', TRUE, '2025-11-19'),

('Dallas mayors, managers, and city councils - cities over 50k population',
 'Anjali, Venkatesh, Jaya, Vinay',
 'REF — Real Estate Forum','DFW',
 'Contact Database', TRUE, '2025-11-14'),

('Service providers list in Leander city',
 'Anjali, Jaya, Venkatesh',
 'Leezaspace','Austin',
 'Contact Database', TRUE, '2025-11-10'),

('Commercial lands for Sherman TX',
 'Anjali',
 'TX Sparks Construction','DFW',
 'Subdivision & Land Intelligence', TRUE, NOW()),

('Sale and lease commercial tracts - restaurants, retail, office',
 'Anjali',
 'Leezaspace','Texas — All Markets',
 'Real Estate Comps', TRUE, NOW()),

('Restaurant office retail sale and lease comps for Frisco',
 'Anjali',
 'Leezaspace','DFW',
 'Real Estate Comps', TRUE, NOW()),

('Restaurant office retail sale and lease comps for Taylor TX',
 'Anjali',
 'Leezaspace','Austin',
 'Real Estate Comps', TRUE, NOW()),

('Restaurant office retail sale and lease comps for Howe TX',
 'Anjali',
 'General','DFW',
 'Real Estate Comps', TRUE, NOW()),

('Texas Commercial Real Estate Agents',
 'Anjali',
 'REF — Real Estate Forum','Texas — All Markets',
 'Contact Database', TRUE, NOW()),

('Orchid Event Center Lead Tracker',
 'Anjali',
 'General','DFW',
 'Event & REF Data', TRUE, NOW()),

('Placement officers IIT IIM',
 'Anjali',
 'SuperConstruct','National',
 'Contact Database', TRUE, '2025-09-11'),

('LinkedIn SuperConstruct Lead',
 'Anjali',
 'SuperConstruct','Multi-state',
 'Contact Database', TRUE, NOW()),

('Prosper commercial shell spaces',
 'Anjali',
 'Leezaspace','DFW',
 'Real Estate Comps', TRUE, NOW()),

('Shell and commercial space sale comps at Lancaster land',
 'Anjali',
 'TX Sparks Construction','DFW',
 'Real Estate Comps', TRUE, NOW()),

('Medical spaces for McKinney location',
 'Anjali',
 'Leezaspace','DFW',
 'Real Estate Comps', TRUE, NOW()),

('Shell retail space for lease or sale',
 'Anjali',
 'Leezaspace','Texas — All Markets',
 'Real Estate Comps', TRUE, NOW()),

('Texas Cities',
 'Sandeep, Venkatesh, Vinay, Kavi, Anjali',
 'General','Texas — All Markets',
 'Contact Database', TRUE, NOW()),

('Comms',
 'Sandeep',
 'General','Texas — All Markets',
 'Contact Database', TRUE, NOW()),

('Home Builders, General Contractors, Hospitality Developers, Public Works',
 'Anjali, Nandini, Jayasree, Varalaxmi',
 'SuperConstruct','Texas — All Markets',
 'Contact Database', TRUE, NOW()),

('Co-working and salon space comps - Leander TX',
 'Anjali',
 'Leezaspace','Austin',
 'Real Estate Comps', TRUE, '2026-01-23');
