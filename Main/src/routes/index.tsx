import { createFileRoute } from "@tanstack/react-router";
import { ApiConnectionTest } from "../components/ApiConnectionTest";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <ApiConnectionTest />;
}