-- ============================================
-- SEED DATA - Test Data
-- ============================================
-- Version: 1.0
-- Date: 2025-11-04
-- Description: Données de test pour développement
-- ============================================

-- ============================================
-- ROLES (System default roles)
-- ============================================

INSERT INTO roles (id, name, description, level) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Administrateur système - Accès total', 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'moderator', 'Modérateur - Gestion contenu et modération', 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'coach', 'Coach - Gestion événements de son club', 3),
    ('550e8400-e29b-41d4-a716-446655440004', 'user', 'Utilisateur - Accès standard', 4);

-- ============================================
-- PERMISSIONS
-- ============================================

INSERT INTO permissions (name, resource, action, description) VALUES
    -- Clubs
    ('clubs.manage', 'clubs', 'manage', 'Gérer tous les clubs'),
    ('clubs.create', 'clubs', 'create', 'Créer des clubs'),
    ('clubs.update', 'clubs', 'update', 'Modifier des clubs'),
    ('clubs.delete', 'clubs', 'delete', 'Supprimer des clubs'),
    
    -- Blog
    ('blog.create', 'blog', 'create', 'Créer des articles'),
    ('blog.update', 'blog', 'update', 'Modifier des articles'),
    ('blog.delete', 'blog', 'delete', 'Supprimer des articles'),
    ('blog.moderate', 'blog', 'manage', 'Modérer les commentaires'),
    
    -- Events
    ('events.create', 'events', 'create', 'Créer des événements'),
    ('events.update', 'events', 'update', 'Modifier des événements'),
    ('events.delete', 'events', 'delete', 'Supprimer des événements'),
    
    -- Users
    ('users.manage', 'users', 'manage', 'Gérer les utilisateurs'),
    ('users.roles', 'users', 'manage', 'Gérer les rôles utilisateurs'),
    
    -- Products
    ('products.manage', 'products', 'manage', 'Gérer la boutique'),
    
    -- Orders
    ('orders.manage', 'orders', 'manage', 'Gérer les commandes');

-- ============================================
-- ROLE PERMISSIONS (Assign permissions to roles)
-- ============================================

-- Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440001', id FROM permissions;

-- Moderator: Content management
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440002', id FROM permissions
WHERE name IN ('blog.create', 'blog.update', 'blog.delete', 'blog.moderate', 'events.create', 'events.update');

-- Coach: Events management
INSERT INTO role_permissions (role_id, permission_id)
SELECT '550e8400-e29b-41d4-a716-446655440003', id FROM permissions
WHERE name IN ('events.create', 'events.update');

-- ============================================
-- CLUBS (5 clubs Phuong Long Vo Dao)
-- ============================================

