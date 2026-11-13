import { getStore } from "@netlify/blobs";

const EMPTY = () => ({ overrides: {}, newMandates: [], meetings: [] });

const NUM_FIELDS = ["mapping_quantum", "longlist", "spoken", "not_interested", "cv", "ideas_shared", "shortlist"];
const TEXT_FIELDS = ["status_text", "pipeline_text", "ideas_discussion"];
const BOOL_FIELDS = ["is_live", "closed"];

const str = (v, n = 200) => (v == null ? null : String(v).slice(0, n));

function cleanValue(field, v) {
  if (NUM_FIELDS.includes(field)) {
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  if (TEXT_FIELDS.includes(field)) return v == null ? "" : String(v).slice(0, 5000);
  if (BOOL_FIELDS.includes(field)) return !!v;
  throw new Error("bad field");
}

// Pure function: applies one edit to the shared state. Exported so it can be tested.
export function applyOp(state, op) {
  state.overrides ||= {};
  state.newMandates ||= [];
  state.meetings ||= [];

  switch (op && op.op) {
    case "set": {
      const id = str(op.id, 60);
      if (!id || !/^[A-Z]+-\d+$/.test(id)) throw new Error("bad id");
      state.overrides[id] ||= {};
      state.overrides[id][op.field] = cleanValue(op.field, op.value);
      break;
    }
    case "resetRow":
      delete state.overrides[str(op.id, 60)];
      break;
    case "addMandate": {
      const r = op.row || {};
      const client = str(r.client, 120);
      if (!client) throw new Error("client required");
      if (state.newMandates.length >= 500) throw new Error("too many");
      state.newMandates.push({
        client,
        position: str(r.position, 160) || "",
        start: null, days: null, longlist: null, spoken: null, cv: null, shortlist: null,
        status_text: null, pipeline_text: null,
        is_live: !!r.is_live, highlight: null, closed: false,
        mapping_quantum: null, not_interested: null, ideas_shared: null, ideas_discussion: null,
      });
      break;
    }
    case "addMeeting": {
      const r = op.row || {};
      if (state.meetings.length >= 5000) throw new Error("too many");
      state.meetings.push({
        id: str(r.id, 60) || String(Date.now()),
        date_iso: null,
        date_display: str(r.date_display, 40),
        client: str(r.client, 120),
        contact: str(r.contact, 120),
        candidate: str(r.candidate, 120),
      });
      break;
    }
    case "removeMeeting":
      state.meetings = state.meetings.filter((m) => String(m.id) !== String(op.id));
      break;
    default:
      throw new Error("unknown op");
  }
  return state;
}

export default async (req) => {
  const password = process.env.BASECAMP_PASSWORD;
  if (!password || req.headers.get("x-password") !== password) {
    return new Response("Unauthorized", { status: 401 });
  }

  const store = getStore("basecamp");
  let state = (await store.get("state", { type: "json" })) || EMPTY();

  if (req.method === "POST") {
    try {
      state = applyOp(state, await req.json());
    } catch (e) {
      return new Response(String(e.message || e), { status: 400 });
    }
    await store.setJSON("state", state);
  }

  return new Response(JSON.stringify(state), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
};

export const config = { path: "/api/state" };
