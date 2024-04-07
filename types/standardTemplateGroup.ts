export type StandardTemplateGroup = {
    guid: string
    groupName: string
    templates:  StandardTemplate[]
}

export type StandardTemplate = {
    guid: string
    label: string
    value: string
}