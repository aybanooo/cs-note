'use client'

import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from '@/components/ui/button'

import TemplateForm from '@/components/TemplateForm'
import { useEffect, useState } from "react"
import { IEscalationTemplate, EscalationTemplate } from "@/types/escalationTemplate"

import { v4 as uuidv4 } from 'uuid';

import { debounce } from 'lodash'
import { Icons } from "@/components/icons"
import { Ghost } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu"

import { TemplateContextContent } from '@/components/TemplateItemContextMenu'

import { storageKeys } from '@/lib/data'
import { Separator } from "@/components/ui/separator"
import * as fsClient from "@/lib/firebase/clientApp"
import { UserAuth } from "@/app/context/AuthContext"

const storageKey = storageKeys.templates;

export default function EscalationTemplateManager() {
  const [selectedTemplate, setSelectedTemplate] = useState<IEscalationTemplate>(new EscalationTemplate('', '', ''))
  const [templates, setTemplates] = useState<IEscalationTemplate[]>([])
  const [selectedIsNew, setSelectedIsNew] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isLoading } = UserAuth();


  const PersistTemplates = debounce(() => {
    if (fsClient.IsLoggedIn()) {
      fsClient.SaveTemplates(templates)
    } else {
      localStorage.setItem(storageKey, JSON.stringify(templates));
    }
  }, 400);

  useEffect(() => {
    if(isLoading) return;
    let cancel = false;
    if (fsClient.IsLoggedIn()) {
      (async () => {
        let templates = await fsClient.GetTemplates()
        if (!cancel) {
          if(templates.length == 0) {
            debugger;
          }
          setTemplates(templates);
        }
        setLoading(false);
        return;
      })()
    } else {
      let result = localStorage.getItem(storageKey);
      if (result != null) {
        try {
          let t: EscalationTemplate[] = JSON.parse(result);
          if (!cancel)
            setTemplates(t);
        } catch {
  
        }
      }
      setLoading(false);
    }
    return () => {
      cancel = true;
    }
  }, [user, isLoading])

  useEffect(() => {
    if (loading || isLoading) return;
      PersistTemplates();
    return () => {
      PersistTemplates.cancel()
    }
  }, [templates])

  useEffect(() => {
    if (templates.every(t => Boolean(t.guid?.trim()))) return;
    setTemplates(curr => {
      const d = [...curr];
      for (const template of d) {
        template.guid = uuidv4();
      }
      return d;
    });
  }, [templates])

  useEffect(() => {
    if (selectedTemplate.guid?.trim()) return;
    setSelectedTemplate(curr => {
      const d = Object.assign({}, curr);
      SetGuid(d);
      return d;
    });
  }, [selectedTemplate])

  useEffect(() => {
    setSelectedIsNew(curr => {
      let guid = selectedTemplate.guid?.trim();
      let exists = templates.find(t => t.guid === guid) != null;
      return !exists
    })
  }, [selectedTemplate]);

  function SetGuid(template: IEscalationTemplate) {
    if (template.guid?.trim()) return;
    template.guid = uuidv4();
  }

  function UpdateLabel(value: string) {
    setSelectedTemplate(curr => {
      let d = Object.assign({}, curr)
      d.label = value;
      return d;
    });
  }

  function UpdateContent(value: string) {
    setSelectedTemplate(curr => {
      let d = Object.assign({}, curr)
      d.value = value;
      return d;
    });
  }

  function OnTemplateSelect(template: EscalationTemplate) {
    setSelectedTemplate(template);
    setOpen(true);
  }

  function AddTemplate() {
    setSelectedTemplate(new EscalationTemplate('', '', ''));
  }

  function HandleSaveOrCreate() {
    if (selectedIsNew) {
      setTemplates(curr => {
        return [...curr, Object.assign({}, selectedTemplate)]
      });
    } else {
      setTemplates(curr => {
        const d = [...curr];
        const target = d.find(t => t.guid === selectedTemplate.guid)
        if (!target) return [...d];
        target.label = selectedTemplate.label;
        target.value = selectedTemplate.value;
        return [...d]
      });
    }
  }

  function RemoveTemplate(template: EscalationTemplate) {
    setTemplates(curr => {
      const d = [...curr];
      let idx = d.findIndex(t => t.guid === template.guid);
      if (idx >= 0)
        d.splice(idx, 1);
      return d;
    });
  }

  return (

    <Dialog>
      <div>
        <div className='flex flex-wrap justify-start mt-5'>
          {
            loading ?
              [32, 40, 64, 36, 40, 32, 64, 32, 36, 40, 64, 32].map((x, i) => {
                return <Skeleton key={i} className={`h-10 w-${x} mb-3 mr-3`} />
              })
              :
              <>
                {[...templates].sort( (x,y) =>x.label.localeCompare(y.label)).map((t, i) => (
                  <ContextMenu key={i}>
                    <DialogTrigger asChild>
                      <ContextMenuTrigger asChild>
                        <Button onClick={e => OnTemplateSelect(t)} className="mb-3 mr-3" variant={"secondary"}>{t.label}</Button>
                      </ContextMenuTrigger>
                    </DialogTrigger>
                    <TemplateContextContent template={t} OnRemove={RemoveTemplate} />
                  </ContextMenu>
                ))}
                <DialogTrigger asChild>
                  <Button variant={"ghost"} onClick={e => AddTemplate()}><Icons.plus className="mr-2 h-4 w-5" />New Template</Button>
                </DialogTrigger>
              </>
          }
        </div>
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedIsNew ? 'Create Template' : 'Edit Template'}</DialogTitle>
          <DialogDescription>
            {selectedIsNew ? "Create a new redemption template. Label and content must be provided" : "Make changes to your redemption template here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <TemplateForm template={selectedTemplate} OnLabelChange={UpdateLabel} OnValueChange={UpdateContent} />
        <DialogFooter>
          <DialogTrigger asChild>
            <Button type="button" onClick={HandleSaveOrCreate} > {selectedIsNew ? 'Create' : 'Save changes'}</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}