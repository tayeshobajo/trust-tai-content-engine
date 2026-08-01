import { redirect } from "next/navigation"

// /dashboard redirects to / (Command Center)
export default function DashboardRedirect() {
  redirect("/")
}
