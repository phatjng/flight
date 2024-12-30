import { TaskModel } from "#/models/task";
import { FlowClient } from "flow";
import { createContext, useContext, useEffect, useMemo } from "react";

type Flow = ReturnType<typeof createFlow>;

const FlowContext = createContext<Flow | null>(null);

const models = {
  task: new TaskModel(),
};

function createFlow(organizationId: string) {
  const flow = new FlowClient({
    namespace: "flight",
    models: models,
    syncUrl: `${import.meta.env.VITE_SYNC_SERVER_URL}/sync/${organizationId}`,
  });

  return flow;
}

export function FlowProvider({
  organizationId,
  children,
}: {
  organizationId: string;
  children: React.ReactNode;
}) {
  const flow = useMemo(() => createFlow(organizationId), [organizationId]);

  useEffect(() => {
    flow.init();

    return () => {
      flow.close();
    };
  }, [flow]);

  return <FlowContext.Provider value={flow}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const flow = useContext(FlowContext);
  if (!flow) {
    throw new Error("useFlow must be used within a FlowProvider");
  }

  return flow;
}
