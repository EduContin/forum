import RegisterForm from "@/components/RegisterForm";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
