"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Reusable Route Forwarder for /templates/edit.
 * Seamlessly routes to the unified Template Studio (/templates/create?templateId=...).
 */
function EditTemplateRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id") || searchParams.get("templateId");
    if (id) {
      router.replace(`/templates/create?templateId=${encodeURIComponent(id)}`);
    } else {
      router.replace("/templates/create");
    }
  }, [router, searchParams]);

  return (
    <div className="flex-1 min-h-0 flex items-center justify-center bg-white dark:bg-[#07090d]">
      <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
        <span className="text-sm font-semibold">Opening Template Blueprint Studio...</span>
      </div>
    </div>
  );
}

export default function EditTemplatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center bg-white dark:bg-[#07090d]">
          <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
        </div>
      }
    >
      <EditTemplateRedirect />
    </Suspense>
  );
}
