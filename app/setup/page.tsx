"use client"

import { GetServerSideProps } from "next";
import { EventHandler, useEffect, useRef, useState } from "react";
import { resetServerContext, DragDropContext, Droppable, Draggable, DraggingStyle, NotDraggingStyle, OnDragEndResponder, DropResult, ResponderProvided, DraggableLocation } from "@hello-pangea/dnd";
import { NoteContentInputType, NoteContent } from "@/types/note";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";

import ContextMenuSetupItem from "@/components/ContextMenuSetupItem";
import { debounce } from "lodash";

interface IItems {
  id: string,
  content: string
}

const reorder = (list: NoteContent[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const
  getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
    // some basic styles to make the items look a bit nicer
    // userSelect: "none",
    // padding: grid * 2,
    margin: `0 0 0 0`,
    // change background colour if dragging
    // background: isDragging ? "lightgreen" : "transparent",

    // styles we need to apply on draggables
    ...draggableStyle
  });

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "transparent",
  // padding: grid,
  // width: 250
});

const source: NoteContentInputType[] = [
  "input",
  "textarea"
]

const ITEMS = source;

const copy = (source: NoteContentInputType[], destination: NoteContent[], droppableSource: DraggableLocation, droppableDestination: DraggableLocation) => {
  console.log('==> dest', destination);

  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const item = sourceClone[droppableSource.index];

  destClone.splice(droppableDestination.index, 0, {
    id: uuidv4(),
    type: item,
    title: "New",
    value: "",
    standardTemplateGroupId: null,
  });
  console.log('==> dest clone', destClone);
  return destClone;
};

import { storageKeys, GetAllData, ImportData, ExportableData, GetStandardTemplates } from '@/lib/data';
const { setup: storageKey } = storageKeys;

type DialogContent = NoteContent & {
  newId: string
}

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import * as z from "zod"
const formSchema = z.object({
  Id: z.string(),
  NewId: z.string().min(2).max(40),
  Label: z.string().min(2).max(40),
})

import * as fsClient from '@/lib/firebase/clientApp'
import { UserAuth } from "../context/AuthContext";
import { useAuthState } from "react-firebase-hooks/auth";
import PageLoader from "@/components/PageLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { StandardTemplateGroup } from "@/types/standardTemplateGroup";
import { Badge } from "@/components/ui/badge";


