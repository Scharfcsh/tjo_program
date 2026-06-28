"use client"

import * as React from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { SEMESTERS } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CollegeCombobox } from "./CollegeCombobox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FieldErrors = Record<string, string[] | undefined>

export default function RegisterPage() {
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [college, setCollege] = React.useState("")
  const [semester, setSemester] = React.useState("")
  const [done, setDone] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get("name") ?? ""),
      college,
      mobile: String(form.get("mobile") ?? ""),
      email: String(form.get("email") ?? ""),
      semester,
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        if (data.issues) setErrors(data.issues as FieldErrors)
        toast.error(data.error ?? "Registration failed. Please try again.")
        return
      }

      setDone(true)
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center p-6">
        <Card>
          <CardHeader>
            <CheckCircle2 className="size-8 text-primary" />
            <CardTitle className="text-lg">You&apos;re registered!</CardTitle>
            <CardDescription>
              Thanks for applying to the TopJobOffer Student Ambassador Program.
              We&apos;ve emailed you a confirmation and will be in touch if
              you&apos;re shortlisted.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center p-6">
      <Card>
        <CardHeader>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            TopJobOffer Ambassadors
          </p>
          <CardTitle className="text-lg">Become a Student Ambassador</CardTitle>
          <CardDescription>
            Register below. Shortlisted students get a private link to start
            onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <Field label="Full name" name="name" errors={errors.name}>
              <Input id="name" name="name" placeholder="Aman Adhikari" required />
            </Field>
            <Field label="College" name="college" errors={errors.college}>
              <CollegeCombobox id="college" value={college} onChange={setCollege} />
            </Field>
            <Field label="Mobile number" name="mobile" errors={errors.mobile}>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="+1 555 0100"
                required
              />
            </Field>
            <Field label="Email" name="email" errors={errors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field label="Semester" name="semester" errors={errors.semester}>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select your semester" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Button type="submit" disabled={submitting} className="mt-2">
              {submitting && <Loader2 className="animate-spin" />}
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string
  name: string
  errors?: string[]
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {errors?.[0] && <p className="text-xs text-destructive">{errors[0]}</p>}
    </div>
  )
}
