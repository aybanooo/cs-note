import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
  } from "@/components/ui/context-menu"
  
  import {Icons} from '@/components/icons'
import { IEscalationTemplate, EscalationTemplate } from "@/types/escalationTemplate"

  type props = {
    template: EscalationTemplate,
    OnRemove: (template:IEscalationTemplate) => void
  }

  export function TemplateContextContent({template, OnRemove}:props) {

    function OnSelect(e:Event) {
        OnRemove(template);
    }

    return (
        <ContextMenuContent className="w-64">
          <ContextMenuItem onSelect={OnSelect} inset>
          Remove
            <ContextMenuShortcut>R</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
    )
  }
  