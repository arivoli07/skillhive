const authStorageKey = "skillhive_auth";
const dbStorageKey = "skillhive_demo_db_v1";

const seedDatabase = () => ({
  categories: [
    { id: 1, name: "Web Development" },
    { id: 2, name: "UI/UX Design" },
    { id: 3, name: "Mobile Apps" },
    { id: 4, name: "Digital Marketing" },
    { id: 5, name: "Content Writing" }
  ],
  freelancers: [
    {
      id: 1,
      fullName: "Ava Carter",
      bio: "Frontend specialist focused on React and polished UI systems.",
      skills: "React, Tailwind, TypeScript",
      categories: ["Web Development", "UI/UX Design"],
      whatsapp: "+1 202 555 0112",
      contactEmail: "ava.freelancer@skillhive.demo",
      profilePhotoUrl: "",
      email: "freelancer@demo.com",
      password: "demo123"
    },
    {
      id: 2,
      fullName: "Noah Bennett",
      bio: "Full-stack developer building robust MVPs fast.",
      skills: "Spring Boot, MySQL, React",
      categories: ["Web Development", "Mobile Apps"],
      whatsapp: "+1 202 555 0179",
      contactEmail: "noah.freelancer@skillhive.demo",
      profilePhotoUrl: "",
      email: "noah@demo.com",
      password: "demo123"
    }
  ],
  clients: [
    {
      id: 1,
      fullName: "Mia Johnson",
      company: "Northstar Labs",
      profilePhotoUrl: "",
      email: "client@demo.com",
      password: "demo123"
    }
  ],
  requests: [
    {
      id: 1,
      clientId: 1,
      freelancerId: 1,
      clientName: "Mia Johnson",
      type: "Landing page redesign",
      description: "Need a clean conversion-focused landing page for SaaS.",
      duration: "2 weeks",
      salary: "$1,200",
      status: "PENDING"
    }
  ],
  projects: [
    {
      id: 1,
      clientId: 1,
      freelancerId: 1,
      title: "Marketing website refresh",
      serviceName: "Web Development",
      description: "Revamp main pages and improve mobile UX.",
      duration: "3 weeks",
      deadline: "3 weeks",
      salary: "1500",
      status: "ACTIVE"
    },
    {
      id: 2,
      clientId: 1,
      freelancerId: 2,
      title: "API integration support",
      serviceName: "Web Development",
      description: "Integrate dashboard with external CRM APIs.",
      duration: "10 days",
      deadline: "10 days",
      salary: "900",
      status: "COMPLETED"
    }
  ],
  reviews: [
    {
      id: 1,
      projectId: 2,
      clientId: 1,
      freelancerId: 2,
      clientName: "Mia Johnson",
      rating: 5,
      comment: "Great communication and delivered early."
    }
  ]
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const loadDb = () => {
  const saved = localStorage.getItem(dbStorageKey);
  if (!saved) {
    const seeded = seedDatabase();
    localStorage.setItem(dbStorageKey, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(saved);
};

const saveDb = (db) => {
  localStorage.setItem(dbStorageKey, JSON.stringify(db));
};

const toAuthPayload = (account, role) => ({
  token: `demo-${role.toLowerCase()}-${account.id}`,
  role,
  id: account.id,
  fullName: account.fullName,
  email: account.email
});

const getAuth = () => {
  const saved = localStorage.getItem(authStorageKey);
  return saved ? JSON.parse(saved) : null;
};

const getCurrentClient = (db) => {
  const auth = getAuth();
  if (auth?.role === "CLIENT") {
    const match = db.clients.find((item) => item.id === auth.id);
    if (match) return match;
  }
  return db.clients[0] || null;
};

const getCurrentFreelancer = (db) => {
  const auth = getAuth();
  if (auth?.role === "FREELANCER") {
    const match = db.freelancers.find((item) => item.id === auth.id);
    if (match) return match;
  }
  return db.freelancers[0] || null;
};

const nextId = (items) =>
  items.reduce((max, item) => (item.id > max ? item.id : max), 0) + 1;

const fail = (message) => {
  const error = new Error(message);
  error.response = { data: { error: message } };
  throw error;
};

const withAverageRatings = (db, freelancer) => {
  const ratings = db.reviews
    .filter((review) => review.freelancerId === freelancer.id)
    .map((review) => Number(review.rating) || 0);
  const averageRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return { ...freelancer, averageRating };
};

const mapProjectForClient = (db, project) => ({
  ...project,
  freelancer: db.freelancers.find((item) => item.id === project.freelancerId) || null
});

const mapProjectForFreelancer = (db, project) => ({
  ...project,
  client: db.clients.find((item) => item.id === project.clientId) || null
});

const ensurePendingRequestForFreelancer = (db, freelancer) => {
  const existing = db.requests.filter(
    (item) => item.freelancerId === freelancer.id && item.status === "PENDING"
  );
  if (existing.length > 0) return existing;

  const client = db.clients[0];
  if (!client) return [];

  const fallback = {
    id: nextId(db.requests),
    clientId: client.id,
    freelancerId: freelancer.id,
    clientName: client.fullName,
    type: "Portfolio landing page",
    description: "Build a responsive landing page with contact form and pricing section.",
    duration: "1 week",
    salary: "$800",
    status: "PENDING"
  };
  db.requests.push(fallback);
  saveDb(db);
  return [fallback];
};

const ensureProjectForClient = (db, client) => {
  const existing = db.projects.filter((item) => item.clientId === client.id);
  if (existing.length > 0) return existing;

  const freelancer = db.freelancers[0];
  if (!freelancer) return [];

  const fallback = {
    id: nextId(db.projects),
    clientId: client.id,
    freelancerId: freelancer.id,
    title: "Website redesign project",
    serviceName: "Web Development",
    description: "Create a clean business website with home, about, and contact pages.",
    duration: "2 weeks",
    deadline: "2 weeks",
    salary: "1200",
    status: "ACTIVE"
  };
  db.projects.push(fallback);
  saveDb(db);
  return [fallback];
};

const resolveGet = (db, path) => {
  if (path === "/categories") {
    return clone(db.categories);
  }

  if (path === "/freelancers") {
    return clone(db.freelancers.map((item) => withAverageRatings(db, item)));
  }

  if (path.startsWith("/freelancers/") && !path.startsWith("/freelancers/me")) {
    const id = Number(path.split("/")[2]);
    const freelancer = db.freelancers.find((item) => item.id === id);
    if (!freelancer) return fail("Freelancer not found.");
    const reviews = db.reviews.filter((item) => item.freelancerId === id);
    return clone({
      ...withAverageRatings(db, freelancer),
      reviews,
      services: []
    });
  }

  if (path === "/freelancers/me") {
    const freelancer = getCurrentFreelancer(db);
    if (!freelancer) return fail("Freelancer profile not found.");
    const reviews = db.reviews.filter((item) => item.freelancerId === freelancer.id);
    return clone({
      ...withAverageRatings(db, freelancer),
      reviews
    });
  }

  if (path === "/freelancers/me/projects") {
    const freelancer = getCurrentFreelancer(db);
    if (!freelancer) return fail("Freelancer profile not found.");
    const projects = db.projects
      .filter((item) => item.freelancerId === freelancer.id)
      .map((item) => mapProjectForFreelancer(db, item));
    return clone(projects);
  }

  if (path === "/freelancers/me/reviews") {
    const freelancer = getCurrentFreelancer(db);
    if (!freelancer) return fail("Freelancer profile not found.");
    const reviews = db.reviews.filter((item) => item.freelancerId === freelancer.id);
    return clone(reviews);
  }

  if (path === "/freelancers/me/requests") {
    const freelancer = getCurrentFreelancer(db);
    if (!freelancer) return fail("Freelancer profile not found.");
    const requests = ensurePendingRequestForFreelancer(db, freelancer);
    return clone(requests);
  }

  if (path === "/clients/me") {
    const client = getCurrentClient(db);
    if (!client) return fail("Client profile not found.");
    return clone(client);
  }

  if (path === "/clients/me/projects") {
    const client = getCurrentClient(db);
    if (!client) return fail("Client profile not found.");
    const projects = ensureProjectForClient(db, client)
      .map((item) => mapProjectForClient(db, item));
    return clone(projects);
  }

  return fail("Endpoint not found.");
};

const resolvePost = (db, path, payload = {}) => {
  if (path === "/auth/login") {
    const email = (payload.email || "guest@demo.com").toLowerCase().trim();
    const password = payload.password || "demo123";
    const client = db.clients.find((item) => item.email.toLowerCase() === email);
    if (client) return clone(toAuthPayload(client, "CLIENT"));

    const freelancer = db.freelancers.find((item) => item.email.toLowerCase() === email);
    if (freelancer) return clone(toAuthPayload(freelancer, "FREELANCER"));

    const shouldCreateFreelancer =
      email.includes("freelancer") || email.includes("talent");

    if (shouldCreateFreelancer) {
      const newFreelancer = {
        id: nextId(db.freelancers),
        fullName: "New Freelancer",
        bio: "",
        skills: "",
        categories: ["Web Development"],
        whatsapp: "",
        contactEmail: email,
        profilePhotoUrl: "",
        email,
        password
      };
      db.freelancers.push(newFreelancer);
      saveDb(db);
      return clone(toAuthPayload(newFreelancer, "FREELANCER"));
    }

    const newClient = {
      id: nextId(db.clients),
      fullName: "New Client",
      company: "Individual",
      profilePhotoUrl: "",
      email,
      password
    };
    db.clients.push(newClient);
    saveDb(db);
    return clone(toAuthPayload(newClient, "CLIENT"));
  }

  if (path === "/auth/register/client") {
    const email = (payload.email || "").toLowerCase().trim();
    const exists =
      db.clients.some((item) => item.email.toLowerCase() === email) ||
      db.freelancers.some((item) => item.email.toLowerCase() === email);
    if (exists) return fail("Email already exists.");

    const client = {
      id: nextId(db.clients),
      fullName: payload.fullName || "New Client",
      company: payload.company || "Individual",
      profilePhotoUrl: payload.profilePhotoUrl || "",
      email,
      password: payload.password || "demo123"
    };
    db.clients.push(client);
    saveDb(db);
    return clone(toAuthPayload(client, "CLIENT"));
  }

  if (path === "/auth/register/freelancer") {
    const email = (payload.email || "").toLowerCase().trim();
    const exists =
      db.clients.some((item) => item.email.toLowerCase() === email) ||
      db.freelancers.some((item) => item.email.toLowerCase() === email);
    if (exists) return fail("Email already exists.");

    const freelancer = {
      id: nextId(db.freelancers),
      fullName: payload.fullName || "New Freelancer",
      bio: payload.bio || "",
      skills: payload.skills || "",
      categories: payload.categoryNames || [],
      whatsapp: payload.whatsapp || "",
      contactEmail: payload.contactEmail || email,
      profilePhotoUrl: payload.profilePhotoUrl || "",
      email,
      password: payload.password || "demo123"
    };
    db.freelancers.push(freelancer);
    saveDb(db);
    return clone(toAuthPayload(freelancer, "FREELANCER"));
  }

  if (path === "/clients/me/requests") {
    const client = getCurrentClient(db);
    if (!client) return fail("Client profile not found.");
    const freelancerId = Number(payload.freelancerId);
    const freelancer = db.freelancers.find((item) => item.id === freelancerId);
    if (!freelancer) return fail("Freelancer not found.");

    const request = {
      id: nextId(db.requests),
      clientId: client.id,
      freelancerId,
      clientName: client.fullName,
      type: payload.type || "Service",
      description: payload.description || "",
      duration: payload.duration || "",
      salary: payload.salary || "",
      status: "PENDING"
    };
    db.requests.push(request);
    saveDb(db);
    return clone(request);
  }

  if (path.endsWith("/complete") && path.startsWith("/clients/me/projects/")) {
    const client = getCurrentClient(db);
    if (!client) return fail("Client profile not found.");
    const projectId = Number(path.split("/")[4]);
    const project = db.projects.find(
      (item) => item.id === projectId && item.clientId === client.id
    );
    if (!project) return fail("Project not found.");

    project.status = "COMPLETED";
    const existingReview = db.reviews.find((item) => item.projectId === project.id);
    if (!existingReview) {
      db.reviews.push({
        id: nextId(db.reviews),
        projectId: project.id,
        clientId: client.id,
        freelancerId: project.freelancerId,
        clientName: client.fullName,
        rating: Number(payload.rating) || 5,
        comment: payload.comment || "Great work."
      });
    }
    saveDb(db);
    return clone({ success: true });
  }

  if (path.endsWith("/decline") && path.startsWith("/freelancers/me/requests/")) {
    const freelancer = getCurrentFreelancer(db);
    if (!freelancer) return fail("Freelancer profile not found.");
    const requestId = Number(path.split("/")[4]);
    db.requests = db.requests.filter(
      (item) => !(item.id === requestId && item.freelancerId === freelancer.id)
    );
    saveDb(db);
    return clone({ success: true });
  }

  if (path.endsWith("/accept") && path.startsWith("/freelancers/me/requests/")) {
    const freelancer = getCurrentFreelancer(db);
    if (!freelancer) return fail("Freelancer profile not found.");
    const requestId = Number(path.split("/")[4]);
    const request = db.requests.find(
      (item) => item.id === requestId && item.freelancerId === freelancer.id
    );
    if (!request) return fail("Request not found.");

    db.projects.push({
      id: nextId(db.projects),
      clientId: request.clientId,
      freelancerId: request.freelancerId,
      title: request.type || "New Project",
      serviceName: request.type || "Service",
      description: request.description || "",
      duration: request.duration || "",
      deadline: request.duration || "",
      salary: request.salary || "",
      status: "ACTIVE"
    });
    db.requests = db.requests.filter((item) => item.id !== request.id);
    saveDb(db);
    return clone({ success: true });
  }

  return fail("Endpoint not found.");
};

const resolvePut = (db, path, payload = {}) => {
  if (path === "/clients/me") {
    const client = getCurrentClient(db);
    if (!client) return fail("Client profile not found.");
    Object.assign(client, {
      fullName: payload.fullName || client.fullName,
      company: payload.company || client.company,
      profilePhotoUrl: payload.profilePhotoUrl || client.profilePhotoUrl
    });
    saveDb(db);
    return clone(client);
  }

  if (path === "/freelancers/me") {
    const freelancer = getCurrentFreelancer(db);
    if (!freelancer) return fail("Freelancer profile not found.");
    Object.assign(freelancer, {
      fullName: payload.fullName || freelancer.fullName,
      bio: payload.bio || freelancer.bio,
      skills: payload.skills || freelancer.skills,
      categories: payload.categoryNames || freelancer.categories,
      whatsapp: payload.whatsapp || freelancer.whatsapp,
      contactEmail: payload.contactEmail || freelancer.contactEmail,
      profilePhotoUrl: payload.profilePhotoUrl || freelancer.profilePhotoUrl
    });
    saveDb(db);
    return clone(withAverageRatings(db, freelancer));
  }

  return fail("Endpoint not found.");
};

const request = (method, path, payload) => {
  try {
    const db = loadDb();
    if (method === "GET") return Promise.resolve({ data: resolveGet(db, path) });
    if (method === "POST")
      return Promise.resolve({ data: resolvePost(db, path, payload) });
    if (method === "PUT")
      return Promise.resolve({ data: resolvePut(db, path, payload) });
    fail("Method not supported.");
    return Promise.resolve({ data: null });
  } catch (error) {
    return Promise.reject(error);
  }
};

const api = {
  get: (path) => request("GET", path),
  post: (path, payload) => request("POST", path, payload),
  put: (path, payload) => request("PUT", path, payload)
};

export default api;
