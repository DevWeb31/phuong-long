-- ============================================
-- PHUONG LONG VO DAO - DATABASE SCHEMA
-- ============================================
-- Version: 1.0
-- Date: 2025-11-04
-- Description: Schema complet avec RLS policies
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- ============================================
-- USER PROFILES (complément auth.users)
-- ============================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    favorite_club_id UUID,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLUBS
-- ============================================
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    description TEXT,
    cover_image_url TEXT,
    schedule JSONB,
    pricing JSONB,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COACHES
-- ============================================
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    specialties JSONB DEFAULT '[]'::jsonb,
    years_experience INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOG POSTS
-- ============================================
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    views_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TAGS
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOG TAGS (Many-to-Many)
-- ============================================
CREATE TABLE blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, tag_id)
);

-- ============================================
-- BLOG COMMENTS
-- ============================================
CREATE TABLE blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENTS
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    event_type TEXT CHECK (event_type IN ('competition', 'stage', 'demonstration', 'seminar', 'other')),
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    max_attendees INTEGER,
    registration_deadline TIMESTAMPTZ,
    cover_image_url TEXT,
    price_cents INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENT REGISTRATIONS
-- ============================================
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    category TEXT,
    sizes JSONB,
    attributes JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN DEFAULT TRUE,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    total_cents INTEGER NOT NULL,
    shipping_cents INTEGER DEFAULT 0,
    tax_cents INTEGER DEFAULT 0,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL,
    product_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROLES
-- ============================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL CHECK (name IN ('admin', 'moderator', 'coach', 'user')),
    description TEXT,
    level INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PERMISSIONS
-- ============================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'manage')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER ROLES
-- ============================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id, club_id)
);

-- ============================================
-- ROLE PERMISSIONS (Many-to-Many)
-- ============================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- ============================================
-- USER BOOKMARKS
-- ============================================
CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bookmarkable_type TEXT NOT NULL CHECK (bookmarkable_type IN ('blog_post', 'event', 'product')),
    bookmarkable_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, bookmarkable_type, bookmarkable_id)
);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FACEBOOK CACHE (optionnel)
-- ============================================
CREATE TABLE facebook_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    post_id TEXT UNIQUE NOT NULL,
    content TEXT,
    media JSONB DEFAULT '[]'::jsonb,
    fb_created_time TIMESTAMPTZ,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (Performance)
-- ============================================

-- User Profiles
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_favorite_club ON user_profiles(favorite_club_id);

-- Clubs
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_clubs_city ON clubs(city);
CREATE INDEX idx_clubs_active ON clubs(active);

-- Coaches
CREATE INDEX idx_coaches_club ON coaches(club_id);
CREATE INDEX idx_coaches_active ON coaches(active);

-- Blog Posts
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_club ON blog_posts(club_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Blog Tags
CREATE INDEX idx_blog_tags_post ON blog_tags(post_id);
CREATE INDEX idx_blog_tags_tag ON blog_tags(tag_id);

-- Blog Comments
CREATE INDEX idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_user ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent ON blog_comments(parent_id);
CREATE INDEX idx_blog_comments_approved ON blog_comments(approved);

-- Events
CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_active ON events(active);

-- Event Registrations
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);

-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);

-- Orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- User Roles
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_club ON user_roles(club_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- User Bookmarks
CREATE INDEX idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_type ON user_bookmarks(bookmarkable_type, bookmarkable_id);

-- ============================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================

-- Function pour auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer trigger sur tables avec updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON coaches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function pour incrémenter views_count
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE blog_posts SET views_count = views_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function pour incrémenter tag usage_count
CREATE OR REPLACE FUNCTION increment_tag_usage(tag_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = tag_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON TABLE user_profiles IS 'Profils utilisateurs (complément auth.users)';
COMMENT ON TABLE clubs IS '5 clubs Phuong Long Vo Dao';
COMMENT ON TABLE blog_posts IS 'Articles de blog multi-auteurs';
COMMENT ON TABLE events IS 'Événements (compétitions, stages, etc.)';
COMMENT ON TABLE products IS 'Produits boutique e-commerce';
COMMENT ON TABLE orders IS 'Commandes utilisateurs';
COMMENT ON TABLE user_roles IS 'Rôles utilisateurs (RBAC)';
COMMENT ON TABLE audit_logs IS 'Logs d\'audit pour conformité RGPD';

