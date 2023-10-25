"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import { Skeleton } from '@/components/ui/skeleton'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Button } from '@/components/ui/button'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { MouseEventHandler, useMemo, useState } from 'react';
import { NoteDynamicContent } from '@/types/note'
import { Icons } from "@/components/icons";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
  })

export default function DynamicField() {
    const [loading, setLoading] = useState(false)
    const [templates, setTemplates] = useState<NoteDynamicContent[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<NoteDynamicContent>()
    const [showDialog, setShowDialog] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }
    const selectedIsNew = false;
    // const selectedIsNew:boolean = useMemo<boolean>(()=> {
    //     return Boolean(selectedTemplate) && !selectedTemplate?.id 
    // },[selectedTemplate])

    const OnTemplateSelect = (note:NoteDynamicContent) => {
        
    }

    const OnSelect = (e:Event) => {

    }

    const AddTemplate = (e:MouseEventHandler) => {

    }

    const HandleNewTemplateButton = () => {

    }

    return  <>
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <div>
            <div className='flex flex-wrap justify-start mt-5'>
              {
                loading ? 
                <>
                    <Skeleton className={`h-10 w-25 mb-3 mr-3`} />
                </>
                : 
                <>
                  {templates.map( (t,i) => (
                    <ContextMenu key={i}>
                        <DialogTrigger asChild>
                          <ContextMenuTrigger asChild>
                            <Button onClick={e=>OnTemplateSelect(t)} className="mb-3 mr-3" variant={"secondary"}>{t.title}</Button>
                          </ContextMenuTrigger>
                        </DialogTrigger>
                        <ContextMenuContent className="w-64">
                        <ContextMenuItem onSelect={OnSelect} inset>
                            Remove
                            <ContextMenuShortcut>R</ContextMenuShortcut>
                        </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                  ))}
                  <DialogTrigger asChild>
                      <Button type="button" variant={"ghost"} onClick={e=>HandleNewTemplateButton()}><Icons.plus className="mr-2 h-4 w-5" />New Field Template</Button>
                  </DialogTrigger>
                </>
                }
            </div>
          </div>
                
          <DialogContent className="sm:max-w-[425px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                    <DialogTitle>{selectedIsNew ? 'Create Template' : 'Edit Template'}</DialogTitle>
                    <DialogDescription>
                        {selectedIsNew ? "Create a new redemption template. Label and content must be provided" : "Make changes to your redemption template here. Click save when you're done." }
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <>
                                    <FormItem className="space-y-2 grid grid-cols-4 items-center space-x-4">
                                        <FormLabel className="text-right">Username</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="col-span-3" />
                                        </FormControl>
                                        <FormMessage className="col-start-2 col-span-3" />
                                    </FormItem>
                                </>
                            )}
                        />
                    </div>
                    
                        <Button type="submit">Submit</Button>
                    <DialogFooter>
                        <DialogTrigger asChild>
                            <Button type="submit"> {selectedIsNew ? 'Create' : 'Save changes'}</Button>
                        </DialogTrigger>
                    </DialogFooter>
                    
                </form>
            </Form>
          </DialogContent>
        </Dialog>
    </>
    ;
}