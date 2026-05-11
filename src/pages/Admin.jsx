import { useState, useEffect, useRef, useMemo, useId } from "react";
import { supabase } from "../lib/supabase";
import AdminSkeleton from "../components/AdminSkeleton";
import { useAuth, logout } from "../lib/auth";

/* ───────────────────────────  TOKENS  ─────────────────────────── */
const C = {
  side: "#0a0a0a",
  sideBd: "#1a1a1a",
  sideTx: "#a1a1aa",
  sideTxA: "#fff",
  bg: "#f5f5f7",
  card: "#ffffff",
  bd: "#e5e7eb",
  bdH: "#d4d4d8",
  tx: "#111827",
  txMu: "#6b7280",
  txDim: "#9ca3af",
  acc: "#378ADD",
  accD: "#185FA5",
  accBg: "#eaf2fb",
  ok: "#16a34a",
  warn: "#d97706",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
};

const SECTIONS = [
  { id: "hero",       label: "Hero",       num: "01" },
  { id: "projects",   label: "Projects",   num: "02" },
  { id: "about",      label: "About",      num: "03" },
  { id: "stats",      label: "Metrics",    num: "04" },
  { id: "expertise",  label: "Expertise",  num: "05" },
  { id: "cases",      label: "Cases",      num: "06" },
  { id: "experience", label: "Experience", num: "07" },
  { id: "stack",      label: "Stack",      num: "08" },
  { id: "domains",    label: "Domains",    num: "09" },
];

const nextId = (list = []) => (list.length ? Math.max(...list.map(x => x.id || 0)) + 1 : 1);

