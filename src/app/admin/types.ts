export type Wish = {
  id: number;
  name: string;
  message: string;
  reply: string | null;
  created_at: string;
};

export type Rsvp = {
  id: number;
  name: string;
  attend: string;
  guests: number;
  created_at: string;
};

export type Contribution = {
  id: number;
  name: string;
  amount: number | null;
  item: string | null;
  note: string | null;
  source: string | null;
  done: boolean;
  created_at: string;
};

export type Invitee = {
  id: number;
  name: string;
  type: "digital" | "fisik";
  category: string;
  sent: boolean;
};

export type BudgetItem = {
  id: number;
  name: string;
  cost: number | null;
  bought: boolean;
  note: string | null;
};

export type AdminData = {
  wishes: Wish[];
  rsvps: Rsvp[];
  contributions: Contribution[];
  invitees: Invitee[];
  budget: BudgetItem[];
  photos: Record<string, string[]>;
  texts: Record<string, string>;
};

export type Reload = () => Promise<void>;
