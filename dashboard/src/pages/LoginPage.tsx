import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/login/github";
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Telemetry</h1>
        <Button className="cursor-pointer" onClick={handleLogin}>
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}
