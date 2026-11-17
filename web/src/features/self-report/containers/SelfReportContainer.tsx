"use client";

import { Heading } from "@/components/atoms/Heading";
import { useSelfReportForm } from "../hooks/useSelfReportForm";
import { SelfReportForm } from "../components/organisms/SelfReportForm";

export function SelfReportContainer() {
  const { values, setValue, submit, submitting, error } = useSelfReportForm();

  return (
    <>
      <Heading>Daily self-report</Heading>
      <SelfReportForm values={values} onChange={setValue} onSubmit={submit} submitting={submitting} />
      {error && <p role="alert">{error}</p>}
    </>
  );
}
