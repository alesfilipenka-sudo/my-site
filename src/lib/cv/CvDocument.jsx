/**
 * PDF-шаблон CV (@react-pdf/renderer).
 * Только вёрстка: весь текст приходит из data (Supabase), в коде — лишь заголовки разделов.
 * Модуль грузится лениво из downloadCv.js, в основной бандл сайта не попадает.
 */
import { Document, Page, Text, View, Link, StyleSheet, Font } from "@react-pdf/renderer";
import inter400 from "@fontsource/inter/files/inter-latin-400-normal.woff?url";
import inter500 from "@fontsource/inter/files/inter-latin-500-normal.woff?url";
import inter600 from "@fontsource/inter/files/inter-latin-600-normal.woff?url";
import inter700 from "@fontsource/inter/files/inter-latin-700-normal.woff?url";

Font.register({
  family: "Inter",
  fonts: [
    { src: inter400, fontWeight: 400 },
    { src: inter500, fontWeight: 500 },
    { src: inter600, fontWeight: 600 },
    { src: inter700, fontWeight: 700 },
  ],
});
// без переносов слов по слогам
Font.registerHyphenationCallback(word => [word]);

const ACC = "#4F46E5", TX = "#111114", SEC = "#4B4B55", TER = "#8A8A95", RULE = "#E4E4EA";

