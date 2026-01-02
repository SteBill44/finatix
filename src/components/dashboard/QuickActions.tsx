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
    <div className="grid grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link key={action.label} to={action.to}>
          <Card 
            className={`p-4 text-center hover-lift cursor-pointer transition-all ${action.hoverBg} border-transparent hover:border-${action.color.split('-')[1]}/20`}
          >
            <div className={`w-12 h-12 mx-auto rounded-xl ${action.bgColor} flex items-center justify-center mb-3`}>
              <action.icon className={`w-6 h-6 ${action.color}`} />
            </div>
            <p className="font-semibold text-foreground text-sm">{action.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;
