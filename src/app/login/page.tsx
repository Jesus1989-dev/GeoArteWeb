import { LoginController } from "@/components/features/auth/LoginController";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return <LoginController />;
}