INSERT INTO clubs (id, name, slug, city, address, postal_code, phone, email, description, schedule, pricing, latitude, longitude, active) VALUES
    (
        '650e8400-e29b-41d4-a716-446655440001',
        'Club Principal Marseille',
        'marseille-centre',
        'Marseille',
        '12 Avenue des Arts Martiaux',
        '13001',
        '04 91 12 34 56',
        'marseille@phuong-long-vo-dao.fr',
        'Club historique et siège de la fédération Phuong Long Vo Dao. Fondé en 1985, nous accueillons débutants et confirmés dans une ambiance familiale.',
        '{"lundi": ["18h00-19h30", "19h30-21h00"], "mercredi": ["18h00-19h30", "19h30-21h00"], "samedi": ["10h00-12h00"]}'::jsonb,
        '{"enfants": 180, "adultes": 250, "famille": 400}'::jsonb,
        43.2965,
        5.3698,
        true
    ),
    (
        '650e8400-e29b-41d4-a716-446655440002',
        'Club Expansion Paris',
        'paris-bastille',
        'Paris',
        '45 Boulevard de la Bastille',
        '75011',
        '01 43 56 78 90',
        'paris@phuong-long-vo-dao.fr',
        'Club parisien dynamique au cœur du 11ème arrondissement. Cours tous niveaux avec champions de France.',
        '{"mardi": ["19h00-20h30"], "jeudi": ["19h00-20h30", "20h30-22h00"], "samedi": ["14h00-16h00"]}'::jsonb,
        '{"enfants": 220, "adultes": 290, "etudiant": 250}'::jsonb,
        48.8534,
        2.3698,
        true
    ),
    (
        '650e8400-e29b-41d4-a716-446655440003',
        'Club Côte d''Azur Nice',
        'nice-promenade',
        'Nice',
        '78 Promenade des Anglais',
        '06000',
        '04 93 12 34 56',
        'nice@phuong-long-vo-dao.fr',
        'Club de la Côte d''Azur dans un cadre exceptionnel. Entraînements techniques avec vue sur la Méditerranée.',
        '{"lundi": ["18h30-20h00"], "mercredi": ["18h30-20h00"], "vendredi": ["18h30-20h00"]}'::jsonb,
        '{"enfants": 200, "adultes": 270}'::jsonb,
        43.6961,
        7.2654,
        true
    ),
    (
        '650e8400-e29b-41d4-a716-446655440004',
        'Club Île-de-France Créteil',
        'creteil-universite',
        'Créteil',
        '15 Avenue de l''Université',
        '94000',
        '01 48 98 76 54',
        'creteil@phuong-long-vo-dao.fr',
        'Club universitaire accueillant étudiants et familles. Tarifs préférentiels pour étudiants.',
        '{"mardi": ["18h00-19h30", "19h30-21h00"], "jeudi": ["18h00-19h30"], "samedi": ["10h00-12h00"]}'::jsonb,
        '{"enfants": 190, "adultes": 260, "etudiant": 200, "famille": 380}'::jsonb,
        48.7833,
        2.4417,
        true
    ),
    (
        '650e8400-e29b-41d4-a716-446655440005',
        'Club Alsace Strasbourg',
        'strasbourg-centre',
        'Strasbourg',
        '8 Rue du Combat',
        '67000',
        '03 88 12 34 56',
        'strasbourg@phuong-long-vo-dao.fr',
        'Club alsacien au cœur de Strasbourg. Ambiance conviviale et entraînements de qualité.',
        '{"lundi": ["19h00-20h30"], "mercredi": ["19h00-20h30"], "vendredi": ["19h00-20h30"]}'::jsonb,
        '{"enfants": 180, "adultes": 250}'::jsonb,
        48.5734,
        7.7521,
        true
    );

-- ============================================
-- COACHES
-- ============================================

INSERT INTO coaches (club_id, name, bio, specialties, years_experience, active, display_order) VALUES
    (
        '650e8400-e29b-41d4-a716-446655440001',
        'Maître Nguyen Van Long',
        'Fondateur de la fédération, 7ème Dan. Champion de France 1988, 1990, 1992. Juge international.',
        '["techniques traditionnelles", "combat", "armes"]'::jsonb,
        40,
        true,
        1
    ),
    (
        '650e8400-e29b-41d4-a716-446655440001',
        'Sophie Martin',
        '4ème Dan, professeur diplômé d''État. Spécialiste self-defense féminine.',
        '["self-defense", "pédagogie enfants"]'::jsonb,
        15,
        true,
        2
    ),
    (
        '650e8400-e29b-41d4-a716-446655440002',
        'Jean Dubois',
        '5ème Dan, champion de France 2015. Coach sportif diplômé.',
        '["combat", "préparation physique", "compétition"]'::jsonb,
        18,
        true,
        1
    ),
    (
        '650e8400-e29b-41d4-a716-446655440003',
        'Marie Lefebvre',
        '3ème Dan, ceinture noire depuis 2018. Passionnée par les formes traditionnelles.',
        '["quyền", "armes", "souplesse"]'::jsonb,
        10,
        true,
        1
    ),
    (
        '650e8400-e29b-41d4-a716-446655440004',
        'Thomas Petit',
        '4ème Dan, ancien compétiteur international. Pédagogue reconnu.',
        '["combat", "technique", "pédagogie"]'::jsonb,
        12,
        true,
        1
    ),
    (
        '650e8400-e29b-41d4-a716-446655440005',
        'Émilie Schmitt',
        '3ème Dan, professeur depuis 2019. Spécialiste enfants 6-12 ans.',
        '["pédagogie enfants", "éveil martial", "jeux martials"]'::jsonb,
        8,
        true,
        1
    );

-- ============================================
-- TAGS
-- ============================================

INSERT INTO tags (name, slug, usage_count) VALUES
    ('Technique', 'technique', 0),
    ('Compétition', 'competition', 0),
    ('Histoire', 'histoire', 0),
    ('Enfants', 'enfants', 0),
    ('Self-Defense', 'self-defense', 0),
    ('Quyền', 'quyen', 0),
    ('Combat', 'combat', 0),
    ('Armes', 'armes', 0),
    ('Préparation physique', 'preparation-physique', 0),
    ('Nutrition', 'nutrition', 0),
    ('Philosophie', 'philosophie', 0),
    ('Événement', 'evenement', 0);

