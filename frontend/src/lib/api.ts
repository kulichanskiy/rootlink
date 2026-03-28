/** Base for API calls. Default `/api` is rewritten to Spring Boot by `next.config.ts`. */
export function apiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return "/api";
}

export class ApiError extends Error {
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`;
  let fields: Record<string, string> | undefined;
  try {
    const data = (await response.json()) as Record<string, unknown>;
    if (typeof data.message === "string") message = data.message;
    else if (typeof data.error === "string") message = data.error;
    if (data.fields && typeof data.fields === "object" && data.fields !== null) {
      fields = data.fields as Record<string, string>;
      const first = Object.values(fields)[0];
      if (first) message = first;
    }
  } catch {
    /* ignore */
  }
  return new ApiError(message, response.status, fields);
}

type JsonInit = RequestInit & { token?: string | null };

async function requestJson<T>(path: string, init?: JsonInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = init?.token;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const { token: _t, ...rest } = init ?? {};
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...rest,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export type ApiEvent = {
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

export type ApiService = {
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

export const fetchEvents = async (category?: string): Promise<UiEvent[]> => {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const events = await requestJson<ApiEvent[]>(`/events${suffix}`, {
    method: "GET",
  });
  return events.map(toUiEvent);
};

export const fetchServices = async (type?: string): Promise<UiService[]> => {
  const params = new URLSearchParams();
  if (type && type !== "All") params.set("type", type);

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const services = await requestJson<ApiService[]>(`/services${suffix}`, {
    method: "GET",
  });
  return services.map(toUiService);
};

// ── Auth & mutations (Spring Security JWT) ─────────────────────────────

export type ApiUser = {
  id: number;
  email: string;
  role?: string;
  preferences?: string;
  location?: string;
  avatarUrl?: string;
  createdAt?: string;
};

export async function loginRequest(
  email: string,
  password: string,
): Promise<{ token: string; user: ApiUser }> {
  return requestJson<{ token: string; user: ApiUser }>("/users/login", {  // ← correct
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(body: {
  email: string;
  password: string;
  preferences?: string;
  location?: string;
}): Promise<ApiUser> {
  return requestJson<ApiUser>("/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type CreateEventPayload = {
  title: string;
  description?: string;
  category: string;
  tags?: string;
  eventDatetime: string;
  location: string;
  capacity: number;
};

export async function createEventRequest(
  payload: CreateEventPayload,
  token: string,
): Promise<ApiEvent> {
  return requestJson<ApiEvent>("/events", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export type CreateServicePayload = {
  title: string;
  description?: string;
  type: string;
  tags?: string;
  location: string;
};

export async function createServiceRequest(
  payload: CreateServicePayload,
  token: string,
): Promise<ApiService> {
  return requestJson<ApiService>("/services", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}
