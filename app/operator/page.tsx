import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shepherd | Operator",
  other: {
    items: "Dashboard|/>Operator|/",
  },
};

export default async function Page() {
  return <div className="p-8">Operator</div>;
}
