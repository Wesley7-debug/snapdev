import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import { jitterPublicCoords } from "@/lib/geo";

const DEMO = [
  // ---- Nigeria ----
  {
    username: "sarahbuilds", name: "Sarah Amadi", avatar: "", role: "Founder",
    bio: "Ex-fintech ops. Now building payment tooling for African SMEs.",
    building: "PayNest", techStack: ["Next.js", "TypeScript", "Node.js"],
    xHandle: "sarahbuilds", github: "sarahbuilds", website: "https://paynest.example.com",
    status: "Hiring", city: "Port Harcourt", country: "Nigeria",
    lng: 7.003, lat: 4.815,
  },
  {
    username: "danieldev", name: "Daniel Okoro", avatar: "", role: "Developer",
    bio: "Full-stack developer. I like maps, offline-first apps and football.",
    building: "FinTrack", techStack: ["Next.js", "TypeScript", "Python"],
    xHandle: "danieldev", github: "danieldev", website: "",
    status: "Building", city: "Port Harcourt", country: "Nigeria",
    lng: 6.995, lat: 4.79,
  },
  {
    username: "michaeleze_ai", name: "Michael Eze", avatar: "", role: "AI Engineer",
    bio: "ML engineer working on document vision for clinics.",
    building: "VisionGrid", techStack: ["Python", "PyTorch", "FastAPI"],
    xHandle: "michaeleze_ai", github: "michaeleze", website: "",
    status: "Looking to collaborate", city: "Port Harcourt", country: "Nigeria",
    lng: 7.03, lat: 4.85,
  },
  {
    username: "ada_designs", name: "Adaeze Nwosu", avatar: "", role: "Designer",
    bio: "Product designer. Design systems, prototypes, playful interfaces.",
    building: "Studio Lumen", techStack: ["Figma", "React", "Tailwind"],
    xHandle: "ada_designs", github: "", website: "https://adaeze.example.com",
    status: "Open to opportunities", city: "Port Harcourt", country: "Nigeria",
    lng: 7.035, lat: 4.805,
  },
  {
    username: "tunde_codes", name: "Tunde Bakare", avatar: "", role: "Student",
    bio: "CS student at Uniport. Learning in public.",
    building: "CampusConnect", techStack: ["JavaScript", "React", "Firebase"],
    xHandle: "tunde_codes", github: "tundecodes", website: "",
    status: "Just exploring", city: "Port Harcourt", country: "Nigeria",
    lng: 6.914, lat: 4.9,
  },
  {
    username: "blessingw", name: "Blessing Wike", avatar: "", role: "Developer",
    bio: "Mobile + backend dev. Building offline-first health records.",
    building: "HealthMate", techStack: ["Flutter", "Node.js", "MongoDB"],
    xHandle: "blessingw", github: "blessingw", website: "",
    status: "Looking for cofounder", city: "Port Harcourt", country: "Nigeria",
    lng: 6.97, lat: 4.83,
  },
  {
    username: "chiamaka_ui", name: "Chiamaka Obi", avatar: "", role: "Designer",
    bio: "Brand + product designer for fintech startups.",
    building: "HueBox", techStack: ["Figma", "Illustrator", "Webflow"],
    xHandle: "chiamaka_ui", github: "", website: "",
    status: "Building", city: "Lagos", country: "Nigeria",
    lng: 3.379, lat: 6.524,
  },
  {
    username: "emeka_ships", name: "Emeka Nwankwo", avatar: "", role: "Developer",
    bio: "Backend engineer. Go, Postgres, and event-driven systems.",
    building: "QueuePilot", techStack: ["Go", "Postgres", "Redis"],
    xHandle: "emeka_ships", github: "emekaships", website: "",
    status: "Open to opportunities", city: "Lagos", country: "Nigeria",
    lng: 3.478, lat: 6.448,
  },
  {
    username: "fatima_ai", name: "Fatima Bello", avatar: "", role: "AI Engineer",
    bio: "NLP for low-resource African languages.",
    building: "LinguaLab", techStack: ["Python", "Hugging Face", "Gradio"],
    xHandle: "fatima_ai", github: "fatimaai", website: "",
    status: "Looking to collaborate", city: "Abuja", country: "Nigeria",
    lng: 7.489, lat: 9.058,
  },
  {
    username: "ibrahimdev", name: "Ibrahim Musa", avatar: "", role: "Developer",
    bio: "Frontend dev. React, maps and dashboards.",
    building: "DashNG", techStack: ["React", "TypeScript", "MapLibre"],
    xHandle: "ibrahimdev", github: "ibrahimdev", website: "",
    status: "Building", city: "Abuja", country: "Nigeria",
    lng: 7.482, lat: 9.064,
  },
  // ---- West Africa ----
  {
    username: "kwame_builds", name: "Kwame Mensah", avatar: "", role: "Founder",
    bio: "Building logistics software for Accra's markets.",
    building: "TrotroGo", techStack: ["Flutter", "Firebase", "Node.js"],
    xHandle: "kwame_builds", github: "kwamem", website: "",
    status: "Hiring", city: "Accra", country: "Ghana",
    lng: -0.204, lat: 5.603,
  },
  // ---- East & South Africa ----
  {
    username: "wanjaike", name: "Wanjiku Ke", avatar: "", role: "Developer",
    bio: "Full-stack dev. Agri-tech and USSD experiences.",
    building: "ShambaNet", techStack: ["Next.js", "Python", "Africa's Talking"],
    xHandle: "wanjaike", github: "wanjaike", website: "",
    status: "Building", city: "Nairobi", country: "Kenya",
    lng: 36.822, lat: -1.292,
  },
  {
    username: "otieno_data", name: "Brian Otieno", avatar: "", role: "AI Engineer",
    bio: "Data engineer turned LLM apps builder.",
    building: "SavannaAI", techStack: ["Python", "LangChain", "Postgres"],
    xHandle: "otieno_data", github: "otienodata", website: "",
    status: "Looking for cofounder", city: "Nairobi", country: "Kenya",
    lng: 36.815, lat: -1.285,
  },
  {
    username: "lerato_dev", name: "Lerato Dlamini", avatar: "", role: "Developer",
    bio: "Mobile dev. Fintech apps for townships.",
    building: "eWallet ZA", techStack: ["React Native", "TypeScript", "Supabase"],
    xHandle: "lerato_dev", github: "leratod", website: "",
    status: "Open to opportunities", city: "Cape Town", country: "South Africa",
    lng: 18.424, lat: -33.925,
  },
  {
    username: "cairobytes", name: "Omar El-Sayed", avatar: "", role: "Developer",
    bio: "Backend dev. Arabic-first edtech platforms.",
    building: "MadrasaCloud", techStack: ["Laravel", "Vue", "MySQL"],
    xHandle: "cairobytes", github: "cairobytes", website: "",
    status: "Building", city: "Cairo", country: "Egypt",
    lng: 31.236, lat: 30.044,
  },
  // ---- UK & Europe ----
  {
    username: "james_fintech", name: "James Carter", avatar: "", role: "Founder",
    bio: "Second-time founder. Open banking infra.",
    building: "LedgerLine", techStack: ["TypeScript", "NestJS", "Postgres"],
    xHandle: "james_fintech", github: "jamescfin", website: "https://ledgerline.example.com",
    status: "Hiring", city: "London", country: "United Kingdom",
    lng: -0.128, lat: 51.507,
  },
  {
    username: "priya_codes", name: "Priya Sharma", avatar: "", role: "Developer",
    bio: "Frontend engineer. Design systems + accessibility.",
    building: "A11yKit", techStack: ["React", "TypeScript", "Storybook"],
    xHandle: "priya_codes", github: "priyasharma", website: "",
    status: "Looking to collaborate", city: "London", country: "United Kingdom",
    lng: -0.118, lat: 51.515,
  },
  {
    username: "sofia_makes", name: "Sofia Rossi", avatar: "", role: "Designer",
    bio: "Motion + interaction designer.",
    building: "Kinetic Studio", techStack: ["Figma", "After Effects", "Rive"],
    xHandle: "sofia_makes", github: "", website: "",
    status: "Open to opportunities", city: "London", country: "United Kingdom",
    lng: -0.142, lat: 51.499,
  },
  {
    username: "lukas_dev", name: "Lukas Weber", avatar: "", role: "Developer",
    bio: "Rust + TypeScript. Devtools enjoyer.",
    building: "ShipFast CLI", techStack: ["Rust", "TypeScript", "Tauri"],
    xHandle: "lukas_dev", github: "lukasw", website: "",
    status: "Building", city: "Berlin", country: "Germany",
    lng: 13.405, lat: 52.52,
  },
  {
    username: "anna_product", name: "Anna Schmidt", avatar: "", role: "Product",
    bio: "PM for devtools. Docs, DX and onboarding flows.",
    building: "DevLoop", techStack: ["Notion", "Linear", "Amplitude"],
    xHandle: "anna_product", github: "", website: "",
    status: "Hiring", city: "Berlin", country: "Germany",
    lng: 13.412, lat: 52.513,
  },
  {
    username: "leo_paris", name: "Léo Martin", avatar: "", role: "AI Engineer",
    bio: "Voice AI and speech synthesis.",
    building: "VoixLab", techStack: ["Python", "PyTorch", "WebRTC"],
    xHandle: "leo_paris", github: "leomartin", website: "",
    status: "Looking for cofounder", city: "Paris", country: "France",
    lng: 2.352, lat: 48.857,
  },
  {
    username: "camille_ux", name: "Camille Dubois", avatar: "", role: "Designer",
    bio: "UX researcher turned product designer.",
    building: "Atelier Nord", techStack: ["Figma", "Maze", "Framer"],
    xHandle: "camille_ux", github: "", website: "",
    status: "Just exploring", city: "Paris", country: "France",
    lng: 2.345, lat: 48.863,
  },
  {
    username: "sanne_codes", name: "Sanne Jansen", avatar: "", role: "Developer",
    bio: "Creative developer. WebGL + installations.",
    building: "PixelPolder", techStack: ["Three.js", "GLSL", "Svelte"],
    xHandle: "sanne_codes", github: "sannej", website: "",
    status: "Looking to collaborate", city: "Amsterdam", country: "Netherlands",
    lng: 4.895, lat: 52.368,
  },
  {
    username: "miguel_lx", name: "Miguel Santos", avatar: "", role: "Student",
    bio: "Engineering student. Hackathons every month.",
    building: "StudyStreak", techStack: ["JavaScript", "React", "Supabase"],
    xHandle: "miguel_lx", github: "miguels", website: "",
    status: "Just exploring", city: "Lisbon", country: "Portugal",
    lng: -9.139, lat: 38.722,
  },
  {
    username: "laia_dev", name: "Laia Ferrer", avatar: "", role: "Developer",
    bio: "Indie hacker. Tiny SaaS, big opinions.",
    building: "MicroSaaS Club", techStack: ["Next.js", "Stripe", "Postgres"],
    xHandle: "laia_dev", github: "laiaf", website: "https://micro.example.com",
    status: "Building", city: "Barcelona", country: "Spain",
    lng: 2.173, lat: 41.388,
  },
  {
    username: "erik_sthlm", name: "Erik Lindqvist", avatar: "", role: "AI Engineer",
    bio: "Recommender systems for music streaming.",
    building: "TuneGraph", techStack: ["Python", "Spark", "Go"],
    xHandle: "erik_sthlm", github: "erikl", website: "",
    status: "Open to opportunities", city: "Stockholm", country: "Sweden",
    lng: 18.068, lat: 59.33,
  },
  // ---- North America ----
  {
    username: "alexnyc", name: "Alex Rivera", avatar: "", role: "Founder",
    bio: "Building dev-collab tooling from Brooklyn.",
    building: "PairGrid", techStack: ["Next.js", "Liveblocks", "Vercel"],
    xHandle: "alexnyc", github: "alexrivera", website: "https://pairgrid.example.com",
    status: "Hiring", city: "New York", country: "United States",
    lng: -74.006, lat: 40.713,
  },
  {
    username: "maya_nyc", name: "Maya Chen", avatar: "", role: "Designer",
    bio: "Product designer. Fintech + consumer social.",
    building: "Loop Social", techStack: ["Figma", "SwiftUI", "Framer"],
    xHandle: "maya_nyc", github: "", website: "",
    status: "Looking to collaborate", city: "New York", country: "United States",
    lng: -73.996, lat: 40.721,
  },
  {
    username: "devon_nyc", name: "Devon Wright", avatar: "", role: "Developer",
    bio: "Infra engineer. K8s, edge and observability.",
    building: "EdgePulse", techStack: ["Go", "Kubernetes", "ClickHouse"],
    xHandle: "devon_nyc", github: "devonw", website: "",
    status: "Building", city: "New York", country: "United States",
    lng: -74.016, lat: 40.705,
  },
  {
    username: "sophia_sf", name: "Sophia Nguyen", avatar: "", role: "AI Engineer",
    bio: "Agents + evals. Previously robotics.",
    building: "AgentBench", techStack: ["Python", "TypeScript", "LangGraph"],
    xHandle: "sophia_sf", github: "sophian", website: "",
    status: "Looking for cofounder", city: "San Francisco", country: "United States",
    lng: -122.419, lat: 37.775,
  },
  {
    username: "marc_sf", name: "Marc Thompson", avatar: "", role: "Founder",
    bio: "Climate fintech. Carbon accounting APIs.",
    building: "CarbonLedger", techStack: ["Node.js", "Postgres", "React"],
    xHandle: "marc_sf", github: "marct", website: "",
    status: "Hiring", city: "San Francisco", country: "United States",
    lng: -122.409, lat: 37.785,
  },
  {
    username: "austinmakes", name: "Jordan Lee", avatar: "", role: "Developer",
    bio: "Game dev gone web. WebGPU experiments.",
    building: "ShaderPark", techStack: ["TypeScript", "WebGPU", "Wasm"],
    xHandle: "austinmakes", github: "jordanlee", website: "",
    status: "Just exploring", city: "Austin", country: "United States",
    lng: -97.743, lat: 30.267,
  },
  {
    username: "seattle_sam", name: "Sam Patel", avatar: "", role: "Developer",
    bio: "Distributed systems. Previously cloud infra.",
    building: "MeshDB", techStack: ["Rust", "Raft", "gRPC"],
    xHandle: "seattle_sam", github: "sampatel", website: "",
    status: "Open to opportunities", city: "Seattle", country: "United States",
    lng: -122.332, lat: 47.606,
  },
  {
    username: "toronto_tess", name: "Tess Okafor", avatar: "", role: "AI Engineer",
    bio: "Vision-language models for retail.",
    building: "ShelfSight", techStack: ["Python", "PyTorch", "GCP"],
    xHandle: "toronto_tess", github: "tesso", website: "",
    status: "Building", city: "Toronto", country: "Canada",
    lng: -79.384, lat: 43.653,
  },
  {
    username: "vancityvic", name: "Victor Kim", avatar: "", role: "Student",
    bio: "UBC CS. iOS + SwiftUI enjoyer.",
    building: "CampusEats", techStack: ["Swift", "SwiftUI", "Firebase"],
    xHandle: "vancityvic", github: "victork", website: "",
    status: "Just exploring", city: "Toronto", country: "Canada",
    lng: -79.374, lat: 43.661,
  },
  // ---- Latin America ----
  {
    username: "diego_mx", name: "Diego Hernández", avatar: "", role: "Developer",
    bio: "Full-stack. Fintech APIs across LATAM.",
    building: "PagoLibre", techStack: ["Node.js", "React", "MongoDB"],
    xHandle: "diego_mx", github: "diegoh", website: "",
    status: "Building", city: "Mexico City", country: "Mexico",
    lng: -99.134, lat: 19.433,
  },
  {
    username: "lucas_sp", name: "Lucas Silva", avatar: "", role: "Founder",
    bio: "Proptech for São Paulo rentals.",
    building: "AlugaFácil", techStack: ["Next.js", "Prisma", "Postgres"],
    xHandle: "lucas_sp", github: "lucass", website: "",
    status: "Hiring", city: "São Paulo", country: "Brazil",
    lng: -46.633, lat: -23.55,
  },
  {
    username: "marina_sp", name: "Marina Costa", avatar: "", role: "Designer",
    bio: "Illustrator + UI designer. Playful brands.",
    building: "Estúdio Maré", techStack: ["Figma", "Blender", "Procreate"],
    xHandle: "marina_sp", github: "", website: "",
    status: "Open to opportunities", city: "São Paulo", country: "Brazil",
    lng: -46.623, lat: -23.56,
  },
  {
    username: "bairesnacho", name: "Nacho Fernández", avatar: "", role: "Developer",
    bio: "Crypto + local payments infra.",
    building: "PesoChain", techStack: ["Solidity", "TypeScript", "The Graph"],
    xHandle: "bairesnacho", github: "nachof", website: "",
    status: "Looking to collaborate", city: "Buenos Aires", country: "Argentina",
    lng: -58.382, lat: -34.604,
  },
  {
    username: "valen_bog", name: "Valentina Ríos", avatar: "", role: "Student",
    bio: "Systems engineering student. Women in tech organizer.",
    building: "CodeEllas", techStack: ["Python", "Django", "React"],
    xHandle: "valen_bog", github: "valenar", website: "",
    status: "Just exploring", city: "Bogotá", country: "Colombia",
    lng: -74.072, lat: 4.711,
  },
  // ---- Middle East ----
  {
    username: "dubai_dev", name: "Ahmed Khan", avatar: "", role: "Developer",
    bio: "Super-apps and mini-programs.",
    building: "SouqMini", techStack: ["Flutter", "Dart", "GraphQL"],
    xHandle: "dubai_dev", github: "ahmedk", website: "",
    status: "Building", city: "Dubai", country: "United Arab Emirates",
    lng: 55.27, lat: 25.205,
  },
  {
    username: "noora_builds", name: "Noora Al Farsi", avatar: "", role: "Founder",
    bio: "Femtech + Arabic health content.",
    building: "SehaHer", techStack: ["React Native", "Node.js", "MongoDB"],
    xHandle: "noora_builds", github: "", website: "",
    status: "Looking for cofounder", city: "Dubai", country: "United Arab Emirates",
    lng: 55.28, lat: 25.215,
  },
  {
    username: "yossi_tlv", name: "Yossi Cohen", avatar: "", role: "AI Engineer",
    bio: "Cybersecurity ML. Anomaly detection at scale.",
    building: "ThreatLens", techStack: ["Python", "XGBoost", "Kafka"],
    xHandle: "yossi_tlv", github: "yossic", website: "",
    status: "Hiring", city: "Tel Aviv", country: "Israel",
    lng: 34.782, lat: 32.086,
  },
  // ---- Asia ----
  {
    username: "arjun_blr", name: "Arjun Rao", avatar: "", role: "Developer",
    bio: "Backend at scale. UPI-adjacent systems.",
    building: "SettleUp", techStack: ["Java", "Spring", "Kafka"],
    xHandle: "arjun_blr", github: "arjunr", website: "",
    status: "Building", city: "Bangalore", country: "India",
    lng: 77.595, lat: 12.972,
  },
  {
    username: "divya_design", name: "Divya Nair", avatar: "", role: "Designer",
    bio: "Design engineer. Motion + code.",
    building: "MotionMint", techStack: ["Framer Motion", "React", "Figma"],
    xHandle: "divya_design", github: "divyan", website: "",
    status: "Open to opportunities", city: "Bangalore", country: "India",
    lng: 77.605, lat: 12.982,
  },
  {
    username: "mumbai_mira", name: "Mira Joshi", avatar: "", role: "Product",
    bio: "PM, consumer apps. Growth + retention.",
    building: "LoopBack", techStack: ["Mixpanel", "Figma", "SQL"],
    xHandle: "mumbai_mira", github: "", website: "",
    status: "Hiring", city: "Mumbai", country: "India",
    lng: 72.878, lat: 19.076,
  },
  {
    username: "delhi_dev", name: "Rohan Gupta", avatar: "", role: "Developer",
    bio: "DevOps + platform. GitOps everything.",
    building: "PipeDream", techStack: ["Terraform", "ArgoCD", "AWS"],
    xHandle: "delhi_dev", github: "rohang", website: "",
    status: "Looking to collaborate", city: "Delhi", country: "India",
    lng: 77.209, lat: 28.614,
  },
  {
    username: "liwei_sg", name: "Li Wei Tan", avatar: "", role: "AI Engineer",
    bio: "Multilingual chatbots for SEA markets.",
    building: "ChatSinglish", techStack: ["Python", "Rasa", "React"],
    xHandle: "liwei_sg", github: "liweit", website: "",
    status: "Building", city: "Singapore", country: "Singapore",
    lng: 103.82, lat: 1.352,
  },
  {
    username: "aman_sg", name: "Aman Singh", avatar: "", role: "Founder",
    bio: "Cross-border payments for freelancers.",
    building: "RemitGo", techStack: ["Node.js", "React", "Wise API"],
    xHandle: "aman_sg", github: "amans", website: "https://remitgo.example.com",
    status: "Looking for cofounder", city: "Singapore", country: "Singapore",
    lng: 103.83, lat: 1.362,
  },
  {
    username: "jakarta_jo", name: "Joko Prasetyo", avatar: "", role: "Developer",
    bio: "Android dev. Super-app modules.",
    building: "OjekOS", techStack: ["Kotlin", "Jetpack", "Firebase"],
    xHandle: "jakarta_jo", github: "jokop", website: "",
    status: "Building", city: "Jakarta", country: "Indonesia",
    lng: 106.846, lat: -6.208,
  },
  {
    username: "manila_maria", name: "Maria Santos", avatar: "", role: "Student",
    bio: "IT student. VA tools + automation.",
    building: "TaskTulong", techStack: ["JavaScript", "Zapier", "Notion"],
    xHandle: "manila_maria", github: "marias", website: "",
    status: "Just exploring", city: "Manila", country: "Philippines",
    lng: 120.984, lat: 14.6,
  },
  {
    username: "yuki_tyo", name: "Yuki Tanaka", avatar: "", role: "Developer",
    bio: "Indie game + web dev. Pixel art enjoyer.",
    building: "PixelYokocho", techStack: ["Godot", "TypeScript", "Vite"],
    xHandle: "yuki_tyo", github: "yukit", website: "",
    status: "Looking to collaborate", city: "Tokyo", country: "Japan",
    lng: 139.692, lat: 35.69,
  },
  {
    username: "sakura_ai", name: "Sakura Ito", avatar: "", role: "AI Engineer",
    bio: "Robotics perception. Warehouse automation.",
    building: "KataBots", techStack: ["ROS", "Python", "C++"],
    xHandle: "sakura_ai", github: "sakurai", website: "",
    status: "Hiring", city: "Tokyo", country: "Japan",
    lng: 139.702, lat: 35.68,
  },
  {
    username: "minjun_seoul", name: "Minjun Park", avatar: "", role: "Developer",
    bio: "K-pop fandom platforms at scale.",
    building: "FandomHub", techStack: ["Next.js", "Redis", "AWS"],
    xHandle: "minjun_seoul", github: "minjunp", website: "",
    status: "Building", city: "Seoul", country: "South Korea",
    lng: 126.978, lat: 37.566,
  },
  // ---- Oceania ----
  {
    username: "syd_sarah", name: "Sarah Nguyen", avatar: "", role: "Designer",
    bio: "Design lead. Climate + gov tech.",
    building: "GreenTape", techStack: ["Figma", "React", "D3"],
    xHandle: "syd_sarah", github: "", website: "",
    status: "Open to opportunities", city: "Sydney", country: "Australia",
    lng: 151.209, lat: -33.868,
  },
  {
    username: "melb_matt", name: "Matt Wilson", avatar: "", role: "Developer",
    bio: "Elixir + LiveView. Real-time collab.",
    building: "JamSpace", techStack: ["Elixir", "Phoenix", "WebRTC"],
    xHandle: "melb_matt", github: "mattw", website: "",
    status: "Looking to collaborate", city: "Melbourne", country: "Australia",
    lng: 144.963, lat: -37.814,
  },
  {
    username: "akl_aria", name: "Aria Patel", avatar: "", role: "Student",
    bio: "Design student. 3D + AR filters.",
    building: "FilterFun", techStack: ["Blender", "Spark AR", "Figma"],
    xHandle: "akl_aria", github: "", website: "",
    status: "Just exploring", city: "Auckland", country: "New Zealand",
    lng: 174.763, lat: -36.849,
  },
];