-- ============================================
-- BLOG POSTS (exemples - nécessite auth.users)
-- ============================================

-- Note: Pour créer des posts, il faut d'abord des users authentifiés
-- Ces INSERT sont à exécuter APRÈS création des users via Supabase Auth

-- COMMENT EXAMPLE:
-- INSERT INTO blog_posts (title, slug, excerpt, content, status, published_at, reading_time_minutes, club_id)
-- SELECT 
--     'Bienvenue sur le blog Phuong Long Vo Dao',
--     'bienvenue-blog-vo-dao',
--     'Découvrez notre nouveau blog dédié aux arts martiaux vietnamiens.',
--     'Contenu complet de l''article...',
--     'published',
--     NOW(),
--     3,
--     '650e8400-e29b-41d4-a716-446655440001'
-- WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- ============================================
-- EVENTS
-- ============================================

INSERT INTO events (title, slug, description, event_type, club_id, start_date, end_date, location, max_attendees, registration_deadline, price_cents, active) VALUES
    (
        'Stage Technique Nationale 2025',
        'stage-technique-nationale-2025',
        'Stage national regroupant tous les clubs. Au programme : techniques avancées, quyền supérieurs, combat, et passage de grades.',
        'stage',
        '650e8400-e29b-41d4-a716-446655440001',
        '2025-06-15 09:00:00+00',
        '2025-06-15 18:00:00+00',
        'Gymnase Jean Bouin, Marseille',
        150,
        '2025-06-10 23:59:59+00',
        3500,
        true
    ),
    (
        'Championnat Régional PACA',
        'championnat-regional-paca-2025',
        'Compétition régionale open. Catégories enfants, juniors, seniors. Inscription obligatoire.',
        'competition',
        '650e8400-e29b-41d4-a716-446655440003',
        '2025-04-20 08:00:00+00',
        '2025-04-20 19:00:00+00',
        'Palais des Sports, Nice',
        200,
        '2025-04-15 23:59:59+00',
        1500,
        true
    ),
    (
        'Démonstration Fête de la Ville',
        'demo-fete-ville-paris-2025',
        'Démonstration publique lors de la fête de la ville. Quyền, combat, casse. Entrée libre.',
        'demonstration',
        '650e8400-e29b-41d4-a716-446655440002',
        '2025-09-12 14:00:00+00',
        '2025-09-12 16:00:00+00',
        'Place de la Bastille, Paris',
        NULL,
        NULL,
        0,
        true
    ),
    (
        'Séminaire Self-Defense Féminine',
        'seminaire-self-defense-femmes-2025',
        'Séminaire de 4h dédié au self-defense féminin. Techniques simples et efficaces.',
        'seminar',
        '650e8400-e29b-41d4-a716-446655440001',
        '2025-03-08 14:00:00+00',
        '2025-03-08 18:00:00+00',
        'Dojo Club Marseille',
        25,
        '2025-03-05 23:59:59+00',
        2000,
        true
    ),
    (
        'Stage Armes Traditionnelles',
        'stage-armes-traditionnelles-2025',
        'Stage spécialisé armes : bâton long, sabre, éventail. Niveau ceinture verte minimum.',
        'stage',
        '650e8400-e29b-41d4-a716-446655440005',
        '2025-05-10 10:00:00+00',
        '2025-05-11 17:00:00+00',
        'Dojo Club Strasbourg',
        30,
        '2025-05-05 23:59:59+00',
        5000,
        true
    );

-- ============================================
-- PRODUCTS (Boutique e-commerce)
-- ============================================

