export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      family_events: {
        Row: {
          attendees: string[] | null
          category: string
          created_at: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          profile_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees?: string[] | null
          category: string
          created_at?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          profile_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees?: string[] | null
          category?: string
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          profile_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          age_range: string | null
          birthdate: string | null
          created_at: string | null
          id: string
          name: string
          profile_id: string | null
          relationship: string | null
          updated_at: string | null
        }
        Insert: {
          age_range?: string | null
          birthdate?: string | null
          created_at?: string | null
          id?: string
          name: string
          profile_id?: string | null
          relationship?: string | null
          updated_at?: string | null
        }
        Update: {
          age_range?: string | null
          birthdate?: string | null
          created_at?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          relationship?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_settings: {
        Row: {
          color_palette: string | null
          created_at: string | null
          id: string
          location_sharing: string | null
          notification_enabled: boolean | null
          privacy_level: string | null
          updated_at: string | null
        }
        Insert: {
          color_palette?: string | null
          created_at?: string | null
          id: string
          location_sharing?: string | null
          notification_enabled?: boolean | null
          privacy_level?: string | null
          updated_at?: string | null
        }
        Update: {
          color_palette?: string | null
          created_at?: string | null
          id?: string
          location_sharing?: string | null
          notification_enabled?: boolean | null
          privacy_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          main_location: string | null
          phone_number: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          main_location?: string | null
          phone_number?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          main_location?: string | null
          phone_number?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      saved_locations: {
        Row: {
          address: string | null
          age_range: string | null
          amenities: string[] | null
          created_at: string | null
          id: string
          image_url: string | null
          lat: number
          lng: number
          location_id: string
          name: string
          rating: number | null
          type: string
          user_id: string
        }
        Insert: {
          address?: string | null
          age_range?: string | null
          amenities?: string[] | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          lat: number
          lng: number
          location_id: string
          name: string
          rating?: number | null
          type: string
          user_id: string
        }
        Update: {
          address?: string | null
          age_range?: string | null
          amenities?: string[] | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          lat?: number
          lng?: number
          location_id?: string
          name?: string
          rating?: number | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      family_members_with_age_range: {
        Row: {
          age_range: string | null
          birthdate: string | null
          created_at: string | null
          id: string | null
          name: string | null
          profile_id: string | null
          relationship: string | null
          updated_at: string | null
        }
        Insert: {
          age_range?: never
          birthdate?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          profile_id?: string | null
          relationship?: string | null
          updated_at?: string | null
        }
        Update: {
          age_range?: never
          birthdate?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          profile_id?: string | null
          relationship?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_age_range: {
        Args: {
          birthdate: string
        }
        Returns: string
      }
      create_profile: {
        Args: {
          user_id: string
          user_name: string
          user_email: string
        }
        Returns: boolean
      }
      create_profile_settings: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
