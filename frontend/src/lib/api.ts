function apiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return "/api";
}

type ApiEvent = {
  id: number;
  title: string;
  description?: string;
  category: string;
  tags?: string;
  eventDatetime: string;
  location: string;
  capacity: number;
  organizerId?: number;
};

type ApiService = {
  id: number;
  title: string;
  description?: string;
  type: string;
  tags?: string;
  location: string;
  providerId?: number;
};

export type UiEvent = {
  id: number;
  emoji: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  languages: string[];
  capacity: number;
  spots: number;
  color: string;
  host: string;
  hostHue: number;
  attendees: number[];
};

export type UiService = {
  id: number;
  title: string;
  provider: string;
  desc: string;
  category: string;
  languages: string[];
  price: string;
  rating: string;
  since: string;
  hue: number;
  reviews: Array<{ name: string; stars: number; hue: number; text: string }>;
};

const EVENT_COLORS: Record<string, string> = {
  Sports: "#6A9E72",
  Culture: "#5B9DC9",
  Meetup: "#D4A034",
  Wellness: "#A78BCA",
};

const EVENT_EMOJIS: Record<string, string> = {
  Sports: "⚽",
  Culture: "🎨",
  Meetup: "🤝",
  Wellness: "🧘",
};

const SERVICE_HUES: Record<string, number> = {
  Beauty: 30,
  Education: 220,
  Legal: 140,
  Food: 350,
  Trades: 165,
};

const splitTags = (tags?: string): string[] =>
  (tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Date TBD";

  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const toUiEvent = (event: ApiEvent): UiEvent => {
  const languages = splitTags(event.tags);
  const joined = Math.max(1, Math.min(event.capacity - 1, (event.id % 5) + 1));
  const spots = Math.max(event.capacity - joined, 0);

  return {
    id: event.id,
    emoji: EVENT_EMOJIS[event.category] ?? "📌",
    title: event.title,
    description:
      event.description ?? "Community event posted on RootLink.",
    category: event.category,
    date: formatDateTime(event.eventDatetime),
    location: event.location,
    languages: languages.length > 0 ? languages : ["EN"],
    capacity: event.capacity,
    spots,
    color: EVENT_COLORS[event.category] ?? "#C97B4B",
    host: event.organizerId ? `Organizer #${event.organizerId}` : "Community Host",
    hostHue: ((event.organizerId ?? event.id) * 37) % 360,
    attendees: [60, 180, 300].map((base) => (base + event.id * 11) % 360),
  };
};

export const toUiService = (service: ApiService): UiService => {
  const languages = splitTags(service.tags);
  const category = service.type;
  const hue = SERVICE_HUES[category] ?? 200;

  return {
    id: service.id,
    title: service.title,
    provider: service.providerId
      ? `Provider #${service.providerId}`
      : "Community Provider",
    desc: service.description ?? "Trusted community service on RootLink.",
    category,
    languages: languages.length > 0 ? languages : ["EN"],
    price: "Contact for pricing",
    rating: "New",
    since: "2026",
    hue,
    reviews: [],
  };
};

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const fetchEvents = async (category?: string): Promise<UiEvent[]> => {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const events = await fetchJson<ApiEvent[]>(`/events${suffix}`);
  return events.map(toUiEvent);
};

export const fetchServices = async (type?: string): Promise<UiService[]> => {
  const params = new URLSearchParams();
  if (type && type !== "All") params.set("type", type);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const services = await fetchJson<ApiService[]>(`/services${suffix}`);
  return services.map(toUiService);
};