async function seedAll(): Promise<{ added: number; total: number }> {
  let added = 0;
  for (const d of DEMO) {
    const [pubLng, pubLat] = jitterPublicCoords(d.lng, d.lat);
    const res = await Profile.updateOne(
      { username: d.username },
      {
        $setOnInsert: {
          username: d.username,
          name: d.name,
          avatar: d.avatar,
          role: d.role,
          bio: d.bio,
          building: d.building,
          techStack: d.techStack,
          xHandle: d.xHandle,
          github: d.github,
          website: d.website,
          status: d.status,
          location: { type: "Point", coordinates: [d.lng, d.lat], city: d.city, country: d.country },
          publicLocation: { type: "Point", coordinates: [pubLng, pubLat] },
          isVisible: true,
        },
      },
      { upsert: true }
    );
    if (res.upsertedCount > 0) added += 1;
  }
  const total = await Profile.countDocuments({});
  return { added, total };
}

/**
 * POST /api/seed — upserts demo builders across the world (dev/demo only).
 * Existing usernames are left untouched, so re-running only adds newcomers
 * and never wipes or duplicates real profiles.
 */
export async function POST() {
  try {
    await connectDB();
    const { added, total } = await seedAll();
    return NextResponse.json({ ok: true, seeded: added > 0, added, total });
  } catch {
    return NextResponse.json({ error: "seed failed — is MONGODB_URI set?" }, { status: 500 });
  }
}

/**
 * DELETE /api/seed — wipes ALL profiles, then seeds fresh worldwide demos.
 * Dev/demo only. This destroys real user data — never expose in production.
 */
export async function DELETE() {
  try {
    await connectDB();
    const wiped = await Profile.deleteMany({});
    const { added, total } = await seedAll();
    return NextResponse.json({ ok: true, wiped: wiped.deletedCount ?? 0, added, total });
  } catch {
    return NextResponse.json({ error: "reseed failed — is MONGODB_URI set?" }, { status: 500 });
  }
}
