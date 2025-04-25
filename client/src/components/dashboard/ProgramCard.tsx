import { ProgramWithEnrollments } from "@shared/schema";
import { Link } from "wouter";

interface ProgramCardProps {
  program: ProgramWithEnrollments;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <div className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-150">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-neutral-800">{program.name}</h4>
          <p className="text-sm text-neutral-500 mt-1">{program.enrollmentCount} clients enrolled</p>
        </div>
        <span className="material-icons text-primary">local_hospital</span>
      </div>
      <div className="mt-3">
        <Link href={`/programs?id=${program.id}`}>
          <a className="text-sm text-primary hover:underline">
            View Details
          </a>
        </Link>
      </div>
    </div>
  );
}
