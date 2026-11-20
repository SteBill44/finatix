import { useCourseContentStatus } from "@/hooks/useCourseContentStatus";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ClipboardList,
  FileText,
  GraduationCap,
  Lightbulb,
  Play,
  ShieldCheck,
  Timer,
  Video,
} from "lucide-react";
import { POLICY, billingSummary, formatPrice } from "@/lib/catalogue";
import { QualificationDisclosure } from "@/components/credibility/QualificationDisclosure";
import { formatMinutes, type CourseFacts } from "@/lib/courseFacts";
import {
  getCourseAcademics,
  missingAcademicFields,
  type CourseAcademics,
} from "@/data/courseAcademics";

export interface SyllabusArea {
  title: string;
  weight?: string;
  topics?: string[];
}

interface CoursePreviewProps {
  courseSlug: string;
  courseId: string;
  courseTitle: string;
  /** Case study papers get the marked-response and assessment sections. */
  isCaseStudy: boolean;
  facts: CourseFacts;
  syllabusObjective?: string | null;
  syllabusAreas: SyllabusArea[];
  /** Curriculum preview - safe, public lesson metadata. */
  lessons: Array<{ id: string; title: string; description?: string | null; duration_minutes?: number | null }>;
  /** Advertised price in pounds, or null for a free course. */
  price: number | null;
  isFree: boolean;
  purchaseAvailable: boolean;
  /** True when the visitor's membership already covers this course. */
  coveredByMembership: boolean;
  isAdmin: boolean;
  onBuy: () => void;
}

const formatDate = (iso?: string) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

const Section = ({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      {title}
    </h2>
    {children}
  </section>
);

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
    <dd className="text-sm font-medium text-foreground">{value}</dd>
  </div>
);

