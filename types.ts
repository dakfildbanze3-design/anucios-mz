export interface Ad {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  image: string;
  images?: string[];
  isFeatured?: boolean;
  isMyAd?: boolean;
  timeAgo: string;
  createdAt?: string; // Added for explicit date formatting
  category: 'vehicle' | 'real-estate' | 'electronics' | 'other';
  specs?: {
    fuel?: string;
    transmission?: string;
    mileage?: string;
    type?: string;
    design?: string;
  };
  description?: string;
  views?: number;
  contact?: string;
  featured_expires_at?: string;
  user?: {
    name: string;
    avatar: string;
  };
}

export type ScreenName = 'HOME' | 'CREATE_AD' | 'BOOST_AD' | 'AD_DETAILS' | 'FEATURED_ADS' | 'TERMS' | 'PROFILE' | 'PAYMENT_INFO';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  isPopular?: boolean;
}

export interface Payment {
  id?: string;
  ad_id?: string;
  amount: number;
  plan_id?: string;
  client_number: string;
  operator: 'mpesa' | 'emola' | 'mkesh';
  reference_code: string;
  message_content?: string;
  status: 'confirmed' | 'pending' | 'rejected';
  risk_score?: number; // 0-100 (0 = safe)
  risk_reasons?: string[];
  created_at?: string;
}