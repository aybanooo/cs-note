import { Note, NoteContent } from "@/types/note"
import { EscalationTemplate } from "@/types/escalationTemplate";
import { debug } from "console";

import * as fsClient from '@/lib/firebase/clientApp'
import { StandardTemplateGroup } from "@/types/standardTemplateGroup";

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
    templates: prefix('templates'),
    standard_templates: prefix('standard_templates')
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


export function GetStandardTemplates():StandardTemplateGroup[] {
    let data = GetData<StandardTemplateGroup>(storageKeys.standard_templates)
    return data;
}

export type ExportableData = {
    notes: Note[],
    pending: Note[],
    setup:NoteContent[]
    templates:EscalationTemplate[],
    standard_templates:StandardTemplateGroup[],
}


export async function GetAllData() {
    if(fsClient.IsLoggedIn()) {

        let fireNotes = await fsClient.GetNotes();
        let firePendings = await fsClient.GetPendings();
        let fireSetups = await fsClient.GetSetups();
        let fireTemplates = await fsClient.GetTemplates();
        let fireStandardTemplates = await fsClient.GetStandardTemplates();

        let data:ExportableData = {
            notes: fireNotes,
            pending: firePendings,
            setup: fireSetups,
            templates: fireTemplates,
            standard_templates: fireStandardTemplates
        };
        return data;
    } else {
        let data:ExportableData = {
            notes: GetStoredNotes(),
            pending: GetPendings(),
            setup: GetSetups(),
            templates: GetRedemptionTemplates(),
            standard_templates: GetStandardTemplates()
        };
        return data;
    }
}

export function ImportData(data:ExportableData) {
    let s = (x:any) => JSON.stringify(x);
    if(fsClient.IsLoggedIn()) {
        fsClient.SaveNotes(data.notes);
        fsClient.SavePendings(data.pending);
        fsClient.SaveSetups(data.setup);
        fsClient.SaveTemplates(data.templates);
    } else {
        localStorage.setItem(storageKeys.notes, s(data.notes));
        localStorage.setItem(storageKeys.pending, s(data.pending));
        localStorage.setItem(storageKeys.setup, s(data.setup));
        localStorage.setItem(storageKeys.templates, s(data.templates));
    }
}