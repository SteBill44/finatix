import { createContext, useContext, useState, ReactNode } from "react";

interface AdminViewContextType {
  isStudentView: boolean;
  toggleView: () => void;
  setStudentView: (value: boolean) => void;
}

const AdminViewContext = createContext<AdminViewContextType | undefined>(undefined);

export const AdminViewProvider = ({ children }: { children: ReactNode }) => {
  const [isStudentView, setIsStudentView] = useState(false);

  const toggleView = () => setIsStudentView((prev) => !prev);
  const setStudentView = (value: boolean) => setIsStudentView(value);

  return (
    <AdminViewContext.Provider value={{ isStudentView, toggleView, setStudentView }}>
      {children}
    </AdminViewContext.Provider>
  );
};

export const useAdminView = () => {
  const context = useContext(AdminViewContext);
  if (!context) {
    throw new Error("useAdminView must be used within an AdminViewProvider");
  }
  return context;
};

// Hook that combines admin status with view mode
export const useEffectiveAdmin = () => {
  const { isStudentView } = useAdminView();
  const { useIsAdmin } = require("@/hooks/useUserRole");
  const { isAdmin, isLoading } = useIsAdmin();
  
  return {
    isEffectiveAdmin: isAdmin && !isStudentView,
    isActualAdmin: isAdmin,
    isStudentView,
    isLoading,
  };
};
