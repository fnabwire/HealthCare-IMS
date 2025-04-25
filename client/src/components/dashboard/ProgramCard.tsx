import { ProgramWithEnrollments } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface ProgramCardProps {
  program: ProgramWithEnrollments;
  onEdit?: (program: ProgramWithEnrollments) => void;
  onDelete?: (program: ProgramWithEnrollments) => void;
}

export default function ProgramCard({ program, onEdit, onDelete }: ProgramCardProps) {
  // Generate a gradient color based on program name for visual variety
  const programCodeFirstLetter = program.code.charAt(0).toLowerCase();
  let gradientClass = "from-primary to-secondary"; // default
  
  if ("abcde".includes(programCodeFirstLetter)) {
    gradientClass = "from-primary to-secondary"; 
  } else if ("fghij".includes(programCodeFirstLetter)) {
    gradientClass = "from-secondary to-accent";
  } else if ("klmno".includes(programCodeFirstLetter)) {
    gradientClass = "from-accent to-primary";
  } else if ("pqrst".includes(programCodeFirstLetter)) {
    gradientClass = "from-secondary to-primary";
  } else {
    gradientClass = "from-accent to-secondary";
  }
  
  return (
    <div className="border border-border/40 bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-150">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold`}>
          {program.code.substring(0, 2)}
        </div>
        <div className="flex space-x-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(program)}
              className="p-1 h-8 w-8 rounded-full hover:bg-muted"
              title="Edit program"
            >
              <span className="material-icons text-muted-foreground text-sm">edit</span>
            </Button>
          )}
          
          {onDelete && program.enrollmentCount === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(program)}
              className="p-1 h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive"
              title="Delete program"
            >
              <span className="material-icons text-sm">delete</span>
            </Button>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-foreground">{program.name}</h4>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{program.enrollmentCount}</span> clients
          </p>
          <Link href={`/programs?id=${program.id}`}>
            <a className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center">
              Details
              <span className="material-icons ml-1 text-sm">arrow_forward</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
