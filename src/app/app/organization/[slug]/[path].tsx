import { OrganizationView } from "@daveyplate/better-auth-ui"
import { organizationViewPaths } from "@daveyplate/better-auth-ui/server"

export default function OrganizationPage({ path }: { path: string }) {
    return (
        <main className="container mx-auto p-4 md:p-6">
            <OrganizationView path={path} />
        </main>
    )
}

export async function getStaticPaths() {
    return {
        paths: Object.values(organizationViewPaths).map((path) => ({ params: { slug: "", path } })),
        fallback: "blocking"
    }
}

export async function getStaticProps({ params }: { params: { path: string } }) {
    return { props: { path: params.path } }
}