const CoursePreview = ({
  courseSlug,
  courseId,
  courseTitle,
  isCaseStudy,
  facts,
  syllabusObjective,
  syllabusAreas,
  lessons,
  price,
  isFree,
  purchaseAvailable,
  coveredByMembership,
  isAdmin,
  onBuy,
}: CoursePreviewProps) => {
  const { data: statusMap } = useCourseContentStatus();
  const status = statusMap?.get(courseId);
  const academics: CourseAcademics = getCourseAcademics(courseSlug);
  const missing = missingAcademicFields(courseSlug, isCaseStudy);

  const reviewed = formatDate(academics.lastReviewed);
  const hasProvenance = Boolean(
    academics.syllabusVersion || academics.examPeriod || reviewed || academics.author || academics.reviewer
  );

  const sampleLesson =
    (academics.sampleLessonId && lessons.find((l) => l.id === academics.sampleLessonId)) ||
    (isFree ? lessons[0] : undefined);

  const worked = academics.workedQuestion;
  const marked = academics.markedResponse;

  const lessonTime = formatMinutes(facts.lessonMinutes);

  return (
    <div className="space-y-10 pb-20 lg:pb-0">
      {/* ── What's in this course, from the actual content ── */}
      <Section id="course-contents" title="What's in this course" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-5 border-y border-border py-5 sm:grid-cols-4">
          <div className="border-l border-border pl-4">
            <p className="text-2xl font-bold text-foreground">{facts.lessonCount}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </div>
          {lessonTime && (
            <div className="border-l border-border pl-4">
              <p className="text-2xl font-bold text-foreground">{lessonTime}</p>
              <p className="text-xs text-muted-foreground">Taught lesson time</p>
            </div>
          )}
          {facts.estimatedStudyHours !== null && (
            <div className="border-l border-border pl-4">
              <p className="text-2xl font-bold text-foreground">{facts.estimatedStudyHours} hrs</p>
              <p className="text-xs text-muted-foreground">Estimated total study time</p>
            </div>
          )}
          {(status?.questions ?? 0) > 0 && (
            <div className="border-l border-border pl-4">
              <p className="text-2xl font-bold text-foreground">{status?.questions}</p>
              <p className="text-xs text-muted-foreground">Practice questions</p>
            </div>
          )}
          {(status?.usable_mocks ?? 0) > 0 && (
            <div className="border-l border-border pl-4">
              <p className="text-2xl font-bold text-foreground">{status?.usable_mocks}</p>
              <p className="text-xs text-muted-foreground">Mock exams</p>
            </div>
          )}
          {facts.videoLessonCount > 0 && (
            <div className="border-l border-border pl-4">
              <p className="flex items-center gap-1.5 text-2xl font-bold text-foreground">
                <Video className="h-5 w-5 text-primary" aria-hidden="true" />
                {facts.videoLessonCount}
              </p>
              <p className="text-xs text-muted-foreground">Lessons with video</p>
            </div>
          )}
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <Timer className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          Taught lesson time is the time recorded against the lessons themselves. Estimated total
          study time includes your own reading, practice and revision, so it is longer.
          {facts.videoLessonCount === 0 && " This course is written and worked-example based rather than video-led."}
        </p>
      </Section>

      {/* ── Academic provenance ── */}
      {hasProvenance && (
        <Section id="course-provenance" title="How this material is maintained" icon={ShieldCheck}>
          <Card className="p-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              {academics.syllabusVersion && (
                <MetaRow label="Written against" value={academics.syllabusVersion} />
              )}
              {academics.examPeriod && <MetaRow label="Prepared for" value={academics.examPeriod} />}
              {reviewed && <MetaRow label="Last academic review" value={reviewed} />}
              {academics.author && (
                <MetaRow
                  label="Author"
                  value={[academics.author.name, academics.author.credentials].filter(Boolean).join(", ")}
                />
              )}
              {academics.reviewer && (
                <MetaRow
                  label="Reviewed by"
                  value={[academics.reviewer.name, academics.reviewer.credentials].filter(Boolean).join(", ")}
                />
              )}
            </dl>
          </Card>
        </Section>
      )}

      {/* ── Learning outcomes and syllabus ── */}
      {(academics.learningOutcomes?.length || syllabusObjective || syllabusAreas.length > 0) && (
        <Section id="course-syllabus" title="What you'll be able to do" icon={FileText}>
          {syllabusObjective && (
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{syllabusObjective}</p>
          )}
          {academics.learningOutcomes?.length ? (
            <ul className="mb-6 space-y-2">
              {academics.learningOutcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          ) : null}

          {syllabusAreas.length > 0 && (
            <Accordion type="single" collapsible className="w-full rounded-xl border border-border">
              {syllabusAreas.map((area, i) => (
                <AccordionItem key={area.title} value={`area-${i}`} className="px-4">
                  <AccordionTrigger className="text-left text-sm font-semibold">
                    <span>
                      {area.title}
                      {area.weight && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">{area.weight}</span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    {area.topics?.length ? (
                      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {area.topics.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Refer to the syllabus objectives for this topic.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </Section>
      )}

      {lessons.length > 0 && <Section id="course-curriculum" title="Your course content" icon={BookOpen}><Accordion type="single" collapsible className="border-y border-border"><AccordionItem value="curriculum"><AccordionTrigger className="text-left text-sm">View all {lessons.length} lessons</AccordionTrigger><AccordionContent><ol className="divide-y divide-border">{lessons.map((lesson, i) => <li key={lesson.id} className="flex items-start gap-4 py-4"><span className="w-6 shrink-0 font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span><span className="text-sm font-medium">{lesson.title}</span></li>)}</ol></AccordionContent></AccordionItem></Accordion></Section>}
      {sampleLesson && <Section id="course-sample" title="See a real lesson" icon={Play}><div className="border-l-2 border-primary pl-5"><p className="text-xs text-muted-foreground">Sample from this exam</p><h3 className="mt-2 text-lg font-medium">{sampleLesson.title}</h3>{sampleLesson.description && <p className="mt-2 text-sm text-muted-foreground">{sampleLesson.description}</p>}<Button asChild trace variant="outline" className="mt-5"><Link to={`/courses/${courseId}/lesson/${sampleLesson.id}`}>Open this lesson<Play /></Link></Button>{isFree && <p className="mt-2 text-xs text-muted-foreground">Create an account to open this free course.</p>}</div></Section>}

      {/* ── Vetted worked question ── */}
      {worked && (
        <Section id="course-worked-question" title="A worked question, marked the way we teach it" icon={Lightbulb}>
          <Card className="space-y-5 p-5">
            <p className="text-sm font-medium text-foreground">{worked.question}</p>

            {worked.assumptions?.length ? (
              <div>
                <h3 className="text-sm font-semibold text-foreground">Assumptions</h3>
                <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                  {worked.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h3 className="text-sm font-semibold text-foreground">How to work it through</h3>
              <ol className="mt-1 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                {worked.reasoning.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <h3 className="text-sm font-semibold text-foreground">Answer</h3>
              <p className="mt-1 text-sm text-muted-foreground">{worked.answer}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Where marks are usually lost</h3>
              <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                {worked.commonMistakes.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">What the result actually tells you</h3>
              <p className="mt-1 text-sm text-muted-foreground">{worked.interpretation}</p>
            </div>

            <p className="text-xs text-muted-foreground">
              Checked by {worked.approvedBy}
              {formatDate(worked.approvedOn) ? ` on ${formatDate(worked.approvedOn)}` : ""}.
            </p>
          </Card>
        </Section>
      )}

      {/* ── Case study specifics ── */}
      {isCaseStudy && (academics.assessmentExplanation || marked) && (
        <Section id="course-case-study" title="How the case study is marked" icon={GraduationCap}>
          {academics.assessmentExplanation && (
            <Card className="mb-4 p-5">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {academics.assessmentExplanation}
              </p>
            </Card>
          )}

          {marked && marked.permissionOnFile && (
            <Card className="space-y-4 p-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Anonymised student response, published with permission
                </p>
                <h3 className="mt-1 text-sm font-semibold text-foreground">The scenario</h3>
                <p className="mt-1 text-sm text-muted-foreground">{marked.scenarioSummary}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">What the student wrote</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{marked.studentResponse}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Our marker's commentary</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{marked.markerCommentary}</p>
              </div>
              {marked.marks?.length ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {marked.marks.map((m) => (
                    <li key={m.area}>
                      <span className="font-medium text-foreground">{m.area}: </span>
                      {m.comment}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Marked by {marked.approvedBy}
                {formatDate(marked.approvedOn) ? ` on ${formatDate(marked.approvedOn)}` : ""}. This is our
                own marker's commentary, not examiner feedback.
              </p>
            </Card>
          )}
        </Section>
      )}

      {(status?.questions ?? 0) > 0 && <Section id="course-assessment" title="Practice resources" icon={ClipboardList}><div className="border-y border-border py-5 text-sm text-muted-foreground"><p>This course has {status?.questions} marked practice questions{(status?.usable_mocks ?? 0) > 0 ? ` and ${status?.usable_mocks} timed mock exams` : ""}. Questions are automatically marked with explanations when you submit.</p></div></Section>}

      {/* ── Purchase terms, straight from the catalogue ── */}
      <Section id="course-terms" title="What you're buying" icon={ShieldCheck}>
        <Card className="p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <MetaRow
              label="Price"
              value={isFree ? "Free" : price !== null ? `${formatPrice(price)} (VAT included)` : "See access options"}
            />
            <MetaRow
              label="Billing"
              value={isFree ? "No payment" : billingSummary({ billingType: "one_time", price })}
            />
            <MetaRow
              label="Access"
              value={isFree ? "Free while you have an account" : "Lifetime access to this course"}
            />
            <MetaRow label="Refunds" value={POLICY.refundText} />
          </dl>
          <div className="mt-5">
            <QualificationDisclosure compact />
          </div>
          {!isFree && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button trace onClick={onBuy} className="gap-2">
                {coveredByMembership ? "Start this course" : !purchaseAvailable ? "Register interest" : `Buy ${courseTitle.split(" - ")[0]}`}
              </Button>
              <Button asChild variant="outline">
                <Link to="/pricing">Compare with a bundle or membership</Link>
              </Button>
            </div>
          )}
        </Card>
      </Section>

      {/* ── Admin-only: what's still missing ── */}
      {isAdmin && missing.length > 0 && (
        <Section id="course-owner-checklist" title="Academic content still needed (admin only)" icon={AlertCircle}>
          <Card className="border-yellow-500/40 bg-yellow-500/5 p-5">
            <p className="text-sm text-muted-foreground">
              These fields are hidden from visitors until you supply verified content for{" "}
              <span className="font-medium text-foreground">{courseSlug}</span>.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-foreground">
              {missing.map((f) => (
                <li key={String(f.key)}>{f.label}</li>
              ))}
            </ul>
          </Card>
        </Section>
      )}
    </div>
  );
};

export default CoursePreview;
