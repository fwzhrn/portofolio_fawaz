import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  as?: ElementType;
};

export function Container({ as, className, ...props }: ContainerProps) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cn("mx-auto w-full max-w-[100rem] px-gutter", className)}
      {...props}
    />
  );
}