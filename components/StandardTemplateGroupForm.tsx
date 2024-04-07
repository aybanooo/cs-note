
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChangeEvent, ChangeEventHandler } from "react"
import {StandardTemplateGroup } from "@/types/standardTemplateGroup"
type props = {
  template: StandardTemplateGroup,
  OnLabelChange: (value:string) => void
}

export default function StandardTemplateGroupForm({template, OnLabelChange}:props) {
  
  function OnLabelInputChange(e:ChangeEvent<HTMLInputElement>) {
    OnLabelChange(e.target.value);
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
            value={template.groupName}
            onChange={OnLabelInputChange}
            className="col-span-3"
          />
        </div>
      </div>
    )
}