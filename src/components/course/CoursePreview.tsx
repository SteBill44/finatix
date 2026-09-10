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
  coveredByMembership,
  isAdmin,
  onBuy,
}: CoursePreviewProps) => {
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
    <div className="space-y-12 pb-28 lg:pb-0">
      {/* ── What's in this course, from the actual content ── */}
      <Section id="course-contents" title="What's in this course" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-4">
            <p className="text-2xl font-bold text-foreground">{facts.lessonCount}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </Card>
          {lessonTime && (
            <Card className="p-4">
              <p className="text-2xl font-bold text-foreground">{lessonTime}</p>
              <p className="text-xs text-muted-foreground">Taught lesson time</p>
            </Card>
          )}
          {facts.estimatedStudyHours !== null && (
            <Card className="p-4">
              <p className="text-2xl font-bold text-foreground">{facts.estimatedStudyHours} hrs</p>
              <p className="text-xs text-muted-foreground">Estimated total study time</p>
            </Card>
          )}
          {facts.practiceQuizCount > 0 && (
            <Card className="p-4">
              <p className="text-2xl font-bold text-foreground">{facts.practiceQuizCount}</p>
              <p className="text-xs text-muted-foreground">Practice quizzes</p>
            </Card>
          )}
          {facts.mockExamCount > 0 && (
            <Card className="p-4">
              <p className="text-2xl font-bold text-foreground">{facts.mockExamCount}</p>
              <p className="text-xs text-muted-foreground">Mock exams</p>
            </Card>
          )}
          {facts.videoLessonCount > 0 && (
            <Card className="p-4">
              <p className="flex items-center gap-1.5 text-2xl font-bold text-foreground">
                <Video className="h-5 w-5 text-primary" aria-hidden="true" />
                {facts.videoLessonCount}
              </p>
              <p className="text-xs text-muted-foreground">Lessons with video</p>
            </Card>
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
                      <p className="text-sm text-muted-foreground">Topic detail is being written up.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </Section>
      )}

      {/* ── Sample lesson ── */}
      <Section id="course-sample" title="See a real lesson" icon={Play}>
        {sampleLesson ? (
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Sample lesson</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{sampleLesson.title}</h3>
            {sampleLesson.description && (
              <p className="mt-2 text-sm text-muted-foreground">{sampleLesson.description}</p>
            )}
            <Button asChild className="mt-4 gap-2">
              <Link to={`/courses/${courseId}/lesson/${sampleLesson.id}`}>
                <Play className="h-4 w-4" aria-hidden="true" />
                Open this lesson
              </Link>
            </Button>
            {isFree && (
              <p className="mt-2 text-xs text-muted-foreground">
                Free course - create an account and this lesson opens straight away.
              </p>
            )}
          </Card>
        ) : (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">
              Every lesson title and length in this course is listed above, so you can see the full
              scope before paying. A lesson from this course has not yet been released as a free
              sample. You can read a free Certificate-level lesson in full instead.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/courses/ba1-business-economics">See a free lesson in BA1</Link>
            </Button>
          </Card>
        )}
      </Section>

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

      {/* ── Mocks, feedback and support ── */}
      <Section id="course-assessment" title="Mocks, feedback and support" icon={ClipboardList}>
        <Card className="space-y-3 p-5 text-sm text-muted-foreground">
          <p>
            {facts.mockExamCount > 0
              ? `This course includes ${facts.mockExamCount} timed mock exam${facts.mockExamCount === 1 ? "" : "s"} and ${facts.practiceQuizCount} practice quiz${facts.practiceQuizCount === 1 ? "" : "zes"}.`
              : `This course includes ${facts.practiceQuizCount} practice quiz${facts.practiceQuizCount === 1 ? "" : "zes"}.`}{" "}
            Questions are marked automatically the moment you submit.
          </p>
          <p>
            Feedback is per question and per syllabus area: you see the correct answer with an
            explanation, and your results build a competency picture showing which areas are
            holding your score back.
          </p>
          <p>
            Support is {POLICY.standardSupport.toLowerCase()}, {POLICY.supportHours}. One-to-one
            tutor sessions are not part of this course.
          </p>
        </Card>
      </Section>

      {/* ── Purchase terms, straight from the catalogue ── */}
      <Section id="course-terms" title="What you're buying" icon={ShieldCheck}>
        <Card className="p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <MetaRow
              label="Price"
              value={isFree ? "Free" : price !== null ? `${formatPrice(price)} (VAT included)` : "Not on sale"}
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
          {!isFree && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button onClick={onBuy} className="gap-2">
                {coveredByMembership ? "Start this course" : `Buy ${courseTitle.split(" - ")[0]}`}
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
