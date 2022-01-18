const SUITABILITY_SCORE_HIGH = 100,
      SUITABILITY_SCORE_AVERGE = 50,
      SUITABILITY_SCORE_LOW = 25;

export default class CustomPalette{
  constructor(bpmnFactory,bpmnjs, create, elementFactory, palette, translate) {
    this.bpmnFactory = bpmnFactory;
    this.bpmnjs = bpmnjs;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    

    palette.registerProvider(this);
  }


  getPaletteEntries(element) {
    const {
      bpmnFactory,
      bpmnjs,
      create,
      elementFactory,
      translate
    } = this;

    function createTask(suitabilityScore, name, id) {
      return function(event) {
        const businessObject = bpmnFactory.create('bpmn:ServiceTask');

        businessObject.suitable = suitabilityScore;

        const serviceTask = elementFactory.createShape({
          type: 'bpmn:ServiceTask',
          businessObject: businessObject
        });

        var urlInputParameter = bpmnFactory.create('camunda:InputParameter', {
          name: 'url',
          value: 'http://localhost:8085/sample'
        });

        var methodInputParameter = bpmnFactory.create('camunda:InputParameter', {
          // type: 'string',
          name: 'method',
          value: 'POST'
        });

        var contentTypeInputParameter = bpmnFactory.create('camunda:InputParameter', {
          // type: 'string',
          name: 'Content-Type',
          value: 'application/json'
        });  
         var payloadInputParameter = bpmnFactory.create('camunda:InputParameter', {
          // type: 'string',
          name: 'payload',
          value: "lllll"
        }); 

         var responseOutPutParameter = bpmnFactory.create('camunda:OutputParameter', {
          // type: 'string',
          name: 'responseName',
          value: "${response}"
        }); 

        var inputOutput = bpmnFactory.create('camunda:InputOutput', {
          inputParameters: [urlInputParameter, methodInputParameter, contentTypeInputParameter,
                            payloadInputParameter],
          outputParameters: [responseOutPutParameter]
        });

        const connector = bpmnFactory.create('camunda:Connector',{
          connectorId: 'http-connector', inputOutput
        });

        var extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
          values: [connector]
        });
        serviceTask.businessObject.set("extensionElements", extensionElements);
        serviceTask.businessObject.name=name;
        serviceTask.businessObject.id=id;
        create.start(event, serviceTask);
      };
    }

    function createUserTask(suitabilityScore, name, id) {
      return function(event) {
        const businessObject = bpmnFactory.create('bpmn:UserTask');

        businessObject.suitable = suitabilityScore;

        const userTask = elementFactory.createShape({
          type: 'bpmn:UserTask',
          businessObject: businessObject
        });

         
        userTask.businessObject.assignee='${Test Assignee}';
        userTask.businessObject.candidateUsers='${Test candidate Users}';
        userTask.businessObject.candidateGroups='${Test Candidate Groups}';
        userTask.businessObject.name=name;
        userTask.businessObject.id=id;
        create.start(event, userTask);
      };
    }

    function serviceTaskConfiguration(businessObject, name, delegateExpression) {
      businessObject.name = name;
      businessObject.delegateExpression = delegateExpression;
      businessObject.asyncBefore = true;
      return businessObject;
    }

    function createConnection(sourceShape, targetShape, waypoints) {
      return elementFactory.createConnection({type: 'bpmn:SequenceFlow', 
        source: sourceShape, 
        target: targetShape, 
        waypoints: waypoints
      });
    }
    function createTaskCollection() {
      return function(event) {
        // extension element for the retry time cycle
      var failedJobRetryTmeCycle = bpmnFactory.create('camunda:FailedJobRetryTimeCycle', {
        body: 'R3/PT10S'
      });
        
      var r3pt10sExtensionElement = bpmnFactory.create('bpmn:ExtensionElements', {
        values: [ failedJobRetryTmeCycle ]
      });

      const invokeMyServicetaskShape = elementFactory.createShape({ type: 'bpmn:ServiceTask', x:0, y:0 });
      serviceTaskConfiguration(invokeMyServicetaskShape.businessObject, 'Invoke my service', '${logger}');
      invokeMyServicetaskShape.businessObject.extensionElements = r3pt10sExtensionElement;
      //console.log('the task', helloServicetaskShape);

      const exclusiveGatewayShape = elementFactory.createShape({type:'bpmn:ExclusiveGateway', x:150, y:15 });
      exclusiveGatewayShape.businessObject.name = 'continue?';

      const nextThingServiceTaskShape = elementFactory.createShape({ type: 'bpmn:ServiceTask', x:250, y:0 });
      serviceTaskConfiguration(nextThingServiceTaskShape.businessObject, 'Invoke the next service', '${logger}');
      nextThingServiceTaskShape.businessObject.extensionElements = r3pt10sExtensionElement;

      const otherThingServiceTaskShape = elementFactory.createShape({ type: 'bpmn:ServiceTask', x:250, y:130 });
      serviceTaskConfiguration(otherThingServiceTaskShape.businessObject, 'Do something else', '${logger}');
      otherThingServiceTaskShape.businessObject.extensionElements = r3pt10sExtensionElement;

      const correctItServiceTaskShape = elementFactory.createShape({ type: 'bpmn:ServiceTask', x:120, y:210 });
      serviceTaskConfiguration(correctItServiceTaskShape.businessObject, 'Correct the error', '${logger}');
      correctItServiceTaskShape.businessObject.extensionElements = r3pt10sExtensionElement;
      
      var definitions = bpmnjs.getDefinitions();
      var error = bpmnFactory.create('bpmn:Error', {errorCode: 'abc', name: 'myErrorName'});
      definitions.get('rootElements').push(error);
      
      // error event definition
      var erroreventDefinition = bpmnFactory.create('bpmn:ErrorEventDefinition', {
        errorCodeVariable: 'errorCode',
        errorMessageVariable: 'errorMessage',
        errorRef: error
      });
      //console.log('errorEventDefinition:', erroreventDefinition);
      
      // attached boundary error event
      const erroreventShape = elementFactory.createShape({ type: 'bpmn:BoundaryEvent', x:50, y:62 });
      erroreventShape.businessObject.name = 'hallo error';
      erroreventShape.businessObject.attachedToRef = invokeMyServicetaskShape.businessObject;
      erroreventShape.businessObject.eventDefinitions = [erroreventDefinition];
      erroreventShape.host = invokeMyServicetaskShape;
      //console.log('the event', erroreventShape);

      erroreventDefinition.$parent = erroreventShape.businessObject;

      const sequenceFlowMyServiceExclusive = 
        createConnection(invokeMyServicetaskShape, exclusiveGatewayShape, [{x:100, y:40}, {x:150, y:40}]);
      
      // need a FormularExpression
      const sequenceFlowExclusiveNext = 
        createConnection(exclusiveGatewayShape, nextThingServiceTaskShape, [{x:200, y:40}, {x:250, y:40}]);
      sequenceFlowExclusiveNext.businessObject.name = 'yes';
      sequenceFlowExclusiveNext.businessObject.conditionExpression = 
        bpmnFactory.create('bpmn:FormalExpression', {body: '${continue}'});
      //console.log('conditional sequence flow: ', sequenceFlowExclusiveNext);

      const sequenceFlowExclusiveOther = 
        createConnection(exclusiveGatewayShape, otherThingServiceTaskShape, [{x:175, y:60}, {x:175, y:170}, {x:250, y:170}]);
      sequenceFlowExclusiveOther.businessObject.name = 'no';
      sequenceFlowExclusiveOther.businessObject.conditionExpression = 
        bpmnFactory.create('bpmn:FormalExpression', {body: '${not continue}'});

      const sequenceFlowErrorCorrect = 
        createConnection(erroreventShape, correctItServiceTaskShape, [{x:68, y:98}, {x:68, y:250}, {x:120, y:250}]);

      const sequenceFlowCorrectHello = 
        createConnection(correctItServiceTaskShape, invokeMyServicetaskShape, 
          [{x:220, y:250}, {x:250, y:250}, {x:250, y: 320}, {x:-30, y:320}, {x:-30, y:50}, {x:0, y:50}]);

      create.start(event, [
        invokeMyServicetaskShape, 
        erroreventShape, 
        exclusiveGatewayShape, 
        nextThingServiceTaskShape, 
        otherThingServiceTaskShape,
        correctItServiceTaskShape,
        sequenceFlowMyServiceExclusive,
        sequenceFlowExclusiveNext,
        sequenceFlowExclusiveOther,
        sequenceFlowErrorCorrect,
        sequenceFlowCorrectHello
      ]);
    };
  }

    return {
      'create.low-task': {
        group: 'activity',
        className: 'bpmn-icon-send',
        title: translate('Mail Task'),
        action: {
          dragstart: createTask(SUITABILITY_SCORE_LOW, "Mail Task", "mailTask"),
          click: createTask(SUITABILITY_SCORE_LOW, "Mail Task", "mailTask")
        }
      },
      'create.average-task': {
        group: 'activity',
        className: 'bpmn-icon-user',
        title: translate('User Task'),
        action: {
          dragstart: createUserTask(SUITABILITY_SCORE_AVERGE, "User Task", "userTask"),
          click: createUserTask(SUITABILITY_SCORE_AVERGE, "User Task", "userTask")
        }
      },
      'create.high-task': {
        group: 'activity',
        className: 'bpmn-icon-service-task',
        title: translate('User Task'),
        action: {
          dragstart: createTaskCollection(),
          click: createTaskCollection()
        }
      }
    };
  }
}

CustomPalette.$inject = [
  'bpmnFactory',
  "bpmnjs",
  'create',
  'elementFactory',
  'palette',
  'translate'
];