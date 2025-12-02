/**
 * Supabase Database Types
 * 
 * Types pour typage fort du client Supabase
 * Généré manuellement depuis le schema (à automatiser avec Supabase CLI)
 * 
 * @version 1.0
 * @date 2025-11-04 20:35
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          favorite_club_id: string | null;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          favorite_club_id?: string | null;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          favorite_club_id?: string | null;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      clubs: {
        Row: {
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
          schedule: Json | null;
          pricing: Json | null;
          latitude: number | null;
          longitude: number | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          city: string;
          address?: string | null;
          postal_code?: string | null;
          phone?: string | null;
          email?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          schedule?: Json | null;
          pricing?: Json | null;
          latitude?: number | null;
          longitude?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          city?: string;
          address?: string | null;
          postal_code?: string | null;
          phone?: string | null;
          email?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          schedule?: Json | null;
          pricing?: Json | null;
          latitude?: number | null;
          longitude?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coaches: {
        Row: {
          id: string;
          club_id: string | null;
          name: string;
          bio: string | null;
          photo_url: string | null;
          specialties: Json | null;
          years_experience: number;
          active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id?: string | null;
          name: string;
          bio?: string | null;
          photo_url?: string | null;
          specialties?: Json | null;
          years_experience?: number;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string | null;
          name?: string;
          bio?: string | null;
          photo_url?: string | null;
          specialties?: Json | null;
          years_experience?: number;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          club_id?: string | null;
          status?: 'draft' | 'published' | 'archived';
          published_at?: string | null;
          views_count?: number;
          reading_time_minutes?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          club_id?: string | null;
          status?: 'draft' | 'published' | 'archived';
          published_at?: string | null;
          views_count?: number;
          reading_time_minutes?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          event_type: 'competition' | 'stage' | 'demonstration' | 'seminar' | 'other';
          club_id?: string | null;
          start_date: string;
          end_date?: string | null;
          location?: string | null;
          max_attendees?: number | null;
          is_all_clubs?: boolean;
          facebook_event_id?: string | null;
          facebook_url?: string | null;
          synced_from_facebook?: boolean;
          facebook_raw_data?: Record<string, unknown> | null;
          facebook_synced_at?: string | null;
          registration_deadline?: string | null;
          cover_image_url?: string | null;
          price_cents?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          event_type?: 'competition' | 'stage' | 'demonstration' | 'seminar' | 'other';
          club_id?: string | null;
          start_date?: string;
          end_date?: string | null;
          location?: string | null;
          max_attendees?: number | null;
          is_all_clubs?: boolean;
          registration_deadline?: string | null;
          cover_image_url?: string | null;
          price_cents?: number;
          active?: boolean;
          facebook_event_id?: string | null;
          facebook_url?: string | null;
          synced_from_facebook?: boolean;
          facebook_raw_data?: Record<string, unknown> | null;
          facebook_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_sessions: {
        Row: {
          id: string;
          event_id: string;
          session_date: string;
          start_time: string | null;
          end_time: string | null;
          start_datetime: string | null;
          end_datetime: string | null;
          notes: string | null;
          max_attendees: number | null;
          status: 'scheduled' | 'cancelled' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          session_date: string;
          start_time?: string | null;
          end_time?: string | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          notes?: string | null;
          max_attendees?: number | null;
          status?: 'scheduled' | 'cancelled' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          session_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          notes?: string | null;
          max_attendees?: number | null;
          status?: 'scheduled' | 'cancelled' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      event_prices: {
        Row: {
          id: string;
          event_id: string;
          label: string;
          price_cents: number;
          currency: string;
          description: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          label: string;
          price_cents?: number;
          currency?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          label?: string;
          price_cents?: number;
          currency?: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_locations: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          latitude: number | null;
          longitude: number | null;
          description: string | null;
          is_primary: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          description?: string | null;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          description?: string | null;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_images: {
        Row: {
          id: string;
          event_id: string;
          image_url: string;
          title: string | null;
          alt_text: string | null;
          caption: string | null;
          width: number | null;
          height: number | null;
          format: string | null;
          size_bytes: number | null;
          is_cover: boolean;
          display_order: number;
          uploaded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          image_url: string;
          title?: string | null;
          alt_text?: string | null;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          format?: string | null;
          size_bytes?: number | null;
          is_cover?: boolean;
          display_order?: number;
          uploaded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          image_url?: string;
          title?: string | null;
          alt_text?: string | null;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          format?: string | null;
          size_bytes?: number | null;
          is_cover?: boolean;
          display_order?: number;
          uploaded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_clubs: {
        Row: {
          id: string;
          event_id: string;
          club_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          club_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          club_id?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price_cents: number;
          stock_quantity: number;
          images: Json | null;
          category: string | null;
          sizes: Json | null;
          attributes: Json | null;
          active: boolean;
          stripe_product_id: string | null;
          stripe_price_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price_cents: number;
          stock_quantity?: number;
          images?: Json | null;
          category?: string | null;
          sizes?: Json | null;
          attributes?: Json | null;
          active?: boolean;
          stripe_product_id?: string | null;
          stripe_price_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price_cents?: number;
          stock_quantity?: number;
          images?: Json | null;
          category?: string | null;
          sizes?: Json | null;
          attributes?: Json | null;
          active?: boolean;
          stripe_product_id?: string | null;
          stripe_price_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hero_slides: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          youtube_video_id: string | null;
          image_url: string | null;
          cta_text: string | null;
          cta_link: string | null;
          overlay_opacity: number;
          active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          youtube_video_id?: string | null;
          image_url?: string | null;
          cta_text?: string | null;
          cta_link?: string | null;
          overlay_opacity?: number;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          youtube_video_id?: string | null;
          image_url?: string | null;
          cta_text?: string | null;
          cta_link?: string | null;
          overlay_opacity?: number;
          active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_consents: {
        Row: {
          id: string;
          user_id: string;
          consent_type: 'terms_of_service' | 'privacy_policy' | 'newsletter' | 'marketing' | 'analytics' | 'cookies_essential' | 'cookies_analytics' | 'cookies_marketing';
          version: string;
          granted: boolean;
          ip_address: string | null;
          user_agent: string | null;
          granted_at: string;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          consent_type: 'terms_of_service' | 'privacy_policy' | 'newsletter' | 'marketing' | 'analytics' | 'cookies_essential' | 'cookies_analytics' | 'cookies_marketing';
          version: string;
          granted?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          granted_at?: string;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          consent_type?: 'terms_of_service' | 'privacy_policy' | 'newsletter' | 'marketing' | 'analytics' | 'cookies_essential' | 'cookies_analytics' | 'cookies_marketing';
          version?: string;
          granted?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          granted_at?: string;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      has_role: {
        Args: {
          role_name: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

