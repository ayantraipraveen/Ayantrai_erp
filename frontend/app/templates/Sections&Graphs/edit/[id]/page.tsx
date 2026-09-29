"use client";

import React from "react";
import { useParams } from "next/navigation";
import { SectionEditorContainer } from "../../components";

/**
 * Dedicated Route for Editing a Section Canvas by Slug (/templates/Sections&Graphs/edit/[id]).
 */
export default function EditSectionByIdPage() {
  const params = useParams();
  const sectionId = (params?.id as string) || "";
  return <SectionEditorContainer sectionId={sectionId} />;
}
