import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SearchParams = Promise<{ error?: string }>

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { error } = await searchParams

  const message =
    error === "invalid"
      ? "That sign-in link is invalid or has expired. Ask the team to re-send your invite."
      : error === "unavailable"
        ? "We couldn't sign you in right now. Please try your link again shortly."
        : "Ambassadors sign in from the private link we email you. Check your inbox for your onboarding invite."

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center p-6">
      <Card>
        <CardHeader>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            TopJobOffer Ambassadors
          </p>
          <CardTitle className="text-lg">Check your email</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Not registered yet?{" "}
          <a href="/register" className="text-primary underline-offset-4 hover:underline">
            Apply to the program
          </a>
          .
        </CardContent>
      </Card>
    </main>
  )
}
