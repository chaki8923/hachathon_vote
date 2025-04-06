export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Project: {
        Row: {
          id: string
          name: string
          teamName: string
          description: string
          appealPoint: string | null
          demoUrl: string | null
          imageUrl: string | null
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          name: string
          teamName: string
          description: string
          appealPoint?: string | null
          demoUrl?: string | null
          imageUrl?: string | null
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          name?: string
          teamName?: string
          description?: string
          appealPoint?: string | null
          demoUrl?: string | null
          imageUrl?: string | null
          createdAt?: Date
          updatedAt?: Date
        }
      }
      User: {
        Row: {
          id: string
          email: string
          role: string
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id: string
          email: string
          role?: string
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          email?: string
          role?: string
          createdAt?: Date
          updatedAt?: Date
        }
      }
      Vote: {
        Row: {
          id: string
          userId: string
          projectId: string
          createdAt: Date
        }
        Insert: {
          id?: string
          userId: string
          projectId: string
          createdAt?: Date
        }
        Update: {
          id?: string
          userId?: string
          projectId?: string
          createdAt?: Date
        }
      }
      VotingPeriod: {
        Row: {
          id: string
          startTime: Date
          endTime: Date
          isActive: boolean
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          startTime: Date
          endTime: Date
          isActive?: boolean
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          startTime?: Date
          endTime?: Date
          isActive?: boolean
          createdAt?: Date
          updatedAt?: Date
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
