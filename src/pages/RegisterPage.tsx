import React, { useCallback, useState } from "react";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

const registerSchema = z.object({
  email: z.string().email("Введите корректный email адрес"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = useCallback(async (data: RegisterFormValues) => {
    setFirebaseError(null);

    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
    } catch (error: unknown) {
      console.error("Ошибка Firebase", error);

      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          setFirebaseError("Пользователь с таким email уже существует");
        } else {
          setFirebaseError(error.message);
        }
      } else {
        setFirebaseError("Неизвестная ошибка");
      }
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
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-muted/35 via-background to-background" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 left-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-2">
        <div className="hidden lg:block animate-in fade-in-0 slide-in-from-left-6 duration-500">
          <div className="max-w-lg">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-border/50">
                <div className="h-4 w-4 rounded-sm bg-primary" />
              </div>
              <div className="text-sm font-medium text-foreground">Todo</div>
            </div>

            <h2 className="text-4xl font-semibold tracking-tight text-foreground">
              {t("registerSideTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("registerSideLead")}
            </p>

            <div className="mt-8 grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border bg-background/40 p-5 backdrop-blur-sm">
                <p className="font-medium text-foreground">
                  {t("registerSidePoint1Title")}
                </p>
                <p className="mt-1">{t("registerSidePoint1Desc")}</p>
              </div>
              <div className="rounded-2xl border bg-background/40 p-5 backdrop-blur-sm">
                <p className="font-medium text-foreground">
                  {t("registerSidePoint2Title")}
                </p>
                <p className="mt-1">{t("registerSidePoint2Desc")}</p>
              </div>
              <div className="rounded-2xl border bg-background/40 p-5 backdrop-blur-sm">
                <p className="font-medium text-foreground">
                  {t("registerSidePoint3Title")}
                </p>
                <p className="mt-1">{t("registerSidePoint3Desc")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in-0 slide-in-from-right-6 duration-500">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto w-full max-w-md"
          >
            <div className="mb-7 text-center lg:hidden">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-border/50">
                <div className="h-4 w-4 rounded-sm bg-primary" />
              </div>
            </div>

            <FieldSet className="w-full rounded-2xl border bg-background/60 p-7 shadow-xl shadow-black/5 backdrop-blur-sm">
              <FieldGroup className="w-full">
                <div className="space-y-2">
                  <div className="text-left text-3xl font-semibold tracking-tight text-foreground">
                    {t("registration")}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("registerSideDescription")}
                  </p>
                </div>

                {firebaseError && (
                  <p className="text-destructive text-sm font-medium mt-4">
                    {firebaseError}
                  </p>
                )}

                <Field className="mt-6">
                  <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                  <Input
                    id="email"
                    type="text"
                    placeholder="example@example.com"
                    className="h-12 text-base"
                    {...register("email")}
                  />
                  {errors.email && (
                    <span className="text-destructive text-xs mt-1">
                      {errors.email.message}
                    </span>
                  )}
                </Field>

                <Field className="mt-4">
                  <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 text-base"
                    {...register("password")}
                  />
                  {errors.password && (
                    <span className="text-destructive text-xs mt-1">
                      {errors.password.message}
                    </span>
                  )}
                </Field>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-7 h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base"
                >
                  {isSubmitting ? t("loading") : t("register")}
                </Button>

                <div className="mt-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="mt-4 grid gap-2">
                  <Button
                    type="button"
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="w-full h-12 text-base"
                  >
                    <img
                      src="google.svg"
                      alt="Google Icon"
                      className="w-4 h-4 mr-2"
                    />
                    Google
                  </Button>
                </div>

                <p className="text-sm text-center mt-6 text-muted-foreground">
                  {t("alreadyHaveAccount")}{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    {t("login")}
                  </Link>
                </p>
              </FieldGroup>
            </FieldSet>
          </form>
        </div>
      </div>
    </div>
  );
};
