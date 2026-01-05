import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { FileQuestion, Award, MessageSquare } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      label: "Take a Quiz",
      description: "Test your knowledge",
      icon: FileQuestion,
      to: "/courses",
      color: "text-accent",
      bgColor: "bg-accent/10",
      hoverBg: "hover:bg-accent/20",
    },
    {
      label: "Achievements",
      description: "View your badges",
      icon: Award,
      to: "/achievements",
      color: "text-primary",
      bgColor: "bg-primary/10",
      hoverBg: "hover:bg-primary/20",
    },
    {
      label: "Discussions",
      description: "Join the community",
      icon: MessageSquare,
      to: "/discussions",
      color: "text-teal",
      bgColor: "bg-teal/10",
      hoverBg: "hover:bg-teal/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
      {actions.map((action) => (
        <Link key={action.label} to={action.to}>
          <Card 
            className={`p-4 hover-lift cursor-pointer transition-all ${action.hoverBg} border-transparent hover:border-${action.color.split('-')[1]}/20`}
          >
            <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 sm:mx-auto rounded-xl ${action.bgColor} flex items-center justify-center sm:mb-3 flex-shrink-0`}>
                <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.color}`} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;
