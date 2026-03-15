import type { ReactNode } from "react"
import "./globals.css"
import { Providers } from "@/provider/better-provider"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    )
}
