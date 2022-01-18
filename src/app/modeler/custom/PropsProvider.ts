declare function require(name: string);
var serviceTaskDelegateProps = require('bpmn-js-properties-panel/lib/provider/camunda/parts/ServiceTaskDelegateProps');

function createGeneralTabGroups(element: any, bpmnFactory: any, elementRegistry: any) {


    const generalGroup = {
        id: 'general',
        label: 'General',
        entries: new Array,
    };
    const detailsGroup = {
        id: 'details',
        label: 'Details',
        entries: new Array,
    };
    
    serviceTaskDelegateProps(detailsGroup, element, bpmnFactory, elementRegistry);
   
    const documentationGroup = {
        id: 'documentation',
        label: 'Documentation',
        entries: new Array,
    };
    return [
        generalGroup,
        detailsGroup,
        documentationGroup
    ];
}

export function CustomPropertiesProvider(eventBus: any, bpmnFactory: any, elementRegistry: any) {
    console.log("Heloo");

    this.getTabs = function (element: any) {

        const generalTab = {
            id: 'general',
            label: 'General',
            groups: createGeneralTabGroups(element, bpmnFactory, elementRegistry)
        };

        return [
            generalTab
        ];
    };
}
