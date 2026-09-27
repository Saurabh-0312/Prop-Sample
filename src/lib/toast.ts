import { create } from "zustand";

export type ToastTone = "success" | "error" | "info" | "warning" | "profit" | "loss";

export type ToastItem = {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  duration: number;
};

type ToastState = {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id" | "duration"> & { duration?: number }) => number;
  dismiss: (id: number) => void;
};

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { duration: 4200, ...t, id }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const make =
  (tone: ToastTone) =>
  (title: string, description?: string, duration?: number) =>
    useToastStore.getState().push({ tone, title, description, duration });

export const toast = {
  success: make("success"),
  error: make("error"),
  info: make("info"),
  warning: make("warning"),
  profit: make("profit"),
  loss: make("loss"),
};
