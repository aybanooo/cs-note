export interface IEscalationTemplate {
    guid: string,
    label: string,
    value: string
}

export class EscalationTemplate implements IEscalationTemplate {
    constructor(public guid:string, public label: string, public value:string) { }
}