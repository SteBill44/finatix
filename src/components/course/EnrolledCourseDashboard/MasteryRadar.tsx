import { Card } from "@/components/ui/card";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip as RechartsTooltip,
} from "recharts";
import { AlertTriangle, CheckCircle, Brain } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyState } from "@/components/EmptyState";
import { getScoreColor, wrapSubtitle, type SyllabusArea } from "./helpers";

interface RadarDatum {
  area: string;
  labelPrefix: string;
  labelSubtitle: string;
  fullTitle: string;
  score: number;
  target: number;
  weight: string;
  attempted: number;
  fullMark: number;
}

interface MasteryArea {
  id: string;
  syllabus_area_index: number;
  syllabus_area_title?: string | null;
  mastery_score: number | string;
  questions_attempted?: number | null;
}

interface Props {
  radarData: RadarDatum[];
  hasRadarData: boolean;
  totalAreas: number;
  areasStarted: number;
  radarColor: string;
  weakestAreas: MasteryArea[];
  strongestAreas: MasteryArea[];
}

export const MasteryRadar = ({
  radarData,
  hasRadarData,
  totalAreas,
  areasStarted,
  radarColor,
  weakestAreas,
  strongestAreas,
}: Props) => {
  const isMobile = useIsMobile();

  return (
    <Card className="p-6 lg:col-span-3">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Syllabus Mastery</h3>
            <p className="text-xs text-muted-foreground">
              {hasRadarData
                ? `${areasStarted} of ${totalAreas} area${totalAreas !== 1 ? "s" : ""} practised`
                : "Take quizzes to reveal your mastery map"}
            </p>
          </div>
        </div>
        {/* Legend pills */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
          <div className="flex items-center gap-1.5">
            <span className="w-6 border-t-2 border-dashed border-muted-foreground/60 inline-block" />
            <span className="text-[10px] text-muted-foreground">75% target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: radarColor, opacity: 0.7 }} />
            <span className="text-[10px] text-muted-foreground">your score</span>
          </div>
        </div>
      </div>

      {hasRadarData ? (
        <>
          <div className="w-full -mx-2" style={{ height: isMobile ? 300 : 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? "70%" : "78%"}
                data={radarData}
                margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="area"
                  tickLine={false}
                  tick={({ x, y, payload, cx: chartCx, cy: chartCy, index }: any) => {
                    const dx = x - (chartCx || 0);
                    const dy = y - (chartCy || 0);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const push = isMobile ? 8 : 10;
                    const lx = dist > 0 ? x + (dx / dist) * push : x;
                    const ly = dist > 0 ? y + (dy / dist) * push : y;
                    const isTop = dy < -2;
                    const isBottom = dy > 2;
                    const anchor =
                      Math.abs(dx) < 12 ? "middle" : dx > 0 ? "start" : "end";

                    const datum: any = radarData[index] || {};
                    const prefix: string = datum.labelPrefix || "";
                    const subtitle: string = datum.labelSubtitle || datum.fullTitle || "";
                    const maxChars = isMobile ? 12 : 16;
                    const lines = wrapSubtitle(subtitle, maxChars, 2);

                    const prefixSize = isMobile ? 11 : 13;
                    const subSize = isMobile ? 9 : 10;
                    const lineH = subSize + 2;

                    const blockHeight =
                      (prefix ? prefixSize : 0) + lines.length * lineH;
                    const startY = isTop
                      ? ly - blockHeight + prefixSize / 2
                      : isBottom
                      ? ly + prefixSize / 2
                      : ly - ((lines.length * lineH) / 2) + prefixSize / 2;

                    return (
                      <g>
                        {prefix && (
                          <text
                            x={lx}
                            y={startY}
                            textAnchor={anchor}
                            dominantBaseline="central"
                            fill="hsl(var(--foreground))"
                            fontSize={prefixSize}
                            fontWeight={700}
                          >
                            {prefix}
                          </text>
                        )}
                        {lines.map((line, i) => (
                          <text
                            key={i}
                            x={lx}
                            y={startY + (prefix ? prefixSize / 2 + 2 : 0) + i * lineH + lineH / 2}
                            textAnchor={anchor}
                            dominantBaseline="central"
                            fill="hsl(var(--muted-foreground))"
                            fontSize={subSize}
                            fontWeight={500}
                          >
                            {line}
                          </text>
                        ))}
                        {!prefix && lines.length === 0 && (
                          <text
                            x={lx}
                            y={ly}
                            textAnchor={anchor}
                            dominantBaseline="central"
                            fill="hsl(var(--muted-foreground))"
                            fontSize={subSize}
                          >
                            {payload.value}
                          </text>
                        )}
                      </g>
                    );
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tickCount={5}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="transparent"
                  fillOpacity={0}
                />
                <Radar
                  name="Mastery"
                  dataKey="score"
                  stroke={radarColor}
                  fill={radarColor}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    if (!d) return null;
                    const aboveTarget = d.score >= 75;
                    return (
                      <div className="bg-popover border border-border rounded-md px-2 py-1.5 shadow-md text-left min-w-[120px] max-w-[180px]">
                        <p className="text-xs font-semibold text-foreground leading-tight mb-0.5 line-clamp-2">{d.fullTitle}</p>
                        {d.weight && (
                          <p className="text-[10px] text-muted-foreground mb-1">Weight: {d.weight}</p>
                        )}
                        {d.attempted > 0 ? (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[10px] text-muted-foreground">Mastery</span>
                              <span className={`text-xs font-bold ${getScoreColor(d.score)}`}>
                                {d.score}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[10px] text-muted-foreground">Qs</span>
                              <span className="text-[10px] font-medium text-foreground">{d.attempted}</span>
                            </div>
                            <div className={`mt-1 text-[10px] font-medium ${aboveTarget ? "text-accent" : "text-yellow-500"}`}>
                              {aboveTarget ? "Above target" : `${75 - d.score}% below`}
                            </div>
                          </>
                        ) : (
                          <p className="text-[10px] text-muted-foreground">Not practised yet</p>
                        )}
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Weak / strong legend */}
          {(weakestAreas.length > 0 || strongestAreas.length > 0) && (
            <div className="grid grid-cols-2 gap-4 mt-3 pt-4 border-t border-border/50">
              {weakestAreas.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Focus Areas
                  </p>
                  <div className="space-y-1.5">
                    {weakestAreas.map((area) => (
                      <div key={area.id} className="flex items-center justify-between text-xs gap-2">
                        <span className="text-muted-foreground truncate">
                          {area.syllabus_area_title || `Area ${area.syllabus_area_index + 1}`}
                        </span>
                        <span className="text-destructive font-semibold shrink-0">
                          {Math.round(Number(area.mastery_score))}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {strongestAreas.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Strengths
                  </p>
                  <div className="space-y-1.5">
                    {strongestAreas.map((area) => (
                      <div key={area.id} className="flex items-center justify-between text-xs gap-2">
                        <span className="text-muted-foreground truncate">
                          {area.syllabus_area_title || `Area ${area.syllabus_area_index + 1}`}
                        </span>
                        <span className="text-accent font-semibold shrink-0">
                          {Math.round(Number(area.mastery_score))}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Empty state - no quiz data yet */
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Your mastery map is empty</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Complete practice quizzes on any exam topic and your syllabus coverage will appear here.
          </p>
          {totalAreas > 0 && (
            <p className="text-xs text-muted-foreground/60 mt-3">
              {totalAreas} exam area{totalAreas !== 1 ? "s" : ""} to cover
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