/* ───────────────────────────  ROOT  ─────────────────────────── */
export default function Admin() {
  const [data, setData] = useState(null);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | success | error
  const [saveError, setSaveError] = useState("");
  const [activeSection, setActiveSection] = useState("hero");
  const mainRef = useRef(null);
  const { user } = useAuth();

  /* ── load из Supabase ── */
  const reloadFromSupabase = async () => {
    const [contentRes, casesRes, expRes, projectsRes] = await Promise.all([
      supabase.from("site_content").select("*"),
      supabase.from("cases").select("*").order("id", { ascending: true }),
      supabase.from("experience").select("*").order("id", { ascending: true }),
      supabase.from("projects").select("*").order("sort_order", { ascending: true }),
    ]);
    if (contentRes.error)  throw contentRes.error;
    if (casesRes.error)    throw casesRes.error;
    if (expRes.error)      throw expRes.error;
    if (projectsRes.error) throw projectsRes.error;

    const byKey = Object.fromEntries(
      (contentRes.data || []).map(row => [row.key, row.data])
    );

    return {
      hero:       byKey.hero       ?? {},
      about:      byKey.about      ?? "",
      stack:      byKey.stack      ?? [],
      domains:    byKey.domains    ?? [],
      stats:      byKey.stats      ?? [],
      expertise:  byKey.expertise  ?? [],
      cases:      casesRes.data    ?? [],
      experience: expRes.data      ?? [],
      projects:   projectsRes.data ?? [],
    };
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await reloadFromSupabase();
        if (cancelled) return;
        setData(json);
        setOriginal(JSON.parse(JSON.stringify(json)));
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e.message || "Не удалось загрузить данные из Supabase");
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── dirty tracking + beforeunload guard ── */
  const isDirty = useMemo(() => {
    if (!data || !original) return false;
    return JSON.stringify(data) !== JSON.stringify(original);
  }, [data, original]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  /* ── scroll spy ── */
  useEffect(() => {
    if (!mainRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { root: mainRef.current, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [data]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  /* ── save в Supabase: site_content (upsert), cases/experience (split insert+upsert) ── */
  const saveToSupabase = async () => {
    setSaveStatus("saving");
    setSaveError("");
    try {
      // 1. site_content — скалярные и object/array секции одним батчем
      const contentRows = [
        { key: "hero",      data: data.hero      ?? {} },
        { key: "about",     data: data.about     ?? "" },
        { key: "stack",     data: data.stack     ?? [] },
        { key: "domains",   data: data.domains   ?? [] },
        { key: "stats",     data: data.stats     ?? [] },
        { key: "expertise", data: data.expertise ?? [] },
      ];
      const contentRes = await supabase
        .from("site_content")
        .upsert(contentRows, { onConflict: "key" });
      if (contentRes.error) throw contentRes.error;

      // helper: разделить массив на новые (без id) и существующие
      const split = (rows) => {
        const fresh = [], existing = [];
        for (const row of rows || []) {
          if (row.id == null) {
            // strip id key entirely — пусть БД сгенерит auto-increment
            const { id: _ignore, ...rest } = row;
            fresh.push(rest);
          } else {
            existing.push(row);
          }
        }
        return { fresh, existing };
      };

      // 2. cases
      const c = split(data.cases);
      if (c.existing.length) {
        const r = await supabase.from("cases").upsert(c.existing, { onConflict: "id" });
        if (r.error) throw r.error;
      }
      if (c.fresh.length) {
        const r = await supabase.from("cases").insert(c.fresh);
        if (r.error) throw r.error;
      }

      // 3. experience
      const e = split(data.experience);
      if (e.existing.length) {
        const r = await supabase.from("experience").upsert(e.existing, { onConflict: "id" });
        if (r.error) throw r.error;
      }
      if (e.fresh.length) {
        const r = await supabase.from("experience").insert(e.fresh);
        if (r.error) throw r.error;
      }

      // 4. projects
      const p = split(data.projects);
      if (p.existing.length) {
        const r = await supabase.from("projects").upsert(p.existing, { onConflict: "id" });
        if (r.error) throw r.error;
      }
      if (p.fresh.length) {
        const r = await supabase.from("projects").insert(p.fresh);
        if (r.error) throw r.error;
      }

      // 5. перезагрузить из БД, чтобы поймать настоящие id у новых записей
      const fresh = await reloadFromSupabase();

      setData(fresh);
      setOriginal(JSON.parse(JSON.stringify(fresh)));
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3500);
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err.message || "Save failed");
      setTimeout(() => setSaveStatus("idle"), 6000);
    }
  };

  const reset = () => {
    if (!isDirty) return;
    if (!confirm("Откатить все несохранённые изменения?")) return;
    setData(JSON.parse(JSON.stringify(original)));
  };

  if (loading) return <AdminSkeleton />;
  if (error)   return <CenterMessage tone="danger">{error}</CenterMessage>;

  /* ── update helpers ── */
  const setHero    = (k, v) => setData({ ...data, hero: { ...data.hero, [k]: v } });
  const setAbout   = (v)    => setData({ ...data, about: v });
  const setListAt  = (key, idx, patch) => {
    const list = [...data[key]];
    list[idx] = { ...list[idx], ...patch };
    setData({ ...data, [key]: list });
  };
  const addToList  = (key, item) => setData({ ...data, [key]: [...data[key], item] });
  const removeFromList = (key, idx) => {
    if (!confirm("Удалить элемент?")) return;
    setData({ ...data, [key]: data[key].filter((_, i) => i !== idx) });
  };
  const setStringList = (key, list) => setData({ ...data, [key]: list });

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg, color: C.tx, fontFamily: "Inter, system-ui, -apple-system, sans-serif", colorScheme: "light" }}>
      <Sidebar active={activeSection} onSelect={scrollTo} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar
          isDirty={isDirty}
          saveStatus={saveStatus}
          saveError={saveError}
          onSave={saveToSupabase}
          onReset={reset}
          user={user}
          onLogout={logout}
        />

        <main ref={mainRef} style={{ flex: 1, overflowY: "auto", padding: "32px 40px 120px" }}>
          <div style={{ maxWidth: 920, margin: "0 auto" }}>

            {/* HERO */}
            <Section id="hero" num="01" title="Hero" subtitle="Имя, должность, контакты, статус доступности">
              <Card>
                <Row>
                  <Field label="Name"  value={data.hero?.name}  onChange={v => setHero("name", v)} />
                  <Field label="Title" value={data.hero?.title} onChange={v => setHero("title", v)} />
                </Row>
                <Field label="Tagline" type="textarea" value={data.hero?.tagline} onChange={v => setHero("tagline", v)} />
                <Row>
                  <Field label="Email"    value={data.hero?.email}    onChange={v => setHero("email", v)} />
                  <Field label="Location" value={data.hero?.location} onChange={v => setHero("location", v)} />
                </Row>
                <Row>
                  <Field label="LinkedIn"  value={data.hero?.linkedin}  onChange={v => setHero("linkedin", v)} />
                  <Field label="Instagram" value={data.hero?.instagram} onChange={v => setHero("instagram", v)} />
                </Row>
                <Row>
                  <Field label="Telegram" value={data.hero?.telegram} onChange={v => setHero("telegram", v)} />
                  <Field label="Avatar URL" value={data.hero?.avatar || "/avatar.jpg"} onChange={v => setHero("avatar", v)} />
                </Row>
                <Toggle
                  label="Available for work"
                  hint="Зелёный бейдж в Hero"
                  checked={!!data.hero?.available}
                  onChange={v => setHero("available", v)}
                />
              </Card>
            </Section>

            {/* PROJECTS */}
            <Section
              id="projects" num="02" title="Projects"
              subtitle="Карточки портфолио. Self-project / Vibecode / клиентский."
              action={<BtnGhost onClick={() => addToList("projects", {
                title: "New project", desc: "", company: "Self-project",
                domain: "", status: "in-dev", date: "", icon: "globe",
                image: "", placeholder: "",
                sort_order: (data.projects?.length || 0) * 10 + 10, hidden: false,
              })}>+ Add project</BtnGhost>}
            >
              {data.projects?.map((p, i) => (
                <Card key={p.id ?? i} accent>
                  <ItemHeader
                    title={p.title || "Untitled"}
                    subtitle={`${p.company || "—"} · ${p.domain || "—"} · ${p.status || "—"}`}
                    hidden={!!p.hidden}
                    onToggleHidden={() => setListAt("projects", i, { hidden: !p.hidden })}
                    onRemove={() => removeFromList("projects", i)}
                  />
                  <Field label="Title" value={p.title}
                         onChange={v => setListAt("projects", i, { title: v })} />
                  <Field label="Description" type="textarea" rows={3} value={p.desc}
                         onChange={v => setListAt("projects", i, { desc: v })} />
                  <Row>
                    <Field label="Company" value={p.company}
                           onChange={v => setListAt("projects", i, { company: v })} />
                    <Field label="Domain"  value={p.domain}
                           onChange={v => setListAt("projects", i, { domain: v })} />
                  </Row>
                  <Row>
                    <Field label="Status" type="select" options={["in-dev", "ready"]}
                           value={p.status} onChange={v => setListAt("projects", i, { status: v })} />
                    <Field label="Date (e.g. 10.2025 or Q1 2026)" value={p.date}
                           onChange={v => setListAt("projects", i, { date: v })} />
                    <Field label="Icon" type="select" options={["globe", "kanban", "spark", "chart", "box"]}
                           value={p.icon} onChange={v => setListAt("projects", i, { icon: v })} />
                  </Row>
                  <Row>
                    <Field label="Image URL" value={p.image}
                           onChange={v => setListAt("projects", i, { image: v })} />
                    <Field label="Placeholder caption" value={p.placeholder}
                           onChange={v => setListAt("projects", i, { placeholder: v })} />
                  </Row>
                  <Field label="Sort order (lower = higher on page)"
                         value={String(p.sort_order ?? "")}
                         onChange={v => setListAt("projects", i, { sort_order: parseInt(v, 10) || 0 })} />
                </Card>
              ))}
            </Section>

            {/* ABOUT */}
            <Section id="about" num="03" title="About" subtitle="Текст параграфа в секции Professional story">
              <Card>
                <Field
                  label="About"
                  type="textarea"
                  rows={6}
                  value={data.about}
                  onChange={setAbout}
                />
              </Card>
            </Section>

            {/* STATS */}
            <Section
              id="stats" num="04" title="Metrics"
              subtitle="Цифры в Hero (4 штуки оптимально)"
              action={<BtnGhost onClick={() => addToList("stats", { value: "0", label: "new metric" })}>+ Add metric</BtnGhost>}
            >
              {data.stats?.map((s, i) => (
                <Card key={i}>
                  <ItemHeader
                    title={s.value || "—"}
                    subtitle={s.label}
                    hidden={!!s.hidden}
                    onToggleHidden={() => setListAt("stats", i, { hidden: !s.hidden })}
                    onRemove={() => removeFromList("stats", i)}
                  />
                  <Row>
                    <Field label="Value" value={s.value} onChange={v => setListAt("stats", i, { value: v })} />
                    <Field label="Label" value={s.label} onChange={v => setListAt("stats", i, { label: v })} />
                  </Row>
                </Card>
              ))}
            </Section>

            {/* EXPERTISE */}
            <Section
              id="expertise" num="05" title="Expertise"
              subtitle="Карточки 'What I do'. Иконки: doc, sys, fig, ai, ppl"
              action={<BtnGhost onClick={() => addToList("expertise", { id: nextId(data.expertise), title: "New expertise", desc: "", icon: "doc" })}>+ Add expertise</BtnGhost>}
            >
              {data.expertise?.map((e, i) => (
                <Card key={e.id ?? i}>
                  <ItemHeader
                    title={e.title || "Untitled"}
                    subtitle={`icon: ${e.icon}`}
                    hidden={!!e.hidden}
                    onToggleHidden={() => setListAt("expertise", i, { hidden: !e.hidden })}
                    onRemove={() => removeFromList("expertise", i)}
                  />
                  <Row>
                    <Field label="Title" value={e.title} onChange={v => setListAt("expertise", i, { title: v })} />
                    <Field
                      label="Icon"
                      type="select"
                      options={["doc", "sys", "fig", "ai", "ppl"]}
                      value={e.icon}
                      onChange={v => setListAt("expertise", i, { icon: v })}
                    />
                  </Row>
                  <Field label="Description" type="textarea" value={e.desc} onChange={v => setListAt("expertise", i, { desc: v })} />
                </Card>
              ))}
            </Section>

            {/* CASES */}
            <Section
              id="cases" num="06" title="Cases"
              subtitle="Selected work. Аккордеон Context / Task / Result"
              action={<BtnGhost onClick={() => addToList("cases", { title: "Untitled case", company: "", period: "", domain: "", tags: [], context: "", task: "", result: "", hidden: false })}>+ Add case</BtnGhost>}
            >
              {data.cases?.map((c, i) => (
                <Card key={c.id ?? i} accent>
                  <ItemHeader
                    title={c.title || "Untitled case"}
                    subtitle={`${c.company || "—"} · ${c.period || "—"}`}
                    hidden={!!c.hidden}
                    onToggleHidden={() => setListAt("cases", i, { hidden: !c.hidden })}
                    onRemove={() => removeFromList("cases", i)}
                  />
                  <Field label="Title" value={c.title} onChange={v => setListAt("cases", i, { title: v })} />
                  <Row>
                    <Field label="Company" value={c.company} onChange={v => setListAt("cases", i, { company: v })} />
                    <Field label="Period"  value={c.period}  onChange={v => setListAt("cases", i, { period: v })} />
                    <Field label="Domain"  value={c.domain}  onChange={v => setListAt("cases", i, { domain: v })} />
                  </Row>
                  <TagEditor
                    label="Tags"
                    tags={c.tags || []}
                    onChange={tags => setListAt("cases", i, { tags })}
                    placeholder="Add tag…"
                  />
                  <Field label="Context" type="textarea" rows={3} value={c.context} onChange={v => setListAt("cases", i, { context: v })} />
                  <Field label="Task"    type="textarea" rows={3} value={c.task}    onChange={v => setListAt("cases", i, { task: v })} />
                  <Field label="Result"  type="textarea" rows={3} value={c.result}  onChange={v => setListAt("cases", i, { result: v })} />
                </Card>
              ))}
            </Section>

            {/* EXPERIENCE */}
            <Section
              id="experience" num="07" title="Experience"
              subtitle="Career timeline. Зелёная точка = current"
              action={<BtnGhost onClick={() => addToList("experience", { company: "New company", role: "", period: "", current: false })}>+ Add row</BtnGhost>}
            >
              {data.experience?.map((e, i) => (
                <Card key={e.id ?? i}>
                  <ItemHeader
                    title={e.company || "—"}
                    subtitle={`${e.role || "—"} · ${e.period || "—"}`}
                    hidden={!!e.hidden}
                    onToggleHidden={() => setListAt("experience", i, { hidden: !e.hidden })}
                    onRemove={() => removeFromList("experience", i)}
                  />
                  <Row>
                    <Field label="Company" value={e.company} onChange={v => setListAt("experience", i, { company: v })} />
                    <Field label="Role"    value={e.role}    onChange={v => setListAt("experience", i, { role: v })} />
                    <Field label="Period"  value={e.period}  onChange={v => setListAt("experience", i, { period: v })} />
                  </Row>
                  <Toggle
                    label="Current"
                    hint="Подсвечивает строку зелёной точкой"
                    checked={!!e.current}
                    onChange={v => setListAt("experience", i, { current: v })}
                  />
                </Card>
              ))}
            </Section>

            {/* STACK */}
            <Section id="stack" num="08" title="Stack & tools" subtitle="Теги под Experience">
              <Card>
                <TagEditor
                  label="Stack"
                  tags={data.stack || []}
                  onChange={list => setStringList("stack", list)}
                  placeholder="Add tool…"
                />
              </Card>
            </Section>

            {/* DOMAINS */}
            <Section id="domains" num="09" title="Domains" subtitle="Теги в About → Domains">
              <Card>
                <TagEditor
                  label="Domains"
                  tags={data.domains || []}
                  onChange={list => setStringList("domains", list)}
                  placeholder="Add domain…"
                  accent
                />
              </Card>
            </Section>

          </div>
        </main>
      </div>

      <GlobalStyles />
    </div>
  );
}

