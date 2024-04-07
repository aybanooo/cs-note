import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import TemplateForm from "./TemplateForm"
import { StandardTemplate, StandardTemplateGroup } from "@/types/standardTemplateGroup"
import { useEffect, useState } from "react"
import StandardTemplateGroupForm from "./StandardTemplateGroupForm"

import { v4 as uuidv4 } from 'uuid';
import StandardTemplateForm from "./StandaardTemplateForm"
import { Skeleton } from "./ui/skeleton"
import { TemplateContextContent } from "./TemplateItemContextMenu"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./ui/context-menu"

import * as fsClient from "@/lib/firebase/clientApp"
import { storageKeys } from '@/lib/data'
import { debounce } from "lodash"
import { UserAuth } from "@/app/context/AuthContext"

const storageKey = storageKeys.standard_templates;

export default function StandardTemplateList() {
  const { user, isLoading } = UserAuth();

  const [templateGroups, setTemplateGroups] = useState<StandardTemplateGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<StandardTemplateGroup | undefined>();
  const selectedIsNew:boolean = selectedGroup != null && selectedGroup.guid == '';

  
  const [selectedTemplate, setSelectedTemplate] = useState<StandardTemplate>({guid: '', label: '', value: ''});
  const selectedTemplateIsNew:boolean = selectedTemplate.guid == '';

  const [selectedTemplateGroupId, setSelectedTemplateGroupId] = useState<string | undefined>()

  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if(isLoading) return;
    let cancel = false;
    if (fsClient.IsLoggedIn()) {
      (async () => {
        let templates = await fsClient.GetStandardTemplates()
        if (!cancel) {
          if(templates.length == 0) {
          }
          setTemplateGroups(templates);
        }
        setLoading(false);
        return;
      })()
    } else {
      let result = localStorage.getItem(storageKey);
      if (result != null) {
        try {
          let t: StandardTemplateGroup[] = JSON.parse(result);
          if (!cancel)
            setTemplateGroups(t);
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
  }, [templateGroups]);

  const PersistTemplates = debounce(() => {
    if (fsClient.IsLoggedIn()) {
      fsClient.SaveStandardTemplates(templateGroups)
    } else {
      localStorage.setItem(storageKey, JSON.stringify(templateGroups));
    }
  }, 400);


  function UpdateGroupName(val:string) {
    console.log("Update Group Name")
    setSelectedGroup(curr => {
      if(curr == null) return curr;
      curr!.groupName = val
      return {...curr};
    })
  }

  function RemoveTemplateGroup(group:StandardTemplateGroup) {
    setTemplateGroups(curr => {

      return [...curr].filter(t => t.guid != group.guid);
    })
  }

  function UpdateTemplateLabel(val:string) {
    setSelectedTemplate(curr => {
      curr.label = val;
      return {...curr};
    })
  }
  
  function UpdateTemplateValue(val:string) {
    setSelectedTemplate(curr => {
      curr.value = val;
      return {...curr};
    })
  }

  function RemoveTemplate(groupId:string, template:StandardTemplate) {
    setTemplateGroups(curr => {
      const d = [...curr];
      let oldtarget = d.find(t => t.guid === groupId)
      if (!oldtarget) return [...d];
      let target = {...oldtarget};
      let oldTargetIdx = d.indexOf(oldtarget);
      d[oldTargetIdx] = target;
      target.templates = [...target.templates].filter(t => t.guid !== template.guid);
      return d;
    })
  }

  function HandleSubmit() {
    if (selectedIsNew) {
      setTemplateGroups(curr => {
        let newGroup = Object.assign({}, selectedGroup);
        newGroup.guid = uuidv4()
        return [...curr, newGroup];
      });
    } else {
      setTemplateGroups(curr => {
        const d = [...curr];
        const target = d.find(t => t.guid === selectedGroup!.guid)
        if (!target) return [...d];
        target.groupName = selectedGroup!.groupName;
        return [...d]
      });
    }
  }

  function HandleTemplateFormSubmit() {
    const groupId = selectedTemplateGroupId;
    setTemplateGroups( curr => {
      const d = [...curr];
      let oldtarget = d.find(t => t.guid === groupId)
      if (!oldtarget) return [...d];
      let target = {...oldtarget};
      let oldTargetIdx = d.indexOf(oldtarget);
      d[oldTargetIdx] = target;
      if(selectedTemplateIsNew) {
        const newTemplate = {...selectedTemplate};
        newTemplate.guid = uuidv4();
        target.templates = [...target.templates, Object.assign({}, newTemplate)];
      } else {
        let targetTemplate = target.templates.find(x=>x.guid === selectedTemplate!.guid);
        if(targetTemplate) {
          targetTemplate.label = selectedTemplate.label;
          targetTemplate.value = selectedTemplate.value;
        }
      }
      return d;
    })
  }

  function StartNewGroupCreation() {
    setSelectedGroup({groupName: '', guid: '', templates: []})
  }

  function StartNewTemplateCreation(groupId:string) {
    console.log('gege', groupId);
    setSelectedTemplateGroupId(groupId)
    setSelectedTemplate({guid: '', label: '', value: ''});
  }

    return (
      <>
        <Dialog>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl w-full">
            <div className="flex justify-between items-center">
              <span>Standard Templates</span>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{selectedIsNew ? 'Create Template Group' : 'Edit Template Group'}</DialogTitle>
                    <DialogDescription>
                      {selectedIsNew ? "Create a new template group. Label and content must be provided" : "Make changes to your template group here. Click save when you're done."}
                    </DialogDescription>
                  </DialogHeader>
                  {
                      selectedGroup != null && 
                        <StandardTemplateGroupForm template={selectedGroup} OnLabelChange={UpdateGroupName}/>
                  }
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button type="button" onClick={HandleSubmit} > {selectedIsNew ? 'Create' : 'Save changes'}</Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              <DialogTrigger asChild>
                <Button size={"sm"} variant={"secondary"} onClick={StartNewGroupCreation}>New Group</Button>
              </DialogTrigger>
            </div>
        </h1>
          <Accordion type="single" collapsible className="w-full">
            {
              templateGroups.map(templateGroup => 
              <AccordionItem key={templateGroup.guid} value={templateGroup.guid}>
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <AccordionTrigger>
                        {templateGroup.groupName}
                      </AccordionTrigger>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <DialogTrigger asChild>
                        <ContextMenuItem onClick={() => setSelectedGroup(templateGroup)}>Rename</ContextMenuItem>
                      </DialogTrigger>
                      <ContextMenuItem onClick={() => RemoveTemplateGroup(templateGroup)}>Remove</ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                <AccordionContent>
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
                              {[...templateGroup.templates].sort( (x,y) =>x.label.localeCompare(y.label)).map((t, i) => (
                                <ContextMenu key={i}>
                                  <DialogTrigger asChild>
                                    <ContextMenuTrigger asChild>
                                      <Button onClick={() => {setSelectedTemplate(t); setSelectedTemplateGroupId(templateGroup.guid) }} className="mb-3 mr-3" variant={"secondary"}>{t.label}</Button>
                                    </ContextMenuTrigger>
                                  </DialogTrigger>
                                  <TemplateContextContent template={t} OnRemove={() => RemoveTemplate(templateGroup.guid, t)} />
                                </ContextMenu>
                              ))}
                              <DialogTrigger asChild>
                                <Button variant={"ghost"} onClick={() => StartNewTemplateCreation(templateGroup.guid)} ><Icons.plus className="mr-2 h-4 w-5" />New Template</Button>
                              </DialogTrigger>
                            </>
                          }
                        </div>
                  </div>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{selectedTemplateIsNew ? 'Create Template' : 'Edit Template'}</DialogTitle>
                      <DialogDescription>
                        {selectedTemplateIsNew ? "Create a new template. Label and content must be provided" : "Make changes to your template here. Click save when you're done."}
                      </DialogDescription>
                    </DialogHeader>
                      {
                        selectedTemplateGroupId != null && 
                          <StandardTemplateForm template={selectedTemplate} OnLabelChange={UpdateTemplateLabel} OnValueChange={UpdateTemplateValue}/>
                    }
                    <DialogFooter>
                      <DialogTrigger asChild>
                        <Button type="button" onClick={HandleTemplateFormSubmit} > {selectedTemplateIsNew ? 'Create' : 'Save changes'}</Button>
                      </DialogTrigger>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </AccordionContent>
              </AccordionItem>
              )
            }
            </Accordion>
            </Dialog>
      </>
    )
}