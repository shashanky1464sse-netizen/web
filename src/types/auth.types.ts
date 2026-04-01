export interface UserProfile {
  name: string | null;
  email: string;
  title?: string | null;
  location?: string | null;
  bio?: string | null;
  profile_photo_url?: string | null;
  skills_json?: any;
  target_role?: string | null;
  experience_level?: string | null;
  experience_years?: number | null;
  preferred_difficulty?: string | null;
}

export interface AuthResponse {
  access_token: string;
  user?: UserProfile;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password?: string;
}

export interface LoginDTO {
  email: string;
  password?: string;
}