/* ───────────────────────────  SIDEBAR  ─────────────────────────── */
function Sidebar({ active, onSelect }) {
  return (
    <aside style={{
      width: 240, flexShrink: 0, background: C.side, color: C.sideTx,
      borderRight: `1px solid ${C.sideBd}`, display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "22px 22px 18px", borderBottom: `1px solid ${C.sideBd}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.acc, boxShadow: `0 0 12px ${C.acc}` }} />
          <span style={{ color: C.sideTxA, fontSize: 13, fontWeight: 700, letterSpacing: "1px" }}>ALES</span>
          <span style={{ color: C.sideTx, fontSize: 11, letterSpacing: "1px" }}>ADMIN</span>
        </div>
      </div>

      <nav style={{ padding: "14px 10px", flex: 1, overflowY: "auto" }}>
        {SECTIONS.map(s => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="side-link"
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 8, marginBottom: 2,
                background: isActive ? "rgba(55, 138, 221, 0.15)" : "transparent",
                color: isActive ? C.sideTxA : C.sideTx,
                border: "none", cursor: "pointer", textAlign: "left",
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{
                fontSize: 10, fontFamily: "ui-monospace, monospace",
                color: isActive ? C.acc : C.sideTx, opacity: isActive ? 1 : 0.6, width: 22,
              }}>{s.num}</span>
              <span>{s.label}</span>
              {isActive && <span style={{ marginLeft: "auto", width: 4, height: 16, background: C.acc, borderRadius: 2 }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.sideBd}`, fontSize: 11, color: C.sideTx, lineHeight: 1.5 }}>
        Сохранение через<br/><code style={{ color: C.acc }}>Supabase</code> · моментально
      </div>
    </aside>
  );
}

