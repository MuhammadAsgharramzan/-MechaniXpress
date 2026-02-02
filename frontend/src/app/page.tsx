import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          MechaniXpress
        </h1>
        <p className="text-lg leading-8 text-slate-600">
          On-Demand Vehicle Repair Services at your doorstep.
        </p>
        <div className="flex items-center justify-center gap-x-6">
          <Link href="/auth">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
