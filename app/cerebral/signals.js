//tnr: little webpack trick to require all the action files and add them to the 'a' object
var reqContext = require.context('./actions/', true, /^((?!test).)*$/);
var a = {};
reqContext.keys().forEach(function(key) {
    a[key.substring(2)] = reqContext(key)
});
//tnr: little webpack trick to require all the action chain files and add them to the 'c' object
var reqContext = require.context('./chains/', true, /^((?!test).)*$/);
var c = {};
reqContext.keys().forEach(function(key) {
    c[key.substring(2)] = reqContext(key)
});
import assign from 'lodash/object/assign'
var each = require('lodash/collection/each');


export default function(controller, options) {
    a = assign({}, a, options.actions) //override any actions here!
    var signals = {
        toggleAnnotationTable: [a.toggleSidebar],
        copySelection: [a.getData('selectionLayer', 'sequenceData'), a.copySelection, {
            success: a.setData('clipboardData'),
            error: [] //tnr: we should probably have some sort of generic info/warning message that we can display when things go wrong
        }],
        selectAll: [a.selectAll, a.setSelectionLayer],
        selectInverse: [a.selectInverse, a.setSelectionLayer],
        setCutsiteLabelSelection: [a.setCutsiteLabelSelection],
        toggleAnnotationDisplay: [a.toggleAnnotationDisplay],

        editorClicked: [
            a.checkBooleanState(['editorDrag', 'inProgress']), {
                success: [], //do nothing
                error: [a.getData('selectionLayer', 'sequenceLength', 'bpsPerRow', 'caretPosition'),
                    a.checkShiftHeld, {
                        shiftHeld: [a.checkLayerIsSelected, {
                            selected: [a.updateSelectionShiftClick, a.setSelectionLayer],
                            notSelected: [a.createSelectionShiftClick, {
                                updateSelection: [a.setSelectionLayer],
                                doNothing: []
                            }]
                        }],
                        shiftNotHeld: [a.clearSelectionLayer, a.updateOutput('nearestBP', 'caretPosition'), a.setCaretPosition],
                    }
                ]
            }
        ],
        featureClicked: c.selectAnnotation(a),
        orfClicked: c.selectAnnotation(a),
        caretMoved: [
            a.getData('selectionLayer', 'caretPosition', 'sequenceLength', 'bpsPerRow', {
                path: ['sequenceData', 'circular'],
                name: 'circular'
            }),

            a.moveCaret,
            a.handleCaretMoved, {
                caretMoved: [a.clearSelectionLayer, a.setCaretPosition],
                selectionUpdated: [a.setSelectionLayer],
            }
        ],
        editorDragged: [
            a.handleEditorDragged, {
                caretMoved: [a.clearSelectionLayer, a.setCaretPosition],
                selectionUpdated: [a.setSelectionLayer],
            }
        ],
        editorDragStarted: [
            a.handleEditorDragStarted
        ],
        editorDragStopped: [
            [function pause (input, tree, output) {
                //async function that doesn't do anything
                setTimeout(function () {
                    output()
                },0)
            }],
            a.handleEditorDragStopped
        ],
        resizeRowView: [
            a.resizeRowView
        ],
        resizeCircularView: [
            a.resizeCircularView
        ],
        searchSequence: [
            a.searchSequence,
            a.updateSearchLayers
        ],
        // edit only actions
        backspacePressed: a.addEditModeOnly([
            a.checkLayerIsSelected, {
                selected: [a.deleteSequence],
                notSelected: [a.prepDeleteOneBack, a.deleteSequence]
            }
        ]),      
        toggleSequenceCase: [
            a.toggleSequenceCase
        ],
        //tnr: NOT YET WORKING:
        //higher priority
        pasteSequenceString: [a.pasteSequenceString],
        setSelectionLayer: [a.setSelectionLayer],

        //lower priority
        addAnnotations: [a.addAnnotations],
        jumpToRow: [a.jumpToRow],
        sequenceDataInserted: a.addEditModeOnly([
            a.getData('selectionLayer', 'sequenceLength', 'sequenceData'),
            a.checkLayerIsSelected, {
                selected: [a.deleteSequence],
                notSelected: [a.getData('caretPosition')]
            },
            a.insertSequenceData,
            a.setData('caretPosition', 'sequenceData')
        ]),  
        //tnr: NOT YET WORKING:
        //higher priority
        // pasteSequenceString: [a.pasteSequenceString],
        // setSelectionLayer: [a.setSelectionLayer],

        // //lower priority
        // addAnnotations: [a.addAnnotations],
        // jumpToRow: [a.jumpToRow],
    }
    assign({}, signals, options.signals) //optionally override any signals here
    return (attachSignalsToController(signals, controller))
}

function attachSignalsToController(signalsObj, controller) {
    each(signalsObj, function(actionArray, signalName) {
        controller.signal(signalName, actionArray);
    })
}