/* ───────────────────────────  TOPBAR  ─────────────────────────── */
function Topbar({ isDirty, saveStatus, saveError, onSave, onReset, user, onLogout }) {
  const saving = saveStatus === "saving";

  return (
    <header style={{
      height: 64, flexShrink: 0, background: C.card, borderBottom: `1px solid ${C.bd}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>Content editor</span>
        <DirtyBadge isDirty={isDirty} saveStatus={saveStatus} saveError={saveError} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isDirty && (
          <button onClick={onReset} className="btn-ghost" style={btnGhostStyle}>Reset</button>
        )}
        <a href="/" target="_blank" rel="noreferrer" className="btn-ghost" style={{ ...btnGhostStyle, textDecoration: "none" }}>
          View site ↗
        </a>
        {user && <UserMenu user={user} onLogout={onLogout} />}
        <button
          onClick={onSave}
          disabled={saving || !isDirty}
          className="btn-primary"
          style={{
            ...btnPrimaryStyle,
            background: saveStatus === "success" ? C.ok : saveStatus === "error" ? C.danger : C.acc,
            opacity: !isDirty && saveStatus === "idle" ? 0.5 : 1,
            cursor: !isDirty || saving ? "not-allowed" : "pointer",
          }}
        >
          {saving                    ? "Publishing…" :
           saveStatus === "success"  ? "✓ Published" :
           saveStatus === "error"    ? "Retry" :
                                       "Publish"}
        </button>
      </div>
    </header>
  );
}

function DirtyBadge({ isDirty, saveStatus, saveError }) {
  if (saveStatus === "success") return <Badge color={C.ok}>Saved</Badge>;
  if (saveStatus === "error")   return <Badge color={C.danger} title={saveError}>Error{saveError ? ": " + saveError : ""}</Badge>;
  if (isDirty)                  return <Badge color={C.warn}>Unsaved changes</Badge>;
  return <Badge color={C.txDim} muted>Synced</Badge>;
}

function Badge({ children, color, muted, title }) {
  return (
    <span title={title} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 500, letterSpacing: "0.02em",
      padding: "4px 10px", borderRadius: 999,
      color, background: muted ? "transparent" : color + "1a",
      border: muted ? `1px solid ${C.bd}` : `1px solid ${color}33`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {children}
    </span>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initial = (user.name || user.login || "?").trim()[0]?.toUpperCase() || "?";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={`Signed in as ${user.login}`}
        className="btn-ghost"
        style={{ ...btnGhostStyle, padding: "0 8px 0 4px", display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        {user.avatar
          ? <img src={user.avatar} alt="" width={26} height={26} style={{ borderRadius: "50%", display: "block" }} />
          : <span style={{
              width: 26, height: 26, borderRadius: "50%", background: C.acc, color: "#fff",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600,
            }}>{initial}</span>}
        <span style={{ fontSize: 12, color: C.txMu, fontWeight: 500 }}>@{user.login}</span>
        <span style={{ fontSize: 10, color: C.txDim }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          background: C.card, border: `1px solid ${C.bd}`, borderRadius: 10,
          boxShadow: "0 12px 32px rgba(0,0,0,0.12)", minWidth: 200, zIndex: 50, overflow: "hidden",
        }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.bd}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.tx }}>{user.name || user.login}</div>
            <div style={{ fontSize: 11, color: C.txMu, marginTop: 2 }}>@{user.login} · {user.role}</div>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: "100%", textAlign: "left", padding: "10px 14px",
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 13, color: C.danger, display: "flex", alignItems: "center", gap: 8,
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.dangerBg}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────  SECTION  ─────────────────────────── */
function Section({ id, num, title, subtitle, action, children }) {
  return (
    <section id={id} style={{ scrollMarginTop: 24, marginBottom: 56 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", color: C.acc, letterSpacing: "0.1em", marginBottom: 4 }}>{num}</div>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: C.tx, letterSpacing: "-0.01em" }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 13, color: C.txMu, margin: "4px 0 0", lineHeight: 1.5 }}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </section>
  );
}

function Card({ children, accent }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.bd}`, borderRadius: 10,
      padding: 20, borderLeft: accent ? `3px solid ${C.acc}` : `1px solid ${C.bd}`,
      display: "flex", flexDirection: "column", gap: 14,
    }}>{children}</div>
  );
}

