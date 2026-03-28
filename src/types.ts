export interface Place {
  name: string;
  description: string;
  time_required: string;
  lat: number;
  lng: number;
  type?: 'attraction' | 'restaurant' | 'hotel' | 'activity';
  price?: string;
  bookingLink?: string;
  address?: string;
  openingHours?: string;
  userReviews?: string;
  contactInfo?: string;
}

export interface TravelOption {
  mode: string;
  duration: string;
  cost: string;
  description: string;
  provider?: string;
  bookingLink?: string;
}

export interface DayItinerary {
  day: number;
  places: Place[];
  food: string;
  hotel: string;
  transport_mode: string;
  macros?: {
    totalDistance?: string;
    estimatedCost?: string;
    vibe?: string;
    weatherForecast?: string;
    packingTips?: string;
    bestTimeToStart?: string;
    localCustoms?: string;
  };
}

export interface Itinerary {
  id?: string;
  userId?: string;
  createdAt?: number;
  startingLocation: string;
  destination: string;
  budgetRs: number;
  language: string;
  travelOptions: TravelOption[];
  days: DayItinerary[];
}

export interface PlannerFormState {
  startingLocation: string;
  destination: string;
  budgetRs: number;
  days: number;
  travelers: number;
  travelType: string;
  language: string;
  travelScope: 'Local' | 'International';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: any;
}

export interface CommunityPost {
  id?: string;
  userId: string;
  authorName: string;
  authorPhoto?: string;
  destination: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  comments?: Comment[];
  travelType?: string;
  vibe?: string;
  createdAt?: any;
}