const s = StyleSheet.create({
  page:     { fontFamily: "Inter", fontSize: 9.3, color: TX, paddingTop: 38, paddingBottom: 40, paddingHorizontal: 44, lineHeight: 1.42 },
  name:     { fontSize: 22, fontWeight: 600, letterSpacing: -0.4, lineHeight: 1.15 },
  title:    { fontSize: 11, color: ACC, fontWeight: 500, marginTop: 4 },
  contacts: { flexDirection: "row", flexWrap: "wrap", marginTop: 7, color: SEC, fontSize: 8.6 },
  contact:  { marginRight: 12, color: SEC, textDecoration: "none" },
  section:  { marginTop: 12 },
  sh:       { fontSize: 8, fontWeight: 600, color: ACC, letterSpacing: 1.2, textTransform: "uppercase", paddingBottom: 4, borderBottomWidth: 0.6, borderBottomColor: RULE, marginBottom: 7 },
  job:      { marginBottom: 12 },
  jobHead:  { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", backgroundColor: "#F3F3F8", paddingVertical: 4, paddingHorizontal: 6, borderRadius: 3 },
  company:  { fontSize: 11, fontWeight: 700, letterSpacing: -0.1 },
  role:     { color: SEC, fontWeight: 400 },
  period:   { fontSize: 8.4, color: TER },
  jobBody:  { marginLeft: 3, paddingLeft: 11, borderLeftWidth: 1.2, borderLeftColor: "#DCDCF5", marginTop: 4 },
  proj:     { marginTop: 6 },
  projHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  projName: { fontSize: 9.3, fontWeight: 600, color: "#2B2B33" },
  projRole: { color: SEC, fontWeight: 400 },
  projSum:  { fontSize: 8.4, color: TER, marginTop: 0.5 },
  bullet:   { flexDirection: "row", marginTop: 2.5, paddingRight: 6 },
  dot:      { width: 10, color: ACC },
  bt:       { flex: 1 },
  row:      { flexDirection: "row", marginBottom: 3 },
  rk:       { width: 82, color: TER, fontSize: 8.4 },
  rv:       { flex: 1 },
  line:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  strong:   { fontWeight: 600 },
  footer:   { position: "absolute", bottom: 20, left: 44, fontSize: 7.4, color: TER },
});

const clean = list => (list || []).map(x => (typeof x === "string" ? x.trim() : x)).filter(Boolean);
const stripUrl = url => (url || "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function Bullets({ items }) {
  return clean(items).map((t, i) => (
    <View key={i} style={s.bullet} wrap={false}>
      <Text style={s.dot}>•</Text>
      <Text style={s.bt}>{t}</Text>
    </View>
  ));
}

function Section({ title, children, keepTogether }) {
  if (keepTogether) {
    return (
      <View style={s.section} wrap={false}>
        <Text style={s.sh}>{title}</Text>
        {children}
      </View>
    );
  }
  return (
    <View style={s.section}>
      <Text style={s.sh} minPresenceAhead={30}>{title}</Text>
      {children}
    </View>
  );
}

function Job({ job }) {
  const projects = (job.cv_projects || []).filter(p => p && (p.name || clean(p.highlights).length));
  return (
    <View style={s.job}>
      {/* плашка компании не остаётся одна внизу страницы */}
      <View style={s.jobHead} minPresenceAhead={60}>
        <Text style={s.company}>
          {job.company}
          {job.role ? <Text style={s.role}>{`  ·  ${job.role}`}</Text> : null}
        </Text>
        <Text style={s.period}>{job.period}</Text>
      </View>
      <View style={s.jobBody}>
        <Bullets items={job.cv_highlights} />
        {projects.map((p, j) => (
          <View key={j} style={s.proj}>
            <View minPresenceAhead={28}>
              <View style={s.projHead}>
                <Text style={s.projName}>
                  {p.name}
                  {p.role ? <Text style={s.projRole}>{`  ·  ${p.role}`}</Text> : null}
                </Text>
                <Text style={s.period}>{p.period}</Text>
              </View>
              {p.summary ? <Text style={s.projSum}>{p.summary}</Text> : null}
            </View>
            <Bullets items={p.highlights} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * data = { hero, cv, stack, domains, experience, site }
 * hero/stack/domains/experience — те же данные, что на сайте; cv — блок только для CV.
 */
export default function CvDocument({ data }) {
  const { hero = {}, cv = {}, stack = [], domains = [], experience = [], site } = data;
  const title = cv.title || hero.title || "";
  const jobs = experience.filter(e => !e.hidden);
  const skills = clean(cv.skills), tools = clean(stack), doms = clean(domains);
  const education = (cv.education || []).filter(e => e && (e.degree || e.institution));
  const certs = (cv.certifications || []).filter(c => c && c.name);
  const langs = clean(cv.languages);

  return (
    <Document title={`${hero.name || "CV"} — CV`} author={hero.name || ""}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{hero.name}</Text>
        {title ? <Text style={s.title}>{title}</Text> : null}
        <View style={s.contacts}>
          {hero.location ? <Text style={s.contact}>{hero.location}</Text> : null}
          {hero.email ? <Link style={s.contact} src={`mailto:${hero.email}`}>{hero.email}</Link> : null}
          {hero.linkedin ? <Link style={s.contact} src={hero.linkedin}>{stripUrl(hero.linkedin)}</Link> : null}
          {site ? <Link style={s.contact} src={site}>{stripUrl(site)}</Link> : null}
        </View>

        {cv.summary ? (
          <Section title="Summary"><Text>{cv.summary}</Text></Section>
        ) : null}

        {jobs.length ? (
          <Section title="Experience">
            {jobs.map(job => <Job key={job.id ?? job.company} job={job} />)}
          </Section>
        ) : null}

        {(skills.length || tools.length || doms.length) ? (
          <Section title="Skills" keepTogether>
            {skills.length ? <View style={s.row}><Text style={s.rk}>Analysis</Text><Text style={s.rv}>{skills.join(" · ")}</Text></View> : null}
            {tools.length ? <View style={s.row}><Text style={s.rk}>Tools</Text><Text style={s.rv}>{tools.join(" · ")}</Text></View> : null}
            {doms.length ? <View style={s.row}><Text style={s.rk}>Domains</Text><Text style={s.rv}>{doms.join(" · ")}</Text></View> : null}
          </Section>
        ) : null}

        {education.length ? (
          <Section title="Education" keepTogether>
            {education.map((e, i) => (
              <View key={i} style={s.line}>
                <Text><Text style={s.strong}>{e.degree}</Text>{e.institution ? `  ·  ${e.institution}` : ""}</Text>
                <Text style={s.period}>{e.years}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        {certs.length ? (
          <Section title="Certifications" keepTogether>
            {certs.map((c, i) => (
              <View key={i} style={s.line}>
                <Text><Text style={{ fontWeight: 500 }}>{c.name}</Text>{c.issuer ? `  ·  ${c.issuer}` : ""}</Text>
                <Text style={s.period}>{c.date}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        {langs.length ? (
          <Section title="Languages" keepTogether><Text>{langs.join(" · ")}</Text></Section>
        ) : null}

        <Text style={s.footer} fixed>{[hero.name, title].filter(Boolean).join(" — ")}</Text>
      </Page>
    </Document>
  );
}