function ItemHeader({ title, subtitle, hidden, onToggleHidden, onRemove }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      paddingBottom: 12, borderBottom: `1px dashed ${C.bd}`,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: hidden ? C.txDim : C.tx, textDecoration: hidden ? "line-through" : "none" }}>
            {title}
          </span>
          {hidden && <Badge color={C.txDim}>Hidden</Badge>}
        </div>
        {subtitle && <div style={{ fontSize: 12, color: C.txMu, marginTop: 2 }}>{subtitle}</div>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <button onClick={onToggleHidden} title={hidden ? "Показать" : "Скрыть"} className="icon-btn" style={iconBtnStyle}>
          {hidden ? <EyeOff /> : <Eye />}
        </button>
        <button onClick={onRemove} title="Удалить" className="icon-btn icon-btn--danger" style={iconBtnStyle}>
          <Trash />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────  FIELDS  ─────────────────────────── */
function Row({ children }) {
  const arr = Array.isArray(children) ? children : [children];
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${arr.length}, 1fr)`, gap: 12 }}>{children}</div>;
}

function Field({ label, value, onChange, type = "text", options, rows = 3 }) {
  const id = useId();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      {type === "textarea" ? (
        <textarea id={id} className="input" value={value ?? ""} onChange={e => onChange(e.target.value)} rows={rows}
          style={{ ...inputBaseStyle, resize: "vertical", minHeight: 72 }} />
      ) : type === "select" ? (
        <select id={id} className="input" value={value ?? ""} onChange={e => onChange(e.target.value)} style={inputBaseStyle}>
          {(options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input id={id} className="input" type="text" value={value ?? ""} onChange={e => onChange(e.target.value)} style={inputBaseStyle} />
      )}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <span
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 999, padding: 2,
          background: checked ? C.acc : "#d4d4d8",
          transition: "background 0.18s", flexShrink: 0,
          display: "flex", alignItems: "center",
        }}
      >
        <span style={{
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transform: checked ? "translateX(16px)" : "translateX(0)",
          transition: "transform 0.18s", boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        }} />
      </span>
      <span>
        <span style={{ fontSize: 13, fontWeight: 500, color: C.tx, display: "block" }}>{label}</span>
        {hint && <span style={{ fontSize: 12, color: C.txMu }}>{hint}</span>}
      </span>
    </label>
  );
}

function TagEditor({ label, tags, onChange, placeholder, accent }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (tags.includes(v)) { setInput(""); return; }
    onChange([...tags, v]);
    setInput("");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {tags.map((t, i) => (
          <span key={t + i} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: 999, fontSize: 12,
            background: accent ? C.accBg : "#f3f4f6",
            color: accent ? C.accD : C.tx,
            border: `1px solid ${accent ? "#cfe1f5" : C.bd}`,
          }}>
            {t}
            <button
              onClick={() => onChange(tags.filter((_, idx) => idx !== i))}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", opacity: 0.55, fontSize: 14, lineHeight: 1, padding: 0 }}
              title="Remove"
            >×</button>
          </span>
        ))}
        {tags.length === 0 && <span style={{ fontSize: 12, color: C.txDim }}>пусто</span>}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          className="input"
          value={input}
          placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          style={{ ...inputBaseStyle, flex: 1 }}
        />
        <button onClick={add} className="btn-ghost" style={btnGhostStyle}>Add</button>
      </div>
    </div>
  );
}

/* ───────────────────────────  ICONS  ─────────────────────────── */
const Eye    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22"/></svg>;
const Trash  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;

/* ───────────────────────────  STYLES  ─────────────────────────── */
const labelStyle = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: C.txMu,
};

const inputBaseStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#fff", color: C.tx,
  border: `1px solid ${C.bd}`, borderRadius: 8,
  padding: "9px 12px", fontSize: 13, lineHeight: 1.5,
  outline: "none", fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const btnPrimaryStyle = {
  height: 36, padding: "0 16px", borderRadius: 8,
  fontSize: 13, fontWeight: 600, color: "#fff",
  background: C.acc, border: "none",
  cursor: "pointer", letterSpacing: "0.01em",
  transition: "background 0.15s, opacity 0.15s",
};

const btnGhostStyle = {
  height: 36, padding: "0 14px", borderRadius: 8,
  fontSize: 13, fontWeight: 500, color: C.tx,
  background: "transparent", border: `1px solid ${C.bd}`,
  cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
};

const iconBtnStyle = {
  width: 32, height: 32, padding: 0, borderRadius: 8,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "transparent", border: `1px solid ${C.bd}`, color: C.txMu,
  cursor: "pointer", transition: "all 0.15s",
};

function BtnGhost({ children, ...rest }) {
  return <button {...rest} className="btn-ghost" style={btnGhostStyle}>{children}</button>;
}

function CenterMessage({ children, tone }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.bg, color: tone === "danger" ? C.danger : C.tx,
      fontFamily: "Inter, system-ui, sans-serif", fontSize: 14, padding: 24, textAlign: "center",
    }}>{children}</div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      .input:focus {
        border-color: ${C.acc} !important;
        box-shadow: 0 0 0 3px ${C.acc}26 !important;
      }
      .btn-primary:hover:not(:disabled) { background: ${C.accD} !important; }
      .btn-ghost:hover                  { background: ${C.bg}; border-color: ${C.bdH}; }
      .icon-btn:hover                   { background: ${C.bg}; color: ${C.tx}; border-color: ${C.bdH}; }
      .icon-btn--danger:hover           { background: ${C.dangerBg}; color: ${C.danger}; border-color: #fecaca; }
      .side-link:hover                  { background: rgba(255,255,255,0.04); color: ${C.sideTxA}; }
      ::selection { background: ${C.acc}40; }
      input, textarea, select { font-family: inherit; }
      * { box-sizing: border-box; }
      ::-webkit-scrollbar              { width: 10px; height: 10px; }
      ::-webkit-scrollbar-thumb        { background: ${C.bdH}; border-radius: 999px; border: 2px solid ${C.bg}; }
      ::-webkit-scrollbar-thumb:hover  { background: ${C.txDim}; }
      ::-webkit-scrollbar-track        { background: transparent; }
    `}</style>
  );
}
