import { createFileRoute } from "@tanstack/react-router";
import SosForum from "@/components/SosForum";
export const Route = createFileRoute("/forum")({
    component: SosForum,
    head: () => ({ meta: [{ title: "იმედის რუკა × PearTM — სიკეთის ფორუმი" }] }),
});
