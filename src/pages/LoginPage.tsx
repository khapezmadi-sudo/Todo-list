import React, { useCallback, useState } from "react";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase";
import { Link } from "react-router";
import { GoogleAuthProvider } from "firebase/auth";
import { useTranslation } from "react-i18next";

const loginSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const {t} = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = useCallback(async (data: LoginFormValues) => {
    setFirebaseError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error: unknown) {
      console.error(error);
      setFirebaseError("Ошибка при входе");
    }
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setFirebaseError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log("Google вход успешен!");
    } catch (error: unknown) {
      console.error(error);
      setFirebaseError("Ошибка входа через Google");
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-130">
        <FieldSet className="w-full max-w-130 rounded-3xl border-2  flex flex-col items-center justify-center p-12 bg-[#fafafa]">
          <FieldGroup className="w-full">
            <FieldLegend className="text-center font-bold text-2xl!">
              {t("login")}
            </FieldLegend>

            {firebaseError && (
              <p className="text-red-500 text-sm text-center font-medium mt-2">
                {firebaseError}
              </p>
            )}

            <Field className="mt-2">
              <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
              <Input
                id="email"
                type="text"
                placeholder="example@example.com"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </span>
              )}
            </Field>

            <Field className="mt-2">
              <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </span>
              )}
            </Field>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 bg-(--button-color) cursor-pointer text-white hover:bg-(--button-color)/95   transition-colors duration-300 ease-in-out"
            >
              {isSubmitting ? t("loading") : t("login")}
            </Button>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="bg-(--button-color) cursor-pointer text-white   hover:bg-(--button-color)/95   transition-colors duration-300 ease-in-out"
            >
              <img
                src="google.svg"
                alt="Google Icon"
                className="w-4 h-4 mr-2"
              />
              Google
            </Button>

            <p className="text-sm text-center mt-2">
              {t("alreadyHaveAccount")} <Link to="/register"> {t("register")} </Link>
            </p>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
};
