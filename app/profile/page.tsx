import ProfileClient from "@/components/ProfileClient";
export const metadata = { title: "Profile" };
export default function Page() {
  return (
    <div className="container-page py-14">
      <p className="eyebrow">Account area</p>
      <h1 className="section-title mt-2">Profile</h1>
      <ProfileClient />
    </div>
  );
}
