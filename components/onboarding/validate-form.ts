export interface FormState {
  name: string;
  username: string;
  role: string;
  xHandle: string;
  city: string;
  avatar: string;
  bio: string;
  building: string;
  techStack: string;
  github: string;
  website: string;
  status: string;
}

export const INITIAL: FormState = {
  name: "",
  username: "",
  role: "Developer",
  xHandle: "",
  city: "Port Harcourt",
  avatar: "",
  bio: "",
  building: "",
  techStack: "",
  github: "",
  website: "",
  status: "Building",
};

export function validateForm(f: FormState): string {
  if (!f.name.trim()) return "Please add your name.";
  if (!/^[a-zA-Z0-9_]{2,30}$/.test(f.username.trim()))
    return "Username: 2–30 chars, letters/numbers/underscore.";
  if (!f.xHandle.trim()) return "X handle is required.";
  if (!f.city.trim()) return "Please add your city / area.";
  return "";
}

export function trimmed(f: FormState): FormState {
  const out = { ...f };
  (Object.keys(out) as (keyof FormState)[]).forEach((k) => {
    out[k] = out[k].trim();
  });
  return out;
}
