-- ============================================
-- USEFUL QUERIES - Development & Debug
-- ============================================
-- Queries utiles pour développement et debug
-- ============================================

-- ============================================
-- VERIFICATION & STATISTICS
-- ============================================

-- Vue d'ensemble des données
SELECT 
    'clubs' as table_name, COUNT(*) as count FROM clubs
UNION ALL SELECT 'coaches', COUNT(*) FROM coaches
UNION ALL SELECT 'blog_posts', COUNT(*) FROM blog_posts
UNION ALL SELECT 'blog_comments', COUNT(*) FROM blog_comments
UNION ALL SELECT 'events', COUNT(*) FROM events
UNION ALL SELECT 'event_registrations', COUNT(*) FROM event_registrations
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'users (auth)', COUNT(*) FROM auth.users
UNION ALL SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL SELECT 'tags', COUNT(*) FROM tags
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
ORDER BY table_name;

-- ============================================
-- USERS & ROLES
-- ============================================

-- Liste tous les utilisateurs avec leurs rôles
SELECT 
    u.email,
    up.username,
    up.full_name,
    r.name as role,
    c.name as club,
    ur.granted_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN clubs c ON ur.club_id = c.id
ORDER BY u.created_at DESC;

-- Utilisateurs sans profil (à corriger)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE up.id IS NULL;

-- Utilisateurs sans rôle (à attribuer)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.id IS NULL;

-- Admins du système
SELECT 
    u.email,
    up.full_name,
    r.name as role
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'admin';

-- ============================================
-- CLUBS & COACHES
-- ============================================

-- Clubs avec nombre de coaches
SELECT 
    c.name as club,
    c.city,
    COUNT(co.id) as coaches_count,
    c.active
FROM clubs c
LEFT JOIN coaches co ON c.id = co.club_id AND co.active = true
GROUP BY c.id, c.name, c.city, c.active
ORDER BY c.city;

-- Coaches par club avec expérience
SELECT 
    c.name as club,
    co.name as coach,
    co.years_experience,
    co.specialties,
    co.active
FROM coaches co
JOIN clubs c ON co.club_id = c.id
ORDER BY c.name, co.display_order;

-- ============================================
-- BLOG
-- ============================================

-- Articles par statut
SELECT 
    status,
    COUNT(*) as count,
    AVG(views_count) as avg_views,
    AVG(reading_time_minutes) as avg_reading_time
FROM blog_posts
GROUP BY status;

-- Top 10 articles les plus vus
SELECT 
    bp.title,
    bp.views_count,
    bp.published_at,
    u.email as author,
    c.name as club
FROM blog_posts bp
LEFT JOIN auth.users u ON bp.author_id = u.id
LEFT JOIN clubs c ON bp.club_id = c.id
WHERE bp.status = 'published'
ORDER BY bp.views_count DESC
LIMIT 10;

-- Articles avec nombre de commentaires
SELECT 
    bp.title,
    bp.status,
    COUNT(bc.id) as comments_count,
    COUNT(CASE WHEN bc.approved THEN 1 END) as approved_comments
FROM blog_posts bp
LEFT JOIN blog_comments bc ON bp.id = bc.post_id
GROUP BY bp.id, bp.title, bp.status
ORDER BY comments_count DESC;

-- Tags les plus utilisés
SELECT 
    t.name,
    COUNT(bt.id) as usage_count
FROM tags t
LEFT JOIN blog_tags bt ON t.id = bt.tag_id
GROUP BY t.id, t.name
ORDER BY usage_count DESC
LIMIT 20;

-- Commentaires en attente de modération
SELECT 
    bc.content,
    bc.created_at,
    u.email as author,
    bp.title as post_title
FROM blog_comments bc
JOIN auth.users u ON bc.user_id = u.id
JOIN blog_posts bp ON bc.post_id = bp.id
WHERE bc.approved = false
ORDER BY bc.created_at DESC;

-- ============================================
-- EVENTS
-- ============================================

-- Événements à venir
SELECT 
    e.title,
    e.event_type,
    e.start_date,
    c.name as club,
    e.location,
    COUNT(er.id) as registrations_count,
    e.max_attendees,
    CASE 
        WHEN e.max_attendees IS NULL THEN 'Illimité'
        ELSE (e.max_attendees - COUNT(er.id))::TEXT
    END as places_disponibles
FROM events e
LEFT JOIN clubs c ON e.club_id = c.id
LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'confirmed'
WHERE e.start_date > NOW() AND e.active = true
GROUP BY e.id, e.title, e.event_type, e.start_date, c.name, e.location, e.max_attendees
ORDER BY e.start_date;

-- Événements complets (plus de places)
SELECT 
    e.title,
    e.start_date,
    e.max_attendees,
    COUNT(er.id) as registrations
