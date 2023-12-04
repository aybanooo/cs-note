import { IEscalationTemplate } from "./escalationTemplate";

export type NoteContentInputType = "input" | "textarea";

export interface NoteContent {
    id:string,
    title:string,
    type:NoteContentInputType,
    value:string
}

export interface Note {
    guid: string,
    dynamicContent: NoteContent[],
    escalationTemplate: IEscalationTemplate | null
}

export interface NoteDynamicContent {
    id:string,
    title:string,
    type:NoteContentInputType,
    value:string
}



/*

{
        id: 'guid',
        label: "GUID",
        type:'text',
        tag: "INPUT"
    },
    {
        id: 'cust',
        label: "Account",
        type:'text',
        tag: "INPUT"
    },
    {
        id: 'order',
        label: "Order",
        type:'text',
        tag: "INPUT"
    },
    {
        id: 'issue',
        label: "Issue",
        type:'text',
        tag: "INPUT"
    },
    {
        id: 'notes',
        label: "notes",
        type:'text',
        tag: "TEXTAREA"
    },
    {
        id: 'redemp',
        label: "Redemption",
        type:'text',
        tag: "TEXTAREA",
        hidden: true,
        rows: 6
    }

*/