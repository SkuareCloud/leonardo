import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Shepherd | Orchestractor",
    other: {
        items: "Dashboard|/>Orchestractor|/",
    },
}

export default async function Page() {
    return <div className="p-8">Orchestartor</div>
}
