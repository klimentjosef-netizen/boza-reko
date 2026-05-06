import { getProfile } from "@/lib/auth";
import PortalShell from "@/components/portal/PortalShell";

export const metadata = {
  title: "Portál | BOZA REKO",
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return <PortalShell profile={profile}>{children}</PortalShell>;
}
