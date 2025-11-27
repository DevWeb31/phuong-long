/**
 * Database Types - Phuong Long Vo Dao
 * 
 * Types TypeScript générés depuis le schema Supabase
 * Correspond aux tables définies dans supabase/migrations/
 * 
 * @version 1.0
 * @date 2025-11-04 20:30
 */

// ============================================
// CORE TYPES
// ============================================

export interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  cover_image_url: string | null;
  schedule: Record<string, string[]> | null;
  pricing: Record<string, number> | null;
  social_media: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
  } | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: string;
  club_id: string | null;
  name: string;
  bio: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  years_experience: number;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_id: string | null;
  club_id: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  views_count: number;
  reading_time_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: 'competition' | 'stage' | 'demonstration' | 'seminar' | 'other';
  club_id: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  max_attendees: number | null;
  registration_deadline: string | null;
  cover_image_url: string | null;
  price_cents: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface EventLike {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface EventSession {
  id: string;
  event_id: string;
  session_date: string; // Date ISO (YYYY-MM-DD)
  start_time: string; // Time (HH:MM:SS)
  end_time: string | null; // Time (HH:MM:SS)
  location: string | null;
  max_attendees: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventImage {
  id: string;
  event_id: string;
  image_url: string;
  display_order: number;
  caption: string | null;
  alt_text: string | null;
  is_cover: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  stock_quantity: number;
  images: string[] | null;
  category: string | null;
  sizes: string[] | null;
  attributes: Record<string, unknown> | null;
  active: boolean;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_cents: number;
  shipping_cents: number;
  tax_cents: number;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price_cents: number;
  product_snapshot: Record<string, unknown> | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_club_id: string | null;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: 'admin' | 'moderator' | 'coach' | 'user' | 'student' | 'developer';
  description: string | null;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  club_id: string | null;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  created_at: string;
}

// ============================================
// JOINED TYPES (avec relations)
// ============================================

export interface ClubWithCoaches extends Club {
  coaches: Coach[];
}

export interface BlogPostWithAuthor extends BlogPost {
  author: Pick<UserProfile, 'username' | 'full_name' | 'avatar_url'> | null;
  club: Pick<Club, 'name' | 'slug'> | null;
  tags: Tag[];
}

export interface EventWithClub extends Event {
  club: Pick<Club, 'name' | 'city' | 'slug'> | null;
  registrations_count: number;
  is_full: boolean;
}

export interface ProductWithStock extends Product {
  in_stock: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: PaginationMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ============================================
// FORM INPUT TYPES
// ============================================

export interface ClubInput {
  name: string;
  slug: string;
  city: string;
  address?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  description?: string;
  cover_image_url?: string;
  schedule?: Record<string, string[]>;
  pricing?: Record<string, number>;
  latitude?: number;
  longitude?: number;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  club_id?: string;
  status: 'draft' | 'published';
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
}

export interface EventInput {
  title: string;
  slug: string;
  description?: string;
  event_type: 'competition' | 'stage' | 'demonstration' | 'seminar' | 'other';
  club_id?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  max_attendees?: number;
  registration_deadline?: string;
  cover_image_url?: string;
  price_cents?: number;
}

export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  club_id?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithTimestamps<T> = T & {
  created_at: string;
  updated_at: string;
};

