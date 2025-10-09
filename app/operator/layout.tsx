import { Metadata } from "next"
import { OperatorKeyboardProvider } from "./operator-keyboard-provider"

export const metadata: Metadata = {
    title: "Shepherd | Operator",
    other: {
        items: "Dashboard|/>Operator|/",
    },
}

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
    return (
        <OperatorKeyboardProvider>
            <div className="min-h-screen">
                <div className="container">{children}</div>
            </div>
        </OperatorKeyboardProvider>
    )
}
