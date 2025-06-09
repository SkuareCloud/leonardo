import { PageHeader } from "@/components/page-header";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shepherd",
  other: {
    items: "Dashboard|/",
  },
};

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Shepherd"
        subtitle="Management dashboard - view/edit profiles, perform activations, and more!"
      />
    </div>
  );
}
