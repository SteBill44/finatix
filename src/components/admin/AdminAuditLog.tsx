import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuditLogs } from "@/hooks/useAuditLog";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const ENTITY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "course", label: "Courses" },
  { value: "lesson", label: "Lessons" },
  { value: "quiz", label: "Quizzes" },
  { value: "user", label: "Users" },
  { value: "enrollment", label: "Enrollments" },
  { value: "resource", label: "Resources" },
  { value: "syllabus", label: "Syllabus" },
];

function getActionIcon(action: string) {
  switch (action) {
    case "create":
      return <Plus className="h-3 w-3" />;
    case "update":
      return <Pencil className="h-3 w-3" />;
    case "delete":
      return <Trash2 className="h-3 w-3" />;
    default:
      return null;
  }
}

function getActionColor(action: string) {
  switch (action) {
    case "create":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "update":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "delete":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "";
  }
}

export default function AdminAuditLog() {
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const { data: logs, isLoading, refetch, isRefetching } = useAuditLogs({
    limit: 100,
    entityType: entityTypeFilter === "all" ? undefined : entityTypeFilter,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>
            Track all administrative actions in the system
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No activity logs found</p>
            <p className="text-sm">Actions will appear here as admins make changes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 w-fit capitalize ${getActionColor(log.action)}`}
                      >
                        {getActionIcon(log.action)}
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {log.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.entity_name || log.entity_id || "-"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
