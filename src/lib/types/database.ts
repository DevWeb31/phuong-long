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
  is_all_clubs: boolean;
  facebook_event_id: string | null;
  facebook_url: string | null;
  synced_from_facebook: boolean;
  facebook_raw_data: Record<string, unknown> | null;
  facebook_synced_at: string | null;
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
  start_time: string | null; // Time (HH:MM:SS)
  end_time: string | null; // Time (HH:MM:SS)
  start_datetime: string | null; // Timestamp complet
  end_datetime: string | null; // Timestamp complet
  notes: string | null;
  max_attendees: number | null;
  status: 'scheduled' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface EventPrice {
  id: string;
  event_id: string;
  label: string; // Ex: "Adulte", "Enfant", "Adhérent"
  price_cents: number; // 0 = gratuit
  currency: string; // Par défaut "EUR"
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventLocation {
  id: string;
  event_id: string;
  name: string; // Nom du lieu (ex: "Dojo Municipal")
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string; // Par défaut "France"
  latitude: number | null; // Coordonnées GPS
  longitude: number | null;
  description: string | null;
  is_primary: boolean; // Lieu principal
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventImage {
  id: string;
  event_id: string;
  image_url: string;
  title: string | null;
  alt_text: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  format: string | null; // jpg, png, webp, etc.
  size_bytes: number | null;
  is_cover: boolean;
  display_order: number;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface EventClub {
  id: string;
  event_id: string;
  club_id: string;
  created_at: string;
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

export interface EventWithRelations extends Event {
  club: Pick<Club, 'id' | 'name' | 'city' | 'slug'> | null;
  sessions: EventSession[];
  prices: EventPrice[];
  locations: EventLocation[];
  images: EventImage[];
  clubs: Pick<Club, 'id' | 'name' | 'city' | 'slug'>[]; // Pour événements multi-clubs
  registrations_count?: number;
  is_full?: boolean;
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
  is_all_clubs?: boolean;
  start_date: string;
  end_date?: string;
  location?: string;
  max_attendees?: number;
  registration_deadline?: string;
  cover_image_url?: string;
  price_cents?: number;
}

export interface EventSessionInput {
  session_date: string; // YYYY-MM-DD
  start_time?: string; // HH:MM
  end_time?: string; // HH:MM
  notes?: string;
  max_attendees?: number;
  status?: 'scheduled' | 'cancelled' | 'completed';
}

export interface EventPriceInput {
  label: string;
  price_cents: number;
  description?: string;
  display_order?: number;
}

export interface EventLocationInput {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  is_primary?: boolean;
  display_order?: number;
}

export interface EventImageInput {
  image_url: string;
  title?: string;
  alt_text?: string;
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
  size_bytes?: number;
  is_cover?: boolean;
  display_order?: number;
}

export interface EventCompleteInput extends EventInput {
  sessions?: EventSessionInput[];
  prices?: EventPriceInput[];
  locations?: EventLocationInput[];
  images?: EventImageInput[];
  club_ids?: string[]; // Pour événements multi-clubs
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

