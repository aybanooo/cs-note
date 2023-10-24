
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Note } from "@/types/note"
import { IEscalationTemplate } from "@/types/escalationTemplate"
import { ChangeEvent, ChangeEventHandler } from "react"
import {Textarea} from '@/components/ui/textarea'
type props = {
  template: IEscalationTemplate,
  OnValueChange: (value:string) => void 
  OnLabelChange: (value:string) => void
}

export default function TemplateForm({template, OnValueChange, OnLabelChange}:props) {
  
  function OnLabelInputChange(e:ChangeEvent<HTMLInputElement>) {
    OnLabelChange(e.target.value);
  }

  
  function OnValueInputChange(e:ChangeEvent<HTMLTextAreaElement>) {
    OnValueChange(e.target.value);
  }

    return (
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="label" className="text-right">
            Label
          </Label>
          <Input
            autoComplete="off"
            id="label"
            value={template.label}
            onChange={OnLabelInputChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="content" className="text-right">
            Content
          </Label>
          <Textarea
            autoComplete="off"
            id="content"
            value={template.value}
            onChange={OnValueInputChange}
            className="col-span-3">
            </Textarea>
        </div>
      </div>
    )
}