INSERT INTO products (name, slug, description, price_cents, stock_quantity, images, category, sizes, active, attributes) VALUES
    (
        'Kimono Vo Dao Blanc - Adulte',
        'kimono-vo-dao-blanc-adulte',
        'Kimono traditionnel 100% coton. Léger et résistant. Idéal débutants et confirmés.',
        4500,
        50,
        '["https://example.com/kimono-blanc-1.jpg", "https://example.com/kimono-blanc-2.jpg"]'::jsonb,
        'Équipement',
        '["140cm", "150cm", "160cm", "170cm", "180cm", "190cm"]'::jsonb,
        true,
        '{"matiere": "100% coton", "poids": "350g/m²", "couleur": "blanc"}'::jsonb
    ),
    (
        'Kimono Vo Dao Noir - Adulte',
        'kimono-vo-dao-noir-adulte',
        'Kimono noir pour ceintures avancées. Tissu renforcé, coupe ajustée.',
        5500,
        30,
        '["https://example.com/kimono-noir-1.jpg"]'::jsonb,
        'Équipement',
        '["160cm", "170cm", "180cm", "190cm"]'::jsonb,
        true,
        '{"matiere": "65% polyester 35% coton", "poids": "400g/m²", "couleur": "noir"}'::jsonb
    ),
    (
        'Ceinture Coton - Toutes Couleurs',
        'ceinture-coton-couleur',
        'Ceinture coton officielle. Choisir la couleur selon votre grade.',
        800,
        100,
        '["https://example.com/ceintures.jpg"]'::jsonb,
        'Accessoires',
        '["220cm", "240cm", "260cm", "280cm"]'::jsonb,
        true,
        '{"couleurs_disponibles": ["blanche", "jaune", "orange", "verte", "bleue", "marron", "noire"]}'::jsonb
    ),
    (
        'Protège-tibias et Pieds',
        'protege-tibias-pieds',
        'Protection homologuée compétition. Mousse haute densité, scratch ajustable.',
        2800,
        40,
        '["https://example.com/protege-tibias.jpg"]'::jsonb,
        'Protection',
        '["S", "M", "L", "XL"]'::jsonb,
        true,
        '{"couleur": "rouge/bleu", "homologation": "FFKaraté"}'::jsonb
    ),
    (
        'Gants Combat - Mitaines',
        'gants-combat-mitaines',
        'Mitaines combat homologuées. Protection phalanges renforcée.',
        1800,
        45,
        '["https://example.com/gants.jpg"]'::jsonb,
        'Protection',
        '["S", "M", "L"]'::jsonb,
        true,
        '{"couleur": "rouge/bleu", "matiere": "simili-cuir"}'::jsonb
    ),
    (
        'Protège-dents Thermoformable',
        'protege-dents-thermo',
        'Protège-dents simple thermoformable. S''adapte parfaitement à votre dentition.',
        600,
        80,
        '["https://example.com/protege-dents.jpg"]'::jsonb,
        'Protection',
        '["Unique"]'::jsonb,
        true,
        '{"couleur": "transparent", "age": "adulte/enfant +10ans"}'::jsonb
    ),
    (
        'Sac de Sport Vo Dao',
        'sac-sport-vo-dao-logo',
        'Sac de sport 50L avec logo Phuong Long. Compartiment chaussures séparé.',
        3200,
        25,
        '["https://example.com/sac-sport.jpg"]'::jsonb,
        'Accessoires',
        '["Unique"]'::jsonb,
        true,
        '{"couleur": "noir/rouge", "capacite": "50L", "logo": "brodé"}'::jsonb
    ),
    (
        'T-Shirt Technique Entrainement',
        't-shirt-technique-entrainement',
        'T-shirt technique respirant. Idéal entraînements intensifs.',
        1800,
        60,
        '["https://example.com/tshirt.jpg"]'::jsonb,
        'Vêtements',
        '["S", "M", "L", "XL", "XXL"]'::jsonb,
        true,
        '{"matiere": "polyester technique", "couleur": "noir"}'::jsonb
    );

-- ============================================
-- INITIAL STATISTICS (pour dashboard)
-- ============================================

-- Function pour créer stats initiales
CREATE OR REPLACE FUNCTION create_initial_stats()
RETURNS VOID AS $$
BEGIN
    -- Increment usage_count for some tags
    UPDATE tags SET usage_count = FLOOR(RANDOM() * 10 + 5) WHERE slug IN ('technique', 'competition', 'enfants');
    
    -- Increment views for published posts (when they exist)
    -- UPDATE blog_posts SET views_count = FLOOR(RANDOM() * 200 + 50) WHERE status = 'published';
END;
$$ LANGUAGE plpgsql;

SELECT create_initial_stats();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Afficher résumé des données insérées
DO $$ 
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SEED DATA SUMMARY';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Roles: %', (SELECT COUNT(*) FROM roles);
    RAISE NOTICE 'Permissions: %', (SELECT COUNT(*) FROM permissions);
    RAISE NOTICE 'Clubs: %', (SELECT COUNT(*) FROM clubs);
    RAISE NOTICE 'Coaches: %', (SELECT COUNT(*) FROM coaches);
    RAISE NOTICE 'Tags: %', (SELECT COUNT(*) FROM tags);
    RAISE NOTICE 'Events: %', (SELECT COUNT(*) FROM events);
    RAISE NOTICE 'Products: %', (SELECT COUNT(*) FROM products);
    RAISE NOTICE '============================================';
END $$;

