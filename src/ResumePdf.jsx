import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 8.6,
    color: "#111111",
    lineHeight: 1.28,
  },
  name: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  contact: {
    fontSize: 7.7,
    textAlign: "center",
    marginBottom: 12,
    color: "#222222",
  },
  section: { marginTop: 7, marginBottom: 2 },
  heading: {
    fontSize: 10.3,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.6,
    borderBottomColor: "#333333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  strong: { fontFamily: "Helvetica-Bold" },
  small: { fontSize: 8.2 },
  item: { marginBottom: 5 },
  bullet: { marginLeft: 10, textIndent: -7, marginBottom: 1 },
  muted: { color: "#333333" },
  link: { color: "#111111", textDecoration: "none" },
});

const nonempty = (v) => typeof v === "string" && v.trim();
const bullets = (text) =>
  (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

function Section({ title, children }) {
  if (!children) return null;
  return (
    <View style={styles.section} wrap>
      <Text style={styles.heading}>{title}</Text>
      {children}
    </View>
  );
}

function BulletList({ text }) {
  return bullets(text).map((line, i) => (
    <Text key={i} style={styles.bullet}>
      • {line}
    </Text>
  ));
}

export default function ResumePdf({ resume }) {
  const p = resume.personal || {};
  const contacts = [
    p.phone,
    p.email,
    p.linkedin,
    p.github,
    p.portfolio,
    p.location,
  ].filter(nonempty);
  const order = (resume.sectionOrder || []).filter(
    (k) => !(resume.hiddenSections || []).includes(k),
  );
  const titles = resume.sectionTitles || {};

  const section = (key) => {
    switch (key) {
      case "summary":
        return nonempty(resume.summary) ? (
          <Section title={titles.summary || "Summary"} key={key}>
            <Text>{resume.summary}</Text>
          </Section>
        ) : null;
      case "links":
        return (resume.links || []).some(
          (x) => nonempty(x.label) && nonempty(x.url),
        ) ? (
          <Section title={titles.links || "Links"} key={key}>
            {(resume.links || [])
              .filter((x) => nonempty(x.label) && nonempty(x.url))
              .map((x, i) => (
                <Text key={i} style={styles.item}>
                  <Link src={x.url} style={styles.link}>
                    {x.label}: {x.url}
                  </Link>
                </Text>
              ))}
          </Section>
        ) : null;
      case "skills":
        return (resume.skills || []).some(
          (x) => nonempty(x.category) && nonempty(x.skills),
        ) ? (
          <Section title={titles.skills || "Skills"} key={key}>
            {(resume.skills || [])
              .filter((x) => nonempty(x.category) && nonempty(x.skills))
              .map((x, i) => (
                <Text key={i} style={styles.item}>
                  <Text style={styles.strong}>{x.category}: </Text>
                  {x.skills}
                </Text>
              ))}
          </Section>
        ) : null;
      case "experience":
        return (resume.experience || []).some(
          (x) => nonempty(x.title) || nonempty(x.company),
        ) ? (
          <Section title={titles.experience || "Experience"} key={key}>
            {(resume.experience || [])
              .filter((x) => nonempty(x.title) || nonempty(x.company))
              .map((x, i) => (
                <View key={i} style={styles.item} wrap={false}>
                  <View style={styles.row}>
                    <Text style={styles.strong}>
                      {x.title || ""}
                      {x.linkUrl && x.linkLabel ? (
                        <Text>
                          {" "}
                          |{" "}
                          <Link src={x.linkUrl} style={styles.link}>
                            {x.linkLabel}
                          </Link>
                        </Text>
                      ) : null}
                    </Text>
                    <Text>
                      {[
                        x.start,
                        x.end && !x.current
                          ? x.end
                          : x.current
                            ? "Present"
                            : "",
                      ]
                        .filter(nonempty)
                        .join(" – ")}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text>
                      {[x.company, x.location].filter(nonempty).join(", ")}
                    </Text>
                    {nonempty(x.technologies) ? (
                      <Text style={styles.small}>
                        Technologies: {x.technologies}
                      </Text>
                    ) : null}
                  </View>
                  <BulletList text={(x.bullets || []).join("\n")} />
                </View>
              ))}
          </Section>
        ) : null;
      case "projects":
        return (resume.projects || []).some((x) => nonempty(x.name)) ? (
          <Section title={titles.projects || "Projects"} key={key}>
            {(resume.projects || [])
              .filter((x) => nonempty(x.name))
              .map((x, i) => (
                <View key={i} style={styles.item} wrap={false}>
                  <View style={styles.row}>
                    <Text style={styles.strong}>
                      {x.name}
                      {x.liveUrl ? (
                        <Text>
                          {" "}
                          |{" "}
                          <Link src={x.liveUrl} style={styles.link}>
                            Live Demo
                          </Link>
                        </Text>
                      ) : null}
                      {x.githubUrl ? (
                        <Text>
                          {" "}
                          |{" "}
                          <Link src={x.githubUrl} style={styles.link}>
                            GitHub Repo
                          </Link>
                        </Text>
                      ) : null}
                    </Text>
                    <Text>{x.date || ""}</Text>
                  </View>
                  {nonempty(x.tech) ? (
                    <Text>
                      <Text style={styles.strong}>Tech Stack: </Text>
                      {x.tech}
                    </Text>
                  ) : null}
                  {nonempty(x.overview) ? (
                    <Text>
                      <Text style={styles.strong}>Overview: </Text>
                      {x.overview}
                    </Text>
                  ) : null}
                  {nonempty(x.features) ? (
                    <Text>
                      <Text style={styles.strong}>Key Features: </Text>
                      {x.features}
                    </Text>
                  ) : null}
                  {nonempty(x.impact) ? (
                    <Text>
                      <Text style={styles.strong}>Impact: </Text>
                      {x.impact}
                    </Text>
                  ) : null}
                </View>
              ))}
          </Section>
        ) : null;
      case "education":
        return (resume.education || []).some((x) => nonempty(x.institution)) ? (
          <Section title={titles.education || "Education"} key={key}>
            {(resume.education || [])
              .filter((x) => nonempty(x.institution))
              .map((x, i) => (
                <View key={i} style={styles.item} wrap={false}>
                  <View style={styles.row}>
                    <Text style={styles.strong}>{x.institution}</Text>
                    <Text>
                      {[
                        x.start,
                        x.end && !x.current
                          ? x.end
                          : x.current
                            ? "Present"
                            : "",
                      ]
                        .filter(nonempty)
                        .join(" – ")}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text>{x.degree || ""}</Text>
                    {nonempty(x.score) ? (
                      <Text>
                        {x.scoreLabel || "Score"}: {x.score}
                      </Text>
                    ) : null}
                  </View>
                  {nonempty(x.details) ? <Text>{x.details}</Text> : null}
                </View>
              ))}
          </Section>
        ) : null;
      case "activities":
        return (resume.activities || []).some((x) => nonempty(x.title)) ? (
          <Section title={titles.activities || "Extra Activities"} key={key}>
            {(resume.activities || [])
              .filter((x) => nonempty(x.title))
              .map((x, i) => (
                <View key={i} style={styles.item} wrap={false}>
                  <View style={styles.row}>
                    <Text style={styles.strong}>
                      {x.title}
                      {x.organization ? ` — ${x.organization}` : ""}
                    </Text>
                    <Text>{x.date || ""}</Text>
                  </View>
                  <BulletList text={(x.bullets || []).join("\n")} />
                  {x.url ? (
                    <Link src={x.url} style={styles.link}>
                      {x.url}
                    </Link>
                  ) : null}
                </View>
              ))}
          </Section>
        ) : null;
      case "awards":
        return (resume.awards || []).some((x) => nonempty(x.name)) ? (
          <Section title={titles.awards || "Awards & Certifications"} key={key}>
            {(resume.awards || [])
              .filter((x) => nonempty(x.name))
              .map((x, i) => (
                <View key={i} style={styles.item} wrap={false}>
                  <Text>
                    • <Text style={styles.strong}>{x.name}</Text>
                    {x.organization ? ` — ${x.organization}` : ""}
                    {x.date ? ` (${x.date})` : ""}
                  </Text>
                  {x.description ? (
                    <Text style={{ marginLeft: 10 }}>{x.description}</Text>
                  ) : null}
                  {x.url ? (
                    <Link src={x.url} style={[styles.link, { marginLeft: 10 }]}>
                      {x.url}
                    </Link>
                  ) : null}
                </View>
              ))}
          </Section>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Document
      title={`${p.name || "Resume"} - Resume`}
      author={p.name || "Resume Builder"}
    >
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.name}>{p.name || "YOUR NAME"}</Text>
        <Text style={styles.contact}>{contacts.join("  |  ")}</Text>
        {order.map(section)}
      </Page>
    </Document>
  );
}
