import { Link } from "react-router-dom";
import { BadgeCheck, ExternalLink, PlayCircle } from "lucide-react";
import { INSTRUCTORS, type Instructor } from "@/data/instructors";
import { Button } from "@/components/ui/button";

export function InstructorCard({ instructor }: { instructor: Instructor }) {
  return (
    <article className="bg-card rounded-2xl border border-border p-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <img
          src={instructor.photoUrl}
          alt={`Photograph of ${instructor.name}`}
          loading="lazy"
          className="w-20 h-20 rounded-full object-cover border border-border"
        />
        <div>
          <h3 className="text-lg font-semibold text-foreground">{instructor.name}</h3>
          <p className="text-sm text-muted-foreground">{instructor.role}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{instructor.bio}</p>

      <ul className="mt-4 space-y-2">
        {instructor.credentials.map((credential) => (
          <li key={credential.label} className="flex items-start gap-2 text-sm">
            <BadgeCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-foreground">
              {credential.label}
              <span className="text-muted-foreground">
                {" "}
                - {credential.awardedBy}
                {credential.year ? `, ${credential.year}` : ""}
              </span>
              {credential.verificationUrl && (
                <a
                  href={credential.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1.5 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Verify
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium text-foreground">Teaching experience</dt>
          <dd className="text-muted-foreground">{instructor.teachingExperience}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Teaches on Finatix</dt>
          <dd className="text-muted-foreground">{instructor.specialisms.join(", ")}</dd>
        </div>
      </dl>

      {instructor.sampleLesson && (
        <Button asChild variant="outline" size="sm" className="mt-5 w-full gap-2">
          <Link to={instructor.sampleLesson.href}>
            <PlayCircle className="w-4 h-4" />
            Watch a sample lesson
          </Link>
        </Button>
      )}
    </article>
  );
}

/** Renders nothing until at least one complete, verified profile exists. */
export function InstructorProfiles({
  heading = "Who teaches on Finatix",
  intro,
}: {
  heading?: string;
  intro?: string;
}) {
  if (INSTRUCTORS.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{heading}</h2>
          {intro && <p className="text-muted-foreground">{intro}</p>}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {INSTRUCTORS.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default InstructorProfiles;
