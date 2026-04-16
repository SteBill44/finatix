import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Users, UserMinus, Loader2, Search, X, Download } from "lucide-react";
import PaginationControls from "./PaginationControls";

export interface EnrolledUser {
  enrollment_id: string;
  user_id: string;
  full_name: string | null;
  enrolled_at: string;
  completed_at: string | null;
  lessons_completed: number;
  total_lessons: number;
}

const ITEMS_PER_PAGE = 20;

interface Props {
  users: EnrolledUser[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedIds: Set<string>;
  onToggleUser: (id: string) => void;
  onToggleAll: () => void;
  page: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  unenrolling: boolean;
  exporting: boolean;
  onUnenrollClick: () => void;
  onExportCSV: () => void;
}

const EnrolledUsersTab = ({
  users,
  searchQuery,
  onSearchChange,
  selectedIds,
  onToggleUser,
  onToggleAll,
  page,
  onPageChange,
  loading,
  unenrolling,
  exporting,
  onUnenrollClick,
  onExportCSV,
}: Props) => {
  const filtered = searchQuery.trim()
    ? users.filter((u) => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const allPageSelected = paginated.length > 0 && paginated.every((u) => selectedIds.has(u.enrollment_id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search enrolled users..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button variant="outline" onClick={onExportCSV} disabled={exporting || users.length === 0}>
          {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Export CSV
        </Button>

        {selectedIds.size > 0 && (
          <Button variant="destructive" onClick={onUnenrollClick} disabled={unenrolling}>
            {unenrolling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserMinus className="h-4 w-4 mr-2" />
            )}
            Unenroll Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{searchQuery ? "No users match your search" : "No users enrolled in this course"}</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={allPageSelected} onCheckedChange={onToggleAll} />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((user) => {
                const pct =
                  user.total_lessons > 0
                    ? Math.round((user.lessons_completed / user.total_lessons) * 100)
                    : 0;
                return (
                  <TableRow key={user.enrollment_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(user.enrollment_id)}
                        onCheckedChange={() => onToggleUser(user.enrollment_id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.enrolled_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {user.lessons_completed}/{user.total_lessons} ({pct}%)
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.completed_at ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Completed</Badge>
                      ) : (
                        <Badge variant="outline">In Progress</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default EnrolledUsersTab;