export default function Page() {

  const [items, setItems] = useState<NoteContent[]>([]);
  const [sloading, setLoading] = useState(true);
  const [dialogItem, setDialogItem] = useState<DialogContent>();
  const [open, setOpen] = useState(false);
  const [assignTemplateOpen, setAssignTemplateOpen] = useState(false);
  const {user, isLoading: loading} = UserAuth();
  const PersistTemplates = debounce(() => {
    if(fsClient.IsLoggedIn()) {
      fsClient.SaveSetups(items);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, 400);

  const [standardTemplateGroups, setStandardTemplateGroup] = useState<StandardTemplateGroup[]>([])
  const [selectedNoteContent, setSelectedNoteContent] = useState<NoteContent|undefined>();

  useEffect(() => {
    setLoading(true);
    let cancel = false;
    if(fsClient.IsLoggedIn()) {
      (async () => {
        let data = await fsClient.GetSetups();
        let templateGroup = await fsClient.GetStandardTemplates();

        if(!cancel) {
          setItems(data);
          setStandardTemplateGroup(templateGroup);
        }
        setLoading(false);
        return;
      })()
    } else {
      let result = localStorage.getItem(storageKey);
      let resultGroups = GetStandardTemplates();
      if (result != null) {
        try {
          let t: NoteContent[] = JSON.parse(result);
          console.log(t);
          if(!cancel) {
            setItems(t);
            setLoading(false);
            setStandardTemplateGroup(resultGroups);
          }
        } catch {
          setLoading(false);
        }
      }
    }
    return () => {
      cancel = true;
    }
  }, [user])

  useEffect(() => {
    if (loading) return;
    PersistTemplates();
  }, [items])

  function onDragEnd(result: DropResult, provided: ResponderProvided) {
    // const { source, destination } = result;

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    console.log('==> result', result);

    // // dropped outside the list
    // if (!destination) {
    //     return;
    // }

    switch (source.droppableId) {
      case 'ITEMS':
        const newItems = copy(
          ITEMS,
          items,
          source,
          destination
        );
        setItems(newItems);
        break;
      default:
        const ordereditems = reorder(
          items,
          result.source.index,
          result.destination.index
        );
        setItems(ordereditems);
        break;
    }

  }

  function OnComponentValueChange(fieldId:string, value:string) {
    setItems( curr => {
        let currCopy = [...curr];
        let target = currCopy.find(x=>x.id === fieldId);
        if(!target) return currCopy;
        target.value = value;
        return currCopy;
    })
  }

  function RemoveItem(data: NoteContent): void {
    setItems(curr => {
      const d = curr.filter(item => item.id != data.id);
      return d;
    });
  }

  function ShowRenameModal(item: NoteContent): void {
    form.setValue('Label', item.title, { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    form.setValue('Id', item.id, { shouldValidate: true });
    form.setValue('NewId', item.id, { shouldValidate: true });
    setOpen(true);
  }

  function AssignTemplate(item: NoteContent): void {
    setSelectedNoteContent(item);
    setAssignTemplateOpen(true);
  }

  function UpdateAssignedTemplate(standardTemplateGroupId:string) {
    setItems( curr => {
      let currCopy = [...curr];
      if(selectedNoteContent == null) return currCopy;
      let target = currCopy.find(x=>x.id === selectedNoteContent.id);
      if(!target) return currCopy;
      target.standardTemplateGroupId = standardTemplateGroupId;
      return currCopy;
    })
  }

  function Rename() {
    const currid = dialogItem?.id;
    setItems(curr => {
      const d = [...curr];
      let target = d.find(item => item.id === currid);
      if (!target || !dialogItem) return d;
      target.title = dialogItem.newId;
      target.id = dialogItem.newId;
      return d;
    })
    setOpen(false);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Id: ""
    },
    shouldUnregister: true
  })

  const { control } = form;

  const { NewId } = useWatch({ control });


  function onSubmit(values: z.infer<typeof formSchema>) {
    let idExists = items.map(x => x.id).some(i => i == values.NewId);
    if (idExists && values.Id !== values.NewId) {
      form.setError('NewId', {
        message: "Id already exist"
      });
      return;
    }
    const currid = values.Id;
    setItems(curr => {
      const d = [...curr];
      let target = d.find(item => item.id === currid);
      if (!target) return d;
      target.title = values.NewId;
      target.id = values.NewId;
      return d;
    })
    setOpen(false);
  }

  const [dialogErrorMessage, setDialogErrorMessage] = useState({
    message: "",
    hasError: false
  });
  useEffect(() => {
    let idExists = items.map(x => x.id).some(i => i == dialogItem?.newId);
    if (idExists) {
      form.setError('NewId', {
        message: "Id already exist"
      });
    }
  }, [NewId, items])


  async function Export() {
    let d = await GetAllData();    
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(d)
      )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "data.json";
    link.click();
  }

  function OnFileUpload(files:FileList|null) {
    const fileReader = new FileReader();
    if(!files)return;
    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (e:any) => {
      const content = e.target.result;
      console.log(content);
      debugger;
      try {
        let d = JSON.parse(content) as ExportableData
        setItems(d.setup);
        ImportData(d);
      } catch {}
    };
  }
  const upload = useRef<HTMLInputElement>(null);
  function Import() {
    upload.current?.click();
    upload
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        Setup
      </h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Rename Field</DialogTitle>
                <DialogDescription>
                  Rename the selected field. The name that will be provided must be unique.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="NewId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
                {/* <Button type="button" onClick={Rename}>Save changes</Button> */}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
        <div className="">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-6 gap-5">
              <div className="grid grid-rows-1 md:grid-rows-2 grid-cols-1 gap-5 col-span-6 md:col-span-2">
                <Card className="col-span-2 h-fit shadow-xl">
                  <CardHeader>
                    <CardTitle>Components</CardTitle>
                    <CardDescription>You can drag & drop the elements below to the preview shown in the right of this section.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="ITEMS" isDropDisabled={true}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          //style={getListStyle(snapshot.isDraggingOver)}
                          className="dnd-copy-list"
                        >
                          {ITEMS.map((item, index) => (
                            <Draggable
                              key={item}
                              draggableId={item}
                              index={index}>
                              {(provided, snapshot) => (
                                <>
                                  <div 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                    )}>
                                    <span className="" style={{ pointerEvents: "none" }}>
                                      <Label>{item}</Label>
                                      {item == "input" ? (
                                        <Input />
                                      ) : (
                                        <Textarea></Textarea>
                                      )}
                                    </span>
                                    <span className="pb-3 block"></span>
                                  </div>
                                  {snapshot.isDragging && (
                                    <span className="dnd-copy" style={{ pointerEvents: "none" }}>
                                      <Label>{item}</Label>
                                      {item == "input" ? (
                                        <Input disabled />
                                      ) : (
                                        <Textarea></Textarea>
                                      )}
                                    <span className="pb-3 block"></span>
                                    </span>
                                    // <div className="opacity-50">{item}</div>
                                  )}
                                </>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
                <Card className="hidden md:block w-full shadow-xl h-fit col-span-2">
                  <CardHeader>
                      <CardTitle>Data & Configuration</CardTitle>
                      {/* <CardDescription>This is the preview of what will your notes look like. You can re-order the elements below by dragging & dropping</CardDescription> */}
                    </CardHeader>
                    <CardContent>
                      <ImportExportContent/>
                    </CardContent>
                </Card>
              </div>
              <Card className="col-span-6 md:col-span-4 h-fit shadow-xl">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>This is the preview of what will your notes look like. You can re-order the elements below by dragging & dropping. You can set default values by typing it in the created fields/components. For other action, you can right-click a field.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form>
                    <div className="grid w-full items-center gap-4">
                      <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                          >
                            { loading ? 
                            <>
                              <PageLoader>
                                  <Skeleton className="h-5 w-20 mb-1" />
                                  <Skeleton className="h-10 w-full mb-3" />
                                  <Skeleton className="h-5 w-20 mb-1" />
                                  <Skeleton className="h-10 w-full mb-3" />
                                  <Skeleton className="h-5 w-20 mb-1" />
                                  <Skeleton className="h-10 w-full mb-3" />
                              </PageLoader>
                            </> : 
                            items.map((item, index) => (
                              <ContextMenu key={index}>
                                <ContextMenuTrigger>
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getItemStyle(
                                          snapshot.isDragging,
                                          provided.draggableProps.style
                                        )}
                                      >
                                        <Label className="basis-" htmlFor="account">{item.title} {item.standardTemplateGroupId != null ? <Badge variant={"outline"} >{standardTemplateGroups.find(x=>x.guid == item.standardTemplateGroupId)?.groupName}</Badge> : ""}</Label>
                                        <div className="flex space-x-2">
                                          {item.type == "input" ? (
                                            <Input id={item.id} value={item.value} onChange={ e => OnComponentValueChange(item.id, e.target.value)} placeholder="Type here to set default value ..." />
                                          ) : (
                                            <Textarea value={item.value} onChange={ e => OnComponentValueChange(item.id, e.target.value)} placeholder="Type here to set default value ..."></Textarea>
                                          )}
                                          <Button style={{ pointerEvents: "none" }} type="button" variant="ghost" size="icon"><Icons.copy className='h-4 w-4' /></Button>
                                        </div>
                                        <span className="pb-3 block"></span>
                                      </div>
                                    )}
                                  </Draggable>
                                </ContextMenuTrigger>
                                <ContextMenuSetupItem 
                                  OnRemove={e => RemoveItem(item)} 
                                  OnRename={e => ShowRenameModal(item)} 
                                  OnAssignTemplate={e => AssignTemplate(item)}
                                  />
                              </ContextMenu>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between space-x-2" style={{ pointerEvents: "none", opacity: ".5" }}>
                  <Select>
                    <SelectTrigger id="framework">
                      <SelectValue placeholder="Escalation Templates" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                    </SelectContent>
                  </Select>
                  <Button variant={"destructive"}>Remove</Button>
                  <Button variant="outline">Pend</Button>
                </CardFooter>
              </Card>
              <Card className="block md:hidden w-full shadow-xl h-fit col-span-6">
                  <CardHeader>
                      <CardTitle>Data & Configuration</CardTitle>
                      {/* <CardDescription>This is the preview of what will your notes look like. You can re-order the elements below by dragging & dropping</CardDescription> */}
                    </CardHeader>
                    <CardContent>
                      <ImportExportContent/>
                    </CardContent>
                </Card>
            </div>
          </DragDropContext>
        </div>
      </Dialog>
      
      <Dialog open={assignTemplateOpen} onOpenChange={setAssignTemplateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Template</DialogTitle>
            <DialogDescription>
              Assign a standard template for the selected input.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
              <Select onValueChange={t => UpdateAssignedTemplate(t)} value={selectedNoteContent?.standardTemplateGroupId ?? undefined}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template group" />
                </SelectTrigger>
                <SelectContent>
                  {
                    standardTemplateGroups.map( tg => 
                      <SelectItem key={tg.guid} value={tg.guid}>{tg.groupName}</SelectItem>
                    )
                  }
                </SelectContent>
              </Select>
          </div>
        </DialogContent>
      </Dialog>


      <div className="sm:max-w-[425px]">
      </div>
    </section>
  )
  
  function ImportExportContent() {
    return (
      <>
        <div className="grid gap-3">
          <Input ref={upload} onChange={e=> OnFileUpload(e.target.files)} className="hidden" id="picture" type="file" />
          <Button disabled={loading} onClick={Import}><Icons.copy className='h-4 w-4 mr-2' />Import</Button>
          <Button disabled={loading} onClick={Export} variant={"secondary"}><Icons.copy className='h-4 w-4 mr-2' />Export</Button>
        </div>
      </>
    )
  }
}

