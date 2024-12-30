import {
  CompletedTasksList,
  InProgressTasksList,
} from "#/components/tasks-list";
import { Button } from "#/components/ui/button";
import { Dialog } from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { FlowProvider, useFlow } from "#/providers/flow";
import { DialogPanel } from "@headlessui/react";
import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { useState } from "react";

export const Route = createFileRoute("/$organizationId")({
  component: AppLayout,
});

function AppLayout() {
  const params = Route.useParams();

  return (
    <FlowProvider organizationId={params.organizationId}>
      <App />
    </FlowProvider>
  );
}

function App() {
  const flow = useFlow();

  const createTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title")!.toString();

    const now = DateTime.now().toISO();

    await flow.tx.insert(flow.models.task, {
      id: crypto.randomUUID().toString(),
      title: title,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    });

    form.reset();
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="w-2xl mx-auto flex items-center justify-between border-x px-2 py-4">
        <span>
          <svg className="fill-primary h-5 w-5" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.06 12.9c-.04.87-.16 1.44-.48 1.89-.17.22-.36.42-.59.58-.7.5-1.69.5-3.67.5H5.26c-1.99 0-2.98 0-3.67-.5A2.65 2.65 0 0 1 1 14.8c-.5-.7-.5-1.69-.5-3.68v-1.05c0-1.99 0-2.98.5-3.68.16-.22.36-.42.59-.58.44-.33 1.01-.44 1.89-.49h.12a1.48 1.48 0 0 0 1.33-1.37v-.08c.04-.87.16-1.44.48-1.89.17-.22.36-.42.59-.59.7-.5 1.69-.5 3.67-.5h1.06c1.99 0 2.98 0 3.67.5.23.17.43.37.59.6.5.69.5 1.68.5 3.66V6.7c0 1.99 0 2.98-.5 3.68-.16.22-.36.42-.59.58-.44.33-1.01.44-1.89.48h-.04l-.08.01c-.7.06-1.27.63-1.33 1.33V12.9ZM4.91 6.53c-.83 0-1.4 0-1.84.05-.48.05-.66.14-.76.22-.12.08-.22.19-.31.3-.07.11-.16.29-.21.77-.06.5-.06 1.17-.06 2.19v1.05c0 1.02 0 1.7.06 2.2.05.47.14.65.21.75.09.12.2.23.31.31.1.08.28.17.76.22.5.05 1.17.05 2.19.05h1.06c1.02 0 1.68 0 2.19-.05.47-.05.65-.14.76-.22.12-.08.22-.19.3-.3.08-.11.17-.29.22-.77.05-.44.06-1 .06-1.83h-.18c-1.98 0-2.98 0-3.67-.5a2.65 2.65 0 0 1-.59-.6c-.5-.69-.5-1.68-.5-3.67v-.17Z"
            />
          </svg>
        </span>

        <div className="flex items-center gap-4">
          <AboutDialog />

          <a
            className="flex items-center gap-1"
            href="https://github.com/phatjng/flight"
            target="_blank"
          >
            <span>GitHub</span>
            <span>
              <svg className="size-4" viewBox="0 0 15 15">
                <path
                  d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </span>
          </a>
        </div>
      </div>

      <div className="border-y">
        <div className="mx-auto max-w-2xl border-x px-2 py-2">
          <form onSubmit={createTask} className="flex">
            <Input
              type="text"
              name="title"
              placeholder="Create a task"
              required
            />
            <Button type="submit">Create</Button>
          </form>
        </div>
      </div>

      <div className="w-2xl mx-auto h-full divide-y overflow-y-auto border-x">
        <InProgressTasksList />
        <CompletedTasksList />
      </div>
    </div>
  );
}

function AboutDialog() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <span onClick={() => setOpen(true)}>About</span>

      <Dialog
        as="div"
        className="relative z-10 focus:outline-none"
        open={open}
        onClose={() => setOpen(false)}
      >
        <DialogPanel
          className="bg-sand-4 w-full max-w-md border shadow-lg"
          transition
        >
          <div>
            <div className="bg-sand-3 border-b p-2">
              <span className="font-bold"> Welcome to Flight</span>
            </div>

            <div className="flex flex-col gap-4 p-4">
              <p>
                Flight is a simple to-do list built with Flow, a sync engine for
                the web.
              </p>
              <p>
                To see it in action, open a new window with the same URL
                side-by-side!
              </p>

              <div>
                <Button onClick={() => setOpen(false)}>Continue</Button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
