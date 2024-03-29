import { Note, NoteContent } from "@/types/note"
import { EscalationTemplate } from "@/types/escalationTemplate";
import { debug } from "console";

import fs from 'fs'

const storageKey = 'csnote-notes';
const storageKey_pending = 'csnote-pending';
const storageKey_setup = 'csnote-setup';
const storageKey_redemp = 'csnote-templates';

const c = 'csnote';
const prefix = (value:string) => c+'-'+value;
export const storageKeys = {
    notes: prefix('notes'),
    pending: prefix('pending'),
    setup: prefix('setup'),
    templates: prefix('templates')
};

function GetData<T>(key:string):T[] {
    let data = localStorage.getItem(key) as any;
    try {
        data = JSON.parse(data);
        if(data && Array.isArray(data))
            return data;
        else return []
    } catch {
        return []
    }
}

export function GetStoredNotes():Note[] {
    let data = GetData<Note>(storageKeys.notes)
    return data;
}

export function GetPendings():Note[] {
    let data = GetData<Note>(storageKeys.pending)
    return data;
}

export function GetSetups():NoteContent[] {
    let data = GetData<NoteContent>(storageKeys.setup)
    return data;
}

export function GetRedemptionTemplates():EscalationTemplate[] {
    let data = GetData<EscalationTemplate>(storageKeys.templates)
    return data;
}

export type ExportableData = {
    notes: Note[],
    pending: Note[],
    setup:NoteContent[]
    templates:EscalationTemplate[],
}


export function GetAllData() {
    let data:ExportableData = {
        notes: GetStoredNotes(),
        pending: GetPendings(),
        setup: GetSetups(),
        templates: GetRedemptionTemplates()
    };
    return data;
}

export function ImportData(data:ExportableData) {
    let s = (x:any) => JSON.stringify(x);
    localStorage.setItem(storageKeys.notes, s(data.notes));
    localStorage.setItem(storageKeys.pending, s(data.pending));
    localStorage.setItem(storageKeys.setup, s(data.setup));
    localStorage.setItem(storageKeys.templates, s(data.templates));
}