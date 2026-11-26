export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description_en: string
          description_pl: string | null
          id: string
          name_en: string
          name_pl: string | null
          position: number
          slug: string
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_pl?: string | null
          id?: string
          name_en: string
          name_pl?: string | null
          position?: number
          slug: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_pl?: string | null
          id?: string
          name_en?: string
          name_pl?: string | null
          position?: number
          slug?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: number
          price: number
          sale_price: number | null
          variant_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: never
          price: number
          sale_price?: number | null
          variant_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: never
          price?: number
          sale_price?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_variants"
            referencedColumns: ["variant_id"]
          },
          {
            foreignKeyName: "price_history_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_en: string
          alt_pl: string | null
          created_at: string
          id: string
          position: number
          product_id: string
          storage_path: string
        }
        Insert: {
          alt_en?: string
          alt_pl?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id: string
          storage_path: string
        }
        Update: {
          alt_en?: string
          alt_pl?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_preorder: boolean
          category_id: string
          created_at: string
          description_en: string
          description_pl: string | null
          id: string
          is_new: boolean
          name_en: string
          name_pl: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          allow_preorder?: boolean
          category_id: string
          created_at?: string
          description_en?: string
          description_pl?: string | null
          id?: string
          is_new?: boolean
          name_en: string
          name_pl?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          allow_preorder?: boolean
          category_id?: string
          created_at?: string
          description_en?: string
          description_pl?: string | null
          id?: string
          is_new?: boolean
          name_en?: string
          name_pl?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          fee_courier: number
          fee_inpost_locker: number
          fee_pickup: number
          id: boolean
          low_stock_threshold: number
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          fee_courier?: number
          fee_inpost_locker?: number
          fee_pickup?: number
          id?: boolean
          low_stock_threshold?: number
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          fee_courier?: number
          fee_inpost_locker?: number
          fee_pickup?: number
          id?: boolean
          low_stock_threshold?: number
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          actor: string | null
          change: number
          created_at: string
          id: number
          note: string
          reason: string
          variant_id: string
        }
        Insert: {
          actor?: string | null
          change: number
          created_at?: string
          id?: never
          note?: string
          reason: string
          variant_id: string
        }
        Update: {
          actor?: string | null
          change?: number
          created_at?: string
          id?: never
          note?: string
          reason?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_variants"
            referencedColumns: ["variant_id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "variants"
            referencedColumns: ["id"]
          },
        ]
      }
      variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label_en: string
          label_pl: string | null
          position: number
          price: number
          product_id: string
          sale_price: number | null
          sku: string | null
          stock_on_hand: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label_en?: string
          label_pl?: string | null
          position?: number
          price: number
          product_id: string
          sale_price?: number | null
          sku?: string | null
          stock_on_hand?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label_en?: string
          label_pl?: string | null
          position?: number
          price?: number
          product_id?: string
          sale_price?: number | null
          sku?: string | null
          stock_on_hand?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      catalog_variants: {
        Row: {
          available: number | null
          label_en: string | null
          label_pl: string | null
          lowest_price_30d: number | null
          position: number | null
          price: number | null
          product_id: string | null
          sale_price: number | null
          variant_id: string | null
        }
        Insert: {
          available?: number | null
          label_en?: string | null
          label_pl?: string | null
          lowest_price_30d?: never
          position?: number | null
          price?: number | null
          product_id?: string | null
          sale_price?: number | null
          variant_id?: string | null
        }
        Update: {
          available?: number | null
          label_en?: string | null
          label_pl?: string | null
          lowest_price_30d?: never
          position?: number | null
          price?: number | null
          product_id?: string | null
          sale_price?: number | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
