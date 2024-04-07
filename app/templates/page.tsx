'use client'
import DynamicField from "@/components/DynamicField"
import EscalationTemplate from "@/components/EscalationTemplate"
import StandardTemplate from "@/components/StandardTemplateList"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"


export default function TemplatePage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-start gap-2">
        <StandardTemplate />
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Escalation Templates
        </h1>
        {/* <Separator className="my-4" />
        <h2 className="text-1xl font-extrabold leading-tight tracking-tighter md:text-2xl">
            Escalation
        </h2> */}
        <EscalationTemplate />
        {/* <DynamicField /> */}
      </div>
    </section>
  )
}
