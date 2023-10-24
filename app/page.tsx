'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';


import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button, buttonVariants } from "@/components/ui/button"

import NoteCard from '@/components/NoteCard'
import { Note, NoteContent } from "@/types/note"
import { Icons } from '@/components/icons' 
import { CornerLeftDownIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { debounce } from 'lodash';
import { IEscalationTemplate, EscalationTemplate } from '@/types/escalationTemplate';

import { storageKeys , GetPendings, GetRedemptionTemplates, GetSetups, GetStoredNotes } from '@/lib/data';


const storageKey = storageKeys.notes;
const storageKey_pending = storageKeys.pending;
const storageKey_setup = storageKeys.setup;

export default function IndexPage() {

  const [notes, setNotes] = useState<Note[]>([])
  const [pending, setPending] = useState<Note[]>([])
  const [dynamicContent, setDynamicContent] = useState<NoteContent[]>([]);
  const [templates, setTemplate] = useState<EscalationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [hasEmpty, setHasEmpty] = useState<boolean>(false)
  const [emptyCount, setEmptyCount] = useState<number>(0)
  
  useEffect(() => {
    setNotes(GetStoredNotes())
    setTemplate(GetRedemptionTemplates())
    setPending(GetPendings())
    setDynamicContent(GetSetups())
    setLoading(false);
  }, [])

  useEffect(() => {
    if(!dynamicContent.length) return;
    setNotes(curr => {
      let d = [...curr];
      d.forEach(note => {
        dynamicContent.forEach(content=> {
          let prev = note.dynamicContent.find(oldContent=>content.id === oldContent.id);
          if(!prev) {
            note.dynamicContent.push(Object.assign({},content));
          }
        });
      });
      return d;
    });
  }, [dynamicContent])

  useEffect(() => {
    if(loading) return;
    PersistTemplates();
  }, [notes, pending])

  const PersistTemplates = debounce(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
    localStorage.setItem(storageKey_pending, JSON.stringify(pending));
  }, 400);

  useEffect(() => {
    let hasEmpty = notes.some(IsEmpty);
    setHasEmpty(hasEmpty);
    
    let count = notes.filter(IsEmpty).length
    setEmptyCount(count)
  }, [notes])


  function IsEmpty(note :Note) {
    let ids = dynamicContent.map(x=>x.id);
    let hasRedemption = note.escalationTemplate;
    console.log(hasRedemption, "escal template");
    return !note.dynamicContent.filter(x=>ids.includes(x.id)).some(x=>x.value) && !hasRedemption;
  }

  function OnUpdateData(note: Note, key: string, value: string) {
      setNotes( curr => {
        let d = [...curr];
        let target = d.find(x => x == note);
        let id = key;
        let targetContent = target?.dynamicContent.find(x=>x.id == id);
        if(!targetContent) return [...d];
        targetContent.value = value;
        return d;
      });
  }
  
  function OnUpdateEscalation(note: Note, value: string) {
    let targetTemplate = templates.find(x=>x.guid == value);
    if(targetTemplate==null) return;
    setNotes( curr => {
      let d = [...curr];
      let target = d.find(x => x == note);
      console.log(">", targetTemplate);
      if(!target || !targetTemplate) return d;
      target.escalationTemplate = targetTemplate;
      return d;
    });
  }

  function OnUpdateEscalationValue(note:Note, value:string) {
    setNotes( curr => {
      let d = [...curr];
      let target = d.find(x => x == note);
      if(!target || !target.escalationTemplate) return d;
      target.escalationTemplate.value = value;
      return d;
    });
  }


  function OnRemoveNote(note: Note) {
    setNotes(curr => {
      let target = curr.findIndex(n => n == note);
      if(target == -1) return [...curr];
      curr.splice(target, 1);
      return [...curr];
    });
  }

  function AddNewNote() {
    setNotes(curr => {
      let newNote: Note = {
        guid: uuidv4(),
        dynamicContent: [],
      };
      dynamicContent.forEach(x=> {
        newNote.dynamicContent.push(Object.assign({},x) );
      });
      return [...curr, newNote]
    })
  }

  function RemoveEmpty() {

    setNotes(curr => {
      let target = [...curr].reverse().findIndex(IsEmpty);
      if(target == -1) return [...curr];
      curr.splice(target, 1);
      return [...curr];
    });
  }

  function OnClearNote(note:Note) {
    setNotes(curr => {
      let target = curr.findIndex(x=>x.guid === note.guid);
      if(target == -1) return [...curr];
      curr[target].dynamicContent.forEach(d => d.value = "");
      curr[target].escalationTemplate = undefined;
      return [...curr];
    });
  }

  function MoveToPending(note: Note) {
    setPending(curr => {
      return [Object.assign({},note),...curr];
    });
    OnRemoveNote(note);
  }

  function GetPending() {
    if(pending.length == 0) return;
    const pendingNote = [...pending].shift() as Note;
    setNotes(curr => {
      return [pendingNote, ...curr];
    })
    setPending( curr => {
      let d = [...curr];
      d = d.filter(x=>x.guid != pendingNote.guid);
      return d;
    })
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className='flex justify-center'>
        <div className='flex flex-col space-y-3 w-full md:w-4/5 lg:w-1/2'>
          <div className='flex space-x-3'>
            <Button className='grow' disabled={!hasEmpty} onClick={RemoveEmpty} variant={'destructive'}><Icons.minus className="mr-2 h-4 w-5" />Remove Empty ({emptyCount} note{notes.length>1 ? 's' : ''})</Button>
            <Button className='grow' onClick={AddNewNote} variant={'secondary'}><Icons.plus className="mr-2 h-4 w-5" />Add New Note ({notes.length} note{notes.length>1 ? 's' : ''})</Button>
            <Button disabled={pending.length == 0} variant={'secondary'} className='text-amber-400' onClick={GetPending}>
              <Icons.pending className="mr-2 h4 w-5"/>
              <span className=''>
                {pending.length}
              </span>
            </Button>
          </div>
          {
            notes.map(data => <NoteCard key={data.guid} 
              note={data} 
              OnClearNote={OnClearNote}
              OnUpdateData={OnUpdateData} OnRemoveNote={OnRemoveNote} 
              OnMoveToPending={MoveToPending} OnUpdateEscalation={OnUpdateEscalation} OnUpdateEscalationValue={OnUpdateEscalationValue}
              noteDynamicContent={dynamicContent}
              templates={templates}
              ></NoteCard>)
          }
        </div>
      </div>
    </section>
  )
}
