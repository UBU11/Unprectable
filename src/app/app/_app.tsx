import type { AppProps } from "next/app"
import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import { useRouter } from "next/router"
import Link from "next/link"

import { authClient } from "@/lib/auth-client"

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const slug = router.query.slug as string | undefined

    return (
        <AuthUIProvider
            authClient={authClient}
            navigate={router.push}
            replace={router.replace}
            organization={{
                pathMode: "slug",
                basePath: "/organization",
                slug
            }}
            Link={Link}
        >
            <Component {...pageProps} />
        </AuthUIProvider>
    )
}
