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
  const {t} = useTranslation();
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
      console.log("Регистрация прошла успешно!");
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
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-130 ">
        <FieldSet className="w-full max-w-130 rounded-3xl border-2  flex flex-col items-center justify-center p-12 bg-[#fafafa]">
          <FieldGroup className="w-full">
            <FieldLegend className="text-center font-bold text-2xl!">
              {t("registration")}
            </FieldLegend>

            {/* === ВЫВОД ОШИБКИ FIREBASE === */}
            {firebaseError && (
              <p className="text-red-500 text-sm text-center font-medium mt-2">
                {firebaseError}
              </p>
            )}

            <Field className="mt-2">
              <FieldLabel htmlFor="username">{t("email")}</FieldLabel>
              <Input
                id="username"
                type="text"
                placeholder="example@example.com"
                {...register("email")}
              />
              {/* === ВЫВОД ОШИБКИ ZOD ДЛЯ EMAIL === */}
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
              {/* === ВЫВОД ОШИБКИ ZOD ДЛЯ ПАРОЛЯ === */}
              {errors.password && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </span>
              )}
            </Field>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 bg-(--button-color) cursor-pointer text-white   hover:bg-(--button-color)/95   transition-colors duration-300 ease-in-out"
            >
              {isSubmitting ? t("loading") : t("register")}
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
              {t("alreadyHaveAccount")} <Link to={"/login"}> {t("login")} </Link>
            </p>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
};
