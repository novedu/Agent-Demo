import { Panel } from '@console/components/ui';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-7xl">
        <Panel title={title} description={description}>
          <div className="rounded-lg border border-dashed border-lineStrong bg-panel p-8 text-sm text-muted">
            This center is reserved for the next Studio sprint. Existing Agent Runtime contracts
            remain unchanged.
          </div>
        </Panel>
      </div>
    </section>
  );
}
