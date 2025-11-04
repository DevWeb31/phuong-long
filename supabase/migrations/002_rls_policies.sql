-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Version: 1.0
-- Date: 2025-11-04
-- Description: Policies de sécurité au niveau database
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_cache ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Check if user has role
-- ============================================

CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USER PROFILES
-- ============================================

-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON user_profiles FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- CLUBS
-- ============================================

-- Everyone can view active clubs
CREATE POLICY "Anyone can view active clubs"
    ON clubs FOR SELECT
    USING (active = true OR is_admin());

-- Only admins can insert clubs
CREATE POLICY "Admins can insert clubs"
    ON clubs FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can update clubs
CREATE POLICY "Admins can update clubs"
    ON clubs FOR UPDATE
    USING (is_admin());

-- Only admins can delete clubs
CREATE POLICY "Admins can delete clubs"
    ON clubs FOR DELETE
    USING (is_admin());

-- ============================================
-- COACHES
-- ============================================

-- Everyone can view active coaches
CREATE POLICY "Anyone can view active coaches"
    ON coaches FOR SELECT
    USING (active = true OR is_admin());

-- Admins can manage coaches
CREATE POLICY "Admins can manage coaches"
    ON coaches FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- BLOG POSTS
-- ============================================

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts"
    ON blog_posts FOR SELECT
    USING (
        status = 'published'
        OR author_id = auth.uid()
        OR is_admin()
        OR has_role('moderator')
    );

-- Authenticated users with role can create posts
CREATE POLICY "Authorized users can create posts"
    ON blog_posts FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND (has_role('admin') OR has_role('moderator') OR has_role('coach'))
    );

-- Authors and admins can update posts
CREATE POLICY "Authors and admins can update posts"
    ON blog_posts FOR UPDATE
    USING (
        auth.uid() = author_id
        OR is_admin()
        OR has_role('moderator')
    );

-- Admins can delete posts
CREATE POLICY "Admins can delete posts"
    ON blog_posts FOR DELETE
    USING (is_admin());

-- ============================================
-- TAGS
-- ============================================

-- Everyone can view tags
CREATE POLICY "Anyone can view tags"
    ON tags FOR SELECT
    USING (true);

-- Moderators can manage tags
CREATE POLICY "Moderators can manage tags"
    ON tags FOR ALL
    USING (has_role('moderator') OR is_admin())
    WITH CHECK (has_role('moderator') OR is_admin());

-- ============================================
-- BLOG TAGS
-- ============================================

-- Everyone can view blog tags
CREATE POLICY "Anyone can view blog tags"
    ON blog_tags FOR SELECT
    USING (true);

-- Authors can manage tags on their posts
CREATE POLICY "Authors can manage tags on own posts"
    ON blog_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM blog_posts
            WHERE id = blog_tags.post_id AND author_id = auth.uid()
        )
        OR is_admin()
        OR has_role('moderator')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM blog_posts
            WHERE id = blog_tags.post_id AND author_id = auth.uid()
        )
        OR is_admin()
        OR has_role('moderator')
    );

-- ============================================
-- BLOG COMMENTS
-- ============================================

-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
    ON blog_comments FOR SELECT
    USING (
        approved = true
        OR user_id = auth.uid()
        OR is_admin()
        OR has_role('moderator')
    );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
    ON blog_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update own comments
CREATE POLICY "Users can update own comments"
    ON blog_comments FOR UPDATE
    USING (auth.uid() = user_id);

-- Users and moderators can delete comments
CREATE POLICY "Users and moderators can delete comments"
    ON blog_comments FOR DELETE
    USING (
        auth.uid() = user_id
        OR is_admin()
        OR has_role('moderator')
    );

-- ============================================
-- EVENTS
-- ============================================

-- Anyone can view active events
CREATE POLICY "Anyone can view active events"
    ON events FOR SELECT
    USING (active = true OR is_admin() OR has_role('coach'));

-- Coaches and admins can create events
CREATE POLICY "Coaches can create events"
    ON events FOR INSERT
    WITH CHECK (has_role('coach') OR is_admin() OR has_role('moderator'));

-- Coaches can update own club events
CREATE POLICY "Coaches can update events"
    ON events FOR UPDATE
    USING (
        is_admin()
        OR has_role('moderator')
        OR (
            has_role('coach')
            AND EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() AND club_id = events.club_id
            )
        )
    );

-- Admins can delete events
CREATE POLICY "Admins can delete events"
    ON events FOR DELETE
    USING (is_admin());

-- ============================================
-- EVENT REGISTRATIONS
-- ============================================

-- Users can view own registrations
CREATE POLICY "Users can view own registrations"
    ON event_registrations FOR SELECT
    USING (
        user_id = auth.uid()
        OR is_admin()
        OR has_role('coach')
    );

-- Authenticated users can register for events
CREATE POLICY "Users can register for events"
    ON event_registrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update own registrations
CREATE POLICY "Users can update own registrations"
    ON event_registrations FOR UPDATE
    USING (auth.uid() = user_id OR is_admin());

-- Users can cancel own registrations
CREATE POLICY "Users can cancel registrations"
    ON event_registrations FOR DELETE
    USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- PRODUCTS
-- ============================================

-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (active = true OR is_admin());

-- Admins can manage products
CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- ORDERS
-- ============================================

-- Users can view own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (user_id = auth.uid() OR is_admin());

-- Users can create orders
CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can update orders
CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (is_admin());

-- ============================================
-- ORDER ITEMS
-- ============================================

-- Users can view own order items
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE id = order_items.order_id
            AND (user_id = auth.uid() OR is_admin())
        )
    );

-- System can insert order items (via backend)
CREATE POLICY "Authenticated users can insert order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE id = order_items.order_id AND user_id = auth.uid()
        )
    );

-- ============================================
-- ROLES (read-only for non-admins)
-- ============================================

-- Everyone can view roles
CREATE POLICY "Anyone can view roles"
    ON roles FOR SELECT
    USING (true);

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
    ON roles FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- PERMISSIONS (read-only for non-admins)
-- ============================================

-- Everyone can view permissions
CREATE POLICY "Anyone can view permissions"
    ON permissions FOR SELECT
    USING (true);

-- Only admins can manage permissions
CREATE POLICY "Admins can manage permissions"
    ON permissions FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- USER ROLES
-- ============================================

-- Users can view own roles
CREATE POLICY "Users can view own roles"
    ON user_roles FOR SELECT
    USING (user_id = auth.uid() OR is_admin());

-- Admins can manage user roles
CREATE POLICY "Admins can manage user roles"
    ON user_roles FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- ROLE PERMISSIONS
-- ============================================

-- Anyone can view role permissions
CREATE POLICY "Anyone can view role permissions"
    ON role_permissions FOR SELECT
    USING (true);

-- Admins can manage role permissions
CREATE POLICY "Admins can manage role permissions"
    ON role_permissions FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ============================================
-- USER BOOKMARKS
-- ============================================

-- Users can view own bookmarks
CREATE POLICY "Users can view own bookmarks"
    ON user_bookmarks FOR SELECT
    USING (user_id = auth.uid());

-- Users can manage own bookmarks
CREATE POLICY "Users can manage own bookmarks"
    ON user_bookmarks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AUDIT LOGS
-- ============================================

-- Admins can view all logs
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================
-- FACEBOOK CACHE
-- ============================================

-- Anyone can view cached posts
CREATE POLICY "Anyone can view facebook cache"
    ON facebook_cache FOR SELECT
    USING (true);

-- System can manage cache
CREATE POLICY "System can manage facebook cache"
    ON facebook_cache FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

