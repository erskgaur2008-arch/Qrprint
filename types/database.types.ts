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
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean
          name: string
          school_id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean
          name: string
          school_id: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          name?: string
          school_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_applications: {
        Row: {
          application_no: string
          class_applied: string | null
          created_at: string
          enquiry_id: string | null
          id: string
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          school_id: string
          status: string
          student_name: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          application_no: string
          class_applied?: string | null
          created_at?: string
          enquiry_id?: string | null
          id?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_id: string
          status?: string
          student_name: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          application_no?: string
          class_applied?: string | null
          created_at?: string
          enquiry_id?: string | null
          id?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_id?: string
          status?: string
          student_name?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admission_applications_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "admission_enquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admission_applications_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_documents: {
        Row: {
          application_id: string
          created_at: string
          document_type: string
          file_url: string | null
          id: string
          notes: string | null
          school_id: string
          status: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_type: string
          file_url?: string | null
          id?: string
          notes?: string | null
          school_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_type?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          school_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admission_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "admission_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admission_documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_enquiries: {
        Row: {
          class_interested: string | null
          created_at: string
          date_of_birth: string | null
          enquiry_no: string
          gender: string | null
          id: string
          next_follow_up_at: string | null
          notes: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          school_id: string
          source: string | null
          status: string
          student_name: string
          updated_at: string
        }
        Insert: {
          class_interested?: string | null
          created_at?: string
          date_of_birth?: string | null
          enquiry_no: string
          gender?: string | null
          id?: string
          next_follow_up_at?: string | null
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_id: string
          source?: string | null
          status?: string
          student_name: string
          updated_at?: string
        }
        Update: {
          class_interested?: string | null
          created_at?: string
          date_of_birth?: string | null
          enquiry_no?: string
          gender?: string | null
          id?: string
          next_follow_up_at?: string | null
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_id?: string
          source?: string | null
          status?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admission_enquiries_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_punches: {
        Row: {
          created_at: string
          id: string
          punch_at: string
          punch_type: string
          school_id: string
          source: string | null
          staff_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          punch_at?: string
          punch_type: string
          school_id: string
          source?: string | null
          staff_id: string
        }
        Update: {
          created_at?: string
          id?: string
          punch_at?: string
          punch_type?: string
          school_id?: string
          source?: string | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_punches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_punches_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_qr_days: {
        Row: {
          attendance_date: string
          created_at: string
          created_by: string | null
          id: string
          qr_token: string
          school_id: string
        }
        Insert: {
          attendance_date: string
          created_at?: string
          created_by?: string | null
          id?: string
          qr_token: string
          school_id: string
        }
        Update: {
          attendance_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          qr_token?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_qr_days_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          record_id: string | null
          school_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id?: string | null
          school_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          record_id?: string | null
          school_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year_id: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          school_id: string
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          school_id: string
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_marks: {
        Row: {
          created_at: string
          entered_by: string | null
          exam_schedule_id: string
          grade: string | null
          id: string
          marks: number
          remarks: string | null
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entered_by?: string | null
          exam_schedule_id: string
          grade?: string | null
          id?: string
          marks?: number
          remarks?: string | null
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entered_by?: string | null
          exam_schedule_id?: string
          grade?: string | null
          id?: string
          marks?: number
          remarks?: string | null
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_marks_exam_schedule_id_fkey"
            columns: ["exam_schedule_id"]
            isOneToOne: false
            referencedRelation: "exam_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_marks_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_schedules: {
        Row: {
          class_id: string | null
          created_at: string
          duration_minutes: number
          exam_date: string
          exam_id: string
          id: string
          max_marks: number
          school_id: string
          section_id: string | null
          start_time: string | null
          subject_id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          duration_minutes?: number
          exam_date: string
          exam_id: string
          id?: string
          max_marks?: number
          school_id: string
          section_id?: string | null
          start_time?: string | null
          subject_id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          duration_minutes?: number
          exam_date?: string
          exam_id?: string
          id?: string
          max_marks?: number
          school_id?: string
          section_id?: string | null
          start_time?: string | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_schedules_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_schedules_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_schedules_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_schedules_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_schedules_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year_id: string | null
          created_at: string
          created_by: string | null
          end_date: string
          exam_type: string
          id: string
          name: string
          school_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date: string
          exam_type?: string
          id?: string
          name: string
          school_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string
          exam_type?: string
          id?: string
          name?: string
          school_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year_id: string | null
          amount: number
          created_at: string
          description: string | null
          due_day: number | null
          frequency: string
          id: string
          is_active: boolean
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          amount: number
          created_at?: string
          description?: string | null
          due_day?: number | null
          frequency?: string
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          amount?: number
          created_at?: string
          description?: string | null
          due_day?: number | null
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          completed: boolean
          created_at: string
          created_by: string | null
          enquiry_id: string
          follow_up_at: string
          id: string
          notes: string | null
          outcome: string | null
          school_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          created_by?: string | null
          enquiry_id: string
          follow_up_at: string
          id?: string
          notes?: string | null
          outcome?: string | null
          school_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          created_by?: string | null
          enquiry_id?: string
          follow_up_at?: string
          id?: string
          notes?: string | null
          outcome?: string | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "admission_enquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          academic_year_id: string | null
          assigned_date: string
          class_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          school_id: string
          section_id: string | null
          status: string
          subject_id: string | null
          teacher_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          assigned_date?: string
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          school_id: string
          section_id?: string | null
          status?: string
          subject_id?: string | null
          teacher_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          assigned_date?: string
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          school_id?: string
          section_id?: string | null
          status?: string
          subject_id?: string | null
          teacher_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          school_id: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          school_id: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          school_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          paid_at: string
          payment_mode: string
          school_id: string
          student_fee_id: string
          student_id: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          paid_at?: string
          payment_mode?: string
          school_id: string
          student_fee_id: string
          student_id: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          paid_at?: string
          payment_mode?: string
          school_id?: string
          student_fee_id?: string
          student_id?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          id: string
          issued_at: string
          payment_id: string
          receipt_number: string
          school_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issued_at?: string
          payment_id: string
          receipt_number: string
          school_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issued_at?: string
          payment_id?: string
          receipt_number?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      report_cards: {
        Row: {
          created_at: string
          exam_id: string
          generated_by: string | null
          id: string
          max_marks: number
          overall_grade: string | null
          percentage: number
          remarks: string | null
          school_id: string
          status: string
          student_id: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          generated_by?: string | null
          id?: string
          max_marks?: number
          overall_grade?: string | null
          percentage?: number
          remarks?: string | null
          school_id: string
          status?: string
          student_id: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          generated_by?: string | null
          id?: string
          max_marks?: number
          overall_grade?: string | null
          percentage?: number
          remarks?: string | null
          school_id?: string
          status?: string
          student_id?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      school_branding: {
        Row: {
          accent_color: string | null
          favicon_url: string | null
          logo_url: string | null
          primary_color: string | null
          school_id: string
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          favicon_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          school_id: string
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          favicon_url?: string | null
          logo_url?: string | null
          primary_color?: string | null
          school_id?: string
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_branding_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_users: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          school_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          school_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          school_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_users_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          slug: string
          state: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          slug: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          slug?: string
          state?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          capacity: number | null
          class_id: string
          class_teacher_id: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          school_id: string
        }
        Insert: {
          capacity?: number | null
          class_id: string
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          school_id: string
        }
        Update: {
          capacity?: number | null
          class_id?: string
          class_teacher_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          attendance_pin_hash: string | null
          created_at: string
          department: string | null
          designation: string | null
          email: string | null
          employee_no: string | null
          id: string
          joining_date: string | null
          name: string
          phone: string | null
          school_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          attendance_pin_hash?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          employee_no?: string | null
          id?: string
          joining_date?: string | null
          name: string
          phone?: string | null
          school_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          attendance_pin_hash?: string | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          employee_no?: string | null
          id?: string
          joining_date?: string | null
          name?: string
          phone?: string | null
          school_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          attendance_date: string
          created_at: string
          id: string
          marked_by: string | null
          school_id: string
          status: string
          student_id: string
        }
        Insert: {
          attendance_date: string
          created_at?: string
          id?: string
          marked_by?: string | null
          school_id: string
          status: string
          student_id: string
        }
        Update: {
          attendance_date?: string
          created_at?: string
          id?: string
          marked_by?: string | null
          school_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          academic_year_id: string | null
          amount: number
          created_at: string
          description: string
          discount: number
          due_date: string | null
          fee_structure_id: string | null
          id: string
          school_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          amount: number
          created_at?: string
          description: string
          discount?: number
          due_date?: string | null
          fee_structure_id?: string | null
          id?: string
          school_id: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          amount?: number
          created_at?: string
          description?: string
          discount?: number
          due_date?: string | null
          fee_structure_id?: string | null
          id?: string
          school_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_parents: {
        Row: {
          is_primary: boolean
          parent_id: string
          relationship: string | null
          student_id: string
        }
        Insert: {
          is_primary?: boolean
          parent_id: string
          relationship?: string | null
          student_id: string
        }
        Update: {
          is_primary?: boolean
          parent_id?: string
          relationship?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_parents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_parents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year_id: string | null
          address: string | null
          admission_date: string | null
          admission_no: string | null
          blood_group: string | null
          class_name: string | null
          created_at: string
          date_of_birth: string | null
          gender: string | null
          id: string
          name: string
          photo_url: string | null
          roll_no: string | null
          school_id: string
          section: string | null
          status: string
          student_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          address?: string | null
          admission_date?: string | null
          admission_no?: string | null
          blood_group?: string | null
          class_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          name: string
          photo_url?: string | null
          roll_no?: string | null
          school_id: string
          section?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          address?: string | null
          admission_date?: string | null
          admission_no?: string | null
          blood_group?: string | null
          class_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          roll_no?: string | null
          school_id?: string
          section?: string | null
          status?: string
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          school_id: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          school_id: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          academic_year_id: string | null
          class_id: string
          created_at: string
          id: string
          is_primary: boolean
          school_id: string
          section_id: string | null
          staff_id: string
          subject_id: string
        }
        Insert: {
          academic_year_id?: string | null
          class_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          school_id: string
          section_id?: string | null
          staff_id: string
          subject_id: string
        }
        Update: {
          academic_year_id?: string | null
          class_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          school_id?: string
          section_id?: string | null
          staff_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          role_id: string
          school_id: string
          user_id: string
        }
        Insert: {
          role_id: string
          school_id: string
          user_id: string
        }
        Update: {
          role_id?: string
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admit_application: {
        Args: {
          p_application_id: string
          p_class_name?: string
          p_section?: string
        }
        Returns: string
      }
      ensure_daily_attendance_qr: {
        Args: { p_school_id: string }
        Returns: {
          attendance_date: string
          qr_token: string
        }[]
      }
      record_staff_punch: {
        Args: {
          p_employee_no: string
          p_pin: string
          p_qr_token: string
          p_school_id: string
        }
        Returns: {
          punch_at: string
          punch_type: string
          staff_id: string
          staff_name: string
          working_minutes: number
        }[]
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
