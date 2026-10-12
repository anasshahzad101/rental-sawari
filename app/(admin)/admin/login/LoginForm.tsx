"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CircleAlert, Eye, EyeOff, Timer } from "lucide-react";
import { fmtTime } from "@/lib/admin/format";
import { loginAction, type LoginState } from "./actions";

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const off = disabled || pending;
  return (
    <button
      type="submit"
      disabled={off}
      className={
        disabled
          ? "mt-5 flex h-12 w-full items-center justify-center rounded-control border border-line bg-fill text-body-m font-semibold text-quiet-solid lg:h-11 lg:text-[15px]"
          : "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-control bg-brand-700 text-body-m font-semibold text-white hover:bg-brand-800 active:shadow-pressed disabled:cursor-wait lg:h-11 lg:text-[15px]"
      }
    >
      {pending && !disabled ? (
        <>
          <span className="h-4 w-4 animate-spin-fast rounded-full border-2 border-white/35 border-t-white" />
          Logging in…
        </>
      ) : (
        "Log in"
      )}
    </button>
  );
}

function PasswordField({ state, locked }: { state: LoginState; locked: boolean }) {
  const { pending } = useFormStatus();
  const [show, setShow] = useState(false);
  const wrong = state.status === "wrong";
  if (locked) {
    return (
      <div className="mt-4 flex flex-col gap-1.5">
        <span className="text-label font-semibold text-quiet-solid">Password</span>
        <div className="flex h-12 items-center rounded-control border border-line bg-fill px-3.5 text-body-m font-medium text-quiet-solid lg:h-11 lg:text-[15px]">
          Locked for now
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 flex flex-col gap-1.5">
      <label htmlFor="password" className="text-label font-semibold text-ink-2">
        Password
      </label>
      <div
        className={[
          "flex h-12 items-center rounded-control pl-3.5 pr-1 lg:h-11",
          pending ? "border border-line bg-fill" : "bg-surface",
          !pending && wrong ? "border-[1.5px] border-bad-solid" : "",
          !pending && !wrong ? "border border-line focus-within:border-[1.5px] focus-within:border-brand-700 focus-within:shadow-input-focus" : "",
        ].join(" ")}
      >
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          autoFocus
          required
          readOnly={pending}
          placeholder="Your admin password"
          aria-invalid={wrong || undefined}
          aria-describedby={wrong ? "pw-error" : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-body-m font-medium text-ink outline-none placeholder:font-normal placeholder:text-quiet-solid focus-visible:shadow-none lg:text-[15px]"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="grid h-11 w-11 place-items-center rounded-lg text-ink-2 lg:h-9 lg:w-10"
        >
          {show ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
        </button>
      </div>
      {wrong && (
        <span id="pw-error" className="flex items-center gap-1.5 text-label text-bad-text">
          <CircleAlert size={16} strokeWidth={1.75} />
          That password is not right. Try again.
        </span>
      )}
    </div>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useFormState<LoginState, FormData>(loginAction, { status: "idle" });
  const locked = state.status === "locked" && state.until > Date.now();

  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />
      {locked && state.status === "locked" && (
        <div className="mt-5 flex gap-2.5 rounded-control border border-bad-border bg-bad-fill px-3.5 py-3" role="alert">
          <Timer size={20} strokeWidth={1.75} className="mt-0.5 flex-none text-bad-text" />
          <div className="text-body font-medium text-ink">
            <span className="font-bold text-bad-text">Too many tries. Wait 10 minutes.</span>
            <br />
            You can try again after {fmtTime(new Date(state.until).toISOString())}.
          </div>
        </div>
      )}
      {state.status === "unset" && (
        <div className="mt-5 flex gap-2.5 rounded-control border border-bad-border bg-bad-fill px-3.5 py-3" role="alert">
          <CircleAlert size={20} strokeWidth={1.75} className="mt-0.5 flex-none text-bad-text" />
          <div className="text-body font-medium text-ink">
            <span className="font-bold text-bad-text">The admin password isn&apos;t set on the server.</span>
            <br />
            Add ADMIN_PASSWORD to the site&apos;s environment variables in Hostinger, then redeploy.
          </div>
        </div>
      )}
      <PasswordField state={state} locked={locked} />
      <Submit disabled={locked} />
    </form>
  );
}