FROM events e
JOIN event_registrations er ON e.id = er.event_id AND er.status = 'confirmed'
WHERE e.max_attendees IS NOT NULL
GROUP BY e.id, e.title, e.start_date, e.max_attendees
HAVING COUNT(er.id) >= e.max_attendees;

-- Inscriptions par utilisateur
SELECT 
    u.email,
    COUNT(er.id) as events_registered,
    string_agg(e.title, ', ') as events
FROM auth.users u
JOIN event_registrations er ON u.id = er.user_id
JOIN events e ON er.event_id = e.id
GROUP BY u.id, u.email
ORDER BY events_registered DESC;

-- ============================================
-- SHOP (E-COMMERCE)
-- ============================================

-- Produits en stock
SELECT 
    p.name,
    p.category,
    p.price_cents / 100.0 as price_euros,
    p.stock_quantity,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Rupture'
        WHEN p.stock_quantity < 10 THEN 'Stock faible'
        ELSE 'En stock'
    END as stock_status
FROM products
WHERE active = true
ORDER BY p.category, p.name;

-- Top 10 produits vendus
SELECT 
    p.name,
    SUM(oi.quantity) as total_sold,
    SUM(oi.quantity * oi.unit_price_cents) / 100.0 as revenue_euros
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('paid', 'shipped', 'delivered')
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 10;

-- Commandes récentes
SELECT 
    o.id,
    u.email as customer,
    o.status,
    o.total_cents / 100.0 as total_euros,
    o.created_at,
    COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN auth.users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.email, o.status, o.total_cents, o.created_at
ORDER BY o.created_at DESC
LIMIT 20;

-- CA par mois
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as orders_count,
    SUM(total_cents) / 100.0 as revenue_euros
FROM orders
WHERE status IN ('paid', 'shipped', 'delivered')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Panier moyen
SELECT 
    AVG(total_cents) / 100.0 as avg_cart_euros,
    AVG(items_count) as avg_items_per_order
FROM (
    SELECT 
        o.total_cents,
        COUNT(oi.id) as items_count
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.status IN ('paid', 'shipped', 'delivered')
    GROUP BY o.id, o.total_cents
) stats;

-- ============================================
-- PERMISSIONS & SECURITY
-- ============================================

-- Permissions par rôle
SELECT 
    r.name as role,
    p.resource,
    p.action,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.level, p.resource, p.action;

-- Vérifier si un user a une permission
-- (remplacer USER_EMAIL et PERMISSION_NAME)
SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.email = 'USER_EMAIL'
    AND p.name = 'PERMISSION_NAME'
) as has_permission;

-- ============================================
-- AUDIT & LOGS
-- ============================================

-- Dernières actions (audit trail)
SELECT 
    al.action,
    al.table_name,
    u.email as user_email,
    al.created_at,
    al.ip_address
FROM audit_logs al
LEFT JOIN auth.users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;

-- Actions par utilisateur
SELECT 
    u.email,
    al.action,
    COUNT(*) as count
FROM audit_logs al
JOIN auth.users u ON al.user_id = u.id
GROUP BY u.email, al.action
ORDER BY count DESC;

-- ============================================
-- MAINTENANCE & CLEANUP
-- ============================================

-- Supprimer anciens événements (> 1 an)
-- DELETE FROM events 
-- WHERE end_date < NOW() - INTERVAL '1 year' 
-- AND active = false;

-- Archiver anciens articles (> 2 ans non publiés)
-- UPDATE blog_posts 
-- SET status = 'archived'
-- WHERE status = 'draft' 
-- AND created_at < NOW() - INTERVAL '2 years';

-- Supprimer cache Facebook ancien (> 1 semaine)
-- DELETE FROM facebook_cache 
-- WHERE cached_at < NOW() - INTERVAL '1 week';

-- Nettoyer audit logs anciens (> 6 mois)
-- DELETE FROM audit_logs 
-- WHERE created_at < NOW() - INTERVAL '6 months';

-- ============================================
-- PERFORMANCE ANALYSIS
-- ============================================

-- Taille des tables
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index utilisés
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Requêtes lentes (si pg_stat_statements activé)
-- SELECT 
--     query,
--     calls,
--     total_time,
--     mean_time,
--     max_time
-- FROM pg_stat_statements
-- ORDER BY mean_time DESC
-- LIMIT 20;

-- ============================================
-- BACKUP HELPERS
-- ============================================

-- Export clubs (JSON format)
SELECT json_agg(row_to_json(c.*)) 
FROM clubs c;

-- Export products (JSON format)
SELECT json_agg(row_to_json(p.*))
FROM products p;

-- Export roles + permissions (JSON format)
SELECT json_build_object(
    'roles', (SELECT json_agg(row_to_json(r.*)) FROM roles r),
    'permissions', (SELECT json_agg(row_to_json(p.*)) FROM permissions p),
    'role_permissions', (SELECT json_agg(row_to_json(rp.*)) FROM role_permissions rp)
);

