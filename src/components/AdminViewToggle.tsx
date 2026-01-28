import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminView } from "@/contexts/AdminViewContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AdminViewToggle = () => {
  const { isAdmin } = useIsAdmin();
  const { isStudentView, toggleView } = useAdminView();

  if (!isAdmin) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isStudentView ? "default" : "outline"}
          size="sm"
          onClick={toggleView}
          className={`gap-2 ${isStudentView ? "bg-primary text-primary-foreground" : ""}`}
        >
          {isStudentView ? (
            <>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Student View</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">Admin View</span>
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isStudentView 
          ? "Currently viewing as student. Click to switch to admin view." 
          : "Currently viewing as admin. Click to see what students see."}
      </TooltipContent>
    </Tooltip>
  );
};

export default AdminViewToggle;
