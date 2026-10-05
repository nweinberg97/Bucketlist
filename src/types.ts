export type Category =
  | 'Adventure'
  | 'Fitness'
  | 'Food'
  | 'Creativity'
  | 'Learning'
  | 'Travel'
  | 'Career'
  | 'Community'
  | 'Relationships'
  | 'Just for fun';

export type Privacy = 'public' | 'network' | 'private';
export type Status = 'want' | 'progress' | 'done';

export type SceneKind = 'ocean' | 'ridges' | 'hills' | 'city' | 'dunes' | 'field' | 'aurora';
export type Palette = 'dawn' | 'noon' | 'golden' | 'dusk' | 'sand' | 'night';

export interface Scene {
  kind: SceneKind;
  palette: Palette;
  seed: number;
  /** a few small hot-air balloons drift in the sky */
  balloons?: boolean;
}

export interface Person {
  id: string;
  kind: 'person' | 'business';
  name: string;
  first: string;
  hood: string;
  city: string;
  /** short "what I'm about" line used when suggesting helpers */
  tagline: string;
  bio: string;
  /** things this person loves or knows — drives matching */
  skills: string[];
  interests: string[];
  socials: { instagram?: string; linkedin?: boolean; tiktok?: string };
  /** ids of people in this person's network */
  network: string[];
  stats: { helped: number; backed: number };
  /** avatar tint */
  hue: number;
  joined: string;
}

export interface Backer {
  personId?: string;
  name: string;
  amount: number;
  at: number;
}

export interface Funding {
  enabled: boolean;
  target: number;
  raised: number;
  /** count of earlier backers not individually listed */
  baseBackers: number;
  backers: Backer[];
}

export interface Sponsorship {
  open: boolean;
  /** what's standing in the way — framed for sponsors */
  need: string;
}

export interface Goal {
  id: string;
  ownerId: string;
  title: string;
  emoji: string;
  story: string;
  category: Category;
  hood: string;
  city: string;
  privacy: Privacy;
  status: Status;
  targetDate?: string;
  createdAt: number;
  completedAt?: number;
  /** short reflection written after completion */
  outcome?: string;
  scene: Scene;
  image?: string;
  tags: string[];
  /** concrete things that would help */
  needs: string[];
  steps?: { done: number; total: number; label: string };
  /** people who offered help before the prototype session */
  baseHelpers: number;
  funding?: Funding;
  sponsorship?: Sponsorship;
  shares: number;
}

export interface Intro {
  id: string;
  goalId: string;
  fromId: string;
  message: string;
  mode: 'self' | 'someone';
  at: number;
}

export interface SponsorOffer {
  id: string;
  goalId: string;
  fromId: string;
  funding?: number;
  products?: string;
  services?: string;
  space?: string;
  other?: string;
  status: 'pending' | 'accepted' | 'declined';
  at: number;
}

export interface Promotion {
  id: string;
  goalId: string;
  promoterId: string;
  caption: string;
  status: 'pending' | 'approved' | 'declined';
  at: number;
}

export type NotificationKind =
  | 'help'
  | 'fund'
  | 'milestone'
  | 'sponsor-offer'
  | 'sponsor-accepted'
  | 'sponsor-declined'
  | 'promote-request'
  | 'promote-approved'
  | 'promote-declined'
  | 'completed'
  | 'nearby'
  | 'shared';

export interface Notification {
  id: string;
  to: string;
  kind: NotificationKind;
  actorId?: string;
  goalId?: string;
  refId?: string;
  text: string;
  quote?: string;
  at: number;
  read: boolean;
}

export interface AppState {
  version: number;
  me: string;
  people: Record<string, Person>;
  goals: Record<string, Goal>;
  intros: Intro[];
  sponsorOffers: SponsorOffer[];
  promotions: Promotion[];
  notifications: Notification[];
}
