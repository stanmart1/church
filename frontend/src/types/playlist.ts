export interface Playlist {
  id: number | string;
  name: string;
  description?: string;
  member_id?: string | number | null;
  member_name?: string | null;
  sermon_count?: string | number;
  plays?: number;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}
