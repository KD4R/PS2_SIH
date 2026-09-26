import { PipelineBoard } from "@/features/procurement-pipeline/components/pipeline-board";

export const metadata = { title: "Proposals Pipeline" };

export default async function PipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">Proposals Pipeline</h1>
        <p className="mt-2 text-muted-foreground">Evaluate and track startup proposals for this challenge.</p>
      </div>
      <PipelineBoard challengeId={id} />
    </div>
  );
}
