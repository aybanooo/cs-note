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
import { NoteContent } from "@/types/note"

  type props = {
    OnRemove?: (e:Event) => void
    OnRename?: (e:Event) => void
    OnAssignTemplate?: (e:Event) => void
  }

  export default function TemplateContextContent({OnRemove, OnRename, OnAssignTemplate}:props) {

    return (
        <ContextMenuContent className="w-64">
          <ContextMenuItem onSelect={OnRemove} inset>
          Remove
            <ContextMenuShortcut>R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={OnRename} inset>
          Rename
            <ContextMenuShortcut>E</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={OnAssignTemplate} inset>
          Assign Template
            <ContextMenuShortcut>T</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
    )
  }
  