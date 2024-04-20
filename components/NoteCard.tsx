'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

import {Note, NoteContent} from '@/types/note'
import {Icons} from '@/components/icons'
import { Textarea } from "@/components/ui/textarea"
import { IEscalationTemplate, EscalationTemplate } from "@/types/escalationTemplate"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from "./ui/context-menu"
import { StandardTemplateGroup } from "@/types/standardTemplateGroup"
import { MouseEventHandler, ReactNode, RefObject, createRef, useEffect, useRef, useState } from "react"



type props = {
  note: Note,
  OnUpdateData: (note: Note, key: string, value: string) => void,
  OnUpdateEscalation: (note: Note, value: string) => void,
  OnUpdateEscalationValue: (note: Note, value:string) => void,
  OnRemoveNote: (note: Note) => void,
  OnClearNote: (note: Note) => void,
  OnMoveToPending: (note: Note) => void,
  noteDynamicContent: NoteContent[],
  templates: EscalationTemplate[],
  standardTemplateGroups: StandardTemplateGroup[]
}

export default function CardWithForm({note, noteDynamicContent, templates, standardTemplateGroups, OnUpdateData, OnClearNote, OnRemoveNote, OnMoveToPending, OnUpdateEscalation, OnUpdateEscalationValue}: props) {
  const { toast } = useToast()

  const hasTemplateGroup = (noteContent:NoteContent) => noteContent.standardTemplateGroupId != null;

  function CopyToClipboard(label:string ,value: string) {
    navigator.clipboard.writeText(value);
    // toast({
    //   title: `${label} copied`
    // })
  }

  function GetContentValue(id:string) {
    let target = note.dynamicContent.find(d => d.id === id);
    if(!target) return "";
    return target.value;
  }

  const arrLength = noteDynamicContent.length;
  let [lastFocusInputId, setLastFocusInputId] = useState<string>('');
  const inputRef = useRef<Array<HTMLInputElement|HTMLTextAreaElement|null>>([]);

  function HandleCloseAutoFocus(idx:number) 
  {
    let target = inputRef.current[idx];
    target?.focus();
    target?.setSelectionRange(target.value.length, target.value.length);
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        {/* <CardTitle>Note</CardTitle>
        <CardDescription>guid: {note.guid}</CardDescription> */}
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            {
              noteDynamicContent.map( (input, idx) => 
                <div key={input.id} className="flex flex-col space-y-1.5">
                  <Label className="basis-" htmlFor={input.id}>{input.title}</Label>
                  <div className="flex space-x-2">
                    <ContextMenu>
                      <ContextMenuTrigger asChild onClick={() => console.log("sad")}>
                    {
                      input.type == "input" ?
                      <Input ref={el => inputRef.current[idx] = el} autoComplete="off" id={input.id} value={GetContentValue(input.id)} onChange={e=> OnUpdateData(note, input.id, e.target.value)}/> 
                      :
                      <Textarea ref={el => inputRef.current[idx] = el} autoComplete="off" id={input.id} value={GetContentValue(input.id)} onChange={e=> OnUpdateData(note, input.id, e.target.value)}/>
                    }
                      </ContextMenuTrigger>
                      <ContextMenuContent onCloseAutoFocus={ e => {e.preventDefault();HandleCloseAutoFocus(idx);}}>
                        <ContextMenuLabel>Templates</ContextMenuLabel>
                        <CtxContainer scrollable={(standardTemplateGroups.find(x=>x.guid == input?.standardTemplateGroupId)?.templates.length ?? 0 ) > 10 ?? false}>
                          {
                            (() => {
                              let inputTemplate = standardTemplateGroups.find(x=>x.guid == input!.standardTemplateGroupId);
                              if(
                                input.standardTemplateGroupId == null
                                || inputTemplate == null
                                || inputTemplate.templates.length == 0
                              )
                              return <ContextMenuItem disabled >No Template</ContextMenuItem>;
                              return inputTemplate!.templates.toSorted((x,y) =>x.label.localeCompare(y.label)).map(tg => 
                                <ContextMenuItem key={tg.guid} onClick={() => OnUpdateData(note, input.id, GetContentValue(input.id)+tg.value)} >{tg.label}</ContextMenuItem>
                              );
                            })()
                          }
                        </CtxContainer>
                      </ContextMenuContent>
                    </ContextMenu>
                    <Button type="button" variant="ghost" size="icon" onClick={e => CopyToClipboard(input.title, GetContentValue(input.id))}><Icons.copy className='h-4 w-4' /></Button>
                  </div>
                </div>
              )
            }
            {note.escalationTemplate && (
              <div className="flex flex-col space-y-1.5">
              <Label htmlFor="redemption">{note.escalationTemplate.label}</Label>
              <div className="flex space-x-2">
                <Textarea autoComplete="off" id="redemption" placeholder="Redemption" value={note.escalationTemplate.value} onChange={e=> OnUpdateEscalationValue(note, e.target.value)}/>
                <Button type="button" variant="ghost" size="icon" onClick={e => CopyToClipboard("Escalation Template", note?.escalationTemplate?.value || '')}><Icons.copy className='h-4 w-4' /></Button>
              </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between space-x-2">
        <Select value="" onValueChange={e=>OnUpdateEscalation(note, e)}>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Escalation Templates" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <ScrollArea className="h-[300px]">
                    {
                      [...templates].sort((x,y)=> x.label.localeCompare(y.label) ).map(t => <SelectItem key={t.guid} value={t.guid}>{t.label}</SelectItem>)
                    }
                  </ScrollArea>
                </SelectContent>
        </Select>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={"secondary"}>Clear</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Do you want to proceed?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently clear the note data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={e=>OnClearNote(note)}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button variant="outline" onClick={e=>OnMoveToPending(note)}>Pend</Button>
      </CardFooter>
    </Card>
  )
}

function CtxContainer({children, scrollable}:{scrollable:boolean, children?:ReactNode}) {
  return(
    <>
      {scrollable ? 
      <ScrollArea className="h-[300px]">
        {children}
      </ScrollArea>
      : 
      <>{children}</>
      }
    </>
  )
}