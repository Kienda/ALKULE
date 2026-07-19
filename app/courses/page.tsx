import { redirect } from "next/navigation";

// "Courses" was a catch-all mixing learning, culture, and media. Those now
// live in their own domains (Learn / Culture / Library); send visitors to the
// structured lessons.
export default function CoursesPage() {
  redirect("/learn/lessons");
}
