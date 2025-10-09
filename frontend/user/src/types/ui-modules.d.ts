declare module "@/components/ui/use-toast" {
  export type ToastOptions = {
    title?: string;
    description?: string;
    variant?: string;
  };

  export function useToast(): {
    toast: (opts: ToastOptions) => void;
  };

  const _default: ReturnType<typeof useToast>;
  export default _default;
}
