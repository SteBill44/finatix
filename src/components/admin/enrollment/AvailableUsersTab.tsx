import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, UserPlus, Loader2, Search, X } from "lucide-react";
import PaginationControls from "./PaginationControls";

export interface AvailableUser {
  user_id: string;
  full_name: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 20;

interface Props {
  users: AvailableUser[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedIds: Set<string>;
  onToggleUser: (id: string) => void;
  onToggleAll: () => void;
  page: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  enrolling: boolean;
  onEnrollClick: () => void;
}

const AvailableUsersTab = ({
  users,
  searchQuery,
  onSearchChange,
  selectedIds,
  onToggleUser,
  onToggleAll,
  page,
  onPageChange,
  loading,
  enrolling,
  onEnrollClick,
}: Props) => {
  const filtered = searchQuery.trim()
    ? users.filter((u) => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const allPageSelected = paginated.length > 0 && paginated.every((u) => selectedIds.has(u.user_id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users to enroll..."
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

        {selectedIds.size > 0 && (
          <Button onClick={onEnrollClick} disabled={enrolling}>
            {enrolling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Enroll Selected ({selectedIds.size})
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
          <p>{searchQuery ? "No users match your search" : "All users are already enrolled in this course"}</p>
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
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(user.user_id)}
                      onCheckedChange={() => onToggleUser(user.user_id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.full_name || "Unknown User"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
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

export default AvailableUsersTab;
