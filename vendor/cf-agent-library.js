/* eslint-disable */

/*! cf-agent-library - v2.0.0 - 2017-12-05 - Connect First */
/**
 * @fileOverview Exposed functionality for Connect First AgentUI.
 * @author <a href="mailto:dlbooks@connectfirst.com">Danielle Lamb-Books </a>
 * @version 0.0.1
 * @namespace AgentLibrary
 */
;(function (global) {
  var AddSessionNotification = function() {
  };
  /*
     * This class is responsible for handling "ADD-SESSION" packets from IntelliQueue.  This is used by
     * the CallControlForm. Then it will increment the total_calls count.
     *
     * {
     *   "ui_notification": {
     *       "@message_id": "IQ982008082918151403727",
     *       "@response_to": "",
     *       "@type": "ADD-SESSION",
     *       "session_id": { "#text": "2" },
     *       "uii": { "#text": "200808291814560000000900016558" },
     *       "phone": { "#text": "200808291814370000000900016555" },
     *       "session_type": { "#text": "AGENT" },
     *       "session_label": { "#text": "Primary Agents Call Session" },
     *       "allow_control": { "#text": "TRUE" },
     *       "monitoring": { "#text": "FALSE" },
     *       "agent_id": { "#text": "1856" }
     *   }
     *  }
     */
  AddSessionNotification.prototype.processResponse = function(notification) {
    var formattedResponse = utils.buildDefaultResponse(notification);
    var model = UIModel.getInstance();
    var notif = notification.ui_notification;
    var sessionAgentId = utils.getText(notif, "agent_id");
    if(utils.getText(notif, "session_type") === "AGENT"){
      model.incrementTotalCalls();
    }
    if(sessionAgentId === model.agentSettings.agentId){
      // add the session_id of this leg to the current call packet -
      // this way we can use it for hangups later.
      model.currentCall.sessionId = utils.getText(notif, "session_id");
    }else if(sessionAgentId != ""){
      // this is a monitoring session, lets save the monitored agent id for barge-ins
      model.currentCall.monitorAgentId = sessionAgentId;
    }
    // Check to see if we have a transfer leg here, if so, register it
    if(utils.getText(notif, "session_type") === 'OUTBOUND' && sessionAgentId === "" && utils.getText(notif, "allow_control") === true){
      model.transferSessions[utils.getText(notif, "session_id")] = {sessionId:utils.getText(notif, "session_id"),destination:utils.getText(notif, "phone"),uii:utils.getText(notif, "uii")};
    }
    // if agent session, set on call status
    if(notif.session_id === '2'){
      model.agentSettings.onCall = true;
    }
    formattedResponse.status = "OK";
    formattedResponse.message = "Received ADD-SESSION notification";
    formattedResponse.sessionId = utils.getText(notif, "session_id");
    formattedResponse.uii = utils.getText(notif, "uii");
    formattedResponse.phone = utils.getText(notif, "phone");
    formattedResponse.sessionType = utils.getText(notif, "session_type");
    formattedResponse.sessionLabel = utils.getText(notif, "session_label");
    formattedResponse.allowControl = utils.getText(notif, "allow_control");
    formattedResponse.monitoring = utils.getText(notif, "monitoring");
    formattedResponse.agentId = utils.getText(notif, "agent_id");
    formattedResponse.transferSessions = model.transferSessions;
    return formattedResponse;
  };
  var DialGroupChangeNotification = function() {
  };
  /*
     * This class is responsible for handling a DIAL_GROUP_CHANGE notification.
     * This event is sent from IQ when an agent's dial group is changed in through the AdminUI.
     *
     *   {
     *       "ui_notification": {
     *           "@message_id": "IQ10012016080413085500263",
     *           "@type": "DIAL_GROUP_CHANGE",
     *           "agent_id": { "#text": "1180958" },
     *           "dial_group_id": { "#text": "50354" },
     *           "dialGroupName": { "#text": "Preview Dial Mode" },
     *           "dial_group_desc": {}
     *       }
     *   }
     */
  DialGroupChangeNotification.prototype.processResponse = function(notification) {
    //Modify configRequest with new DialGroupId
    var model = UIModel.getInstance();
    var notif = notification.ui_notification;
    var origLoginType = model.configRequest.loginType;
    var newDgId = utils.getText(notif, "dial_group_id");
    model.dialGroupChangeNotification = notification;
    // Calculate type of login - called from AdminUI when assigning agent to new dial group.
    // Only options should be BLENDED or OUTBOUND here.
    if(newDgId && newDgId !== "" && (origLoginType === "INBOUND" || origLoginType === "BLENDED") ){
      model.configRequest.loginType = "BLENDED";
    }else if (newDgId && newDgId !== ""){
      model.configRequest.loginType = "OUTBOUND";
    }else if (origLoginType  === "INBOUND"){
      model.configRequest.loginType = "INBOUND";
    }else{
      model.configRequest.loginType = "NO-SELECTION";
    }
    UIModel.getInstance().configRequest.dialGroupId = newDgId;
    var formattedResponse = {
      message: "Dial Group Updated Successfully.",
      detail: "Dial Group changed to [" + newDgId + "].",
      dialGroupId: utils.getText(notif, "dial_group_id"),
      dialGroupName: utils.getText(notif, "dialGroupName"), // camel case from server for some reason :/
      dialGroupDesc: utils.getText(notif, "dial_group_desc"),
      agentId: utils.getText(notif, "agent_id")
    };
    return formattedResponse;
  };
  var DialGroupChangePendingNotification = function() {
  };
  /*
     * This class is responsible for handling a DIAL_GROUP_CHANGE_PENDING notification.
     * This event is sent from IQ when an agent's dial group is changed and the agent is on a call.
     *
     * {
     *     "ui_notification": {
     *         "@message_id": "IQ10012016080515294800318",
     *         "@type": "DIAL_GROUP_CHANGE_PENDING",
     *         "agent_id": { "#text": "1180958" },
     *         "dial_group_id": { "#text": "50354" },
     *         "update_from_adminui": { "#text": "TRUE" }
     *     }
     * }
     */
  DialGroupChangePendingNotification.prototype.processResponse = function(notification) {
    var model = UIModel.getInstance();
    var notif = notification.ui_notification;
    model.agentSettings.pendingDialGroupChange = parseInt(utils.getText(notif, "dial_group_id"), 10);
    // check if request originated with AdminUI
    if(notif.update_from_adminui){
      model.agentSettings.updateDGFromAdminUI = utils.getText(notif, "update_from_adminui") === true;
    }else{
      model.agentSettings.updateDGFromAdminUI = false;
    }
    var formattedResponse = {
      message: "Dial Group Change Pending notification received.",
      detail: "DialGroup switch for existing session pending until active call ends.",
      agentId: utils.getText(notif, "agent_id"),
      dialGroupId: utils.getText(notif, "dial_group_id"),
      updateFromAdminUI: utils.getText(notif, "update_from_adminui")
    };
    return formattedResponse;
  };
  var DropSessionNotification = function() {
  };
  /*
     * This class handles the DROP-SESSION packet from IQ. It doesn't really do anything
     * besides format a response for the callback notification since there isn't any action needed.
     *
     *  {
     *      "ui_notification": {
     *          "@message_id":"IQ10012016081613222800341",
     *          "@response_to":"",
     *          "@type":"DROP-SESSION",
     *          "session_id":{"#text":"3"},
     *          "uii":{"#text":"201608161322180139000000000124"}
     *      }
     *  }
     */
  DropSessionNotification.prototype.processResponse = function(notification) {
    var formattedResponse = utils.buildDefaultResponse(notification);
    var notif = notification.ui_notification;
    var sessionId = utils.getText(notif, "session_id");
    var transfer = UIModel.getInstance().transferSessions[sessionId];
    // Check to see if we just disconnected a transfer session
    // If so, we need to remove the session from our map
    if(transfer){
      utils.logMessage(LOG_LEVELS.DEBUG, "Transfer to " + transfer.destination + " has terminated", "");
      delete UIModel.getInstance().transferSessions[sessionId];
      formattedResponse.transferEnd = transfer;
    }
    formattedResponse.message = "Received DROP-SESSION Notification";
    formattedResponse.status = "OK";
    formattedResponse.sessionId = utils.getText(notif, "session_id");
    formattedResponse.uii = utils.getText(notif, "uii");
    return formattedResponse;
  };
  var EarlyUiiNotification = function() {
  };
  /*
     * This class is responsible for handling "EARLY_UII" packets from IntelliQueue.
     * For manual outdials, this gives the uii to cancel a ringing line.
     *
     *  {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016081611595000289",
     *          "@type":"EARLY_UII",
     *          "agent_id":{"#text":"1180958"},
     *          "uii":{"#text":"201608161200240139000000000120"}
     *      }
     *  }
     */
  EarlyUiiNotification.prototype.processResponse = function(notification) {
    var formattedResponse = utils.buildDefaultResponse(notification);
    var notif = notification.ui_notification;
    formattedResponse.message = "Received EARLY_UII notification";
    formattedResponse.status = "OK";
    formattedResponse.agentId = utils.getText(notif, "agent_id");
    formattedResponse.uii = utils.getText(notif, "uii");
    return formattedResponse;
  };
  var EndCallNotification = function(libInstance) {
    this.libInstance = libInstance;
  };
  /*
     * This class is responsible for handling an END-CALL notification.
     * Save the packet in the UIModel by appending it to the currentCall packet.
     * Update the CallState field in the UIModel to "CALL-ENDED"
     *
     * {
     *  "ui_notification":{
     *      "@message_id":"IQ982008082910362203349",
     *      "@response_to":"",
     *      "@type":"END-CALL",
     *      "agent_id":{"#text":"1856"},
     *      "uii":{"#text":"200808291035510000000900029412"},
     *      "session_id":{"#text":"2"},
     *      "call_dts":{"#text":"2008-08-29 10:36:04"},
     *      "call_duration":{"#text":"16"},
     *      "term_party":{"#text":"CALLER"},
     *      "term_reason":{},
     *      "recording_url":{},
     *      "disposition_timeout:{"#text":"60"}
     *  }
     * }
     */
  EndCallNotification.prototype.processResponse = function(notification) {
    var model = UIModel.getInstance();
    var notif = notification.ui_notification;
    model.endCallNotification = notification;
    // add callDuration, termParty, and termReason to the current call packet
    model.currentCall.duration = utils.getText(notif, "call_duration");
    model.currentCall.termParty = utils.getText(notif, "term_party");
    model.currentCall.termReason = utils.getText(notif, "term_reason");
    // set call state to "CALL-ENDED"
    model.agentSettings.callState = "CALL-ENDED";
    model.agentSettings.onCall = false;
    model.agentSettings.onManualOutdial = false;
    // Clear out any transfer sessions from the previous call
    model.transferSessions = {};
    // Check if there is a pending dial group change
    if(model.agentSettings.pendingDialGroupChange > 0 || model.agentSettings.pendingDialGroupChange == -1) {
      // update dial group id
      model.configRequest.dialGroupId = model.agentSettings.pendingDialGroupChange;
      // send login update request
      this.libInstance.configureAgent(model.configRequest.queueIds, model.configRequest.chatIds, model.configRequest.skillProfileId, model.configRequest.dialGroupId, model.configRequest.dialDest, model.agentSettings.updateDGFromAdminUI);
      // reset pending dial group variables
      model.agentSettings.pendingDialGroupChange = 0;
      model.agentSettings.updateDGFromAdminUI = false;
    }
    var formattedResponse = {
      message: "End Call Notification Received.",
      detail: "",
      uii: utils.getText(notif, "uii"),
      sessionId: utils.getText(notif, "session_id"),
      agentId: utils.getText(notif, "agent_id"),
      callDts: utils.getText(notif, "call_dts"),
      duration: model.currentCall.duration,
      termParty: model.currentCall.termParty,
      termReason: model.currentCall.termReason,
      recordingUrl: utils.getText(notif, "recording_url"),
      dispositionTimeout: utils.getText(notif, "disposition_timeout")
    };
    return formattedResponse;
  };
  var GatesChangeNotification = function() {
  };
  /*
     * This class is responsible for handling a gates change notification
     *
     * {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016080817344100936",
     *          "@type":"GATES_CHANGE",
     *          "agent_id":{"#text":"1180958"},
     *          "gate_ids":{"#text":"11117,3"}
     *      }
     * }
     */
  GatesChangeNotification.prototype.processResponse = function(notification) {
    var model = UIModel.getInstance();
    var notif = notification.ui_notification;
    var newAssignedGates = [];
    var availableQueues = model.inboundSettings.availableQueues;
    var assignedGateIds = utils.getText(notif, "gate_ids");
    if(assignedGateIds !== ""){
      assignedGateIds = assignedGateIds.split(',');
    }
    for(var a = 0; a < assignedGateIds.length; a++){
      // find gate in avail list
      var id = assignedGateIds[a];
      var foundGate = utils.findObjById(availableQueues, id, "gateId");
      if(foundGate){
        newAssignedGates.push(foundGate);
      }else{
        // gate not in assigned list, add stub
        var gate = {
          gateId: id,
          gateName:"",
          gateDesc:"",
          defaultDestOverride:"",
          isAgentSelectable:false
        };
        newAssignedGates.push(gate);
      }
    }
    model.inboundSettings.queues = JSON.parse(JSON.stringify(newAssignedGates));
    var formattedResponse = {
      agentId: utils.getText(notif, "agent_id"),
      message: "Gates Change notification received.",
      queues: newAssignedGates
    };
    return formattedResponse;
  };
  var GenericNotification = function() {
  };
  /*
     * This class is responsible for handling a generic notification
     *
     * {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016080317400400011",
     *          "@response_to":"1c2fe39f-a31e-aff8-8d23-92a61c88270f",
     *          "@type":"GENERIC",
     *          "message_code":{"#text":"0"},
     *          "message":{"#text":"OK"},
     *          "detail":{"#text":"Pending Callback Successfully Cancelled."}
     *      }
     * }
     */
  GenericNotification.prototype.processResponse = function(notification) {
    var formattedResponse = utils.buildDefaultResponse(notification);
    // add message and detail if present
    formattedResponse.messageCode = utils.getText(notification.ui_notification,"message_code");
    return formattedResponse;
  };
  var NewCallNotification = function() {
  };
  /*
     * This class processes a "NEW-CALL" packet received from Intelliqueue. It will determine
     * if the call is a regular or monitoring call:
     * 		@Monitoring==true:  set state to ACTIVE-MONITORING, send NewMonitoringCall event
     * 		@Monitoring==false: set state to ACTIVE, send newcall packet and increment total calls
     *
     *  {"ui_notification":{
     *      "@message_id":"IQ982010020911335300027",
     *      "@response_to":"",
     *      "@type":"NEW-CALL",
     *      "uii":{"#text":"201002091133350139990000000010"},
     *      "ani":{"#text":"9548298548"},
     *      "dnis":{},
     *      "dial_dest":{"#text":"sip:+16789050673@sip.connectfirst.com"},
     *      "call_type":{"#text":"OUTBOUND"},
     *      "queue_dts":{"#text":"2010-02-09 11:33:53"},
     *      "queue_time":{"#text":"-1"},
     *      "agent_id":{"#text":"657"},
     *      "app_url":{},
     *      "is_monitoring":{"#text":"FALSE"},
     *      "script_id":{},
     *      "script_version":{},
     *      "survey_id":{},
     *      "survey_pop_type":{"#text":"SUPPRESS"},
     *      "message":{},
     *      "agent_recording":{"@default":"ON","@pause":"10","#text":"TRUE"},
     *      "gate":{
     *          "@number":"17038",
     *          "name":{"#text":"AM Campaign"},
     *          "description":{}
     *      },
     *      "outdial_dispositions":{
     *          "@type":"CAMPAIGN|GATE",
     *          "disposition":[
     *              { "@contact_forwarding":"FALSE", "@disposition_id":"20556", "#text":"Not Available"},
     *              { "@contact_forwarding":"FALSE", "@disposition_id":"20559", "#text":"Transfer Not Available"}
     *          ]
     *      },
     *      "requeue_shortcuts":{
     *          "requeue_shortcut":[
     *              { "@gate_id":"2", "@name":"test queue" "@skill_id":""}
     *          ]
     *      },
     *      "baggage":{
     *          "@allow_updates":"TRUE",
     *          "@show_lead_passes":"TRUE",
     *          "@show_list_name":"TRUE",
     *          "aux_phone":{},
     *          "aux_greeting":{},
     *          "aux_external_url":{},
     *          "aux_data1":{"#text":"BMAK"},
     *          "aux_data2":{"#text":"BMAK-041653-934"},
     *          "aux_data3":{"#text":"Call Ctr 1"},
     *          "aux_data4":{},
     *          "aux_data5":{},
     *          "extern_id":{"#text":"9548298548"},
     *          "lead_id":{"#text":"64306"},
     *          "lead_passes":{"#text":"1"},
     *          "first_name":{"#text":"Ryant"},
     *          "last_name":{"#text":"Taylor"},
     *          "mid_name":{},
     *          "address1":{"#text":"8010 Maryland Ave"},
     *          "address2":{},
     *          "city":{"#text":"Cleveland"},
     *          "state":{"#text":"OH"},
     *          "zip":{"#text":"44105"},
     *          "custom_labels":{
     *              "aux_1_label":{},
     *              "aux_2_label":{},
     *              "aux_3_label":{},
     *              "aux_4_label":{},
     *              "aux_5_label":{}
     *          }
     *      },
     *      "survey_response":{
     *          "@response_id":"24",
     *          "@survey_id":"1775",
     *          "details":{
     *              "detail":[
     *                  {"@element_id":"9001","@option_id":"0","#text":"Box 1"},
     *                  {"@element_id":"9002","@option_id":"0","#text":"Area 1"},
     *                  {"@element_id":"9003","@option_id":"6439"},
     *                  {"@element_id":"9004","@option_id":"6443"},
     *                  {"@element_id":"9004","@option_id":"6444"},
     *                  {"@element_id":"9005","@option_id":"6447"},
     *                  {"@element_id":"9006","@option_id":"0","#text":"11/20/2013"},
     *                  {"@element_id":"9015","@option_id":"0","#text":"Box 2"},
     *                  {"@element_id":"9016","@option_id":"0","#text":"Area 2"},
     *                  {"@element_id":"9017","@option_id":"6466"},
     *                  {"@element_id":"9018","@option_id":"6471"},
     *                  {"@element_id":"9018","@option_id":"6472"},
     *                  {"@element_id":"9019","@option_id":"6477"},
     *                  {"@element_id":"9020","@option_id":"0","#text":"11/21/2013"}
     *             ]
     *          }
     *      }
     *    }
     *  }
     */
  NewCallNotification.prototype.processResponse = function(notification) {
    var model = UIModel.getInstance();
    var notif = notification.ui_notification;
    // set up new call obj
    var newCall = {
      uii: utils.getText(notif,'uii'),
      agentId: utils.getText(notif,'agent_id'),
      dialDest: utils.getText(notif,'dial_dest'),
      queueDts: utils.getText(notif,'queue_dts'),
      queueTime: utils.getText(notif,'queue_time'),
      ani: utils.getText(notif,'ani'),
      dnis: utils.getText(notif,'dnis'),
      callType: utils.getText(notif,'call_type'),
      appUrl: utils.getText(notif,'app_url'),
      isMonitoring: utils.getText(notif,'is_monitoring'),
      allowHold: utils.getText(notif,'allow_hold'),
      allowTransfer: utils.getText(notif,'allow_transfer'),
      allowHangup: utils.getText(notif,'allow_hangup'),
      allowRequeue: utils.getText(notif,'allow_requeue'),
      allowEndCallForEveryone: utils.getText(notif,'allow_endcallforeveryone'),
      scriptId: utils.getText(notif,'script_id'),
      scriptVersion: utils.getText(notif,'script_version'),
      surveyId: utils.getText(notif,'survey_id'),
      surveyPopType: utils.getText(notif,'survey_pop_type'),
      requeueType: utils.getText(notif,'requeue_type')
    };
    // set collection values
    newCall.queue = utils.processResponseCollection(notification, 'ui_notification', 'gate')[0];
    newCall.agentRecording = utils.processResponseCollection(notification, 'ui_notification', 'agent_recording', 'agentRecording')[0];
    newCall.outdialDispositions = utils.processResponseCollection(notification, 'ui_notification', 'outdial_dispositions', 'disposition')[0];
    newCall.requeueShortcuts = utils.processResponseCollection(notification, 'ui_notification', 'requeue_shortcuts', 'requeueShortcut')[0];
    newCall.baggage = utils.processResponseCollection(notification, 'ui_notification', 'baggage')[0];
    newCall.surveyResponse = utils.processResponseCollection(notification, 'ui_notification', 'survey_response', 'detail')[0];
    newCall.scriptResponse = {};
    newCall.transferPhoneBook = utils.processResponseCollection(notification, 'ui_notification', 'transfer_phone_book')[0];
    // set saved script response if present
    try{
      var savedModel = JSON.parse(notif.script_result["#text"]).model;
      var results = {};
      var keys = Object.keys(savedModel);
      for(var idx = 0; idx < keys.length; idx++){
        var key = keys[idx];
        var value = savedModel[key].value;
        results[key] = value;
      }
      newCall.scriptResponse = results;
    }catch(err){}
    // fix phonebook format
    if(newCall.transferPhoneBook && newCall.transferPhoneBook.entrys){
      newCall.transferPhoneBook = newCall.transferPhoneBook.entrys;
    }
    // fix requeue shortcuts
    if(newCall.requeueShortcuts && newCall.requeueShortcuts.requeueShortcuts){
      newCall.requeueShortcuts = newCall.requeueShortcuts.requeueShortcuts;
    }
    // if only one disposition, convert to array
    if(newCall.outdialDispositions && newCall.outdialDispositions.disposition){
      newCall.outdialDispositions.dispositions = [newCall.outdialDispositions]
    }
    // convert numbers to boolean where applicable
    newCall.queue.isCampaign = newCall.queue.isCampaign === "1";
    if(newCall.outdialDispositions && newCall.outdialDispositions.dispositions){
      for(var d = 0; d < newCall.outdialDispositions.dispositions.length; d++) {
        var disp = newCall.outdialDispositions.dispositions[d];
        disp.isComplete = disp.isComplete === "1";
        disp.requireNote = disp.requireNote === "1";
        disp.saveSurvey = disp.saveSurvey === "1";
        disp.xfer = disp.xfer === "1";
      }
    }
    // Build token map
    model.callTokens = buildCallTokenMap(notif, newCall);
    newCall.baggage = model.callTokens; // add all tokens to baggage
    // Is Monitoring Call?
    if(newCall.isMonitoring){
      model.agentSettings.callState = "ACTIVE-MONITORING";
    }else{
      model.agentSettings.callState = "ACTIVE";
      // check for preloaded transfer number
      if(newCall.baggage && newCall.baggage.auxPhone != ""){
        model.transferNumber = newCall.baggage.auxPhone;
      }
    }
    // Reset the current call counter for Agent Daily Stats
    model.agentDailyStats.currCallTime = 0;
    // todo handle scripting??
    model.currentCall = newCall;
    // start ping call interval timer, sends message every 30 seconds
    // if this is not a manual outdial and we are not suppressing disposition pop
    if(newCall.outdialDispositions && newCall.outdialDispositions.dispositions && newCall.outdialDispositions.dispositions.length > 0 && newCall.surveyPopType !== "SUPPRESS"){
      UIModel.getInstance().pingIntervalId = setInterval(utils.sendPingCallMessage, 30000);
    }
    return newCall;
  };
  function buildCallTokenMap(notif, newCall){
    var model = UIModel.getInstance();
    var tokens = newCall.baggage || {}; // seed with baggage values
    if(notif.baggage && notif.baggage.generic_key_value_pairs){
      var keyValuePairs = [];
      var keyValuePairsStr = utils.getText(notif.baggage, 'generic_key_value_pairs');
      if (keyValuePairsStr.length > 0){
        keyValuePairs = utils.parseKeyValuePairsFromString(keyValuePairsStr, "|", "::");
      }
      for(var keyValue in keyValuePairs){
        tokens[keyValue] = keyValuePairs[keyValue];
      }
    }
    tokens["ani"] = newCall.ani;
    tokens["dnis"] = newCall.dnis;
    tokens["uii"] = newCall.uii;
    try{
      if(newCall.queue.number){
        tokens["sourceId"] = newCall.number || "";
        tokens["sourceName"] = newCall.name || "";
        tokens["sourceDesc"] = newCall.description || "";
        if(newCall.queue.isCampaign === "0"){
          tokens["sourceType"] = "INBOUND";
        }else{
          tokens["sourceType"] = "OUTBOUND";
        }
      }else{
        tokens["sourceId"] = "0";
        tokens["sourceType"] = "MANUAL";
        tokens["sourceName"] = "";
        tokens["sourceDesc"] = "";
      }
    }catch(any){
      console.error("There was an error processing source tokenization", + any);
    }
    try{
      tokens["agentFirstName"] = model.agentSettings.firstName;
      tokens["agentLastName"] = model.agentSettings.lastName;
      tokens["agentExternalId"] = model.agentSettings.externalAgentId;
      tokens["agentType"] = model.agentSettings.agentType;
      tokens["agentEmail"] = model.agentSettings.email;
      tokens["agentUserName"] = model.agentSettings.username;
    }catch(any){
      console.error("There was an error parsing tokens for agent info. ", any);
    }
    return tokens;
  }
  function isCampaign(gate){
    if (gate && gate.isCampaign){
      return gate.isCampaign === "1" || gate.isCampaign === true;
    }
    return false;
  }
  var PendingDispNotification = function() {
  };
  /*
     * This class is responsible for handling a generic notification
     *
     * {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016080317400400011",
     *          "@type":"PENDING_DISP",
     *          "agent_id":{"#text":"3"},
     *          "status":{"#text":"false"}
     *      }
     * }
     */
  PendingDispNotification.prototype.processResponse = function(notification) {
    var formattedResponse = {};
    formattedResponse.agentId = utils.getText(notification.ui_notification,"agent_id");
    formattedResponse.status = utils.getText(notification.ui_notification,"status");
    return formattedResponse;
  };
  var PreviewLeadStateNotification = function() {
  };
  /*
     * This class is responsible for processing the lead state packet
     * received from intelliqueue. It will decide what type of leads are
     * being processed, and depending on if the callback is true or false, it will
     * call the appropriate form to update the lead state.
     *
     * {
     *      "ui_notification":{
     *          "@type":"PREVIEW-LEAD-STATE",
     *          "@call_type":"MANUAL|PREVIEW",
     *          "@message_id":"IQ10012016092715393600184",
     *          "request_id":{"#text":"IQ10012016092715390900179"},
     *          "lead_state":{"#text":"ANSWER"},
     *          "callback":{"#text":"FALSE"}
     *      }
     *   }
     * }
     */
  PreviewLeadStateNotification.prototype.processResponse = function(notification) {
    var notif = notification.ui_notification;
    UIModel.getInstance().agentSettings.onManualOutdial = true;
    var response = {
      callType: notif['@call_type'],
      messageId: notif['@message_id'],
      requestId: utils.getText(notif, "request_id"),
      leadState: utils.getText(notif,"lead_state"),
      callback: utils.getText(notif,"callback")
    };
    return response;
  };
  var ReverseMatchNotification = function() {
  };
  /*
     * This class is responsible for processing a REVERSE_MATCH packet from IQ. It
     * will log the packet was rec'd, save the packet to the UIModel for use by
     * components like the WhosCallingForm
     * {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016080317400400011",
     *          "@response_to":"1c2fe39f-a31e-aff8-8d23-92a61c88270f",
     *          "@type":"REVERSE_MATCH",
     *          "first_name":{"#text":""},
     *          "mid_name":{"#text":""},
     *          "last_name":{"#text":""},
     *          "address1":{"#text":""},
     *          "address2":{"#text":""},
     *          "city":{"#text":""},
     *          "state":{"#text":""},
     *          "zip":{"#text":""},
     *          "business_name":{"#text":""}
     *      }
     * }
     */
  ReverseMatchNotification.prototype.processResponse = function(notification) {
    var notif = notification.ui_notification;
    var model = UIModel.getInstance();
    model.tokens["first_name"] = utils.getText(notif,'first_name');
    model.tokens["mid_name"] = utils.getText(notif,'mid_name');
    model.tokens["last_name"] = utils.getText(notif,'last_name');
    model.tokens["address1"] = utils.getText(notif,'address1');
    model.tokens["address2"] = utils.getText(notif,'address2');
    model.tokens["suffix"] = utils.getText(notif,'suffix');
    model.tokens["title"] = utils.getText(notif,'title');
    model.tokens["city"] = utils.getText(notif,'city');
    model.tokens["state"] = utils.getText(notif,'state');
    model.tokens["zip"] = utils.getText(notif,'zip');
    model.tokens["business_name"] = utils.getText(notif,'business_name');
    return model.tokens;
  };
  var TcpaSafeLeadStateNotification = function() {
  };
  /*
     * This class is responsible for processing the lead state packet
     * received from intelliqueue. It will decide what type of leads are
     * being processed, and depending on if the callback is true or false, it will
     * call the appropriate form to update the lead state.
     *
     * {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016080317400400011",
     *          "@type":"TCPA-SAFE-LEAD-STATE",
     *          "@call_type":"MANUAL|TCPA-SAFE",
     *          "request_id":{"#text":""},
     *          "lead_state":{"#text":"CALLING"},
     *          "callback":{"#text":"false"}
     *      }
     * }
     */
  TcpaSafeLeadStateNotification.prototype.processResponse = function(notification) {
    var notif = notification.ui_notification;
    var response = {
      callType: notif['@call_type'],
      messageId: notif['@message_id'],
      requestId: utils.getText(notif, "request_id"),
      leadState: utils.getText(notif,"lead_state"),
      callback: utils.getText(notif,"callback")
    };
    return response;
  };
  var AckRequest = function(audioType, agentId, uii, monitorAgentId) {
    this.audioType = audioType || "FULL";
    this.agentId = agentId;
    this.uii = uii;
    this.monitorAgentId = monitorAgentId;
  };
  /*
     * This class processes ACK packets rec'd from IQ.
     * This is a callback triggered by certain actions like
     * sending dispositions or script results.
     * NOTE: uii is added in utils message processing.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008090317393001252",
     *      "@response_to":"1112222",
     *      "@type":"ACK",
     *      "type":{"#text":"CHAT-DISPOSITION|INBOUND-DISPOSITION|OUTDIAL-DISPOSITION|SCRIPT-RESULT"},
     *      "status":{"#text":"OK|FAILURE"},
     *      "message":{"#text":""},
     *      "detail":{}
     *    }
     * }
     */
  AckRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    formattedResponse.type = utils.getText(resp, 'type');
    if(formattedResponse.status === "OK"){
      utils.logMessage(LOG_LEVELS.DEBUG, formattedResponse.message, response);
    }else{
      utils.logMessage(LOG_LEVELS.WARN, formattedResponse.message + ': ' + formattedResponse.detail, response);
    }
    return formattedResponse;
  };
  var AgentStateRequest = function(agentState, agentAuxState) {
    if(agentState.toUpperCase() == "ON-BREAK" && UIModel.getInstance().onCall == true){
      this.agentState = "BREAK-AFTER-CALL";
      this.agentAuxState = "";
    }else{
      this.agentState = agentState.toUpperCase() || "";
      this.agentAuxState = agentAuxState || "";
    }
  };
  AgentStateRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.AGENT_STATE,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "state":{
          "#text":this.agentState
        },
        "agent_aux_state":{
          "#text":this.agentAuxState
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes AGENT-STATE packets rec'd from IQ. It will check the state of the
     * packet and then set the state on the model. It will also check for deferred surveys,
     * if one is found it will load it at this point.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008082817165103294",
     *      "@type":"AGENT-STATE",
     *      "status":{"#text":"OK"},
     *      "message":{},
     *      "detail":{},
     *      "agent_id":{"#text":"1856"},
     *      "prev_state":{"#text":"ENGAGED"},
     *      "current_state":{"#text":"WORKING"},
     *      "agent_aux_state":{"#text":"Offhook Work"},
     *      "prev_aux_state":{}
     *   }
     * }
     */
  AgentStateRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var status = utils.getText(resp, "status");
    var prevState = utils.getText(resp, "prev_state");
    var currState = utils.getText(resp, "current_state");
    var prevAuxState = utils.getText(resp, "prev_aux_state");
    var currAuxState = utils.getText(resp, "agent_aux_state");
    var model = UIModel.getInstance();
    // add message and detail if present
    var formattedResponse = utils.buildDefaultResponse(response);
    formattedResponse.agentId = response.ui_response.agent_id['#text'] || "";
    formattedResponse.previousState = prevState;
    formattedResponse.currentState = currState;
    formattedResponse.previousAuxState = prevAuxState;
    formattedResponse.currentAuxState = currAuxState;
    if(status=="OK"){
      var prevStateStr = prevState;
      var currStateStr = currState;
      if(prevAuxState.length > 0){
        prevStateStr = prevAuxState;
      }
      if(currAuxState.length > 0){
        currStateStr = currAuxState;
      }
      // Update the state in the UIModel
      model.agentSettings.currentState = currState;
      model.agentSettings.currentStateLabel = currAuxState;
      model.agentStatePacket = response;
    }else{
      if(formattedResponse.message === ""){
        formattedResponse.message = "Unable to change agent state";
      }
      // log message response
      var message = "Unable to change agent state. " + formattedResponse.detail;
      utils.logMessage(LOG_LEVELS.WARN, message, response);
    }
    return formattedResponse;
  };
  var BargeInRequest = function(audioType, agentId, uii, monitorAgentId) {
    this.audioType = audioType || "FULL";
    this.agentId = agentId;
    this.uii = uii;
    this.monitorAgentId = monitorAgentId;
  };
  /*
     *
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UIV22008931055822",
     *      "@response_to":"",
     *      "@type":"BARGE-IN",
     *      "agent_id":{"#text":"94"},
     *      "uii":{"#text":"200809031054510000000900020961"},
     *      "audio_state":{"#text":"FULL"},
     *      "monitor_agent_id":{"#text":"1856"}
     *    }
     * }
     */
  BargeInRequest.prototype.formatJSON = function() {
    var model = UIModel.getInstance();
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.BARGE_IN,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":utils.toString(this.agentId)
        },
        "uii":{
          "#text":utils.toString(this.uii)
        },
        "audio_state":{
          "#text":utils.toString(this.audioType)
        },
        "monitor_agent_id":{
          "#text":utils.toString(this.monitorAgentId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes BARGE-IN packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008090317393001252",
     *      "@response_to":"",
     *      "@type":"BARGE-IN",
     *      "agent_id":{"#text":"94"},
     *      "uii":{},
     *      "status":{"#text":"OK"},
     *      "message":{"#text":"Barge-In processed successfully!"},
     *      "detail":{}
     *    }
     * }
     */
  BargeInRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    formattedResponse.agentId = utils.getText(resp, 'agent_id');
    formattedResponse.uii = utils.getText(resp, 'uii');
    if(formattedResponse.status === "OK"){
      utils.logMessage(LOG_LEVELS.DEBUG, formattedResponse.message, response);
    }else{
      utils.logMessage(LOG_LEVELS.WARN, "There was an error processing the Barge-In request. " + formattedResponse.detail, response);
    }
    return formattedResponse;
  };
  var CallNotesRequest = function(notes) {
    this.notes = notes;
  };
  /*
    * This event is responsible for allowing an agent to tag a call with notes
    */
  CallNotesRequest.prototype.formatJSON = function() {
    var model = UIModel.getInstance();
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "@type":MESSAGE_TYPES.CALL_NOTES,
        "agent_id": {
          "#text" : utils.toString(model.agentSettings.agentId)
        },
        "uii": {
          "#text" : utils.toString(model.currentCall.uii)
        },
        "notes": {
          "#text" : utils.toString(this.notes)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class process CALL-NOTES packets rec'd from IntelliQueue.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008082817165103294",
     *      "@type":"CALL-NOTES",
     *      "status":{"#text":"OK"},
     *      "message":{},
     *      "detail":{}
     *   }
     * }
     */
  CallNotesRequest.prototype.processResponse = function(response) {
    var formattedResponse = utils.buildDefaultResponse(response);
    if(formattedResponse.status === "OK"){
      formattedResponse.message = "Call notes have been updated.";
      formattedResponse.type = "INFO_EVENT";
    }else{
      formattedResponse.type = "ERROR_EVENT";
      formattedResponse.message = "Unable to update notes.";
    }
    return formattedResponse;
  };
  var CallbackCancelRequest = function(leadId, agentId) {
    this.agentId = agentId || UIModel.getInstance().agentSettings.agentId;
    this.leadId = leadId;
  };
  CallbackCancelRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.CALLBACK_CANCEL,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":this.agentId
        },
        "lead_id":{
          "#text":this.leadId
        }
      }
    };
    return JSON.stringify(msg);
  };
  // NOTE: cancel callback response sent as a generic notification message
  var CallbacksPendingRequest = function(agentId) {
    this.agentId = agentId || UIModel.getInstance().agentSettings.agentId;
  };
  CallbacksPendingRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.CALLBACK_PENDING,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":this.agentId
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class is responsible for handling an PENDING-CALLBACKS response packet from IntelliQueue.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008091512353000875",
     *      "@response_to":"UIV220089151235539",
     *      "@type":"PENDING-CALLBACKS",
     *      "lead":{
     *          "@aux_data1":"",
     *          "@aux_data2":"",
     *          "@aux_data3":"",
     *          "@aux_data4":"",
     *          "@aux_data5":"",
     *          "@destination":"5555555555",
     *          "@dial_group_id":"",
     *          "@dial_group_name":"",
     *          "@dial_time":"2016-08-03 10:00",
     *          "@extern_id":"",
     *          "@lead_id":"",
     *          "lead_id":{},
     *          "extern_id":{},
     *          "extern_id":{},
     *          "first_name":{},
     *          "mid_name":{},
     *          "last_name":{},
     *          "suffix":{},
     *          "title":{},
     *          "address1":{},
     *          "address2":{},
     *          "city":{},
     *          "state":{},
     *          "zip":{},
     *          "gate_keeper":{}
     *      }
     *   }
     * }
     */
  CallbacksPendingRequest.prototype.processResponse = function(response) {
    var leadsRaw = response.ui_response.lead;
    var leads = [];
    if(Array.isArray(leadsRaw)){
      for(var l = 0; l < leadsRaw.length; l++){
        var leadRaw = leadsRaw[l];
        var lead = parseLead(leadRaw);
        leads.push(lead);
      }
    }else if(leadsRaw){
      leads.push(parseLead(leadsRaw));
    }
    UIModel.getInstance().agentSettings.pendingCallbacks = JSON.parse(JSON.stringify(leads));
    return UIModel.getInstance().agentSettings.pendingCallbacks;
  };
  function parseLead(leadRaw){
    var lead = {
      auxData1 : leadRaw['@aux_data1'],
      auxData2 : leadRaw['@aux_data2'],
      auxData3 : leadRaw['@aux_data3'],
      auxData4 : leadRaw['@aux_data4'],
      auxData5 : leadRaw['@aux_data5'],
      destination : leadRaw['@destination'],
      dialGroupId : leadRaw['@dial_group_id'],
      dialGroupName : leadRaw['@dial_group_name'],
      dialTime : leadRaw['@dial_time'],
      externId : leadRaw['@extern_id'],
      leadId : leadRaw['@lead_id'],
      firstName : utils.getText(leadRaw, "first_name"),
      midName : utils.getText(leadRaw, "mid_name"),
      lastName : utils.getText(leadRaw, "last_name"),
      sufix : utils.getText(leadRaw, "suffix"),
      title : utils.getText(leadRaw, "title"),
      address1 : utils.getText(leadRaw, "address1"),
      address2 : utils.getText(leadRaw, "address2"),
      city : utils.getText(leadRaw, "city"),
      state : utils.getText(leadRaw, "state"),
      zip : utils.getText(leadRaw, "zip"),
      gateKeeper : utils.getText(leadRaw, "gate_keeper")
    };
    return lead;
  }
  /*
     * This request is used to get the list of dispositions for a given campaign
     * E.g. in the lead search form for manual passes
     *
     */
  var CampaignDispositionsRequest = function(campaignId) {
    this.agentId = UIModel.getInstance().agentSettings.agentId;
    this.campaignId = campaignId;
  };
  CampaignDispositionsRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.CAMPAIGN_DISPOSITIONS,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":utils.toString(this.agentId)
        },
        "campaign_id": {
          "#text":utils.toString(this.campaignId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class is responsible for handling CAMPAIGN-DISPOSITIONS packets received
     * from IntelliQueue. It will save a copy of it in the UIModel.
     *
     * {"ui_response":{
     *      "@campaign_id":"60403",
     *      "@message_id":"IQ10012016081813480400006",
     *      "@response_to":"0b61c3ca-c4fc-9942-c139-da4978053c9d",
     *      "@type":"CAMPAIGN-DISPOSITIONS",
     *      "outdial_dispositions":{
     *          "disposition":[
     *              {"@disposition_id":"1","#text":"requeue"},
     *              {"@disposition_id":"2","#text":"complete"}
     *          ]
     *       }
     *    }
     * }
     */
  CampaignDispositionsRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var model = UIModel.getInstance();
    var dispositions = utils.processResponseCollection(resp, 'outdial_dispositions', 'disposition', 'disposition');
    model.outboundSettings.campaignDispositions = dispositions;
    return dispositions;
  };
  var XferColdRequest = function(dialDest, callerId, sipHeaders) {
    this.dialDest = dialDest;
    this.callerId = callerId || "";
    this.sipHeaders = sipHeaders || [];
  };
  XferColdRequest.prototype.formatJSON = function() {
    var fields = [];
    for(var i =0; i < this.sipHeaders.length; i++){
      var fieldObj = this.sipHeaders[i];
      fields.push({ '@name' : utils.toString(fieldObj.name), '@value' : utils.toString(fieldObj.value)});
    }
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.XFER_COLD,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "uii":{
          "#text":UIModel.getInstance().currentCall.uii
        },
        "dial_dest":{
          "#text":utils.toString(this.dialDest)
        },
        "caller_id":{
          "#text":utils.toString(this.callerId)
        },
        "xfer_header": fields
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes COLD-XFER packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@message_id":"IQ10012016082314475000219",
     *      "@response_to":"",
     *      "@type":"COLD-XFER",
     *      "agent_id":{"#text":"1"},
     *      "uii":{"#text":"201608231447590139000000000200"},
     *      "session_id":{"#text":"3"},
     *      "status":{"#text":"OK"},
     *      "dial_dest":{"#text":"3038593775"},
     *      "message":{"#text":"OK"},
     *      "detail":{}
     *   }
     * }
     */
  XferColdRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    formattedResponse.agentId = utils.getText(resp, 'agent_id');
    formattedResponse.uii = utils.getText(resp, 'uii');
    formattedResponse.sessionId = utils.getText(resp, 'session_id');
    formattedResponse.dialDest = utils.getText(resp, 'dial_dest');
    if(formattedResponse.status === "OK"){
    }else{
      // log message response
      var message = "There was an error processing the Cold Xfer request. " + formattedResponse.message + " : " + formattedResponse.detail;
      utils.logMessage(LOG_LEVELS.WARN, message, response);
    }
    return formattedResponse;
  };
  var ConfigRequest = function(dialDest, queueIds, chatIds, skillProfileId, dialGroupId, updateFromAdminUI) {
    this.queueIds = queueIds || [];
    this.chatIds = chatIds || [];
    this.skillProfileId = skillProfileId || "";
    this.dialGroupId = dialGroupId || "";
    this.dialDest = dialDest || "";
    this.updateFromAdminUI = updateFromAdminUI || false;
    this.loginType = "NO-SELECTION";
    this.updateLogin = false;
    // Remove any ids agent doesn't have access to
    var model = UIModel.getInstance();
    this.queueIds = utils.checkExistingIds(model.inboundSettings.availableQueues, this.queueIds, "gateId");
    this.chatIds = utils.checkExistingIds(model.chatSettings.availableChatQueues, this.chatIds, "chatQueueId");
    this.skillProfileId = utils.checkExistingIds(model.inboundSettings.availableSkillProfiles, [this.skillProfileId], "profileId")[0] || "";
    this.dialGroupId = utils.checkExistingIds(model.outboundSettings.availableOutdialGroups, [this.dialGroupId], "dialGroupId")[0] || "";
    // Set loginType value
    if(this.queueIds.length > 0 && this.dialGroupId !== ""){
      this.loginType = "BLENDED";
    } else if(this.queueIds.length > 0){
      this.loginType = "INBOUND";
    } else if(this.dialGroupId !== ""){
      this.loginType = "OUTBOUND";
    } else if(this.chatIds.length > 0){
      this.loginType = "CHAT";
    } else {
      this.loginType = "NO-SELECTION";
    }
    // set updateLogin value
    if(model.agentSettings.isLoggedIn){
      this.updateLogin = true;
    }
    // validate dialDest is sip or 10-digit num
    if(!utils.validateDest(this.dialDest)){
      utils.logMessage(LOG_LEVELS.WARN, "dialDest [" + this.dialDest + "] must be a valid sip or 10-digit DID", "");
    }
  };
  ConfigRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request":{
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.LOGIN,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":utils.toString(UIModel.getInstance().agentSettings.agentId)
        },
        "agent_pwd":{
          "#text": UIModel.getInstance().loginRequest.password
        },
        "dial_dest":{
          "#text":utils.toString(this.dialDest)
        },
        "login_type":{
          "#text":this.loginType
        },
        "update_login":{
          "#text":utils.toString(this.updateLogin)
        },
        "outdial_group_id":{
          "#text":utils.toString(this.dialGroupId)
        },
        "skill_profile_id":{
          "#text":utils.toString(this.skillProfileId)
        },
        "update_from_adminui":{
          "#text":utils.toString(this.updateFromAdminUI)
        }
      }
    };
    // add arrays
    var queueIds = [];
    for(var i = 0; i < this.queueIds.length; i++){
      if(this.queueIds[i] !== ""){
        queueIds.push( { "#text": utils.toString(this.queueIds[i]) } );
      }
    }
    if(queueIds.length > 0){
      msg.ui_request.gates = { "gate_id" : queueIds };
    }else{
      msg.ui_request.gates = {};
    }
    var chatIds = [];
    for(var i = 0; i < this.chatIds.length; i++){
      if(this.chatIds[i] !== "") {
        chatIds.push( {"#text": utils.toString(this.chatIds[i]) } );
      }
    }
    if(chatIds.length > 0) {
      msg.ui_request.chat_queues = {"chat_queue_id": chatIds};
    }else{
      msg.ui_request.chat_queues = {};
    }
    return JSON.stringify(msg);
  };
  /*
     * This function is responsible for handling the response to Login from IntelliQueue.
     *
     * {"ui_response":{
     *      "@message_id":"IQ10012016082513212000447",
     *      "@response_to":"IQ201608251121200",
     *      "@type":"LOGIN",
     *      "agent_id":{"#text":"1"},
     *      "status":{"#text":"SUCCESS"},
     *      "message":{"#text":"Hello Geoffrey Mina!"},
     *      "detail":{"#text":"Logon request processed successfully!"},
     *      "hash_code":{"#text":"404946966"},
     *      "login_type":{"#text":"BLENDED"},
     *      "outdial_group_id":{"#text":"50692"},
     *      "skill_profile_id":{"#text":"1513"},
     *      "gates":{
     *          "gate_id":[
     *              {"#text":"11116"},
     *              {"#text":"11117"}
     *          ]
     *      },
     *      "chat_queues":{
     *          "chat_queue_id":{"#text":"30"}
     *      }
     *    }
     * }
     */
  ConfigRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var status = utils.getText(resp, "status");
    var detail = utils.getText(resp, "detail");
    var model = UIModel.getInstance();
    var message = "";
    var formattedResponse = utils.buildDefaultResponse(response);
    if(detail === "Logon Session Configuration Updated!"){
      // this is an update login packet
      model.agentSettings.updateLoginMode = true;
      message = "Logon Session Configuration Updated!";
      utils.logMessage(LOG_LEVELS.INFO, message, response);
    }
    if(status === "SUCCESS"){
      if(!model.agentSettings.isLoggedIn){
        // fresh login, set UI Model properties
        model.configPacket = response;
        model.connectionSettings.hashCode = utils.getText(resp, "hash_code");
        model.agentSettings.isLoggedIn = true;
        model.agentSettings.loginDTS = new Date();
        model.connectionSettings.reconnect = true;
        model.agentPermissions.allowLeadSearch = false;
        model.agentSettings.dialDest = model.configRequest.dialDest; // not sent in response
        model.agentSettings.loginType = utils.getText(resp, "login_type");
        model.agentSettings.guid = utils.getText(resp,"guid");
        model.agentSettings.accountId = utils.getText(resp,"account_id");
        // Set collection values
        setDialGroupSettings(response);
        setGateSettings(response);
        setChatQueueSettings(response);
        setSkillProfileSettings(response);
      }else{
        if(model.agentSettings.updateLoginMode){
          model.agentSettings.dialDest = model.configRequest.dialDest;
          model.agentSettings.loginType = utils.getText(resp, "login_type");
          model.agentSettings.guid = utils.getText(resp,"guid");
          model.agentSettings.accountId = utils.getText(resp,"account_id");
          // This was an update login request
          model.agentSettings.updateLoginMode = false;
          // reset to false before updating dial group settings
          model.agentPermissions.allowLeadSearch = false;
          model.agentPermissions.requireFetchedLeadsCalled = false;
          model.agentPermissions.allowPreviewLeadFilters = false;
          // Set collection values
          setDialGroupSettings(response);
          setGateSettings(response);
          setChatQueueSettings(response);
          setSkillProfileSettings(response);
        }else{
          // this was a reconnect
          message = "Processed a Layer 2 Reconnect Successfully";
          utils.logMessage(LOG_LEVELS.INFO, message, response);
        }
      }
      formattedResponse.agentSettings = model.agentSettings;
      formattedResponse.agentPermissions = model.agentPermissions;
      formattedResponse.applicationSettings = model.applicationSettings;
      formattedResponse.chatSettings = model.chatSettings;
      formattedResponse.connectionSettings = model.connectionSettings;
      formattedResponse.inboundSettings = model.inboundSettings;
      formattedResponse.outboundSettings = model.outboundSettings;
      formattedResponse.scriptSettings = model.scriptSettings;
    }else{
      // Login failed
      if(formattedResponse.message === ""){
        formattedResponse.message = "Agent configuration attempt failed (2nd layer login)"
      }
      utils.logMessage(LOG_LEVELS.WARN, formattedResponse.message, response);
    }
    return formattedResponse;
  };
  function setDialGroupSettings(response){
    var model = UIModel.getInstance();
    var outdialGroups = model.outboundSettings.availableOutdialGroups;
    model.outboundSettings.outdialGroup = {}; // reset
    for(var g = 0; g < outdialGroups.length; g++){
      var group = outdialGroups[g];
      if(group.dialGroupId === response.ui_response.outdial_group_id['#text']){
        model.agentPermissions.allowLeadSearch = group.allowLeadSearch;
        model.agentPermissions.allowPreviewLeadFilters = group.allowPreviewLeadFilters;
        model.agentPermissions.progressiveEnabled = group.progressiveEnabled;
        model.outboundSettings.outdialGroup = JSON.parse(JSON.stringify(group)); // copy object
        // Only used for Preview or TCPA Safe accounts.
        // If set to true, only allow fetching new leads when current leads are called or expired
        model.agentPermissions.requireFetchedLeadsCalled = group.requireFetchedLeadsCalled;
      }
    }
  }
  function setSkillProfileSettings(response){
    var model = UIModel.getInstance();
    model.inboundSettings.skillProfile = {};
    var skillProfiles = model.inboundSettings.availableSkillProfiles;
    for(var s = 0; s < skillProfiles.length; s++){
      var profile = skillProfiles[s];
      var responseId = utils.getText(response.ui_response, "skill_profile_id");
      if(profile.profileId === responseId){
        model.inboundSettings.skillProfile = JSON.parse(JSON.stringify(profile)); // copy object
      }
    }
  }
  function setGateSettings(response){
    var model = UIModel.getInstance();
    var gates = model.inboundSettings.availableQueues;
    var selectedGateIds = [];
    var selectedGates = [];
    var gateIds = response.ui_response.gates.gate_id;
    if(gateIds){
      if(Array.isArray(gateIds)){ // multiple gates assigned
        for(var s = 0; s < gateIds.length; s++){
          var obj = gateIds[s];
          selectedGateIds.push(obj["#text"]);
        }
      }else{ // single gate assigned
        selectedGateIds.push(gateIds["#text"]);
      }
    }
    for(var gIdx = 0; gIdx < gates.length; gIdx++){
      var gate = gates[gIdx];
      if(selectedGateIds.indexOf(gate.gateId) > -1){
        selectedGates.push(gate);
      }
    }
    model.inboundSettings.queues = JSON.parse(JSON.stringify(selectedGates)); // copy array
  }
  function setChatQueueSettings(response){
    var model = UIModel.getInstance();
    var chatQueues = model.chatSettings.availableChatQueues;
    var selectedChatQueueIds = [];
    var selectedChatQueues = [];
    var cQueues = response.ui_response.chat_queues || {};
    var chatQueueIds = cQueues.chat_queue_id;
    if(chatQueueIds){
      if(Array.isArray(chatQueueIds)){ // multiple chatQueues assigned
        for(var c = 0; c < chatQueueIds.length; c++){
          var obj = chatQueueIds[c];
          selectedChatQueueIds.push(obj["#text"]);
        }
      }else{ // single chat queue assigned
        selectedChatQueueIds.push(chatQueueIds["#text"]);
      }
    }
    for(var cIdx = 0; cIdx < chatQueues.length; cIdx++){
      var chatQueue = chatQueues[cIdx];
      if(selectedChatQueueIds.indexOf(chatQueue.chatQueueId) > -1){
        selectedChatQueues.push(chatQueue);
      }
    }
    model.chatSettings.chatQueues = JSON.parse(JSON.stringify(selectedChatQueues)); // copy array
  }
  var DispositionRequest = function(uii, dispId, notes, callback, callbackDTS, contactForwardNumber, survey, externId, leadId) {
    this.uii = uii;
    this.dispId = dispId;
    this.notes = notes;
    this.callback = callback;
    this.callbackDTS = callbackDTS || "";
    this.contactForwardNumber = contactForwardNumber || null;
    this.externId = externId || null; // outbound-disposition only
    this.leadId = leadId || null;     // outbound-disposition only
    /*
         * survey = {
         *      first_name: {
         *          leadField: "first_name"
         *          value: "Geoff"
         *      },
         *      last_name: {
         *          leadField: "last_name"
         *          value: "Mina"
         *      }
         *      ...
         * }
         */
    this.survey = survey || null;
  };
  /*
     * This class is responsible for creating an inbound or outbound disposition packet to
     * send to intelliqueue. It will grab uii and agent_id directly from packets saved
     * in the UIModel. Then, using the information passed in, it will
     * create the remainder of the packet. This class is called from the ExtendedCallForm
     *
     * {"ui_request":{
     *      "@message_id":"IQ20160817145840132",
     *      "@response_to":"",
     *      "@type":"OUTDIAL-DISPOSITION|INBOUND-DISPOSITION",
     *      "session_id":{"#text":"2"},  <-- ONLY WHEN AVAILABLE otherwise the node is left blank. this is the AGENT session_id
     *      "uii":{"#text":"201608171658440139000000000165"},
     *      "agent_id":{"#text":"1180958"},
     *      "lead_id":{"#text":"1800"},                 <-- OUTDIAL-DISPOSITION ONLY
     *      "outbound_externid":{"#text":"3038593775"}, <-- OUTDIAL-DISPOSITION ONLY
     *      "disposition_id":{"#text":"5950"},
     *      "notes":{"#text":"note here"},
     *      "call_back":{"#text":"FALSE"},
     *      "call_back_DTS":{},
     *      "contact_forwarding":{},
     *      "survey":{
     *          "response":[
     *              {"@extern_id":"text_box","@lead_update_column":"","#text":"hello"},
     *              {"@extern_id":"check_box","@lead_update_column":"","#text":"20"},
     *              {"@extern_id":"radio_save","@lead_update_column":"","#text":"23"}
     *          ]
     *      }
     *   }
     * }
     */
  DispositionRequest.prototype.formatJSON = function() {
    var model = UIModel.getInstance();
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "@type":MESSAGE_TYPES.OUTDIAL_DISPOSITION,
        "agent_id": {
          "#text" : utils.toString(model.agentSettings.agentId)
        },
        "session_id":{
          "#text": ""
        },
        "uii": {
          "#text" : utils.toString(this.uii)
        },
        "disposition_id": {
          "#text" : utils.toString(this.dispId)
        },
        "notes": {
          "#text" : utils.toString(this.notes)
        },
        "call_back": {
          "#text" : this.callback === true? "TRUE" : "FALSE"
        },
        "call_back_DTS": {
          "#text" : utils.toString(this.callbackDTS)
        },
        "contact_forwarding": {
          "#text" : utils.toString(this.contactForwardNumber)
        },
        "outbound_externid": {
          "#text" : utils.toString(this.externId)
        },
        "lead_id": {
          "#text" : utils.toString(this.leadId)
        }
      }
    };
    if(model.currentCall.outdialDispositions && model.currentCall.outdialDispositions.type === "GATE") {
      msg.ui_request['@type'] = MESSAGE_TYPES.INBOUND_DISPOSITION;
    }
    if(model.currentCall.sessionId){
      msg.ui_request.session_id = {"#text":model.currentCall.sessionId};
    }
    /*
         * converts survey to this response
         * survey : {
         *      response: [
         *          { "@extern_id":"", "@lead_update_column":"", "#text":"" }
         *      ]
         * }
         */
    if(this.survey !== null){
      var response = [];
      var keys = Object.keys(this.survey);
      for(var i = 0; i < keys.length; i++){
        var key = keys[i];
        var obj = {
          "@extern_id": key,
          "@lead_update_column": utils.toString(this.survey[key].leadField),
          "#text": utils.toString(this.survey[key].value)
        };
        response.push(obj);
      }
      msg.ui_request.survey = {"response":response};
    }
    return JSON.stringify(msg);
  };
  var DispositionManualPassRequest = function(dispId, notes, callback, callbackDTS, leadId, requestId, externId) {
    this.dispId = dispId;
    this.notes = notes;
    this.callback = callback;
    this.callbackDTS = callbackDTS || "";
    this.leadId = leadId || null;
    this.requestId = requestId || null;
    this.externId = externId || null;
  };
  /*
     * Sends an OUTDIAL-DISPOSITION request, just a separate class
     * specifically for dispositions on manual pass.
     *
     * {"ui_request":{
     *      "@message_id":"UIV220089241119416",
     *      "@response_to":"",
     *      "@type":"OUTDIAL-DISPOSITION",
     *      "manual_disp":{"#text":"TRUE"},
     *      "request_key":{"#text":"IQ10012016081719070100875"},
     *      "session_id":{},
     *      "uii":{},
     *      "agent_id":{"#text":"1810"},
     *      "lead_id":{"#text":"213215"},
     *      "outbound_externid":{"#text":"909809"},
     *      "disposition_id":{"#text":"126"},
     *      "notes":{"#text":"here are my notes :)"},
     *      "call_back":{"#text":"TRUE | FALSE"},
     *      "call_back_DTS":{"#text":"2008-09-30 22:30:00 | null"},
     *      "contact_forwarding":{"#text":"null"}
     *    }
     * }
     */
  DispositionManualPassRequest.prototype.formatJSON = function() {
    var model = UIModel.getInstance();
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "@type":MESSAGE_TYPES.OUTDIAL_DISPOSITION,
        "manual_disp": {
          "#text" : "TRUE"
        },
        "agent_id": {
          "#text" : utils.toString(model.agentSettings.agentId)
        },
        "request_key": {
          "#text": utils.toString(this.requestId)
        },
        "disposition_id": {
          "#text" : utils.toString(this.dispId)
        },
        "notes": {
          "#text" : utils.toString(this.notes)
        },
        "call_back": {
          "#text" : this.callback === true? "TRUE" : "FALSE"
        },
        "call_back_DTS": {
          "#text" : utils.toString(this.callbackDTS)
        },
        "lead_id": {
          "#text" : utils.toString(this.leadId)
        },
        "extern_id": {
          "#text" : utils.toString(this.externId)
        },
        "contact_forwarding": {
          "#text": "null"
        },
        "session_id":{},
        "uii": {}
      }
    };
    return JSON.stringify(msg);
  };
  var HangupRequest = function(sessionId) {
    this.sessionId = sessionId || null;
  };
  HangupRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.HANGUP,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":utils.toString(UIModel.getInstance().agentSettings.agentId)
        },
        "uii":{
          "#text":utils.toString(UIModel.getInstance().currentCall.uii)
        },
        "session_id":{
          "#text":utils.toString(this.sessionId === null ? UIModel.getInstance().currentCall.sessionId : this.sessionId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var HoldRequest = function(holdState) {
    this.holdState = holdState;
  };
  /*
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UI200809291036128",
     *      "@response_to":"",
     *      "@type":"HOLD",
     *      "agent_id":{"#text":"1856"},
     *      "uii":{"#text":"200808291035510000000900029412"},
     *      "session_id":{"#text":"1"},
     *      "hold_state":{"#text":"ON"}
     *    }
     * }
     */
  HoldRequest.prototype.formatJSON = function() {
    var model = UIModel.getInstance();
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.HOLD,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":utils.toString(model.currentCall.agentId)
        },
        "uii":{
          "#text":utils.toString(model.currentCall.uii)
        },
        "session_id":{
          "#text":"1"
        },
        "hold_state":{
          "#text":this.holdState === true || this.holdState === "true" ? "ON" : "OFF"
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes HOLD packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008082910361503344",
     *      "@response_to":"",
     *      "@type":"HOLD",
     *      "uii":{"#text":"200808291035510000000900029412"},
     *      "session_id":{"#text":"1"},
     *      "status":{"#text":"OK"},
     *      "message":{},
     *      "detail":{},
     *      "hold_state":{"#text":"ON"}
     *    }
     * }
     */
  HoldRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    var currUII = "";
    if(UIModel.getInstance().currentCall.uii){
      currUII = UIModel.getInstance().currentCall.uii;
    }
    formattedResponse.holdState = utils.getText(resp, 'hold_state') === "ON";
    formattedResponse.sessionId = utils.getText(resp, 'session_id');
    formattedResponse.uii = utils.getText(resp, 'uii');
    if(formattedResponse.status === "OK"){
      // make sure we are talking about the same call
      if(formattedResponse.uii === currUII){
        if(formattedResponse.message === ""){
          formattedResponse.message = "Broadcasting new hold state of " + formattedResponse.holdState;
        }
        utils.logMessage(LOG_LEVELS.DEBUG, "Broadcasting new hold state of " + formattedResponse.holdState, response);
      }
      else{
        utils.logMessage(LOG_LEVELS.DEBUG, "Hold Response is for a different call...discarding", response);
      }
    }else{
      if(formattedResponse.message === ""){
        formattedResponse.message = "Error processing HOLD request. " +  + formattedResponse.message + "\n" + formattedResponse.detail;
      }
      utils.logMessage(LOG_LEVELS.WARN, "Error processing HOLD request. " + formattedResponse.detail, response);
    }
    return formattedResponse;
  };
  var LeadHistoryRequest = function(leadId) {
    this.leadId = leadId;
  };
  /*
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UI200809291036128",
     *      "@response_to":"",
     *      "@type":"LEAD-HISTORY",
     *      "agent_id":{"#text":"1"},
     *      "lead_id":{"#text":"12"},
     *    }
     * }
     */
  LeadHistoryRequest.prototype.formatJSON = function() {
    var model = UIModel.getInstance();
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.LEAD_HISTORY,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":utils.toString(model.agentSettings.agentId)
        },
        "lead_id":{
          "#text":utils.toString(this.leadId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes LEAD-HISTORY packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@lead_id":"2653",
     *      "@message_id":"IQ982008091512353000875",
     *      "@response_to":"UIV220089151235539",
     *      "@type":"LEAD-HISTORY",
     *      "previous_dial":{
     *          "@agent_name":"mandy pants (mandy)",
     *          "@duration":"",
     *          "@pass_disposition":"",
     *          "@pass_dts":"2008-09-15 12:35:27",
     *          "@pass_number":"",
     *          "@pass_uii":"200809151234140000000900021288",
     *          "agent_notes":{"#text":"This person was incredibly nice and agreed to buy donuts. "},
     *          "agent_disposition":{"#text":"Incomplete"}
     *      }
     *   }
     * }
     *
     * OR
     *
     * {"ui_response":{
     *      "@lead_id":"2653",
     *      "@message_id":"IQ982008091512353000875",
     *      "@response_to":"UIV220089151235539",
     *      "@type":"LEAD-HISTORY",
     *      "previous_dial":[
     *        {
     *          "@agent_name":"mandy pants (mandy)",
     *          "@duration":"",
     *          "@pass_disposition":"",
     *          "@pass_dts":"2008-09-15 12:35:27",
     *          "@pass_number":"",
     *          "@pass_uii":"200809151234140000000900021288",
     *          "agent_notes":{"#text":"This person was incredibly nice and agreed to buy donuts. "},
     *          "agent_disposition":{"#text":"Incomplete"}
     *        },
     *        {
     *          "@agent_name":"mandy pants (mandy)",
     *          "@duration":"",
     *          "@pass_disposition":"",
     *          "@pass_dts":"2008-09-15 12:35:27",
     *          "@pass_number":"",
     *          "@pass_uii":"200809151234140000000900021288",
     *          "agent_notes":{"#text":"This person was incredibly nice and agreed to buy donuts. "},
     *          "agent_disposition":{"#text":"Incomplete"}
     *        }
     *      ]
     *   }
     * }
     */
  LeadHistoryRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var histResponse = {
      leadId: resp['@lead_id']
    };
    var history = utils.processResponseCollection(response, 'ui_response', 'previous_dial');
    // always return array, even if only one item
    if(!Array.isArray(history)){
      history = [history];
    }
    histResponse.leadHistory = history;
    return histResponse;
  };
  var LeadInsertRequest = function(dataObj) {
    // handle boolean value conversion
    if(dataObj.agent_reserved && dataObj.agent_reserved === true){
      dataObj.agent_reserved = "1";
    }else{
      dataObj.agent_reserved = "0";
    }
    if(dataObj.dialable && dataObj.dialable === true){
      dataObj.dialable = "1";
    }else{
      dataObj.dialable = "0";
    }
    this.dataObj = dataObj;
  };
  /*
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UI200809291036128",
     *      "@response_to":"",
     *      "@type":"LEAD-INSERT",
     *      "agent_id":{"#text":"1"},
     *      "campaign_id":{"#text":""},
     *      "lead_phone":{"#text":""},
     *      "dialable":{"#text":""},
     *      "agent_reserved":{"#text":""},
     *      "callback_dts":{"#text":""},
     *      "first_name":{"#text":""},
     *      "mid_name":{"#text":""},
     *      "last_name":{"#text":""},
     *      "suffix":{"#text":""},
     *      "title":{"#text":""},
     *      "address1":{"#text":""},
     *      "address2":{"#text":""},
     *      "city":{"#text":""},
     *      "state":{"#text":""},
     *      "zip":{"#text":""},
     *      "email":{"#text":""},
     *      "gateKeeper":{"#text":""},
     *      "aux_data1":{"#text":""},
     *      "aux_data2":{"#text":""},
     *      "aux_data3":{"#text":""},
     *      "aux_data4":{"#text":""},
     *      "aux_data5":{"#text":""},
     *    }
     * }
     */
  LeadInsertRequest.prototype.formatJSON = function() {
    var model = UIModel.getInstance();
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.LEAD_INSERT,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":utils.toString(this.dataObj.agent_id)
        },
        "campaign_id":{
          "#text":utils.toString(this.dataObj.campaign_id)
        },
        "lead_phone":{
          "#text":utils.toString(this.dataObj.lead_phone)
        },
        "dialable":{
          "#text":utils.toString(this.dataObj.dialable)
        },
        "agent_reserved":{
          "#text":utils.toString(this.dataObj.agent_reserved)
        },
        "call_back_dts":{
          "#text":utils.toString(this.dataObj.callback_dts)
        },
        "first_name":{
          "#text":utils.toString(this.dataObj.first_name)
        },
        "mid_name":{
          "#text":utils.toString(this.dataObj.mid_name)
        },
        "last_name":{
          "#text":utils.toString(this.dataObj.last_name)
        },
        "suffix":{
          "#text":utils.toString(this.dataObj.suffix)
        },
        "title":{
          "#text":utils.toString(this.dataObj.title)
        },
        "address1":{
          "#text":utils.toString(this.dataObj.address1)
        },
        "address2":{
          "#text":utils.toString(this.dataObj.address2)
        },
        "city":{
          "#text":utils.toString(this.dataObj.city)
        },
        "state":{
          "#text":utils.toString(this.dataObj.state)
        },
        "zip":{
          "#text":utils.toString(this.dataObj.zip)
        },
        "email":{
          "#text":utils.toString(this.dataObj.email)
        },
        "gate_keeper":{
          "#text":utils.toString(this.dataObj.gate_keeper)
        },
        "aux_data1":{
          "#text":utils.toString(this.dataObj.aux_data1)
        },
        "aux_data2":{
          "#text":utils.toString(this.dataObj.aux_data2)
        },
        "aux_data3":{
          "#text":utils.toString(this.dataObj.aux_data3)
        },
        "aux_data4":{
          "#text":utils.toString(this.dataObj.aux_data4)
        },
        "aux_data5":{
          "#text":utils.toString(this.dataObj.aux_data5)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes LEAD-INSERT packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008091512353000875",
     *      "@response_to":"UIV220089151235539",
     *      "@type":"LEAD-INSERT",
     *      "status":{"#text":"TRUE|FALSE"},
     *      "msg":{"#text":""},
     *      "detail":{"#text":""},
     *   }
     * }
     */
  LeadInsertRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    formattedResponse.message = resp.msg["#text"];
    return formattedResponse;
  };
  var LeadUpdateRequest = function(leadId, leadPhone, baggage) {
    this.leadId = leadId;
    this.leadPhone = leadPhone;
    this.baggage = baggage;
    this.agentId = utils.toString(UIModel.getInstance().agentSettings.agentId);
  };
  /*
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UI200809291036128",
     *      "@response_to":"",
     *      "@type":"LEAD-UPDATE",
     *      "agent_id":{"#text":"1"},
     *      "lead_id":{"#text":"12"},
     *      "lead_phone":{"#text":"12"},
     *       "baggage":{
     *          "lead_id":{"#text":"64306"},
     *          "extern_id":{"#text":"9548298548"},
     *          "first_name":{"#text":"Ryant"},
     *          "mid_name":{},
     *          "last_name":{"#text":"Taylor"},
     *          "state":{"#text":"OH"},
     *          "aux_data1":{"#text":"BMAK"},
     *          "aux_data2":{"#text":"BMAK-041653-934"},
     *          "aux_data3":{"#text":"Call Ctr 1"},
     *          "aux_data4":{},
     *          "aux_data5":{},
     *          "address1":{"#text":"8010 Maryland Ave"},
     *          "address2":{},
     *          "city":{"#text":"Cleveland"},
     *          "zip":{"#text":"44105"},
     *          "aux_external_url":{},
     *          "aux_greeting":{},
     *          "aux_phone":{}
     *      },
     *    }
     * }
     */
  LeadUpdateRequest.prototype.formatJSON = function() {
    // make sure required baggage fields are present
    this.baggage = _formatBaggage(this.baggage);
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.LEAD_UPDATE,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":this.agentId
        },
        "lead_id":{
          "#text":utils.toString(this.leadId)
        },
        "lead_phone":{
          "#text":utils.toString(this.leadPhone)
        },
        "baggage": this.baggage
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes LEAD-UPDATE packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008091512353000875",
     *      "@response_to":"UIV220089151235539",
     *      "@type":"LEAD-UPDATE",
     *      "status":{"#text":"TRUE|FALSE"},
     *      "msg":{"#text":"64306"},
     *      "detail":{"#text":"64306"},
     *   }
     * }
     */
  LeadUpdateRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    formattedResponse.message = resp.msg["#text"];
    return formattedResponse;
  };
  _formatBaggage = function(baggage){
    var bag = {};
    bag.first_name = {"#text": baggage.first_name || ""};
    bag.mid_name = {"#text":baggage.mid_name || ""};
    bag.last_name = {"#text":baggage.last_name || ""};
    bag.suffix =  {"#text":baggage.suffix || ""};
    bag.title = {"#text":baggage.title || ""};
    bag.address1 = {"#text":baggage.address1 || ""};
    bag.address2 = {"#text":baggage.address2 || ""};
    bag.city = {"#text":baggage.city || ""};
    bag.state = {"#text":baggage.state || ""};
    bag.zip = {"#text":baggage.zip || ""};
    bag.email = {"#text":baggage.email || ""};
    bag.gate_keeper = {"#text":baggage.gate_keeper || ""};
    bag.extern_id = {"#text":baggage.extern_id || ""};
    bag.aux_data1 = {"#text":baggage.aux_data1 || ""};
    bag.aux_data2 = {"#text":baggage.aux_data2 || ""};
    bag.aux_data3 = {"#text":baggage.aux_data3 || ""};
    bag.aux_data4 = {"#text":baggage.aux_data4 || ""};
    bag.aux_data5 = {"#text":baggage.aux_data5 || ""};
    return bag;
  };
  var LoginRequest = function(username, password, isCaseSensitive) {
    this.username = username;
    this.password = password;
    this.isCaseSensitive = isCaseSensitive || false;
  };
  LoginRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IS",
        "@type":MESSAGE_TYPES.LOGIN,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "username":{
          "#text":this.username
        },
        "password":{
          "#text":this.password
        },
        "is_case_sensitive":{
          "#text":utils.toString(this.isCaseSensitive === true ? "TRUE" : "FALSE")
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This function is responsible for handling the login packet received from IntelliServices. It will save
     * a copy of it in the UIModel as loginPacket, as well as set the isLoggedInIS variable to
     * true (for reconnect purposes) and the loginDTS with the current date/time.
     *
     * {"ui_response":{
     *      "@type":"login",
     *      "status":{"#text":"OK"},
     *      "agent_id":{"#text":"1810"},
     *      "agent_pwd":{"#text":"bound25"},
     *      "first_name":{"#text":"mandy"},
     *      "last_name":{"#text":"pants"},
     *      "email":{"#text":"mandypants@aol.coim"},
     *      "agent_type":{"#text":"AGENT"},
     *      "external_agent_id":{"#text":"blahblah"},
     *      "default_login_dest":{"#text":"9548298548|123"},
     *      "alt_default_login_dest":{"#text":"9548298548|123"},
     *      "iq_url":{"#text":"dev.connectfirst.com"},
     *      "iq_port":{"#text":"1313"},
     *      "iq_ssl_port":{"#text":"1213"},
     *      "iq_secret_key":{"#text":"F-OFF"},
     *      "allow_inbound":{"#text":"1"},
     *      "allow_outbound":{"#text":"1"},
     *      "allow_chat":{"#text":"1"},
     *      "allow_blended":{"#text":"0"},
     *      "allow_off_hook":{"#text":"1"},
     *      "allow_call_control":{"#text":"1"},
     *      "allow_login_control":{"#text":"1"},
     *      "allow_login_updates":{"#text":"1"},
     *      "allow_lead_inserts":{"#text":"1"},
     *      "show_lead_history":{"#text":"1"},
     *      "allow_cross_gate_requeue":{"#text":"1"},
     *      "phone_login_dial_group":{"#text":"44"},
     *      "phone_login_pin":{"#text":"1234"},
     *      "allow_manual_calls":{"#text":"1"},
     *      "allow_manual_intl_calls":{"#text":"0"},
     *      "init_login_state":{"#text":"ON-BREAK"},
     *      "init_login_state_label":{"#text":"Morning Break"},
     *      "outbound_prepay":{"#text":"0"},
     *      "max_break_time":{"#text":"-1"},
     *      "max_lunch_time":{"#text":"-1"},
     *      "allow_lead_search":{"#text":"YES_ALL"},
     *      "tcpa_safe_mode":{"#text":"1|0"},
     *      "pci_enabled":{"#text":"1|0"},
     *      "login_gates":{
     *          "gate":[
     *              {"@default_dest_override":"","@gate_desc":"","@gate_id":"37","@gate_name":"test"},
     *              {"@default_dest_override":"","@gate_desc":"","@gate_id":"42","@gate_name":"test gate two"},
     *              {"@default_dest_override":"","@gate_desc":"","@gate_id":"43","@gate_name":"test gate three"},
     *              {"@default_dest_override":"","@gate_desc":"Amandas Other Gate","@gate_id":"46","@gate_name":"You know it!"}
     *          ]
     *      },
     *      "login_chat_queues":{
     *          "chat_queue":[
     *              {"@chat_queue_description":"","@chat_queue_id":"","@chat_queue_name":""},
     *              {"@chat_queue_description":"","@chat_queue_id":"","@chat_queue_name":""}
     *          ]
     *      },
     *      "outdial_groups":{
     *          "group":[
     *              {"@billing_key":"","@dial_group_desc":"","@dial_group_id":"44","@dial_group_name":"Geoff Dial Test","@dial_mode":"PREDICTIVE"},
     *              {"@billing_key":"2","@dial_group_desc":"AutoDial Configured Dial Group","@dial_group_id":"46","@dial_group_name":"Phone Only test5","@dial_mode":"PREDICTIVE"},
     *              {"@billing_key":"","@dial_group_desc":"Test","@dial_group_id":"200000","@dial_group_name":"Test","@dial_mode":"PREDICTIVE"},
     *              {"@billing_key":"","@dial_group_desc":"Test","@dial_group_id":"200010","@dial_group_name":"Carissa's Test Group","@dial_mode":"PREDICTIVE"}
     *          ]
     *      },"skill_profiles":{
     *          "profile":[
     *              {"@profile_desc":"","@profile_id":"571","@profile_name":"skill1"},
     *              {"@profile_desc":"","@profile_id":"572","@profile_name":"skill2"}
     *          ]
     *      },
     *      "requeue_gates":{
     *          "gate_group":[
     *              {
     *                  "@gate_group_id":"18",
     *                  "@group_name":"new gate group",
     *                  "gates":{
     *                      "gate":[
     *                          {"@gate_desc":"","@gate_id":"37","@gate_name":"test"},
     *                          {"@gate_desc":"","@gate_id":"43","@gate_name":"test gate three"},
     *                          {"@gate_desc":"","@gate_id":"42","@gate_name":"test gate two"}
     *                      ]
     *                  },
     *                  "skills":{
     *                      "skill":[
     *                          {"@skill_desc":"","@skill_id":"58","@skill_name":"one"},
     *                          {"@skill_desc":"","@skill_id":"59","@skill_name":"two"},
     *                      ]
     *                  }
     *              }
     *          ]
     *      },
     *      "chat_rooms":{},
     *      "scripts": {
     *           "script": {
     *               "@script_id": "15",
     *               "@script_name": "Don't Read This Script"
     *           }
     *      },
     *      "campaigns": {
     *          "campaign": {
     *              "@allow_lead_updates": "",
     *              "@campaign_id": "",
     *              "@campaign_name": "",
     *              "@survey_id": "",
     *              "@survey_name": "",
     *              "custom_labels": {
     *                  "@aux_1_label": "",
     *                  "@aux_2_label": "",
     *                  "@aux_3_label": "",
     *                  "@aux_4_label": "",
     *                  "@aux_5_label": ""
     *              },
     *              "generic_key_value_pairs": {}
     *          }
     *      },
     *      "account_countries":{
     *          "country":[
     *              {"@country_id":"BRA"},{"@country_id":"FRA"},{"@country_id":"GER"}
     *          ]
     *      }
     *   }
     * }
     */
  LoginRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var status = resp.status['#text'];
    var model = UIModel.getInstance();
    var formattedResponse = utils.buildDefaultResponse(response);
    if(status === 'OK'){
      if(!model.isLoggedInIS){
        // save login packet properties to UIModel
        model.loginPacket = response;
        model.applicationSettings.isLoggedInIS = true;
        model.applicationSettings.isTcpaSafeMode = utils.getText(resp, 'tcpa_safe_mode') === "1";
        model.applicationSettings.pciEnabled = utils.getText(resp, 'pci_enabled') === "1";
        model.chatSettings.alias = utils.getText(resp, 'first_name') + " " + utils.getText(resp, 'last_name');
        model.agentSettings.loginDTS = new Date();
        model.agentSettings.maxBreakTime = utils.getText(resp, 'max_break_time');
        model.agentSettings.maxLunchTime = utils.getText(resp, 'max_lunch_time');
        model.agentSettings.firstName = utils.getText(resp, 'first_name');
        model.agentSettings.lastName = utils.getText(resp, 'last_name');
        model.agentSettings.email = utils.getText(resp, 'email');
        model.agentSettings.agentId = utils.getText(resp, 'agent_id');
        model.agentSettings.externalAgentId = utils.getText(resp, 'external_agent_id');
        model.agentSettings.agentType = utils.getText(resp, 'agent_type');
        model.agentSettings.realAgentType = utils.getText(resp, 'real_agent_type');
        model.agentSettings.defaultLoginDest = utils.getText(resp, 'default_login_dest');
        model.agentSettings.altDefaultLoginDest = utils.getText(resp, 'alt_default_login_dest');
        model.agentSettings.initLoginState = utils.getText(resp, 'init_login_state');
        model.agentSettings.initLoginStateLabel = utils.getText(resp, 'init_login_state_label');
        model.agentSettings.outboundManualDefaultRingtime = utils.getText(resp, 'outbound_manual_default_ringtime');
        model.agentSettings.isOutboundPrepay = utils.getText(resp, 'outbound_prepay') === "1";
        model.agentSettings.phoneLoginPin = utils.getText(resp, 'phone_login_pin');
        model.agentSettings.username = model.loginRequest.username;
        model.agentPermissions.allowCallControl = utils.getText(resp, 'allow_call_control') === "1";
        model.agentPermissions.allowChat = utils.getText(resp, 'allow_chat') === "1";
        model.agentPermissions.showLeadHistory = utils.getText(resp, 'show_lead_history') === "1";
        model.agentPermissions.allowManualOutboundGates = utils.getText(resp, 'allow_manual_outbound_gates') === "1";
        model.agentPermissions.allowOffHook = utils.getText(resp, 'allow_off_hook') === "1";
        model.agentPermissions.allowManualCalls = utils.getText(resp, 'allow_manual_calls') === "1";
        model.agentPermissions.allowManualPass = utils.getText(resp, 'allow_manual_pass') === "1";
        model.agentPermissions.allowManualIntlCalls = utils.getText(resp, 'allow_manual_intl_calls') === "1";
        model.agentPermissions.allowLoginUpdates = utils.getText(resp, 'allow_login_updates') === "1";
        model.agentPermissions.allowInbound = utils.getText(resp, 'allow_inbound') === "1";
        model.agentPermissions.allowOutbound = utils.getText(resp, 'allow_outbound') === "1";
        model.agentPermissions.allowBlended = utils.getText(resp, 'allow_blended') === "1";
        model.agentPermissions.allowLoginControl = utils.getText(resp, 'allow_login_control') === "1";
        model.agentPermissions.allowCrossQueueRequeue = utils.getText(resp, 'allow_cross_gate_requeue') === "1";
        model.agentPermissions.disableSupervisorMonitoring = utils.getText(resp, 'disable_supervisor_monitoring') === "1";
        model.agentPermissions.allowAutoAnswer = utils.getText(resp, 'allow_auto_answer') === "1";
        model.outboundSettings.defaultDialGroup = utils.getText(resp, 'phone_login_dial_group');
        if(response.ui_response.allow_lead_inserts && typeof resp.insert_campaigns !== 'undefined' && response.ui_response.insert_campaigns.campaign){
          model.agentPermissions.allowLeadInserts = utils.getText(resp, 'allow_lead_inserts') === "1";
        }
        // Set collection values
        processCampaigns(response);
        model.chatSettings.availableChatQueues = utils.processResponseCollection(response.ui_response, "login_chat_queues", "chat_queue");
        model.chatSettings.availableChatRequeueQueues = utils.processResponseCollection(response.ui_response, "chat_requeue_queues", "chat_group");
        model.inboundSettings.availableQueues = utils.processResponseCollection(response.ui_response, "login_gates", "gate");
        model.inboundSettings.availableSkillProfiles = utils.processResponseCollection(response.ui_response, "skill_profiles", "profile");
        model.inboundSettings.availableRequeueQueues = utils.processResponseCollection(response.ui_response, "requeue_gates", "gate_group");
        model.chatSettings.availableChatRooms = utils.processResponseCollection(response.ui_response, "chat_rooms", "room");
        model.scriptSettings.availableScripts = utils.processResponseCollection(response.ui_response, "scripts", "script");
        model.agentSettings.callerIds = utils.processResponseCollection(response.ui_response, "caller_ids", "caller_id");
        model.agentSettings.availableAgentStates = utils.processResponseCollection(response.ui_response, "agent_states", "agent_state");
        model.applicationSettings.availableCountries = utils.processResponseCollection(response.ui_response, "account_countries", "country");
        model.outboundSettings.insertCampaigns = utils.processResponseCollection(response.ui_response, "insert_campaigns", "campaign");
        var dialGroups = utils.processResponseCollection(response.ui_response, "outdial_groups", "group");
        // set boolean values
        for(var dg = 0; dg < dialGroups.length; dg++){
          var group = dialGroups[dg];
          group.allowLeadSearch = group.allowLeadSearch === "YES";
          group.allowPreviewLeadFilters = group.allowPreviewLeadFilters === "1";
          group.progressiveEnabled = group.progressiveEnabled === "1";
          group.requireFetchedLeadsCalled = group.requireFetchedLeadsCalled === "1";
        }
        model.outboundSettings.availableOutdialGroups = dialGroups;
      }
      formattedResponse.agentSettings = model.agentSettings;
      formattedResponse.agentPermissions = model.agentPermissions;
      formattedResponse.applicationSettings = model.applicationSettings;
      formattedResponse.chatSettings = model.chatSettings;
      formattedResponse.connectionSettings = model.connectionSettings;
      formattedResponse.inboundSettings = model.inboundSettings;
      formattedResponse.outboundSettings = model.outboundSettings;
      formattedResponse.scriptSettings = model.scriptSettings;
    }else if(status === 'RESTRICTED'){
      formattedResponse.message = "Invalid IP Address";
      utils.logMessage(LOG_LEVELS.WARN, formattedResponse.message, response);
    }else{
      formattedResponse.message = "Invalid Username or password";
      utils.logMessage(LOG_LEVELS.WARN, formattedResponse.message, response);
    }
    return formattedResponse;
  };
  processCampaigns = function(response){
    var campaigns = [];
    var campaign = {};
    var campaignsRaw = [];
    var customLabels = [];
    var labelArray = [];
    var label = "";
    var campaignId = 0;
    var campaignName = "";
    var allowLeadUpdates = 0;
    if(typeof response.ui_response.campaigns.campaign !== 'undefined'){
      campaignsRaw = response.ui_response.campaigns.campaign;
    }
    if(Array.isArray(campaignsRaw)){
      // dealing with an array
      for(var c = 0; c < campaignsRaw.length; c++){
        campaignId = campaignsRaw[c]['@campaign_id'];
        campaignName = campaignsRaw[c]['@campaign_name'];
        allowLeadUpdates = campaignsRaw[c]['@allow_lead_updates']; // 0 = no update, 1 = allow phone update, 2 = don't allow phone update
        customLabels = campaignsRaw[c]['custom_labels'];
        labelArray = [];
        label = "";
        UIModel.getInstance().agentPermissions.allowLeadUpdatesByCampaign[campaignId] = allowLeadUpdates;
        for (var prop in customLabels) {
          label = prop.replace(/@/, ''); // remove leading '@'
          var obj = {};
          obj[label] = customLabels[prop];
          labelArray.push(obj);
        }
        campaign = {
          allowLeadUpdates: allowLeadUpdates,
          campaignId: campaignId,
          campaignName: campaignName,
          surveyId: campaignsRaw[c]['@survey_id'],
          surveyName: campaignsRaw[c]['@survey_name'],
          customLabels: labelArray
        };
        campaigns.push(campaign);
      }
    }else{
      if(campaignsRaw){
        // single campaign object
        campaignId = campaignsRaw['@campaign_id'];
        campaignName = campaignsRaw['@campaign_name'];
        allowLeadUpdates = campaignsRaw['@allow_lead_updates']; // 0 = no update, 1 = allow phone update, 2 = don't allow phone update
        customLabels = campaignsRaw['custom_labels'];
        labelArray = [];
        label = "";
        UIModel.getInstance().agentPermissions.allowLeadUpdatesByCampaign[campaignId] = allowLeadUpdates;
        for (var p in customLabels) {
          label = p.replace(/@/, ''); // remove leading '@'
          var obj = {};
          obj[label] = customLabels[p];
          labelArray.push(obj);
        }
        campaign = {
          allowLeadUpdates: allowLeadUpdates,
          campaignId: campaignId,
          campaignName: campaignName,
          surveyId: campaignsRaw['@survey_id'],
          surveyName: campaignsRaw['@survey_name'],
          customLabels: labelArray
        };
        campaigns.push(campaign);
      }
    }
    UIModel.getInstance().outboundSettings.availableCampaigns = campaigns;
  };
  var LogoutRequest = function(agentId, message, isSupervisor) {
    this.agentId = agentId;
    this.message = message || "";
    this.isSupervisor = isSupervisor;
  };
  LogoutRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.LOGOUT,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":this.agentId
        },
        "message":{
          "#text":this.message
        }
      }
    };
    return JSON.stringify(msg);
  };
  var OffhookInitRequest = function() {
  };
  OffhookInitRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.OFFHOOK_INIT,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "dial_dest":{
          "#text":UIModel.getInstance().agentSettings.dialDest
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class is responsible for handling an off-hook-init response packet from IntelliQueue.
     * If the offhookinit is successful, it will go into the UIModel and set the isOffhook variable
     * to true.
     *
     * {"ui_response":{
     *      "@message_id":"UI2005",
     *      "@response_to":"",
     *      "@type":"OFF-HOOK-INIT",
     *      "status":{"#text":"OK|FAILURE"},
     *      "message":{},
     *      "detail":{}
     *    }
     * }
     */
  OffhookInitRequest.prototype.processResponse = function(response) {
    var status = response.ui_response.status['#text'];
    var formattedResponse = utils.buildDefaultResponse(response);
    if(status === 'OK'){
      UIModel.getInstance().offhookInitPacket = response;
      UIModel.getInstance().agentSettings.isOffhook = true;
    }else{
      if(formattedResponse.message === ""){
        formattedResponse.message = "Unable to process offhook request";
      }
      utils.logMessage(LOG_LEVELS.WARN, formattedResponse.message + ' ' + formattedResponse.detail, response);
    }
    return formattedResponse;
  };
  var OffhookTermRequest = function() {
  };
  OffhookTermRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.OFFHOOK_TERM,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * Process an OFF-HOOK-TERM packet and update various variables in the UI
     *
     * {"ui_notification":{
     *      "@message_id":"IQ10012016080217135001344",
     *      "@response_to":"",
     *      "@type":"OFF-HOOK-TERM",
     *      "agent_id":{"#text":"1"},
     *      "start_dts":{"#text":"2016-08-02 17:11:38"},
     *      "end_dts":{"#text":"2016-08-02 17:14:07"},
     *      "monitoring":{"#text":"0"}
     *    }
     * }
     */
  OffhookTermRequest.prototype.processResponse = function(data) {
    var notif = data.ui_notification;
    var monitoring = utils.getText(notif, "monitoring") === '1';
    var model = UIModel.getInstance();
    model.agentSettings.wasMonitoring = monitoring;
    model.offhookTermPacket = data;
    model.agentSettings.isOffhook = false;
    var formattedResponse = {
      status: "OK",
      agentId: utils.getText(notif, "agent_id"),
      startDts: utils.getText(notif, "start_dts"),
      endDts: utils.getText(notif, "end_dts"),
      monitoring: monitoring
    };
    return formattedResponse;
  };
  var OneToOneOutdialRequest = function(destination, callerId, ringTime, countryId, gateId) {
    this.destination = destination;
    this.callerId = callerId;
    this.ringTime = ringTime || "60";
    this.countryId = countryId || "USA";
    this.gateId = gateId || "";
  };
  OneToOneOutdialRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.ONE_TO_ONE_OUTDIAL,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":utils.toString(UIModel.getInstance().agentSettings.agentId)
        },
        "destination":{
          "#text":utils.toString(this.destination)
        },
        "ring_time":{
          "#text":utils.toString(this.ringTime)
        },
        "caller_id":{
          "#text":utils.toString(this.callerId)
        },
        "country_id":{
          "#text":utils.toString(this.countryId)
        },
        "gate_id":{
          "#text":utils.toString(this.gateId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var OneToOneOutdialCancelRequest = function(uii) {
    this.uii = uii
  };
  /*
     * This class is responsible for creating a new packet to cancel
     * an in-progress outbound call.
     */
  OneToOneOutdialCancelRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.ONE_TO_ONE_OUTDIAL_CANCEL,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":utils.toString(UIModel.getInstance().agentSettings.agentId)
        },
        "uii":{
          "#text":utils.toString(this.uii)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var PauseRecordRequest = function(record) {
    this.record = record;
  };
  /*
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UI200809291036128",
     *      "@response_to":"",
     *      "@type":"PAUSE-RECORD",
     *      "agent_id":{"#text":"1856"},
     *      "uii":{"#text":"200808291035510000000900029412"},
     *      "record":{"#text":"TRUE | FALSE"},
     *      "pause":{"#text":"10"}
     *    }
     * }
     */
  PauseRecordRequest.prototype.formatJSON = function() {
    var model = UIModel.getInstance();
    var pauseTime = "10";
    if(model.currentCall.agentRecording && model.currentCall.agentRecording.pause){
      pauseTime = model.currentCall.agentRecording.pause;
    }
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.PAUSE_RECORD,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":utils.toString(model.currentCall.agentId)
        },
        "uii":{
          "#text":utils.toString(model.currentCall.uii)
        },
        "record":{
          "#text":utils.toString(this.record === true ? "TRUE" : "FALSE")
        },
        "pause":{
          "#text":utils.toString(pauseTime)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes PAUSE-RECORD packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008082910361503344",
     *      "@response_to":"",
     *      "@type":"PAUSE-RECORD",
     *      "uii":{"#text":"200808291035510000000900029412"},
     *      "status":{"#text":"OK | FAILURE"},
     *      "message":{},
     *      "detail":{},
     *      "state":{"#text":"RECORDING | PAUSED"},
     *      "pause":{"#text":"10"}
     *    }
     * }
     */
  PauseRecordRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    var currUII = "";
    if(UIModel.getInstance().currentCall.uii){
      currUII = UIModel.getInstance().currentCall.uii;
    }
    formattedResponse.uii = utils.getText(resp, 'uii');
    formattedResponse.state = utils.getText(resp, 'state');
    formattedResponse.pause = utils.getText(resp, 'pause');
    if(formattedResponse.status === "OK"){
      // make sure we are talking about the same call
      if(formattedResponse.uii === currUII) {
        if(formattedResponse.message === ""){
          formattedResponse.message = "Broadcasting new record state of " + formattedResponse.state;
        }
        utils.logMessage(LOG_LEVELS.DEBUG, "Broadcasting new record state of " + formattedResponse.state, response);
      }else{
        utils.logMessage(LOG_LEVELS.DEBUG, "Pause Record Response is for a different call...discarding", response);
      }
    }else{
      if(formattedResponse.message === ""){
        formattedResponse.message = "Error processing PAUSE-RECORD request." + formattedResponse.message + "\n" + formattedResponse.detail;
      }
      utils.logMessage(LOG_LEVELS.WARN, formattedResponse.message, response);
    }
    return formattedResponse;
  };
  var PingCallRequest = function() {

  };
  PingCallRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.PING_CALL,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":UIModel.getInstance().currentCall.agentId
        },
        "uii":{
          "#text":UIModel.getInstance().currentCall.uii
        }
      }
    };
    return JSON.stringify(msg);
  };
  var PreviewDialRequest = function(action, searchFields, requestId) {
    this.agentId = UIModel.getInstance().agentSettings.agentId;
    this.searchFields = searchFields || [];
    this.requestId = requestId || "";
    this.action = action || "";
  };
  /*
     * searchFields = [
     *  {key: "name", value: "Danielle"},
     *  {key: "number", value: "5555555555"
     * ];
     */
  PreviewDialRequest.prototype.formatJSON = function() {
    var fields = {};
    for(var i =0; i < this.searchFields.length; i++){
      var fieldObj = this.searchFields[i];
      fields[fieldObj.key] = { "#text" : utils.toString(fieldObj.value) };
    }
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.PREVIEW_DIAL,
        "@message_id":utils.getMessageId(),
        "@action":this.action,
        "@response_to":"",
        "agent_id":{
          "#text":utils.toString(UIModel.getInstance().agentSettings.agentId)
        },
        "pending_request_id":{
          "#text":utils.toString(this.requestId)
        },
        "search_fields": fields
        // { "name": {"#text": "Danielle" } }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class is responsible for handling PREVIEW-DIAL packets received
     * from the dialer. It will save a copy of it in the UIModel.
     *
     * {"dialer_request":{
     *      "@action":"", // <-- empty for Preview fetch, otherwise "SEARCH"
     *      "@callbacks":"TRUE|FALSE"
     *      ,"@message_id":"ID2008091513163400220",
     *      "@response_to":"",
     *      "@type":"PREVIEW_DIAL",
     *      "dial_group_id":{"#text":"200018"},
     *      "account_id":{"#text":"99999999"},
     *      "agent_id":{"#text":"1810"},
     *      "is_insert":{"#text":"TRUE|FALSE"}, <--- TRUE if search triggered by insert
     *      "destinations":{
     *          "lead":[
     *              {
     *                  "@aux_data1":"","@aux_data2":"","@aux_data3":"","@aux_data4":"","@aux_data5":"",
     *                  "@aux_phone":"","@campaign_id":"51","@destination":"9548298548","@dnis":"1112223333",
     *                  "@extern_id":"amanda","@lead_id":"2646","@lead_state":"PENDING","@live_answer_msg":"",
     *                  "@mach_answer_msg":"","@machine_detect":"FALSE","@request_key":"IQ982008091516241101125",
     *                  "@valid_until":"2008-09-15 17:24:11","extern_id":{"#text":"9548298548"},
     *                  "first_name":{"#text":"Amanda"},"mid_name":{"#text":"Amanda"},"last_name":{"#text":"Machutta2"},
     *                  "address1":{},"address2":{},"city":{},"state":{},"zip":{},"aux_greeting":{},
     *                  "aux_external_url":{}
     *              },
     *          ]
     *      }
     *    }
     * }
     */
  PreviewDialRequest.prototype.processResponse = function(notification) {
    var notif = notification.dialer_request;
    var model = UIModel.getInstance();
    var leads = utils.processResponseCollection(notif, 'destinations', 'lead');
    // send over requestId (as well as requestKey for backwards compatibility)
    // to match previewLeadState.notification property
    for(var l = 0; l < leads.length; l++){
      leads[l].requestId = leads[l].requestKey;
    }
    var formattedResponse = {
      action: notif['@action'],
      callbacks: notif['@callbacks'] === "TRUE",
      dialGroupId: utils.getText(notif,"dial_group_id"),
      accountId: utils.getText(notif,"account_id"),
      agentId: utils.getText(notif,"agent_id"),
      isInsert: utils.getText(notif,"is_insert"),
      leads: leads
    };
    if(notif['@callbacks'] === 'TRUE'){
      utils.logMessage(LOG_LEVELS.INFO, "New CALLBACK packet request rec'd from dialer", notification);
      // clear callbacks??
      //model.callbacks = [];
      for(var l = 0; l < leads.length; l++){
        var lead = leads[l];
        model.callbacks.push(lead);
      }
    }else{
      model.outboundSettings.previewDialLeads = leads;
    }
    return formattedResponse;
  };
  var RecordRequest = function(record) {
    this.record = record;
  };
  /*
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UI200809291036128",
     *      "@response_to":"",
     *      "@type":"RECORD",
     *      "agent_id":{"#text":"1856"},
     *      "uii":{"#text":"200808291035510000000900029412"},
     *      "record":{"#text":"TRUE | FALSE"}
     *    }
     * }
     */
  RecordRequest.prototype.formatJSON = function() {
    var model = UIModel.getInstance();
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.RECORD,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":utils.toString(model.currentCall.agentId)
        },
        "uii":{
          "#text":utils.toString(model.currentCall.uii)
        },
        "record":{
          "#text": this.record === true ? "TRUE" : "FALSE"
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes RECORD packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008082910361503344",
     *      "@response_to":"",
     *      "@type":"RECORD",
     *      "uii":{"#text":"200808291035510000000900029412"},
     *      "status":{"#text":"OK"},
     *      "message":{},
     *      "detail":{},
     *      "state":{"#text":"RECORDING | STOPPED"}
     *    }
     * }
     */
  RecordRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    var currUII = "";
    if(UIModel.getInstance().currentCall.uii){
      currUII = UIModel.getInstance().currentCall.uii;
    }
    formattedResponse.uii = utils.getText(resp, 'uii');
    formattedResponse.state = utils.getText(resp, 'state');
    if(formattedResponse.status === "OK"){
      // make sure we are talking about the same call
      if(formattedResponse.uii === currUII) {
        if(formattedResponse.message === ""){
          formattedResponse.message = "Broadcasting new record state of " + formattedResponse.state;
        }
        utils.logMessage(LOG_LEVELS.DEBUG, formattedResponse.message, response);
      }else{
        utils.logMessage(LOG_LEVELS.DEBUG, "Record Response is for a different call...discarding", response);
      }
    }else{
      if(formattedResponse.message === ""){
        formattedResponse.message = "Error processing RECORD request." + formattedResponse.message + "\n" + formattedResponse.detail;
      }
      utils.logMessage(LOG_LEVELS.WARN, formattedResponse.message, response);
    }
    return formattedResponse;
  };
  var RequeueRequest = function(queueId, skillId, maintain) {
    this.queueId = queueId;
    this.skillId = skillId;
    this.maintain = maintain;
  };
  RequeueRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.REQUEUE,
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "uii":{
          "#text":UIModel.getInstance().currentCall.uii
        },
        "gate_number":{
          "#text":utils.toString(this.queueId)
        },
        "skill_id":{
          "#text":utils.toString(this.skillId)
        },
        "maintain_agent":{
          "#text":this.maintain === true ? "TRUE" : "FALSE"
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes RE-QUEUE packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008082817165103291",
     *      "@response_to":"UIV220088281716486",
     *      "@type":"RE-QUEUE",
     *      "status":"OK",
     *      "message":"Success.",
     *      "detail":"The re-queue request was successfully processed.",
     *      "agent_id":{"#text":"1856"},
     *      "uii":{"#text":"200808281716090000000900028070"},
     *      "gate_number":{"#text":"19"},
     *      "maintain_agent":{"#text":"FALSE"}
     *    }
     * }
     */
  RequeueRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    formattedResponse.agentId = utils.getText(resp, 'agent_id');
    formattedResponse.uii = utils.getText(resp, 'uii');
    formattedResponse.queueId = utils.getText(resp, 'gate_number');
    if(formattedResponse.status === "OK"){
    }else{
      var message = "There was an error processing the requeue request. " + formattedResponse.detail;
      utils.logMessage(LOG_LEVELS.WARN, message, response);
    }
    return formattedResponse;
  };
  var ScriptConfigRequest = function(scriptId, version) {
    this.scriptId = scriptId;
    this.version = version || null;
  };
  /*
    * This event is responsible for requesting a script object
    */
  ScriptConfigRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "@type":MESSAGE_TYPES.SCRIPT_CONFIG,
        "agent_id":{
          "#text":utils.toString(UIModel.getInstance().agentSettings.agentId)
        },
        "script_id": {
          "#text" : utils.toString(this.scriptId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class process SCRIPT-CONFIG packets received from IntelliQueue.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008082817165103294",
     *      "@response_to":"",
     *      "@type":"SCRIPT-CONFIG",
     *      "status":{"#text":"OK"},
     *      "message":{},
     *      "script_id":{"#text":"123"},
     *      "version":{"#text":"1"},
     *      "json":{},
     *   }
     * }
     */
  ScriptConfigRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    if(formattedResponse.status === "true"){
      formattedResponse.status = true;
      formattedResponse.scriptId = utils.getText(resp, 'script_id');
      formattedResponse.version = utils.getText(resp, 'version');
      formattedResponse.json = utils.getText(resp, 'json');
      // store script on model
      UIModel.getInstance().scriptSettings.loadedScripts[formattedResponse.scriptId] = formattedResponse;
    }else{
      formattedResponse.status = false;
    }
    return formattedResponse;
  };
  var ScriptResultRequest = function(uii, scriptId, jsonResult) {
    this.uii = uii;
    this.scriptId = scriptId;
    this.jsonResult = jsonResult;
  };
  /*
    * This event is responsible for sending the script result object
    */
  ScriptResultRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@message_id":utils.getMessageId(),
        "response_to":"",
        "@type":MESSAGE_TYPES.SCRIPT_RESULT,
        "agent_id": {
          "#text" : utils.toString(UIModel.getInstance().agentSettings.agentId)
        },
        "uii":{
          "#text":utils.toString(this.uii)
        },
        "script_id": {
          "#text" : utils.toString(this.scriptId)
        },
        "json_result": {
          "#text": JSON.stringify(this.jsonResult)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var StatsRequest = function() {

  };
  /*
     * { "ui_request": {
     *      "@response_to":"",
     *      "@message_id":"IS20160901142437535",
     *      "@type":"STATS"
     *    }
     * }
     */
  StatsRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IS",
        "@type":MESSAGE_TYPES.STATS,
        "@message_id":utils.getMessageId(),
        "@response_to":""
      }
    };
    return JSON.stringify(msg);
  };
  var TcpaSafeRequest = function(action, searchFields, requestId) {
    this.agentId = UIModel.getInstance().agentSettings.agentId;
    this.searchFields = searchFields || [];
    this.requestId = requestId || "";
    this.action = action || "";
  };
  /*
     * searchFields = [
     *  {key: "name", value: "Danielle"},
     *  {key: "number", value: "5555555555"
     * ];
     */
  TcpaSafeRequest.prototype.formatJSON = function() {
    var fields = {};
    for(var i =0; i < this.searchFields.length; i++){
      var fieldObj = this.searchFields[i];
      fields[fieldObj.key] = { "#text" : utils.toString(fieldObj.value) };
    }
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.TCPA_SAFE,
        "@message_id":utils.getMessageId(),
        "@action":this.action,
        "response_to":"",
        "agent_id":{
          "#text":utils.toString(UIModel.getInstance().agentSettings.agentId)
        },
        "pending_request_id":{
          "#text":utils.toString(this.requestId)
        },
        "search_fields": fields
        // { "name": {"#text": "Danielle"} }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class is responsible for handling TCPA-SAFE packets received
     * from the dialer. It will save a copy of it in the UIModel.
     *
     * {"dialer_request":{
     *      "@action":"",
     *      "@callbacks":"TRUE|FALSE"
     *      ,"@message_id":"ID2008091513163400220",
     *      "@response_to":"",
     *      "@type":"TCPA_SAFE",
     *      "dial_group_id":{"#text":"200018"},
     *      "account_id":{"#text":"99999999"},
     *      "agent_id":{"#text":"1810"},
     *      "is_insert":{"#text":"TRUE|FALSE"}, <--- TRUE if search triggered by insert
     *      "destinations":{
     *          "lead":[
     *              {
     *                  "@aux_data1":"","@aux_data2":"","@aux_data3":"","@aux_data4":"","@aux_data5":"",
     *                  "@aux_phone":"","@campaign_id":"51","@destination":"9548298548","@dnis":"1112223333",
     *                  "@extern_id":"amanda","@lead_id":"2646","@lead_state":"PENDING","@live_answer_msg":"",
     *                  "@mach_answer_msg":"","@machine_detect":"FALSE","@request_key":"IQ982008091516241101125",
     *                  "@valid_until":"2008-09-15 17:24:11","extern_id":{"#text":"9548298548"},
     *                  "first_name":{"#text":"Amanda"},"mid_name":{"#text":"Amanda"},"last_name":{"#text":"Machutta2"},
     *                  "address1":{},"address2":{},"city":{},"state":{},"zip":{},"aux_greeting":{},
     *                  "aux_external_url":{}
     *              },
     *          ]
     *      }
     *    }
     * }
     *
     */
  TcpaSafeRequest.prototype.processResponse = function(notification) {
    var notif = notification.dialer_request;
    var model = UIModel.getInstance();
    var leads = utils.processResponseCollection(notif, 'destinations', 'lead');
    // send over requestId (as well as requestKey for backwards compatibility)
    // to match tcpaSafeLeadState.notification property
    for(var l = 0; l < leads.length; l++){
      leads[l].requestId = leads[l].requestKey;
    }
    var formattedResponse = {
      action: notif['@action'],
      callbacks: notif['@callbacks'] === "TRUE",
      dialGroupId: utils.getText(notif,"dial_group_id"),
      accountId: utils.getText(notif,"account_id"),
      agentId: utils.getText(notif,"agent_id"),
      isInsert: utils.getText(notif,"is_insert"),
      leads: leads
    };
    if(notif['@callbacks'] === 'TRUE'){
      var message = "New CALLBACK packet request rec'd from dialer";
      utils.logMessage(LOG_LEVELS.INFO, message, notification);
      // clear callbacks??
      //model.callbacks = [];
      for(var l = 0; l < leads.length; l++){
        var lead = leads[l];
        model.callbacks.push(lead);
      }
    }else{
      model.outboundSettings.tcpaSafeLeads = leads;
    }
    return formattedResponse;
  };
  var XferWarmRequest = function(dialDest, callerId, sipHeaders) {
    this.dialDest = dialDest;
    this.callerId = callerId || "";
    this.sipHeaders = sipHeaders || [];
  };
  XferWarmRequest.prototype.formatJSON = function() {
    var fields = [];
    for(var i =0; i < this.sipHeaders.length; i++){
      var fieldObj = this.sipHeaders[i];
      fields.push({ '@name' : utils.toString(fieldObj.name), '@value' : utils.toString(fieldObj.value)});
    }
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.XFER_WARM,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "uii":{
          "#text":UIModel.getInstance().currentCall.uii
        },
        "dial_dest":{
          "#text":utils.toString(this.dialDest)
        },
        "caller_id":{
          "#text":utils.toString(this.callerId)
        },
        "xfer_header": fields
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class processes WARM-XFER packets rec'd from IQ.
     *
     * {"ui_response":{
     *      "@message_id":"IQ10012016082314475000219",
     *      "@response_to":"",
     *      "@type":"WARM-XFER",
     *      "agent_id":{"#text":"1"},
     *      "uii":{"#text":"201608231447590139000000000200"},
     *      "session_id":{"#text":"3"},
     *      "status":{"#text":"OK"},
     *      "dial_dest":{"#text":"3038593775"},
     *      "message":{"#text":"OK"},"detail":{}
     *    }
     * }
     *  Response on CANCEL:
     *  {"ui_response":{
     *      "@message_id":"IQ10012016082315005000264",
     *      "@response_to":"",
     *      "@type":"WARM-XFER",
     *      "agent_id":{"#text":"1"},
     *      "uii":{"#text":"201608231501090139000000000204"},
     *      "session_id":{},
     *      "status":{"#text":"FAILURE"},
     *      "dial_dest":{"#text":"3038593775"},
     *      "message":{"#text":"Transfer CANCELED"},
     *      "detail":{"#text":"NOANSWER after 3 seconds."}
     *    }
     * }
     */
  XferWarmRequest.prototype.processResponse = function(response) {
    var resp = response.ui_response;
    var formattedResponse = utils.buildDefaultResponse(response);
    formattedResponse.agentId = utils.getText(resp, 'agent_id');
    formattedResponse.uii = utils.getText(resp, 'uii');
    formattedResponse.sessionId = utils.getText(resp, 'session_id');
    formattedResponse.dialDest = utils.getText(resp, 'dial_dest');
    if(formattedResponse.status === "OK"){
      utils.logMessage(LOG_LEVELS.DEBUG, "Warm Xfer to " + formattedResponse.dialDest + " processed successfully.", response);
    }else{
      utils.logMessage(LOG_LEVELS.WARN, "There was an error processing the Warm Xfer request. " + formattedResponse.message + "\n" + formattedResponse.detail, response);
    }
    return formattedResponse;
  };
  var XferWarmCancelRequest = function(dialDest) {
    this.dialDest = dialDest;
  };
  XferWarmCancelRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.XFER_WARM_CANCEL,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "uii":{
          "#text":UIModel.getInstance().currentCall.uii
        },
        "dial_dest":{
          "#text":utils.toString(this.dialDest)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var ChatAliasRequest = function(alias) {
    this.alias = alias;
  };
  /*
     * This class is responsible for creating the request to change chat alias
     * packet and sending it to intelliservices.
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UI200809291036128",
     *      "@response_to":"",
     *      "@type":"CHAT-ALIAS",
     *      "alias":{"#text":""}
     *    }
     * }
     */
  ChatAliasRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IS",
        "@type":MESSAGE_TYPES.CHAT_ALIAS,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "alias":{
          "#text":utils.toString(this.alias)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var ChatDispositionRequest = function(uii, agentId, dispositionId, notes, sendAcknowlegement, survey, sessionId) {
    this.uii = uii;
    this.agentId = agentId;
    this.dispositionId = dispositionId;
    this.notes = notes || "";
    this.sendAcknowlegement = sendAcknowlegement || false;
    this.sessionId = sessionId;
    /*
         * survey = {
         *      first_name: {
         *          leadField: "first_name"
         *          value: "Geoff"
         *      },
         *      last_name: {
         *          leadField: "last_name"
         *          value: "Mina"
         *      }
         *      ...
         * }
         */
    this.survey = survey || null;
  };
  /*
     * External Chat:
     * When agent dispositions a chat, send "CHAT-DISPOSITION" request to IntelliQueue
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@type":"CHAT-DISPOSITION",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "uii":{"#text":""},
     *      "agent_id":{"#text":""},
     *      "session_id" : {"#text" : ""},
     *      "disposition_id":{"#text":""},
     *      "notes":{"#text":"hello"},
     *      "do_ack":{"#text":"true"},
     *      "survey":{
     *          "response":[
     *              {"@extern_id":"text_box","#text":"hello"},
     *              {"@extern_id":"check_box","#text":"20"},
     *              {"@extern_id":"radio_save","#text":"23"}
     *          ]
     *      }
     *    }
     * }
     */
  ChatDispositionRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.CHAT_DISPOSITION,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "uii":{
          "#text":utils.toString(this.uii)
        },
        "agent_id":{
          "#text":utils.toString(this.agentId)
        },
        "session_id" : {
          "#text" : utils.toString(this.sessionId)
        },
        "disposition_id":{
          "#text":utils.toString(this.dispositionId)
        },
        "notes":{
          "#text":utils.toString(this.notes)
        },
        "do_ack":{
          "#text":this.sendAcknowlegement === true ? "TRUE" : "FALSE"
        }
      }
    };
    /*
         * converts survey to this response
         * survey : {
         *      response: [
         *          { "@extern_id":"", "@lead_update_column":"", "#text":"" }
         *      ]
         * }
         */
    if(this.survey !== null){
      var response = [];
      var keys = Object.keys(this.survey);
      for(var i = 0; i < keys.length; i++){
        var key = keys[i];
        var obj = {
          "@extern_id": key,
          "#text": utils.toString(this.survey[key].value)
        };
        response.push(obj);
      }
      msg.ui_request.survey = {"response":response};
    }
    return JSON.stringify(msg);
  };
  var ChatListRequest = function(agentId, monitorAgentId) {
    this.agentId = agentId;
    this.monitorAgentId = monitorAgentId;
  };
  /*
     * External Chat:
     * Requests a list of all chats by monitor agent id
     *
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@type":"CHAT-LIST",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "agent_id":{"#text":""},
     *      "monitor_agent_id":{"#text":""}
     *    }
     * }
     */
  ChatListRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.CHAT_LIST,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "monitor_agent_id":{
          "#text":utils.toString(this.monitorAgentId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var ChatMessageRequest = function(uii, agentId, message, whisper) {
    this.uii = uii;
    this.agentId = agentId;
    this.message = message;
    this.whisper = whisper;
  };
  /*
     * External Chat:
     * When agent submits a chat message, send "CHAT-MESSAGE" request to IntelliQueue
     *
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@type":"CHAT-MESSAGE",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "uii":{"#text":""},
     *      "agent_id":{"#text":""},
     *      "message":{"#text":"hello"},
     *      "whisper":{"#text":"true|false"}
     *    }
     * }
     */
  ChatMessageRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.CHAT_MESSAGE,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "uii":{
          "#text":utils.toString(this.uii)
        },
        "agent_id":{
          "#text":utils.toString(this.agentId)
        },
        "message":{
          "#text":utils.toString(this.message)
        },
        "whisper":{
          "#text":utils.toString(this.whisper)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class is responsible for handling external CHAT-MESSAGE packets received from
     * IntelliQueue.
     *
     * {"ui_notification":{
     *      "@message_id":"",
     *      "@response_to":"",
     *      "@type":"CHAT-MESSAGE",
     *      "uii":{"#text":""},
     *      "account_id":{"#text":""},
     *      "from":{"#text":""},
     *      "message":{"#text":"hello"},
     *      "dts":{"#text":"2017-05-10 12:40:28"}
     *    }
     * }
     */
  ChatMessageRequest.prototype.processResponse = function(response) {
    var resp = response.ui_notification;
    var dts = utils.getText(resp, 'dts').trim();
    var dtsDate = new Date(dts.replace(' ','T'));
    var formattedResponse = {
      uii: utils.getText(resp, 'uii'),
      accountId: utils.getText(resp, 'account_id'),
      from: utils.getText(resp, 'from'),
      type: utils.getText(resp, 'type'),
      message: utils.getText(resp, 'message'),
      whisper: utils.getText(resp, 'whisper'),
      dts: dtsDate
    };
    utils.logMessage(LOG_LEVELS.DEBUG, "New CHAT-MESSAGE packet received from IntelliQueue", response);
    return formattedResponse;
  };
  var ChatPresentedResponseRequest = function(uii, messageId, response, responseReason) {
    this.uii = uii;
    this.messageId = messageId;
    this.response = response;
    this.responseReason = responseReason || "";
  };
  /*
     * External Chat:
     * When Agent receives a CHAT-PRESENTED notification, respond with
     * either ACCEPT or REJECT for presented chat.
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@type":"CHAT-PRESENTED",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "uii":{"#text":""},
     *      "agent_id":{"#text":""},
     *      "response":{"#text":"ACCEPT|REJECT"},
     *      "response_reason":{"#text":""}
     *    }
     * }
     */
  ChatPresentedResponseRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.CHAT_PRESENTED_RESPONSE,
        "@message_id":utils.getMessageId(),
        "@response_to":this.messageId,
        "uii":{
          "#text":utils.toString(this.uii)
        },
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "response":{
          "#text":utils.toString(this.response)
        },
        "response_reason":{
          "#text":utils.toString(this.responseReason)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var ChatRequeueRequest = function(uii, agentId, chatQueueId, skillId, maintainAgent) {
    this.uii = uii;
    this.agentId = agentId;
    this.chatQueueId = chatQueueId;
    this.skillId = skillId || "";
    this.maintainAgent = maintainAgent || false;
  };
  /*
     * External Chat:
     * When agent submits a chat message, send "CHAT-REQUEUE" request to IntelliQueue
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@type":"CHAT-REQUEUE",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "uii":{"#text":""},
     *      "agent_id":{"#text":""},
     *      "chat_queue_id":{"#text":""},
     *      "skill_id":{"#text":""},
     *      "maintain_agent":{"#text":"true|false"}
     *    }
     * }
     */
  ChatRequeueRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.CHAT_REQUEUE,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "uii":{
          "#text":utils.toString(this.uii)
        },
        "agent_id":{
          "#text":utils.toString(this.agentId)
        },
        "chat_queue_id":{
          "#text":utils.toString(this.chatQueueId)
        },
        "skill_id":{
          "#text":utils.toString(this.skillId)
        },
        "maintain_agent":{
          "#text":utils.toString(this.maintainAgent)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var ChatRoomRequest = function(action, roomType, roomId, agentOne, agentTwo) {
    this.action = action;
    this.roomType = roomType;
    this.roomId = roomId;
    this.agentOne = agentOne || "";
    this.agentTwo = agentTwo || "";
  };
  /*
     * This class is responsible for sending the packet requesting to either enter
     * a chatroom, or to exit a chatroom to IS. It also handles private chats. There are
     * two possible ways these packets could look:
     *
     * //PUBLIC
     * {"ui_request":{
     *      "@destination":"IS",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "@type":"CHAT-ROOM",
     *      "@room_type":"PUBLIC",
     *      "room_id":{"#text":""},
     *      "action":{"#text":"EXIT|ENTER"}
     *    }
     * }
     * -OR-
     * // PRIVATE
     * {"ui_request":{
     *      "@destination":"IS",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "@type":"CHAT-ROOM",
     *      "@room_type":"PRIVATE",
     *      "agent_one":{"#text":""},
     *      "agent_two":{"#text":""},
     *      "action":{"#text":"ENTER|EXIT"}
     *    }
     * }
     *
     */
  ChatRoomRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IS",
        "@type":MESSAGE_TYPES.CHAT_ROOM,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "action":{
          "#text":utils.toString(this.action)
        }
      }
    };
    if(this.action !== "EXIT"){
      msg.ui_request["@room_type"] = this.roomType;
    }
    if(this.roomType === "PRIVATE" && this.action === "ENTER"){
      msg.ui_request.agent_one = { "#text":utils.toString(this.agentOne) };
      msg.ui_request.agent_two = { "#text":utils.toString(this.agentTwo) };
    }else{
      msg.ui_request.room_id = { "#text":utils.toString(this.roomId) };
    }
    return JSON.stringify(msg);
  };
  var ChatRoomStateRequest = function() {
  };
  /*
     * This class is responsible for processing CHAT-ROOM-STATE packets received
     * from IntelliServices.
     *
     * {"ui_request":{
     *      "@message_id":"",
     *      "@response_to":"",
     *      "@type":"CHAT-ROOM-STATE",
     *      "room_id":{"#text":""},
     *      "agent_id":{"#text":""},
     *      "chat_alias":{"#text":""},
     *      "state":{"#text":""}
     *    }
     * }
     */
  ChatRoomStateRequest.prototype.processResponse = function(response) {
    var resp = response.ui_request;
    var formattedResponse = {
      roomId: utils.getText(resp, 'room_id'),
      agentId: utils.getText(resp, 'agent_id'),
      chatAlias: utils.getText(resp, 'chat_alias'),
      state: utils.getText(resp, 'state')
    };
    utils.logMessage(LOG_LEVELS.DEBUG, "Chat-Room-State update packet received for room #" + formattedResponse.roomId, response);
    return formattedResponse;
  };
  var ChatSendRequest = function(roomId, message) {
    this.roomId = roomId;
    this.message = message;
  };
  /*
     * This class is responsible for creating the CHAT message packet and sending
     * it to IntelliServices.
     *
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UI200809291036128",
     *      "@response_to":"",
     *      "@type":"CHAT",
     *      "room_id":{"#text":""}
     *      "message":{"#text":""}
     *    }
     * }
     */
  ChatSendRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IS",
        "@type":MESSAGE_TYPES.CHAT_SEND,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "room_id":{
          "#text":utils.toString(this.roomId)
        },
        "message":{
          "#text":utils.toString(this.message)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class is responsible for handling CHAT packets received from
     * IntelliServices.
     *
     * //PUBLIC
     * {"ui_request":{
     *      "@message_id":"",
     *      "@response_to":"",
     *      "@type":"CHAT",
     *      "room_type":"GROUP",
     *      "room_id":{"#text":""},
     *      "message":{"#text":""},
     *      "sender":{"#text":""},
     *      "sender_id":{"#text":""},
     *      "room_name":{"#text":""}
     *    }
     * }
     * -OR-
     * // PRIVATE
     * {"ui_request":{
     *      "@dynamic_create":"TRUE",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "@type":"CHAT",
     *      "room_type":"PRIVATE",
     *      "room_id":{"#text":""},
     *      "message":{"#text":""},
     *      "sender":{"#text":""},
     *      "room_name":{"#text":""}
     *    }
     * }
     */
  ChatSendRequest.prototype.processResponse = function(response) {
    var resp = response.ui_request;
    var formattedResponse = {
      roomType: utils.getText(resp, 'room_type'),
      roomId: utils.getText(resp, 'room_id'),
      message: utils.getText(resp, 'message'),
      sender: utils.getText(resp, 'sender'),
      senderId: utils.getText(resp, 'sender_id'),
      roomName: utils.getText(resp, 'room_name'),
      dynamicCreate: utils.getText(resp, 'dynamic_create') === "TRUE"
    };
    utils.logMessage(LOG_LEVELS.DEBUG, "New CHAT packet received from IntelliServices", response);
    return formattedResponse;
  };
  var ChatTypingRequest = function(uii) {
    this.uii = uii;
  };
  /*
     * External Chat:
     * Agent sends typing message to notify client widgets,
     * but the agent's pending message is not sent going this direction.
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@type":"CHAT-TYPING",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "uii":{"#text":""},
     *      "agent_id":{"#text":""}
     *    }
     * }
     */
  ChatTypingRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.CHAT_TYPING,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "uii":{
          "#text":utils.toString(this.uii)
        },
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        }
      }
    };
    return JSON.stringify(msg);
  };
  var LeaveChatRequest = function(uii, agentId, sessionId) {
    this.uii = uii;
    this.agentId = agentId;
    this.sessionId = sessionId;
  };
  /*
     * External Chat:
     * Requests to terminate a chat session on an existing chat uii
     *
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@type":"CHAT-DROP-SESSION",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "uii":{"#text":""},
     *      "agent_id":{"#text":""},
     *      "session_id":{"#text":""}
     *    }
     * }
     */
  LeaveChatRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.LEAVE_CHAT,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "uii":{
          "#text":utils.toString(this.uii)
        },
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "session_id":{
          "#text":utils.toString(this.sessionId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var MonitorChatRequest = function(uii, agentId, monitorAgentId) {
    this.uii = uii;
    this.agentId = agentId;
    this.monitorAgentId = monitorAgentId;
  };
  /*
     * External Chat:
     * Requests a new session on an existing chat uii
     *
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@type":"CHAT-MONITOR",
     *      "@message_id":"",
     *      "@response_to":"",
     *      "uii":{"#text":""},
     *      "agent_id":{"#text":""},
     *      "monitor_agent_id":{"#text":""}
     *    }
     * }
     */
  MonitorChatRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IQ",
        "@type":MESSAGE_TYPES.MONITOR_CHAT,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "uii":{
          "#text":utils.toString(this.uii)
        },
        "agent_id":{
          "#text":UIModel.getInstance().agentSettings.agentId
        },
        "monitor_agent_id":{
          "#text":utils.toString(this.monitorAgentId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  var SupervisorListRequest = function() {
  };
  /*
     * This class is responsible for creating a packet to request a list of
     * supervisors from IntelliServices. This is used by the chat function so an
     * agent can grab a list of supervisors and then select one for a private chat.
     *
     * {"ui_request":{
     *      "@destination":"IQ",
     *      "@message_id":"UI200809291036128",
     *      "@response_to":"",
     *      "@type":"SUPERVISOR-LIST",
     *      "agent_id":{"#text":""}
     *    }
     * }
     */
  SupervisorListRequest.prototype.formatJSON = function() {
    var msg = {
      "ui_request": {
        "@destination":"IS",
        "@type":MESSAGE_TYPES.SUPERVISOR_LIST,
        "@message_id":utils.getMessageId(),
        "@response_to":"",
        "agent_id":{
          "#text":utils.toString(UIModel.getInstance().agentSettings.agentId)
        }
      }
    };
    return JSON.stringify(msg);
  };
  /*
     * This class is responsible for handling the SUPERVISOR-LIST packet
     * rec'd from intelliservices. It will save a copy of this list in the
     * UIModel under a variable called "supervisors". Whenever a new list
     * is rec'd it is overwritten.
     *
     * {"ui_response":{
     *      "@message_id":"IQ982008082910361503344",
     *      "@response_to":"",
     *      "supervisor":[
     *          {"id":{"#text":""}, "fname":{"#text":""}, "lname":{"#text":""}, "uname":{"#text":""} }
     *          {"id":{"#text":""}, "fname":{"#text":""}, "lname":{"#text":""}, "uname":{"#text":""} }
     *      ]
     *    }
     * }
     */
  SupervisorListRequest.prototype.processResponse = function(response) {
    var model = UIModel.getInstance();
    var tempList = utils.processResponseCollection(response, "ui_response", "supervisor");
    var supervisors = [];
    for(var i = 0; i < tempList.length; i++){
      var sup = tempList[i];
      supervisors.push({
        agentId:sup.id,
        firstName:sup.fname,
        lastName:sup.lname,
        username:sup.uname
      });
    }
    utils.logMessage(LOG_LEVELS.DEBUG, "New supervisor list received ", supervisors);
    model.supervisors = supervisors;
    return model.supervisors;
  };
  var ChatActiveNotification = function() {
  };
  /*
     * External Chat:
     * This class is responsible for handling "CHAT-ACTIVE" packets from IntelliQueue.
     * This is sent in response to an agent's CHAT-PRESENTED-RESPONSE accept request.
     *
     *  {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016081611595000289",
     *          "@type":"CHAT-ACTIVE",
     *          "@destination":"IQ",
     *          "@response_to":"",
     *          "account_id":{"#text":"99999999"},
     *          "uii":{"#text":"201608161200240139000000000120"}
     *      }
     *  }
     */
  ChatActiveNotification.prototype.processResponse = function(notification) {
    var notif = notification.ui_notification;
    return {
      message: "Received CHAT-ACTIVE notification",
      status: "OK",
      accountId: utils.getText(notif, "account_id"),
      uii: utils.getText(notif, "uii")
    };
  };
  var ChatCancelledNotification = function() {
  };
  /*
     * External Chat:
     * This class is responsible for processing "CHAT-CANCELLED" packets from IntelliQueue.
     * If an agent is presented a chat and doesn't respond before the timeout, the CHAT-CANCELLED
     * message is sent from IQ.
     *
     *  {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016081611595000289",
     *          "@type":"CHAT-CANCELLED",
     *          "@destination":"IQ",
     *          "@response_to":"",
     *          "account_id":{"#text":"99999999"},
     *          "uii":{"#text":"201608161200240139000000000120"}
     *      }
     *  }
     */
  ChatCancelledNotification.prototype.processResponse = function(notification) {
    var notif = notification.ui_notification;
    return {
      message: "Received CHAT-CANCELLED notification",
      status: "OK",
      messageId: notif['@message_id'],
      accountId: utils.getText(notif, "account_id"),
      uii: utils.getText(notif, "uii")
    };
  };
  var ChatInactiveNotification = function() {
  };
  /*
     * External Chat:
     * This class is responsible for handling "CHAT-INACTIVE" packets from IntelliQueue.
     * This is sent to the agent when the last session is disconnected from a chat.
     *
     *  {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016081611595000289",
     *          "@type":"CHAT-INACTIVE",
     *          "@destination":"IQ",
     *          "@response_to":"",
     *          "account_id":{"#text":"99999999"},
     *          "uii":{"#text":"201608161200240139000000000120"}
     *      }
     *  }
     */
  ChatInactiveNotification.prototype.processResponse = function(notification) {
    var notif = notification.ui_notification;
    return {
      message: "Received CHAT-INACTIVE notification",
      status: "OK",
      accountId: utils.getText(notif, "account_id"),
      uii: utils.getText(notif, "uii")
    };
  };
  var ChatPresentedNotification = function() {
  };
  /*
     * External Chat:
     * This class is responsible for handling "CHAT-PRESENTED" packets from IntelliQueue.
     * When this notification is received, the Agent can either Accept or Decline which will
     * be sent back to IntelliQueue as a CHAT-PRESENTED-RESPONSE.
     *
     *  {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016081611595000289",
     *          "@type":"CHAT-PRESENTED",
     *          "@destination":"IQ",
     *          "@response_to":"",
     *          "chat_queue_id":{"#text":"3"},
     *          "chat_queue_name":{"#text":"Support Chat"},
     *          "account_id":{"#text":"99999999"},
     *          "uii":{"#text":"201608161200240139000000000120"},
     *          "channel_type":{"#text":""}
     *      }
     *  }
     */
  ChatPresentedNotification.prototype.processResponse = function(notification) {
    var notif = notification.ui_notification;
    return {
      message: "Received CHAT-PRESENTED notification",
      status: "OK",
      messageId: notif['@message_id'],
      accountId: utils.getText(notif, "account_id"),
      uii: utils.getText(notif, "uii"),
      channelType: utils.getText(notif, "channel_type"),
      chatQueueId: utils.getText(notif, "chat_queue_id"),
      chatQueueName: utils.getText(notif, "chat_queue_name")
    };
  };
  var ChatTypingNotification = function() {
  };
  /*
     * External Chat:
     * This class is responsible for handling "CHAT-TYPING" packets from IntelliQueue.
     * When this notification is received, the AgentUI will show the pending message
     * so far from the client chat widget and typing notification.
     *
     *  {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016081611595000289",
     *          "@type":"CHAT-TYPING",
     *          "@destination":"IQ",
     *          "@response_to":"",
     *          "uii":{"#text":"201608161200240139000000000120"},
     *          "account_id":{"#text":"99999999"},
     *          "from":{"#text":""},
     *          "message":{"#text":"this is the message before actual send"}
     *      }
     *  }
     */
  ChatTypingNotification.prototype.processResponse = function(notification) {
    var notif = notification.ui_notification;
    return {
      message: "Received CHAT-TYPING notification",
      status: "OK",
      accountId: utils.getText(notif, "account_id"),
      uii: utils.getText(notif, "uii"),
      from: utils.getText(notif, "from"),
      type: utils.getText(notif, "type"),
      pendingMessage: utils.getText(notif, "message")
    };
  };
  var NewChatNotification = function() {
  };
  /*
     * External Chat:
     * This class is responsible for handling "NEW-CHAT" packets from IntelliQueue.
     *
     *  {
     *      "ui_notification":{
     *          "@message_id":"IQ10012016081611595000289",
     *          "@type":"NEW-CHAT",
     *          "@destination":"IQ",
     *          "@response_to":"",
     *          "uii":{"#text":"201608161200240139000000000120"},
     *          "account_id":{"#text":"99999999"},
     *          "session_id":{"#text":"2"},
     *          "agent_id":{"#text":"1180958"},
     *          "queue_dts":{"#text":""},
     *          "queue_time":{"#text":""},
     *          "chat_queue_id":{"#text":""},
     *          "chat_queue_name":{"#text":""},
     *          "chat_requeue_type" : {"#text":""}
     *          "app_url":{"#text":""},
     *          "channel_type":{"#text":""},
     *          "ani":{"#text":""},
     *          "dnis":{"#text":""},
     *          "survey_pop_type":{"#text":""},
     *          "script_id":{"#text":""},
     *          "script_version":{"#text":""},
     *          "requeue_shortcuts":{
     *              "requeue_shortcut":{
     *                  "@chat_queue_id":"2",
     *                  "@name":"test queue",
     *                  "@skill_id":""
     *              }
     *          },
     *          "chat_dispositions":{
     *              "disposition":[
     *                  { "@disposition_id":"2", "@is_success":"true", "@is_complete":"false", "@email_template_id":"1", "#text":"Complete"},
     *                  { "@disposition_id":"3", "@is_success":"true", "@is_complete":"false", "#text":"Requeue"}
     *              ]
     *          },
     *          "chat_requeue_shortcuts" :{
     *              shortcut : [
     *                {@chat_requeue_shortcut_id:"3", @name:"test", @rank:"1",@requeue_chat_queue_id:"74",@skill_id:""}
     *              ]
     *          }
     *          "transcript":{
     *              "message":[
     *                  { "@from":"system", "@type":"SYSTEM", "@dts":"yyyy-MM-dd HH:mm:ss", "#text":"User1 connected"},
     *                  { "@from":"dlbooks", "@type":"AGENT", "@dts":"yyyy-MM-dd HH:mm:ss", "#text":"Hello"},
     *                  { "@from":"user1", "@type":"CLIENT", "@dts":"yyyy-MM-dd HH:mm:ss", "#text":"Hi"}
     *              ]
     *          },
     *          "json_baggage":{"#text":"json_string_form_data"}, <--- pre-form chat data
     *      }
     *  }
     */
  NewChatNotification.prototype.processResponse = function(notification) {
    var notif = notification.ui_notification;
    var dts = utils.getText(notif,'queue_dts');
    dts = new Date(dts.replace(' ','T'));
    // set up new call obj
    var newChat = {
      uii: utils.getText(notif,'uii'),
      accountId: utils.getText(notif,'account_id'),
      sessionId: utils.getText(notif,'session_id'),
      agentId: utils.getText(notif,'agent_id'),
      queueDts: dts,
      queueTime: utils.getText(notif,'queue_time'),
      chatQueueId: utils.getText(notif,'chat_queue_id'),
      chatQueueName: utils.getText(notif,'chat_queue_name'),
      chatRequeueType : utils.getText(notif, 'chat_requeue_type'),
      appUrl: utils.getText(notif,'app_url'),
      channelType: utils.getText(notif,'channel_type'),
      ani: utils.getText(notif,'ani'),
      dnis: utils.getText(notif,'dnis'),
      surveyPopType: utils.getText(notif,'survey_pop_type'),
      scriptId: utils.getText(notif,'script_id'),
      scriptVersion: utils.getText(notif,'script_version'),
      preChatData: utils.getText(notif,'json_baggage')
    };
    newChat.requeueShortcuts = utils.processResponseCollection(notification, 'ui_notification', 'chat_requeue_shortcuts', 'shortcut')[0];
    newChat.chatDispositions = utils.processResponseCollection(notification, 'ui_notification', 'chat_dispositions', 'disposition')[0];
    newChat.transcript = utils.processResponseCollection(notification, 'ui_notification', 'transcript', 'message')[0];
    if(newChat.chatDispositions && newChat.chatDispositions.disposition){
      newChat.chatDispositions.dispositions = [newChat.chatDispositions]
    }else{
      newChat.chatDispositions = newChat.chatDispositions.dispositions;
    }
    if(newChat.transcript && newChat.transcript.message){
      newChat.transcript = [newChat.transcript];
    }else{
      newChat.transcript = newChat.transcript.messages;
    }
    if(newChat.preChatData){
      try {
        newChat.preChatData = JSON.parse(newChat.preChatData);
      }catch(err){
        utils.logMessage(LOG_LEVELS.ERROR, "Error parsing the pre-form chat data.", notif);
      }
    }
    // convert numbers to boolean
    if(newChat.chatDispositions){
      for(var d = 0; d < newChat.chatDispositions.length; d++){
        var disp = newChat.chatDispositions[d];
        disp.isComplete = disp.isComplete === "1";
        disp.isSuccess = disp.isSuccess === "1";
      }
    }
    // convert dates
    if(newChat.transcript){
      for(var t = 0; t < newChat.transcript.length; t++){
        var msg = newChat.transcript[t];
        if(msg.dts){
          msg.dts = new Date(msg.dts.replace(' ','T'));
        }
      }
    }
    // Build token map
    newChat.baggage = buildChatTokenMap(notif, newChat);
    return newChat;
  };
  function buildChatTokenMap(notif, newChat){
    var tokens = {};
    var model = UIModel.getInstance();
    if(newChat.preChatData){
      for(var prop in newChat.preChatData){
        if(newChat.preChatData.hasOwnProperty(prop)){
          tokens[prop] = newChat.preChatData[prop];
        }
      }
    }
    try{
      tokens["chatQueueId"] = newChat.chatQueueId;
      tokens["chatQueueName"] = newChat.chatQueueName;
      tokens["ani"] = newChat.ani;
      tokens["dnis"] = newChat.dnis;
      tokens["uii"] = newChat.uii;
    }catch(any){
      console.error("There was an error parsing chat tokens for basic chat info. ", any);
    }
    try{
      tokens["agentFirstName"] = model.agentSettings.firstName;
      tokens["agentLastName"] = model.agentSettings.lastName;
      tokens["agentExternalId"] = model.agentSettings.externalAgentId;
      tokens["agentType"] = model.agentSettings.agentType;
      tokens["agentEmail"] = model.agentSettings.email;
      tokens["agentUserName"] = model.agentSettings.username;
    }catch(any){
      console.error("There was an error parsing chat tokens for agent info. ", any);
    }
    return tokens;
  }
  var AgentStats = function() {
  };
  /*
     * This class is responsible for handling an Agent Stats packet rec'd from IntelliServices.
     * It will save a copy of it in the UIModel. Could be a single agent or array of agents.
     *
      {"ui_stats":{
           "@type":"AGENT",
           "agent":{
               "@alt":"INBOUND",
               "@atype":"AGENT",
               "@avgtt":"00.0",
               "@calls":"0",
               "@da":"0",
               "@droute":"6789050673",
               "@f":"John",
               "@gdesc":"",
               "@gname":"",
               "@id":"1856",
               "@l":"Doe",
               "@ldur":"6",
               "@ltype":"INBOUND",
               "@oh":"0",
               "@pd":"0",
               "@pres":"0",
               "@rna":"0",
               "@sdur":"6",
               "@sp":"",
               "@state":"AVAILABLE",
               "@ttt":"0",
               "@u":"jdoe",
               "@uii":"",
               "@util":"0.00"
           }
         }
      }
     */
  AgentStats.prototype.processResponse = function(stats) {
    var resp = stats.ui_stats.agent;
    var agentStats = [];
    if(resp && Array.isArray(resp)) {
      for(var i = 0; i < resp.length; i++){
        var a = {
          agentLoginType: resp[i]["@alt"],
          agentType: resp[i]["@atype"],
          avgTalkTime:resp[i]["@avgtt"],
          calls: resp[i]["@calls"],
          isDequeueAgent: resp[i]["@da"],
          defaultRoute: resp[i]["@droute"],
          firstName: resp[i]["@f"],
          queueDesc: resp[i]["@gdesc"],
          queueName: resp[i]["@gname"],
          agentId: resp[i]["@id"],
          lastName: resp[i]["@l"],
          loginDuration: resp[i]["@ldur"],
          loginType: resp[i]["@ltype"],
          offHook: resp[i]["@oh"],
          pendingDisp: resp[i]["@pd"],
          presented: resp[i]["@pres"],
          rna: resp[i]["@rna"],
          stateDuration: resp[i]["@sdur"],
          skillProfileName: resp[i]["@sp"],
          agentState: resp[i]["@state"],
          totalTalkTime: resp[i]["@ttt"],
          username: resp[i]["@u"],
          uii: resp[i]["@uii"],
          utilization: resp[i]["@util"]
        };
        agentStats.push(a);
      }
    }else {
      try {
        var agent = {
          agentLoginType: resp["@alt"],
          agentType: resp["@atype"],
          avgTalkTime: resp["@avgtt"],
          calls: resp["@calls"],
          isDequeueAgent: resp["@da"],
          defaultRoute: resp["@droute"],
          firstName: resp["@f"],
          queueDesc: resp["@gdesc"],
          queueName: resp["@gname"],
          agentId: resp["@id"],
          lastName: resp["@l"],
          loginDuration: resp["@ldur"],
          loginType: resp["@ltype"],
          offHook: resp["@oh"],
          pendingDisp: resp["@pd"],
          presented: resp["@pres"],
          rna: resp["@rna"],
          stateDuration: resp["@sdur"],
          skillProfileName: resp["@sp"],
          agentState: resp["@state"],
          totalTalkTime: resp["@ttt"],
          username: resp["@u"],
          uii: resp["@uii"],
          utilization: resp["@util"]
        };
        agentStats.push(agent);
      }catch(e){
        // do nothing for now
      }
    }
    UIModel.getInstance().agentStats = agentStats;
    return agentStats;
  };
  var AgentDailyStats = function() {
  };
  /*
     * This class is responsible for handling an Agent Daily Stats packet rec'd from IntelliServices.
     * It will save a copy of it in the UIModel.
     *
     * {"ui_stats":{
     *      "@type":"AGENTDAILY",
     *      "agent_id":{"#text":"1180723"},
     *      "total_login_sessions":{"#text":"1"},
     *      "total_calls_handled":{"#text":"0"},
     *      "total_preview_dials":{"#text":"0"},
     *      "total_manual_dials":{"#text":"0"},
     *      "total_rna":{"#text":"0"},
     *      "total_talk_time":{"#text":"0"},
     *      "total_offhook_time":{"#text":"0"},
     *      "total_login_time":{"#text":"7808"},
     *      "total_success_dispositions":{"#text":"0"}
     *    }
     * }
     */
  AgentDailyStats.prototype.processResponse = function(stats) {
    var model = UIModel.getInstance().agentDailyStats;
    var resp = stats.ui_stats;
    model.agentId = utils.getText(resp, "agent_id");
    model.totalLoginSessions = utils.getText(resp, "total_login_sessions");
    model.totalChatsHandled = utils.getText(resp, "total_chats_handled");
    model.totalCallsHandled = utils.getText(resp, "total_calls_handled");
    model.totalPreviewDials = utils.getText(resp, "total_preview_dials");
    model.totalManualDials = utils.getText(resp, "total_manual_dials");
    model.totalRna = utils.getText(resp, "total_rna");
    model.totalSuccessDispositions = utils.getText(resp, "total_success_dispositions");
    if(!model.totalTalkTime) {
      // init daily stats to first stats packet if they don't exist
      model.totalLoginTime = utils.getText(resp, "total_login_time");
      model.totalOffhookTime = utils.getText(resp, "total_offhook_time");
      model.totalTalkTime = utils.getText(resp, "total_talk_time");
      model.currCallTime = "0";
    }
    return model;
  };
  var CampaignStats = function() {
  };
  /*
     * This class is responsible for handling a Campaign Stats packet rec'd from IntelliServices.
     * It will save a copy of it in the UIModel.
     *
     * {"ui_stats":{
     *      "@type":"CAMPAIGN",
     *      "campaign":[
     *          {
     *              "@a":"0","@aba":"0","@an":"0","@av":"0","@b":"0","@c":"1","@e":"0","@f":"0",
     *              "@id":"60275","@int":"0","@m":"0","@na":"0","@name":"Test Campaign",
     *              "@p":"0","@r":"1","@s":"0","@tc":"0","@ttt":"0"
     *          },
     *          {
     *              "@a":"0","@aba":"0","@an":"0","@av":"0","@b":"0","@c":"0","@e":"0","@f":"0",
     *              "@id":"60293","@int":"0","@m":"0","@na":"0","@name":"Test Campaign w\\ Search",
     *              "@p":"0","@r":"19","@s":"0","@tc":"0","@ttt":"0"
     *          }
     *     ],
     *     "totals":{
     *          "noanswer":{"#text":"0"},
     *          "totalConnects":{"#text":"0"},
     *          "pending":{"#text":"0"},
     *          "active":{"#text":"0"},
     *          "error":{"#text":"0"},
     *          "totalTalkTime":{"#text":"0"},
     *          "answer":{"#text":"0"},
     *          "abandon":{"#text":"0"},
     *          "ready":{"#text":"20"},
     *          "machine":{"#text":"0"},
     *          "intercept":{"#text":"0"},
     *          "busy":{"#text":"0"},
     *          "complete":{"#text":"1"},
     *          "fax":{"#text":"0"}
     *     }
     *   }
     * }
     */
  CampaignStats.prototype.processResponse = function(stats) {
    var resp = stats.ui_stats;
    var totals = utils.processResponseCollection(stats,"ui_stats","totals")[0];
    var campaigns = [];
    var campRaw = {};
    var camp = {};
    if(Array.isArray(resp.campaign)){
      for(var c=0; c< resp.campaign.length; c++){
        campRaw = resp.campaign[c];
        if(campRaw){
          camp = {
            active:campRaw["@a"],
            abandon:campRaw["@aba"],
            answer:campRaw["@an"],
            available:campRaw["@av"],
            busy:campRaw["@b"],
            complete:campRaw["@c"],
            error:campRaw["@e"],
            fax:campRaw["@f"],
            campaignId:campRaw["@id"],
            intercept:campRaw["@int"],
            machine:campRaw["@m"],
            noanswer:campRaw["@na"],
            campaignName:campRaw["@name"],
            pending:campRaw["@p"],
            ready:campRaw["@r"],
            staffed:campRaw["@s"],
            totalConnects:campRaw["@tc"],
            totalTalkTime:campRaw["@ttt"]
          };
        }
        campaigns.push(camp);
      }
    }else{
      campRaw = resp.campaign;
      if(campRaw){
        camp = {
          active:campRaw["@a"],
          abandon:campRaw["@aba"],
          answer:campRaw["@an"],
          available:campRaw["@av"],
          busy:campRaw["@b"],
          complete:campRaw["@c"],
          error:campRaw["@e"],
          fax:campRaw["@f"],
          campaignId:campRaw["@id"],
          intercept:campRaw["@int"],
          machine:campRaw["@m"],
          noanswer:campRaw["@na"],
          campaignName:campRaw["@name"],
          pending:campRaw["@p"],
          ready:campRaw["@r"],
          staffed:campRaw["@s"],
          totalConnects:campRaw["@tc"],
          totalTalkTime:campRaw["@ttt"]
        };
      }
      campaigns.push(camp);
    }
    var campaignStats = {
      type:resp["@type"],
      campaigns: campaigns,
      totals:totals
    };
    UIModel.getInstance().campaignStats = campaignStats;
    return campaignStats;
  };
  var ChatQueueStats = function() {
  };
  /*
     * This class is responsible for handling an Chat Stats packet rec'd from IntelliServices.
     * It will save a copy of it in the UIModel.
     *
     *{
     *  "ui_stats": {
     *  "@type": "CHAT",
     *  "chatQueue": [
     *      {
     *          "@active": "1",
     *          "@available": "0",
     *          "@avgAbandon": "00.0",
     *          "@avgChatTime": "00.0",
     *          "@avgQueueTime": "00.0",
     *          "@chatQueueId": "1",
     *          "@chatQueueName": "testing chat quuee",
     *          "@deflected": "0",
     *          "@inQueue": "0",
     *          "@longestInQueue": "0",
     *          "@presented": "0",
     *          "@routing": "0",
     *          "@staffed": "0",
     *          "@totalAbandonTime": "0",
     *          "@totalAnswerTime": "0",
     *          "@totalChatTime": "0",
     *          "@totalQueueTime": "0",
     *          "@utilization": "00.0"
     *      },
     *      {
     *          "@active": "0",
     *          "@available": "0",
     *          "@avgAbandon": "00.0",
     *          "@avgChatTime": "00.0",
     *          "@avgQueueTime": "00.0",
     *          "@chatQueueId": "3",
     *          "@chatQueueName": "testing test",
     *          "@deflected": "0",
     *          "@inQueue": "0",
     *          "@longestInQueue": "0",
     *          "@presented": "0",
     *          "@routing": "0",
     *          "@staffed": "0",
     *          "@totalAbandonTime": "0",
     *          "@totalAnswerTime": "0",
     *          "@totalChatTime": "0",
     *          "@totalQueueTime": "0",
     *          "@utilization": "00.0"
     *      }
     *  ],
     *  "totals": {
     *      "routing": {"#text": "0"},
     *      "ttotalAnswerTime": {"#text": "0"},
     *      "inQueue": { "#text": "0"},
     *      "ttotalChatTime": {"#text": "0"},
     *      "ttotalAbandonTime": {"#text": "0"},
     *      "presented": {"#text": "0},
     *      "accepted": {"#text": "0"},
     *      "deflected": {"#text": "0"},
     *      "active": {"#text": "1"},
     *      "abandoned": {"#text": "0"},
     *      "ttotalQueueTime": {"#text": "0"}
     *   }
     *  }
     *}
     */
  ChatQueueStats.prototype.processResponse = function(stats) {
    var resp = stats.ui_stats;
    var totals = utils.processResponseCollection(stats,"ui_stats","totals")[0];
    var chatQueues = utils.processResponseCollection(stats,"ui_stats","chatQueue");
    var chatQueueStats = {
      type:resp["@type"],
      chatQueues: chatQueues,
      totals:totals
    };
    UIModel.getInstance().chatQueueStats = chatQueueStats;
    return chatQueueStats;
  };
  var QueueStats = function() {
  };
  /*
     * This class is responsible for handling an Queue Stats packet rec'd from IntelliServices.
     * It will save a copy of it in the UIModel.
     *
     * {
     *   "ui_stats":{
     *       "@type":"GATE",
     *       "gate":{
     *           "@aba":"0","@active":"0","@ans":"0","@asa":"00.0","@avail":"2",
     *           "@avga":"00.0","@avgq":"00.0","@avgt":"00.0","@def":"0","@id":"12126",
     *           "@inq":"0","@long_c":"0","@longq":"0","@name":"Cris inbound",
     *           "@pres":"0","@route":"0","@short_aba":"0","@short_c":"0","@sla":"100.0",
     *           "@sla_f":"0","@sla_p":"0","@staff":"2","@t_aba":"0","@t_q":"0","@t_soa":"0","@util":"00.0"
     *       },
     *       "totals":{
     *           "inQueue":{"#text":"0"},
     *           "answered":{"#text":"0"},
     *           "totalABATime":{"#text":"0"},
     *           "active":{"#text":"0"},
     *           "longCall":{"#text":"0"},
     *           "shortCall":{"#text":"0"},
     *           "slaPass":{"#text":"0"},
     *           "totalQueueTime":{"#text":"0"},
     *           "routing":{"#text":"0"},
     *           "totalTalkTime":{"#text":"0"},
     *           "shortAbandon":{"#text":"0"},
     *           "presented":{"#text":"0"},
     *           "totalSOA":{"#text":"0"},
     *           "slaFail":{"#text":"0"},
     *           "deflected":{"#text":"0"},
     *           "abandoned":{"#text":"0"}
     *      }
     *   }
     * }
     */
  QueueStats.prototype.processResponse = function(stats) {
    var resp = stats.ui_stats;
    var totals = utils.processResponseCollection(stats,"ui_stats","totals")[0];
    var queues = [];
    var gate = {};
    var gateRaw = {};
    if(Array.isArray(resp.gate)){
      for(var c=0; c< resp.gate.length; c++){
        gateRaw = resp.gate[c];
        if(gateRaw){
          gate = {
            abandon:gateRaw["@aba"],
            active:gateRaw["@active"],
            answer:gateRaw["@ans"],
            asa:gateRaw["@asa"],
            available:gateRaw["@avail"],
            avgAbandon:gateRaw["@avga"],
            avgQueue:gateRaw["@avgq"],
            avgTalk:gateRaw["@avgt"],
            deflected:gateRaw["@def"],
            queueId:gateRaw["@id"],
            inQueue:gateRaw["@inq"],
            longCall:gateRaw["@long_c"],
            longestInQueue:gateRaw["@longq"],
            queueName:gateRaw["@name"],
            presented:gateRaw["@pres"],
            routing:gateRaw["@route"],
            shortAbandon:gateRaw["@short_aba"],
            shortCall:gateRaw["@short_c"],
            sla:gateRaw["@sla"],
            slaPass:gateRaw["@sla_p"],
            slaFail:gateRaw["@sla_f"],
            staffed:gateRaw["@staff"],
            tAbandonTime:gateRaw["@t_aba"],
            tQueueTime:gateRaw["@t_q"],
            tSpeedOfAnswer:gateRaw["@t_soa"],
            utilization:gateRaw["@util"]
          };
        }
        queues.push(gate);
      }
    }else{
      gateRaw = resp.gate;
      if(gateRaw){
        gate = {
          abandon:gateRaw["@aba"],
          active:gateRaw["@active"],
          answer:gateRaw["@ans"],
          asa:gateRaw["@asa"],
          available:gateRaw["@avail"],
          avgAbandon:gateRaw["@avga"],
          avgQueue:gateRaw["@avgq"],
          avgTalk:gateRaw["@avgt"],
          deflected:gateRaw["@def"],
          queueId:gateRaw["@id"],
          inQueue:gateRaw["@inq"],
          longCall:gateRaw["@long_c"],
          longestInQueue:gateRaw["@longq"],
          queueName:gateRaw["@name"],
          presented:gateRaw["@pres"],
          routing:gateRaw["@route"],
          shortAbandon:gateRaw["@short_aba"],
          shortCall:gateRaw["@short_c"],
          sla:gateRaw["@sla"],
          slaPass:gateRaw["@sla_p"],
          slaFail:gateRaw["@sla_f"],
          staffed:gateRaw["@staff"],
          tAbandonTime:gateRaw["@t_aba"],
          tQueueTime:gateRaw["@t_q"],
          tSpeedOfAnswer:gateRaw["@t_soa"],
          utilization:gateRaw["@util"]
        };
      }
      queues.push(gate);
    }
    var queueStats = {
      type:resp["@type"],
      queues: queues,
      totals:totals
    };
    UIModel.getInstance().queueStats = queueStats;
    return queueStats;
  };
  var UIModel = (function() {
    var instance;
    function init() {
      // Singleton
      // Private methods and variables here //
      //function privateMethod(){
      //    console.log( "I am private" );
      //}
      //
      //var privateVariable = "I'm also private";
      // Public methods and variables
      return {
        currentCall: {},                        // save the NEW-CALL notification in parsed form
        callTokens:{},                          // Stores a map of all tokens for a call
        callbacks:[],
        libraryInstance: null,                  // Initialized to the library instance on startup
        pingIntervalId: null,                   // The id of the timer used to send ping-call messages
        statsIntervalId: null,                  // The id of the timer used to send stats request messages
        agentDailyIntervalId: null,             // The id of the timer used to update some agent daily stats values
        // internal chat requests
        chatAliasRequest : null,
        chatRoomRequest : null,
        chatSendRequest : null,
        supervisorListRequest : null,
        chatRoomStateRequest : new ChatRoomStateRequest(),
        // external chat requests/notifications
        chatActiveNotification : new ChatActiveNotification(),
        chatInactiveNotification : new ChatInactiveNotification(),
        chatDispositionRequest : null,
        chatMessageRequest : new ChatMessageRequest(),
        chatPresentedNotification : new ChatPresentedNotification(),
        chatPresentedRequest : null,
        chatRequeueRequest : null,
        chatTypingNotification : new ChatTypingNotification(),
        chatTypingRequest : null,
        newChatNotification : new NewChatNotification(),
        // request instances
        agentStateRequest : null,
        ackRequest : new AckRequest(),
        bargeInRequest : null,
        callNotesRequest : null,
        callbacksPendingRequest : null,
        campaignDispositionsRequest : null,
        configRequest : null,
        coldXferRequest : null,
        dispositionRequest : null,
        dispositionManualPassRequest : null,
        hangupRequest : null,
        holdRequest : null,
        leadHistoryRequest : null,
        leadInsertRequest : null,
        leadUpdateRequest : null,
        logoutRequest : null,
        loginRequest : null,                // Original LoginRequest sent to IS - used for reconnects
        offhookInitRequest : null,
        offhookTermRequest : null,
        oneToOneOutdialRequest : null,
        oneToOneOutdialCancelRequest : null,
        pauseRecordRequest : null,
        pingCallRequest : null,
        previewDialRequest : null,
        reconnectRequest : null,
        recordRequest : null,
        requeueRequest : null,
        statsRequest : null,
        tcpaSafeRequest : null,
        warmXferRequest : null,
        warmXferCancelRequest : null,
        // response packets
        agentStatePacket : null,
        configPacket : null,
        currentCallPacket : null,
        loginPacket : null,
        offhookInitPacket : null,
        offhookTermPacket : null,
        transferSessions: {},
        // notification packets
        addSessionNotification: new AddSessionNotification(),
        dialGroupChangeNotification : new DialGroupChangeNotification(),
        dialGroupChangePendingNotification : new DialGroupChangePendingNotification(),
        dropSessionNotification: new DropSessionNotification(),
        earlyUiiNotification: new EarlyUiiNotification(),
        endCallNotification : new EndCallNotification(),
        gatesChangeNotification : new GatesChangeNotification(),
        genericNotification : new GenericNotification(),
        newCallNotification: new NewCallNotification(),
        // stats packets
        agentStatsPacket: new AgentStats(),
        agentDailyStatsPacket: new AgentDailyStats(),
        queueStatsPacket: new QueueStats(),
        campaignStatsPacket: new CampaignStats(),
        chatQueueStatsPacket: new ChatQueueStats(),
        // application state
        applicationSettings : {
          availableCountries : [],
          isLoggedInIS : false,               // a check for whether or not user is logged in with IntelliServices
          socketConnected : false,
          socketDest : "",
          isTcpaSafeMode : false             // Comes in at the account-level - will get set to true if this interface should be in tcpa-safe-mode only.
        },
        // stat objects
        agentStats:[],
        agentDailyStats: {},
        campaignStats:{},
        queueStats:{},
        chatQueueStats:{},
        // current agent settings
        agentSettings : {
          accountId: null,                    // account agent belongs to
          agentId : 0,
          agentType : "AGENT",                // AGENT | SUPERVISOR
          altDefaultLoginDest : "",
          availableAgentStates : [],
          callerIds : [],
          callState: null,                     // display the current state of the call
          currentState : "OFFLINE",           // Agent system/base state
          currentStateLabel : "",             // Agent aux state label
          defaultLoginDest : "",
          dialDest : "",                      // Destination agent is logged in with for offhook session, set on configure response, if multi values in format "xxxx|,,xxxx"
          email : "",
          externalAgentId : "",
          firstName : "",
          guid: "",                           // unique key generated on login, used for accessing spring endpoints
          isLoggedIn : false,                 // agent is logged in to the platform
          isOffhook : false,                  // track whether or not the agent has an active offhook session
          initLoginState : "AVAILABLE",       // state agent is placed in on successful login
          initLoginStateLabel : "Available",  // state label for agent on successful login
          isOutboundPrepay : false,           // determines if agent is a prepay agent
          lastName : "",
          loginDTS : null,                    // date and time of the final login phase (IQ)
          loginType : "NO-SELECTION",         // Could be INBOUND | OUTBOUND | BLENDED | NO-SELECTION, set on login response
          maxBreakTime : -1,
          maxLunchTime : -1,
          onCall : false,                     // true if agent is on an active call
          onManualOutdial : false,            // true if agent is on a manual outdial call
          outboundManualDefaultRingtime : "30",
          pendingCallbacks : [],
          pendingDialGroupChange: 0,          // Set to Dial Group Id if we are waiting to change dial groups until agent ends call
          phoneLoginPin: "",
          realAgentType : "AGENT",
          supervisors : [],                   // Used for agent chat
          totalCalls : 0,                     // Call counter that is incremented every time a new session is received
          transferNumber : "",                // May be pre-populated by an external interface, if so, the transfer functionality uses it
          updateDGFromAdminUI : false,        // if pending Dial Group change came from AdminUI, set to true (only used if request is pending)
          updateLoginMode : false,            // gets set to true when doing an update login (for events control)
          username : "",                      // Agent's username
          wasMonitoring : false               // used to track if the last call was a monitoring call
        },
        // current agent permissions
        agentPermissions : {
          allowBlended : true,                // Controls whether or not the agent can log into both inbound queues and an outbound dialgroup
          allowCallControl : true,            // Set from the the login response packet
          allowChat : false,                  // Controls whether or not the agent has the option to open the Chat Queue Manager
          allowCrossQueueRequeue : false,     // Controls whether or not the agent can requeue to a different queue group
          allowInbound : true,                // Controls whether or not the agent can log into an inbound queue
          allowLeadInserts : false,           // Controls whether or not the agents can insert leads
          allowLeadSearch : false,            // Controlled by the dial-group allow_lead_search setting. Enables or disables the lead search
          allowLoginControl : true,           // Controls whether or not the agent can log in
          allowLoginUpdates : true,           // Controls whether or not the agent can update their login
          allowManualCalls : true,            // Controls whether or not the agents have the option to make a manual outbound call
          allowManualPass : true,             // Controls whether or not the agent has the option to make a manual pass on a lead
          allowManualIntlCalls : false,       // Controls whether or not the agent has the option to make international manual outbound calls
          allowManualOutboundGates : false,   // Controls whether or not the agent has the option to select queues to convert manual outbound calls to
          allowOffHook : true,                // Controls whether or not the agents can go offhook
          allowOutbound : true,               // Controls whether or not the agent can log into an outdial group
          allowPreviewLeadFilters : false,    // Controlled by the dial-group allow_preview_lead_filters setting. Enables or disables the filters on the preview style forms
          allowLeadUpdatesByCampaign : {},    // For each campaign ID, store whether leads can be updated
          disableSupervisorMonitoring : true, // Controls whether or not a supervisor can view agent stats
          progressiveEnabled : false,         // Preview dial feature that enables auto-calls from the preview window.
          requireFetchedLeadsCalled : false,  // Controlled by the dial-group require_fetched_leads_called setting. Enables or disables the requirement to only fetch new leads when current leads are called or expired. ONly for Preview or TCPA-SAFE.
          showLeadHistory : true              // Controls whether or not the agents can view lead history
        },
        // chat
        chatSettings :{
          availableChatQueues : [],           // List of all chat queues agent has access to, set on login
          availableChatRooms : [],            // List of all chat rooms agent has access to, set on login
          chatQueues : [],                    // Array of chat queues agent is signed into
          alias : ""                          // Chat alias, on-login this is the UID, but is changed if the user changes it
        },
        // connection objects
        connectionSettings : {
          hashCode : null,                    // used specifically for reconnects
          reconnect : false                   // variable tracks the type of login, on init it's false...once connected it's set to true
        },
        // inbound settings
        inboundSettings : {
          availableQueues : [],               // array of queues agent has access to, set on login
          availableSkillProfiles : [],        // array of skill profiles agent has access to, set on login
          queues : [],                        // array of queues agent is signed into, set on config response
          skillProfile : {}                   // The skill profile the agent is signed into, set on config response
        },
        // outbound settings
        outboundSettings : {
          availableCampaigns : [],            // array of campaigns agent has access to, set on login
          availableOutdialGroups : [],        // array of dial groups agent has access to, set on login
          insertCampaigns : [],
          defaultDialGroup: 0,
          outdialGroup : {},                  // dial group agent is signed into
          previewDialLeads : [],              // list of leads returned from preview dial request
          tcpaSafeLeads : [],                 // list of leads returned from tcpa safe request
          campaignDispositions : []           // list of campaign dispositions for specific campaign
        },
        scriptSettings : {
          availableScripts : [],              // array of all scripts associated with any campaigns or queues agent is logged into
          loadedScripts: {}                   // stores script data by script id e.g. {1:{}, 32:{}}
        },
        // Public methods
        incrementTotalCalls: function() {
          this.agentSettings.totalCalls = this.agentSettings.totalCalls + 1;
        }
      };
    }
    return {
      // Get the Singleton instance if one exists
      // or create one if it doesn't
      getInstance: function () {
        if (!instance) {
          instance = init();
        }
        return instance;
      },
      resetInstance: function () {
        instance = null;
      }
    };
  })();
  var utils = {
    logMessage: function(logLevel, message, data){
      var instance = UIModel.getInstance().libraryInstance;
      if(instance._db){
        var transaction = instance._db.transaction(["logger"], "readwrite");
        var store = transaction.objectStore("logger");
        var record = {
          logLevel: logLevel,
          message: message,
          dts: new Date(),
          data: data
        };
        var request = store.add(record);
      }else{
        //console.log("AgentLibrary: indexedDb not available");
      }
    },
    sendMessage: function(instance, msg) {
      var msgObj = JSON.parse(msg);
      if (instance.socket && instance.socket.readyState === 1) {
        // add message id to request map, then send message
        var type = msgObj.ui_request['@type'];
        var destination = msgObj.ui_request['@destination'];
        var message = "Sending " + type + " request message to " + destination;
        instance._requests.push({ id: msgObj.ui_request['@message_id'], type: msgObj.ui_request['@type'], msg: msgObj.ui_request });
        // keep rolling window of latest 1000 requests
        if(instance._requests.length > 1000){
          instance._requests.shift();
        }
        instance.socket.send(msg);
        if(type === 'STATS'){
          utils.logMessage(LOG_LEVELS.STATS, message, msgObj);
        }else{
          utils.logMessage(LOG_LEVELS.INFO, message, msgObj);
        }
      } else {
        // add message to queue
        instance._queuedMsgs.push({dts: new Date(), msg: msg});
        if(UIModel.getInstance().agentSettings.isLoggedIn){
          // try to reconnect
          instance._isReconnect = true;
          instance.openSocket();
          console.warn("AgentLibrary: WebSocket is not connected, attempting to reconnect.");
        }
      }
    },
    processResponse: function(instance, response)
    {
      var type = response.ui_response['@type'];
      var messageId = response.ui_response['@message_id'];
      var dest = (messageId === "" || !messageId) ? "IS" : messageId.slice(0, 2);
      var message = "Received " + type.toUpperCase() + " response message from " + dest;
      // log message response
      utils.logMessage(LOG_LEVELS.INFO, message, response);
      // Send generic on message response
      utils.fireCallback(instance, CALLBACK_TYPES.ON_MESSAGE, response);
      // Fire callback function
      switch (type.toUpperCase()) {
        case MESSAGE_TYPES.AGENT_STATE:
          if (UIModel.getInstance().agentStateRequest === null) {
            UIModel.getInstance().agentStateRequest = new AgentStateRequest(response.ui_response.current_state["#text"], response.ui_response.agent_aux_state['#text']);
          }
          var stateChangeResponse = UIModel.getInstance().agentStateRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.AGENT_STATE, stateChangeResponse);
          break;
        case MESSAGE_TYPES.BARGE_IN:
          var resp = UIModel.getInstance().bargeInRequest.processResponse(response);
          var responseTo = response.ui_response['@response_to'];
          var request = utils.findRequestById(instance, responseTo);
          if (request) {
            // found corresponding request, fire registered callback for type
            var audioState = request.msg.audio_state['#text'];
            if (audioState === "MUTE") {
              utils.fireCallback(instance, CALLBACK_TYPES.SILENT_MONITOR, resp);
            } else if (audioState === "COACHING") {
              utils.fireCallback(instance, CALLBACK_TYPES.COACH_CALL, resp);
            } else {
              utils.fireCallback(instance, CALLBACK_TYPES.BARGE_IN, resp);
            }
          } else {
            // no corresponding request, just fire FULL audio type BARGE-IN callback
            utils.fireCallback(instance, CALLBACK_TYPES.BARGE_IN, resp);
          }
          break;
        case MESSAGE_TYPES.CAMPAIGN_DISPOSITIONS:
          var campaignDispsResposne = UIModel.getInstance().campaignDispositionsRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.CAMPAIGN_DISPOSITIONS, campaignDispsResposne);
          break;
        case MESSAGE_TYPES.CALL_NOTES:
          var callNotes = UIModel.getInstance().callNotesRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.CALL_NOTES, callNotes);
          break;
        case MESSAGE_TYPES.CALLBACK_PENDING:
          var pendingCallbacks = UIModel.getInstance().callbacksPendingRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.CALLBACK_PENDING, pendingCallbacks);
          break;
        case MESSAGE_TYPES.HOLD:
          var holdRequest;
          if(UIModel.getInstance().holdRequest === null){
            holdRequest = new HoldRequest();
          }else{
            holdRequest = UIModel.getInstance().holdRequest;
          }
          var hold = holdRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.HOLD, hold);
          break;
        case MESSAGE_TYPES.LEAD_HISTORY:
          var history = UIModel.getInstance().leadHistoryRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.LEAD_HISTORY, history);
          break;
        case MESSAGE_TYPES.LEAD_INSERT:
          var insert = UIModel.getInstance().leadInsertRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.LEAD_INSERT, insert);
          break;
        case MESSAGE_TYPES.LEAD_UPDATE:
          var update = UIModel.getInstance().leadUpdateRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.LEAD_UPDATE, update);
          break;
        case MESSAGE_TYPES.LOGIN:
          if (dest === "IS") {
            var loginResponse = UIModel.getInstance().loginRequest.processResponse(response);
            utils.fireCallback(instance, CALLBACK_TYPES.LOGIN, loginResponse);
          } else if (dest === 'IQ') {
            var configResponse = UIModel.getInstance().configRequest.processResponse(response);
            utils.fireCallback(instance, CALLBACK_TYPES.CONFIG, configResponse);
            if (configResponse.status === "SUCCESS") {
              // start stats interval timer, request stats every 5 seconds
              UIModel.getInstance().statsIntervalId = setInterval(utils.sendStatsRequestMessage, 5000);
            }
          }
          break;
        case MESSAGE_TYPES.LOGOUT:
          // TODO add processResponse?
          utils.fireCallback(instance, CALLBACK_TYPES.LOGOUT, response);
          break;
        case MESSAGE_TYPES.OFFHOOK_INIT:
          var offhook = new OffhookInitRequest();
          var initResponse = offhook.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.OFFHOOK_INIT, initResponse);
          break;
        case MESSAGE_TYPES.PAUSE_RECORD:
          var pauseRequest;
          if(UIModel.getInstance().pauseRecordRequest === null){
            pauseRequest = new PauseRecordRequest();
          }else{
            pauseRequest = UIModel.getInstance().pauseRecordRequest;
          }
          var pauseRec = pauseRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.PAUSE_RECORD, pauseRec);
          break;
        case MESSAGE_TYPES.RECORD:
          var record = UIModel.getInstance().recordRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.RECORD, record);
          break;
        case MESSAGE_TYPES.REQUEUE:
          var requeue = UIModel.getInstance().requeueRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.REQUEUE, requeue);
          break;
        case MESSAGE_TYPES.SUPERVISOR_LIST:
          var supervisorList = UIModel.getInstance().supervisorListRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.SUPERVISOR_LIST, supervisorList);
          break;
        case MESSAGE_TYPES.SCRIPT_CONFIG:
          var script = UIModel.getInstance().scriptConfigRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.SCRIPT_CONFIG, script);
          break;
        case MESSAGE_TYPES.XFER_COLD:
          var coldXfer = UIModel.getInstance().coldXferRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.XFER_COLD, coldXfer);
          break;
        case MESSAGE_TYPES.XFER_WARM:
          var warmXfer = UIModel.getInstance().warmXferRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.XFER_WARM, warmXfer);
          break;
        case MESSAGE_TYPES.XFER_WARM_CANCEL:
          var warmXferCancel = UIModel.getInstance().warmXferCancelRequest.processResponse(response);
          utils.fireCallback(instance, CALLBACK_TYPES.XFER_WARM_CANCEL, warmXferCancel);
          break;
        case MESSAGE_TYPES.ACK:
          var ack = UIModel.getInstance().ackRequest.processResponse(response);
          var responseTo = response.ui_response['@response_to'];
          var request = utils.findRequestById(instance, responseTo);
          ack.uii = request.msg.uii["#text"];
          utils.fireCallback(instance, CALLBACK_TYPES.ACK, ack);
          break;
      }
    },
    processNotification: function(instance, data){
      var type = data.ui_notification['@type'];
      var messageId = data.ui_notification['@message_id'];
      var dest = messageId === "" ? "IS" : messageId.slice(0, 2);
      var message = "Received " + type.toUpperCase() + " notification message from " + dest;
      // log message response
      utils.logMessage(LOG_LEVELS.INFO, message, data);
      switch (type.toUpperCase()){
        case MESSAGE_TYPES.ADD_SESSION:
          var addSesNotif = new AddSessionNotification();
          var addResponse = addSesNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.ADD_SESSION, addResponse);
          break;
        case MESSAGE_TYPES.DIAL_GROUP_CHANGE:
          var dgChangeNotif = new DialGroupChangeNotification();
          var changeResponse = dgChangeNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.DIAL_GROUP_CHANGE, changeResponse);
          break;
        case MESSAGE_TYPES.DIAL_GROUP_CHANGE_PENDING:
          var dgChangePendNotif = new DialGroupChangePendingNotification();
          var pendResponse = dgChangePendNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.DIAL_GROUP_CHANGE_PENDING, pendResponse);
          break;
        case MESSAGE_TYPES.DROP_SESSION:
          var dropSesNotif = new DropSessionNotification(instance);
          var dropSesResponse = dropSesNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.DROP_SESSION, dropSesResponse);
          break;
        case MESSAGE_TYPES.EARLY_UII:
          var earlyUiiNotif = new EarlyUiiNotification(instance);
          var earlyUiiResponse = earlyUiiNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.EARLY_UII, earlyUiiResponse);
          break;
        case MESSAGE_TYPES.END_CALL:
          var endCallNotif = new EndCallNotification(instance);
          var endCallResponse = endCallNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.END_CALL, endCallResponse);
          break;
        case MESSAGE_TYPES.GATES_CHANGE:
          var gateChangeNotif = new GatesChangeNotification();
          var gateChangeResponse = gateChangeNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.GATES_CHANGE, gateChangeResponse);
          break;
        case MESSAGE_TYPES.GENERIC:
          var genericNotif = new GenericNotification();
          var generic = genericNotif.processResponse(data);
          var responseTo = data.ui_notification['@response_to'];
          var request = utils.findRequestById(instance, responseTo);
          if(request){
            // found corresponding request, fire registered callback for type
            var type = request.type;
            var callbackFnName = utils.findCallbackBasedOnMessageType(type);
            if(callbackFnName){
              if(type === MESSAGE_TYPES.CALLBACK_CANCEL){
                generic.leadId = request.msg.lead_id["#text"];
              }
              utils.fireCallback(instance, callbackFnName, generic);
            }else{
              // no registered callback, fallback to generic notification
              utils.fireCallback(instance, CALLBACK_TYPES.GENERIC_NOTIFICATION, generic);
            }
          }else{
            // no corresponding request, just fire generic notification callback
            utils.fireCallback(instance, CALLBACK_TYPES.GENERIC_NOTIFICATION, generic);
          }
          break;
        case MESSAGE_TYPES.NEW_CALL:
          var newCallNotif = new NewCallNotification();
          var newCallResponse = newCallNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.NEW_CALL, newCallResponse);
          break;
        case MESSAGE_TYPES.OFFHOOK_TERM:
          if(UIModel.getInstance().offhookTermRequest === null){
            // offhook term initiated by IQ
            UIModel.getInstance().offhookTermRequest = new OffhookTermRequest();
          }
          var termResponse = UIModel.getInstance().offhookTermRequest.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.OFFHOOK_TERM, termResponse);
          break;
        case MESSAGE_TYPES.PREVIEW_LEAD_STATE:
          var leadStateNotif = new PreviewLeadStateNotification();
          var leadStateResponse = leadStateNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.PREVIEW_LEAD_STATE, leadStateResponse);
          break;
        case MESSAGE_TYPES.PENDING_DISP:
          var pendingDispNotif = new PendingDispNotification();
          var pendingDispResponse = pendingDispNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.PENDING_DISP, pendingDispResponse);
          break;
        case MESSAGE_TYPES.REVERSE_MATCH:
          var reverseMatchNotif = new ReverseMatchNotification();
          var reverseMatchResponse = reverseMatchNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.REVERSE_MATCH, reverseMatchResponse);
          break;
        case MESSAGE_TYPES.TCPA_SAFE_LEAD_STATE:
          var leadStateTcpaNotif = new TcpaSafeLeadStateNotification();
          var leadStateTcpaResponse = leadStateTcpaNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.TCPA_SAFE_LEAD_STATE, leadStateTcpaResponse);
          break;
        case MESSAGE_TYPES.CHAT_ACTIVE:
          var activeNotif = new ChatActiveNotification();
          var activeResponse = activeNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.CHAT_ACTIVE, activeResponse);
          break;
        case MESSAGE_TYPES.CHAT_INACTIVE:
          var inactiveNotif = new ChatInactiveNotification();
          var inactiveResponse = inactiveNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.CHAT_INACTIVE, inactiveResponse);
          break;
        case MESSAGE_TYPES.CHAT_PRESENTED:
          var presentedNotif = new ChatPresentedNotification();
          var presentedResponse = presentedNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.CHAT_PRESENTED, presentedResponse);
          break;
        case MESSAGE_TYPES.CHAT_TYPING:
          var typingNotif = new ChatTypingNotification();
          var typingResponse = typingNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.CHAT_TYPING, typingResponse);
          break;
        case MESSAGE_TYPES.CHAT_NEW:
          var newChatNotif = new NewChatNotification();
          var newChatResponse = newChatNotif.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.CHAT_NEW, newChatResponse);
          break;
        case MESSAGE_TYPES.CHAT_MESSAGE:
          var chatMessage = new ChatMessageRequest();
          var chatMessageResponse = chatMessage.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.CHAT_MESSAGE, chatMessageResponse);
          break;
        case MESSAGE_TYPES.CHAT_CANCELLED:
          var chatCancelled = new ChatCancelledNotification();
          var chatCancelledResponse = chatCancelled.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.CHAT_CANCELLED, chatCancelledResponse);
          break;
        case MESSAGE_TYPES.MONITOR_CHAT:
          //TODO: do this
          break;
        case MESSAGE_TYPES.LEAVE_CHAT:
          //TODO: do this
          break;
        case MESSAGE_TYPES.CHAT_LIST:
          //TODO: do this
          break;
      }
    },
    processDialerResponse: function(instance, response) {
      var type = response.dialer_request['@type'];
      var messageId = response.dialer_request['@message_id'];
      var dest = messageId === "" ? "IS" : messageId.slice(0, 2);
      var message = "Received " + type.toUpperCase() + " dialer response message from " + dest;
      // log message response
      utils.logMessage(LOG_LEVELS.INFO, message, response);
      // Send generic on message response
      utils.fireCallback(instance, CALLBACK_TYPES.ON_MESSAGE, response);
      // Fire callback function
      switch (type.toUpperCase()) {
        case MESSAGE_TYPES.PREVIEW_DIAL_ID:
          var pdRequest = new PreviewDialRequest();
          var dialResponse = pdRequest.processResponse(response);
          if(dialResponse.action.toUpperCase() === "SEARCH"){
            utils.fireCallback(instance, CALLBACK_TYPES.LEAD_SEARCH, dialResponse);
          }else{
            utils.fireCallback(instance, CALLBACK_TYPES.PREVIEW_FETCH, dialResponse);
          }
          break;
        case MESSAGE_TYPES.TCPA_SAFE_ID:
          var tcpaRequest = new TcpaSafeRequest();
          var tcpaResponse = tcpaRequest.processResponse(response);
          if(tcpaResponse.action.toUpperCase() === "SEARCH"){
            utils.fireCallback(instance, CALLBACK_TYPES.SAFE_MODE_SEARCH, tcpaResponse);
          }else{
            utils.fireCallback(instance, CALLBACK_TYPES.SAFE_MODE_FETCH, tcpaResponse);
          }
          break;
      }
    },
    processRequest: function(instance, message) {
      var type = message.ui_request['@type'];
      // Fire callback function
      switch (type.toUpperCase()) {
        case MESSAGE_TYPES.CHAT_SEND:
          var chatSendRequest = new ChatSendRequest();
          var chatSendResponse = chatSendRequest.processResponse(message);
          utils.fireCallback(instance, CALLBACK_TYPES.CHAT, chatSendResponse);
          break;
        case MESSAGE_TYPES.CHAT_ROOM_STATE:
          var chatRoomStateRequest = new ChatRoomStateRequest();
          var chatRoomStateResponse = chatRoomStateRequest.processResponse(message);
          utils.fireCallback(instance, CALLBACK_TYPES.CHAT_ROOM_STATE, chatRoomStateResponse);
          break;
      }
    },
    processStats: function(instance, data) {
      var type = data.ui_stats['@type'];
      var message = "Received " + type.toUpperCase() + " response message from IS";
      // log message response
      utils.logMessage(LOG_LEVELS.STATS, message, data);
      // Fire callback function
      switch (type.toUpperCase()) {
        case MESSAGE_TYPES.STATS_AGENT:
          var agentStats = UIModel.getInstance().agentStatsPacket.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.STATS_AGENT, agentStats);
          break;
        case MESSAGE_TYPES.STATS_AGENT_DAILY:
          var agentDailyStats = UIModel.getInstance().agentDailyStatsPacket.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.STATS_AGENT_DAILY, agentDailyStats);
          // start daily stats interval timer, request update every second
          if(UIModel.getInstance().agentDailyIntervalId === null){
            UIModel.getInstance().agentDailyIntervalId = setInterval(utils.onAgentDailyStats, 1000);
          }
          break;
        case MESSAGE_TYPES.STATS_CAMPAIGN:
          var campaignStats = UIModel.getInstance().campaignStatsPacket.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.STATS_CAMPAIGN, campaignStats);
          break;
        case MESSAGE_TYPES.STATS_QUEUE:
          var queueStats = UIModel.getInstance().queueStatsPacket.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.STATS_QUEUE, queueStats);
          break;
        case MESSAGE_TYPES.STATS_CHAT:
          var chatStats = UIModel.getInstance().chatQueueStatsPacket.processResponse(data);
          utils.fireCallback(instance, CALLBACK_TYPES.STATS_CHAT_QUEUE, chatStats);
          break;
      }
    },
    /*
         * Take the xml marked JSON, group and item property names and reformat to
         * simple javascript object without the xml markers.
         * Will work recursively down the tree on nested objects and arrays.
         *
         * example of acceptable response tree (groupProp = requeue_gates, itemProp = gate_group):
         *   "requeue_gates": {
         *       "gate_group": [
         *           {
         *               "@gate_group_id": "4",
         *               "@group_name": "Test Gate Group",
         *               "gates": {
         *                   "gate": [
         *                       {
         *                           "@gate_desc": "",
         *                           "@gate_id": "10951",
         *                           "@gate_name": "CD ACD Queue"
         *                       },
         *                       {
         *                           "@gate_desc": "",
         *                           "@gate_id": "11036",
         *                           "@gate_name": "Xerox Test Gate"
         *                       }
         *                   ]
         *               },
         *               "skills": {
         *                   "skill": [
         *                       {
         *                           "@skill_desc": "",
         *                           "@skill_id": "322",
         *                           "@skill_name": "English"
         *                       },
         *                       {
         *                           "@skill_desc": "",
         *                           "@skill_id": "323",
         *                           "@skill_name": "Spanish"
         *                       }
         *                   ]
         *               }
         *           },
         *           {
         *               "@gate_group_id": "14292",
         *               "@group_name": "New Test Group",
         *               "gates": {
         *                   "gate": {
         *                       "@gate_desc": "",
         *                       "@gate_id": "15535",
         *                       "@gate_name": "New Test Gate"
         *                   }
         *               },
         *               "skills": {
         *                   "skill": {
         *                       "@skill_desc": "",
         *                       "@skill_id": "1658",
         *                       "@skill_name": "new skill"
         *                   }
         *               }
         *           }
         *       ]
         *   }
         *
         *   OR
         *
         *   "outdial_dispositions": {
         *       "@type": "GATE",
         *       "disposition": [
         *          {
         *           "@contact_forwarding": "false",
         *           "@disposition_id": "926",
         *           "@is_complete": "1",
         *           "@require_note": "0",
         *           "@save_survey": "1",
         *           "@xfer": "0",
         *           "#text": "One B"
         *          },
         *          {
         *           "@contact_forwarding": "false",
         *           "@disposition_id": "926",
         *           "@is_complete": "1",
         *           "@require_note": "0",
         *           "@save_survey": "1",
         *           "@xfer": "0",
         *           "#text": "One B"
         *          }
         *      ]
         *   }
         *
         *   OR
         *
         *   "outdial_dispositions": {
         *       "@type": "GATE",
         *       "disposition": {
         *          {
         *           "@contact_forwarding": "false",
         *           "@disposition_id": "926",
         *           "@is_complete": "1",
         *           "@require_note": "0",
         *           "@save_survey": "1",
         *           "@xfer": "0",
         *           "#text": "One B"
         *          }
         *      }
         *   }
         */
    processResponseCollection: function(response, groupProp, itemProp, textName) {
      var items = [];
      var item = {};
      var itemsRaw = [];
      var textName = textName || "text";
      if(response[groupProp] && typeof response[groupProp][itemProp] !== 'undefined'){
        itemsRaw = response[groupProp][itemProp];
      }
      if(Array.isArray(itemsRaw)) {
        // multiple items
        for (var i = 0; i < itemsRaw.length; i++) {
          var formattedKey = "";
          for(var key in itemsRaw[i]){
            if(key.match(/^#/)){
              // dealing with text property
              formattedKey = textName;
            }else{
              // dealing with attribute
              formattedKey = key.replace(/@/, ''); // remove leading '@'
              formattedKey = formattedKey.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); }); // convert to camelCase
            }
            if(typeof itemsRaw[i][key] === "object"){
              if(Object.keys(itemsRaw[i][key]).length === 1 && itemsRaw[i][key]['#text']) {
                // only one property - #text attribute
                item[formattedKey] = itemsRaw[i][key]['#text'];
              }else if(Object.keys(itemsRaw[i][key]).length === 0){
                // dealing with empty property
                item[formattedKey] = "";
              }else {
                // make recursive call
                if(Array.isArray(itemsRaw[key]) || Object.keys(itemsRaw[i][key]).length > 1){
                  var newIt = [];
                  newIt = utils.processResponseCollection(response[groupProp], itemProp, key, textName);
                  if(formattedKey.substr(formattedKey.length - 1) !== 's') {
                    item[formattedKey + 's'] = newIt;
                  }else{
                    item[formattedKey] = newIt;
                  }
                }else{
                  var newItemProp = Object.keys(itemsRaw[i][key])[0];
                  var newItems = [];
                  newItems = utils.processResponseCollection(itemsRaw[i], key, newItemProp);
                  item[formattedKey] = newItems;
                }
              }
            }else{
              // can't convert 0 | 1 to boolean since some are counters
              if(itemsRaw[i][key].toUpperCase() === "TRUE"){
                item[formattedKey] = true;
              }else if(itemsRaw[i][key].toUpperCase() === "FALSE"){
                item[formattedKey] = false;
              }else{
                item[formattedKey] = itemsRaw[i][key];
              }
            }
          }
          items.push(item);
          item = {};
        }
      }else{
        // single item
        var formattedProp = "";
        for(var prop in itemsRaw){
          if(prop.match(/^#/)) {
            // dealing with text property
            formattedProp = textName;
          }else{
            // dealing with attribute
            formattedProp = prop.replace(/@/, ''); // remove leading '@'
            formattedProp = formattedProp.replace(/_([a-z])/g, function (g) {
              return g[1].toUpperCase();
            }); // convert to camelCase
          }
          if(typeof itemsRaw[prop] === "object"){
            if(itemsRaw[prop]['#text'] && Object.keys(itemsRaw[prop]).length === 1) {
              // dealing only with #text element
              item[formattedProp] = itemsRaw[prop]['#text'];
            }else if(Object.keys(itemsRaw[prop]).length === 0){
              // dealing with empty property
              item[formattedProp] = "";
            }else{
              // make recursive call
              if(Array.isArray(itemsRaw[prop]) || Object.keys(itemsRaw[prop]).length > 1){
                var newIt = [];
                newIt = utils.processResponseCollection(response[groupProp], itemProp, prop, textName);
                if(formattedProp.substr(formattedProp.length - 1) !== 's'){
                  item[formattedProp + 's'] = newIt;
                }else{
                  item[formattedProp] = newIt;
                }
              }else {
                var newProp = Object.keys(itemsRaw[prop])[0];
                var newItms = [];
                newItms = utils.processResponseCollection(itemsRaw, prop, newProp);
                item[formattedProp] = newItms;
              }
            }
          }else{
            // can't convert 0 | 1 to boolean since some are counters
            if(itemsRaw[prop].toUpperCase() === "TRUE"){
              item[formattedProp] = true;
            }else if(itemsRaw[prop].toUpperCase() === "FALSE"){
              item[formattedProp] = false;
            }else {
              item[formattedProp] = itemsRaw[prop];
            }
          }
        }
        items.push(item);
      }
      return items;
    },
    fireCallback: function(instance, type, response) {
      response = response || "";
      if (typeof type !== 'undefined' && typeof instance.callbacks[type] === 'function') {
        instance.callbacks[type].call(instance, response);
      }
    },
    setCallback: function(instance, type, callback) {
      if (typeof type !== 'undefined' && typeof callback !== 'undefined') {
        instance.callbacks[type] = callback;
      }
    },
    getMessageId: function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    },
    // check whether the given array of ids exist in the given array of objects
    // if not available, remove the id
    // returns the clean list of acceptable ids
    checkExistingIds: function(objArray, idArray, idProperty) {
      var availIds = [];
      var removeIds = [];
      // get list of available ids
      for(var o = 0; o < objArray.length; o++){
        availIds.push(parseInt(objArray[o][idProperty], 10));
      }
      // go through selected ids and mark unfound ones for removal
      for(var i = 0; i < idArray.length; i++){
        if(availIds.indexOf(parseInt(idArray[i],10)) === -1){
          // selected id not found in available list, mark for removal
          removeIds.push(parseInt(idArray[i],10));
        }
      }
      // remove marked ids
      for(var r = idArray.length -1; r >= 0; r--){
        if(removeIds.indexOf(parseInt(idArray[r],10)) > -1){
          // remove
          idArray.splice(r,1);
        }
      }
      return idArray;
    },
    // find an object by given id in an array of objects
    findObjById: function(objArray, id, propName) {
      for(var o = 0; o < objArray.length; o++){
        var obj = objArray[o];
        if(obj[propName] === id){
          return obj;
        }
      }
      return null;
    },
    // check whether agent dialDest is either a 10-digit number or valid sip
    validateDest: function(dialDest) {
      var isValid = false;
      var isNum = /^\d+$/.test(dialDest);
      if(isNum && dialDest.length === 10){
        // is a 10-digit number
        isValid = true;
      }else if(dialDest.slice(0,4).toLowerCase() === "sip:" && dialDest.indexOf("@") !== -1){
        // has sip prefix and '@'
        isValid = true;
      }
      return isValid;
    },
    // pass in MESSAGE_TYPE string (e.g. "CANCEL-CALLBACK"),
    // return corresponding CALLBACK_TYPE function name string (e.g. "callbackCancelResponse")
    findCallbackBasedOnMessageType: function(messageType) {
      var callbackFnName = "";
      for(var key in MESSAGE_TYPES){
        if(MESSAGE_TYPES[key] === messageType){
          callbackFnName = CALLBACK_TYPES[key];
        }
      }
      return callbackFnName;
    },
    // add message, detail, and status values to the formattedResponse
    // returned from each request processResponse method
    buildDefaultResponse: function(response) {
      var message = "";
      var detail = "";
      var status = "";
      var msg = "";
      var det = "";
      var stat = "";
      // add message and detail if present
      if(response.ui_response){
        msg = response.ui_response.message;
        det = response.ui_response.detail;
        stat = response.ui_response.status;
      }else if(response.ui_notification){
        msg = response.ui_notification.message;
        det = response.ui_notification.detail;
        stat = response.ui_notification.status;
      }
      if(msg){
        message = msg['#text'] || "";
      }
      if(det){
        detail = det['#text'] || "";
      }
      if(stat){
        status = stat['#text'] || "";
      }
      return ({
        message: message,
        detail: detail,
        status: status
      });
    },
    toString: function(val) {
      if(val){
        return val.toString();
      }else{
        return "";
      }
    },
    // safely check if property exists and return empty string
    // instead of undefined if it doesn't exist
    // convert "TRUE" | "FALSE" to boolean
    getText: function(obj,prop) {
      var o = obj[prop];
      if(o && o['#text']){
        if(o['#text'].toUpperCase() === "TRUE"){
          return true;
        }else if(o['#text'].toUpperCase() === "FALSE"){
          return false;
        }else{
          return o['#text'] || "";
        }
      }else{
        return "";
      }
    },
    // safely check if property exists and return empty string
    // instead of undefined if it doesn't exist
    // convert "TRUE" | "FALSE" to boolean
    getAttribute: function(obj,prop) {
      var o = obj[prop];
      if(o && o[prop]){
        if(o[prop].toUpperCase() === "TRUE"){
          return true;
        }else if(o[prop].toUpperCase() === "FALSE"){
          return false;
        }else{
          return o[prop] || "";
        }
      }else{
        return "";
      }
    },
    // Parses a string of key value pairs and returns an Array of KeyValue objects.
    // @param str The string of keyvalue pairs to parse
    // @param outerDelimiter The delimiter that separates each keyValue pair
    // @param innerDelimiter The delimiter that separates each key from its value
    parseKeyValuePairsFromString: function(str, outerDelimiter, innerDelimiter) {
      if (!str){
        return [];
      }
      var arr = str.split(outerDelimiter).reduce(function(dict, pair){
        var keyValue = pair.split(innerDelimiter);
        dict[keyValue[0]] = keyValue[1];
        return dict;
      },{});
      return arr;
    },
    // Finds a request by responseTo id
    findRequestById: function(instance, id) {
      var request = null;
      for(var i = 0; i < instance._requests.length; i++){
        if(instance._requests[i].id === id){
          request = instance._requests[i];
          break;
        }
      }
      return request;
    },
    // called every 30 seconds letting intelliQueue know
    // not to archive the call so dispositions and other call
    // clean up actions can happen
    sendPingCallMessage: function() {
      UIModel.getInstance().pingCallRequest = new PingCallRequest();
      var msg = UIModel.getInstance().pingCallRequest.formatJSON();
      var msgObj = JSON.parse(msg);
      var agentId = utils.getText(msgObj.ui_request,'agent_id');
      var uii = utils.getText(msgObj.ui_request,'uii');
      if(agentId === "" || uii === ""){
        utils.logMessage(LOG_LEVELS.WARN, "PING-CALL message failed, agentId or UII is empty", msgObj);
      }else{
        utils.sendMessage(UIModel.getInstance().libraryInstance, msg);
      }
    },
    // called every 5 seconds to request stats from IntelliServices
    sendStatsRequestMessage: function() {
      UIModel.getInstance().statsRequest = new StatsRequest();
      var msg = UIModel.getInstance().statsRequest.formatJSON();
      utils.sendMessage(UIModel.getInstance().libraryInstance, msg);
    },
    // called every second
    // if we have received agent daily stats
    // start incrementing various data points since not all
    // data is incremented when we want on the IntelliServices side
    onAgentDailyStats: function() {
      if(Object.keys(UIModel.getInstance().agentDailyStats).length !== 0){
        var agentSettings = UIModel.getInstance().agentSettings,
          stats = UIModel.getInstance().agentDailyStats;
        var curLoginTime = stats.totalLoginTime;
        stats.totalLoginTime = Number(curLoginTime) + 1;
        if(agentSettings.isOffhook){
          var curOffhookTime = stats.totalOffhookTime;
          stats.totalOffhookTime = Number(curOffhookTime) + 1;
        }
        if(agentSettings.currentState == 'ENGAGED'){
          var curTalkTime = stats.totalTalkTime;
          stats.totalTalkTime = Number(curTalkTime) + 1;
          var curCallTime = stats.currCallTime;
          stats.currCallTime = Number(curCallTime) + 1;
        }
      }
    }
  };
  // CONSTANTS
  /*jshint esnext: true */
  const LOG_LEVELS ={
    "DEBUG":"debug",
    "STATS":"stats",
    "INFO":"info",
    "WARN":"warn",
    "ERROR":"error"
  };
  // add all callback types to setCallback method description
  const CALLBACK_TYPES = {
    "ADD_SESSION":"addSessionNotification",
    "AGENT_STATE":"agentStateResponse",
    "ACK":"acknowledgeResponse",
    "BARGE_IN":"bargeInResponse",
    "CLOSE_SOCKET":"closeResponse",
    "COACH_CALL":"coachResponse",
    "CONFIG":"configureResponse",
    "CALL_NOTES":"callNotesResponse",
    "CALLBACK_PENDING":"callbacksPendingResponse",
    "CALLBACK_CANCEL":"callbackCancelResponse",
    "CAMPAIGN_DISPOSITIONS":"campaignDispositionsResponse",
    "CHAT":"chatResponse",                          // internal chat
    "CHAT_ACTIVE":"chatActiveNotification",         // external chat
    "CHAT_CANCELLED":"chatCancelledNotification",   // external chat
    "CHAT_INACTIVE":"chatInactiveNotification",     // external chat
    "CHAT_PRESENTED":"chatPresentedNotification",   // external chat
    "CHAT_TYPING":"chatTypingNotification",         // external chat
    "CHAT_MESSAGE":"chatMessageNotification",       // external chat
    "CHAT_NEW":"chatNewNotification",               // external chat
    "CHAT_ROOM_STATE":"chatRoomStateResponse",
    "DIAL_GROUP_CHANGE":"dialGroupChangeNotification",
    "DIAL_GROUP_CHANGE_PENDING":"dialGroupChangePendingNotification",
    "DROP_SESSION":"dropSessionNotification",
    "EARLY_UII":"earlyUiiNotification",
    "END_CALL":"endCallNotification",
    "GATES_CHANGE":"gatesChangeNotification",
    "GENERIC_NOTIFICATION":"genericNotification",
    "GENERIC_RESPONSE":"genericResponse",
    "HOLD":"holdResponse",
    "LOG_RESULTS":"logResultsResponse",
    "LOGIN":"loginResponse",
    "LOGOUT":"logoutResponse",
    "NEW_CALL":"newCallNotification",
    "LEAD_HISTORY":"leadHistoryResponse",
    "LEAD_INSERT":"leadInsertResponse",
    "LEAD_SEARCH":"leadSearchResponse",
    "LEAD_UPDATE":"leadUpdateResponse",
    "OFFHOOK_INIT":"offhookInitResponse",
    "OFFHOOK_TERM":"offhookTermNotification",
    "OPEN_SOCKET":"openResponse",
    "PAUSE_RECORD":"pauseRecordResponse",
    "PENDING_DISP":"pendingDispNotification",
    "PREVIEW_FETCH":"previewFetchResponse",
    "PREVIEW_LEAD_STATE":"previewLeadStateNotification",
    "RECORD":"recordResponse",
    "REQUEUE":"requeueResponse",
    "REVERSE_MATCH":"reverseMatchNotification",
    "SAFE_MODE_FETCH":"safeModeFetchResponse",
    "SAFE_MODE_SEARCH":"safeModeSearchResponse",
    "SCRIPT_CONFIG":"scriptConfigResponse",
    "SILENT_MONITOR":"monitorResponse",
    "STATS_AGENT":"agentStats",
    "STATS_AGENT_DAILY":"agentDailyStats",
    "STATS_CAMPAIGN":"campaignStats",
    "STATS_QUEUE":"queueStats",
    "STATS_CHAT_QUEUE":"chatQueueStats",
    "SUPERVISOR_LIST":"supervisorListResponse",
    "TCPA_SAFE_LEAD_STATE":"tcpaSafeLeadStateNotification",
    "XFER_COLD":"coldXferResponse",
    "XFER_WARM":"warmXferResponse"
  };
  const MESSAGE_TYPES = {
    "ACK":"ACK",
    "ADD_SESSION":"ADD-SESSION",
    "BARGE_IN":"BARGE-IN",
    "AGENT_STATE":"AGENT-STATE",
    "CALL_NOTES":"CALL-NOTES",
    "CALLBACK_PENDING":"PENDING-CALLBACKS",
    "CALLBACK_CANCEL":"CANCEL-CALLBACK",
    "CAMPAIGN_DISPOSITIONS":"CAMPAIGN-DISPOSITIONS",
    "CHAT_SEND":"CHAT",                                     // internal chat
    "CHAT_ALIAS":"CHAT-ALIAS",                              // internal chat
    "CHAT_ROOM":"CHAT-ROOM",                                // internal chat
    "CHAT_ROOM_STATE":"CHAT-ROOM-STATE",                    // internal chat
    "CHAT_ACTIVE":"CHAT-ACTIVE",                            // external chat
    "CHAT_CANCELLED":"CHAT-CANCELLED",                      // external chat
    "CHAT_INACTIVE":"CHAT-INACTIVE",                        // external chat
    "CHAT_DISPOSITION":"CHAT-DISPOSITION",                  // external chat
    "CHAT_MESSAGE":"CHAT-MESSAGE",                          // external chat
    "CHAT_NEW":"NEW-CHAT",                                  // external chat
    "CHAT_PRESENTED":"CHAT-PRESENTED",                      // external chat
    "CHAT_PRESENTED_RESPONSE":"CHAT-PRESENTED-RESPONSE",    // external chat
    "CHAT_REQUEUE":"CHAT-REQUEUE",                          // external chat
    "CHAT_TYPING":"CHAT-TYPING",                            // external chat
    "MONITOR_CHAT":"CHAT-MONITOR",                          // external chat
    "LEAVE_CHAT":"CHAT-DROP-SESSION",                       // external chat
    "CHAT_LIST":"CHAT-LIST",                                // external chat
    "DIAL_GROUP_CHANGE":"DIAL_GROUP_CHANGE",
    "DIAL_GROUP_CHANGE_PENDING":"DIAL_GROUP_CHANGE_PENDING",
    "DROP_SESSION":"DROP-SESSION",
    "EARLY_UII":"EARLY_UII",
    "END_CALL":"END-CALL",
    "GATES_CHANGE":"GATES_CHANGE",
    "GENERIC":"GENERIC",
    "HANGUP":"HANGUP",
    "HOLD":"HOLD",
    "INBOUND_DISPOSITION":"INBOUND-DISPOSITION",
    "LEAD_HISTORY":"LEAD-HISTORY",
    "LEAD_INSERT":"LEAD-INSERT",
    "LEAD_UPDATE":"LEAD-UPDATE",
    "LOGIN":"LOGIN",
    "LOGOUT":"LOGOUT",
    "NEW_CALL":"NEW-CALL",
    "OFFHOOK_INIT":"OFF-HOOK-INIT",
    "OFFHOOK_TERM":"OFF-HOOK-TERM",
    "ON_MESSAGE":"ON-MESSAGE",
    "ONE_TO_ONE_OUTDIAL":"ONE-TO-ONE-OUTDIAL",
    "ONE_TO_ONE_OUTDIAL_CANCEL":"ONE-TO-ONE-OUTDIAL-CANCEL",
    "OUTDIAL_DISPOSITION":"OUTDIAL-DISPOSITION",
    "PAUSE_RECORD":"PAUSE-RECORD",
    "PING_CALL":"PING-CALL",
    "PREVIEW_DIAL":"PREVIEW-DIAL",
    "PENDING_DISP":"PENDING_DISP",
    "PREVIEW_DIAL_ID":"PREVIEW_DIAL",
    "PREVIEW_LEAD_STATE":"PREVIEW-LEAD-STATE",
    "RECORD":"RECORD",
    "REQUEUE":"RE-QUEUE",
    "REVERSE_MATCH":"REVERSE_MATCH",
    "SCRIPT_CONFIG":"SCRIPT-CONFIG",
    "SCRIPT_RESULT":"SCRIPT-RESULT",
    "STATS":"STATS",
    "STATS_AGENT":"AGENT",
    "STATS_AGENT_DAILY":"AGENTDAILY",
    "STATS_CAMPAIGN":"CAMPAIGN",
    "STATS_QUEUE":"GATE",
    "STATS_CHAT":"CHAT",
    "SUPERVISOR_LIST":"SUPERVISOR-LIST",                // internal chat
    "TCPA_SAFE":"TCPA-SAFE",
    "TCPA_SAFE_ID":"TCPA_SAFE",
    "TCPA_SAFE_LEAD_STATE":"TCPA-SAFE-LEAD-STATE",
    "XFER_COLD":"COLD-XFER",
    "XFER_WARM":"WARM-XFER",
    "XFER_WARM_CANCEL":"WARM-XFER-CANCEL"
  };
  /*
     * Init wrapper for the core module.
     * @param {Object} The Object that the library gets attached to in
     * library.init.js.  If the library was not loaded with an AMD loader such as
     * require.js, this is the global Object.
     */
  function initAgentLibraryCore (context) {
    'use strict';
    /**
     * This is the constructor for the Library Object. Note that the constructor is also being
     * attached to the context that the library was loaded in.
     * @param {Object} [config={}] Set socket url and callback functions.
     * @constructor
     * @namespace Core
     * @memberof AgentLibrary
     * @property {object} callbacks Internal map of registered callback functions
     * @property {array} _requests Internal map of requests by message id, private property.
     * @property {array} _queuedMsgs Array of pending messages to be sent when socket reconnected
     * @property {boolean} _isReconnect Whether or not we are doing a reconnect for the socket
     * @example
     * var Lib = new AgentLibrary({
     *      socketDest:'ws://d01-test.cf.dev:8080',
     *      callbacks: {
     *          closeResponse: onCloseFunction,
     *          openResponse: onOpenFunction
     *      }
     * });
     */
    var AgentLibrary = context.AgentLibrary = function (config) {
      config = config || {};
      // define properties
      this.callbacks = {};
      this._requests = [];
      this._queuedMsgs = [];
      this._isReconnect = false;
      // start with new model instance
      UIModel.resetInstance();
      // set instance on model object
      UIModel.getInstance().libraryInstance = this;
      // initialize indexedDB for logging
      this.openLogger();
      // set default values
      if(typeof config.callbacks !== 'undefined'){
        this.callbacks = config.callbacks;
      }
      if(typeof config.socketDest !== 'undefined'){
        UIModel.getInstance().applicationSettings.socketDest = config.socketDest;
        this.openSocket();
      }else{
        // todo default socket address?
      }
      return this;
    };
    /**
     * Set multiple callback functions based on type
     * @memberof AgentLibrary.Core
     * @param {Object} callbackMap Contains map of callback types to their respective functions:<br />
     * <tt>callbackMap = {<br />
     *      closeResponse: onCloseFunction,<br />
     *      openResponse: onOpenFunction<br />
     * }
     * </tt>
     *<br />
     * Possible callback types:
     * <li>"addSessionNotification"</li>
     * <li>"agentStateResponse"</li>
     * <li>"acknowledgeResponse"</li>
     * <li>"bargeInResponse"</li>
     * <li>"closeResponse"</li>
     * <li>"coachResponse"</li>
     * <li>"configureResponse"</li>
     * <li>"callNotesResponse"</li>
     * <li>"callbacksPendingResponse"</li>
     * <li>"callbackCancelResponse"</li>
     * <li>"campaignDispositionsResponse"</li>
     * <li>"chatResponse"</li>
     * <li>"dialGroupChangeNotification"</li>
     * <li>"dialGroupChangePendingNotification"</li>
     * <li>"dropSessionNotification"</li>
     * <li>"earlyUiiNotification"</li>
     * <li>"endCallNotification"</li>
     * <li>"gatesChangeNotification"</li>
     * <li>"genericNotification"</li>
     * <li>"genericResponse"</li>
     * <li>"holdResponse"</li>
     * <li>"leadSearchResponse"</li>
     * <li>"loginResponse"</li>
     * <li>"logoutResponse"</li>
     * <li>"monitorResponse"</li>
     * <li>"newCallNotification"</li>
     * <li>"offhookInitResponse"</li>
     * <li>"offhookTermNotification"</li>
     * <li>"openResponse"</li>
     * <li>"pauseRecordResponse"</li>
     * <li>"pendingDispNotification"</li>
     * <li>"previewFetchResponse"</li>
     * <li>"previewLeadStateNotification"</li>
     * <li>"recordResponse"</li>
     * <li>"requeueResponse"</li>
     * <li>"reverseMatchNotification"</li>
     * <li>"safeModeFetchResponse"</li>
     * <li>"safeModeSearchResponse"</li>
     * <li>"scriptConfigResponse"</li>
     * <li>"supervisorListResponse"</li>
     * <li>"coldXferResponse"</li>
     * <li>"warmXferResponse"</li>
     * <li>"agentStats"</li>
     * <li>"agentDailyStats"</li>
     * <li>"campaignStats"</li>
     * <li>"queueStats"</li>
     * <li>"chatQueueStats"</li>
     * @type {object}
     */
    AgentLibrary.prototype.setCallbacks = function(callbackMap) {
      for(var property in callbackMap) {
        this.callbacks[property] = callbackMap[property];
      }
    };
    /**
     * Set an individual callback function for the given type
     * @memberof AgentLibrary.Core
     * @param {string} type The name of the event that fires the callback function
     * @param {function} callback The function to call for the given type
     */
    AgentLibrary.prototype.setCallback = function(type, callback) {
      this.callbacks[type] = callback;
    };
    /**
     * Get the map of all registered callbacks
     * @memberof AgentLibrary.Core
     * @returns {array}
     */
    AgentLibrary.prototype.getCallbacks = function(){
      return this.callbacks;
    };
    /**
     * Get a given registered callback by type
     * @memberof AgentLibrary.Core
     * @returns {object}
     */
    AgentLibrary.prototype.getCallback = function(type){
      return this.callbacks[type];
    };
    /**
     * Get the socket connection to IntelliSocket
     * @memberof AgentLibrary.Core
     * @returns {object}
     */
    AgentLibrary.prototype.getSocket = function(type){
      return this.socket;
    };
    /**
     * @namespace Requests
     * @memberof AgentLibrary.Core
     */
    ////////////////////////////
    // requests and responses //
    ////////////////////////////
    /**
     * Get outgoing Login Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getLoginRequest = function() {
      return UIModel.getInstance().loginRequest;
    };
    /**
     * Get outgoing Config Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getConfigRequest = function() {
      return UIModel.getInstance().configRequest;
    };
    /**
     * Get outgoing Logout Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getLogoutRequest = function() {
      return UIModel.getInstance().logoutRequest;
    };
    /**
     * Get latest Agent Daily Stats object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getAgentDailyStats = function() {
      return UIModel.getInstance().agentDailyStats;
    };
    /**
     * Get latest Call Tokens object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getCallTokens = function() {
      return UIModel.getInstance().callTokens;
    };
    /**
     * Get latest outgoing Agent State Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getAgentStateRequest = function() {
      return UIModel.getInstance().agentStateRequest;
    };
    /**
     * Get latest outgoing offhook init Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getOffhookInitRequest = function() {
      return UIModel.getInstance().offhookInitRequest;
    };
    /**
     * Get latest outgoing offhook termination Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getOffhookTermRequest = function() {
      return UIModel.getInstance().offhookTermRequest;
    };
    /**
     * Get latest outgoing Hangup Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getHangupRequest = function() {
      return UIModel.getInstance().hangupRequest;
    };
    /**
     * Get latest outgoing Preview Dial Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getPreviewDialRequest = function() {
      return UIModel.getInstance().previewDialRequest;
    };
    /**
     * Get latest TCPA Safe Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getTcpaSafeRequest = function() {
      return UIModel.getInstance().tcpaSafeRequest;
    };
    /**
     * Get latest Manual Outdial Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getManualOutdialRequest = function() {
      return UIModel.getInstance().oneToOneOutdialRequest;
    };
    /**
     * Get latest Manual Outdial Cancel Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getManualOutdialCancelRequest = function() {
      return UIModel.getInstance().oneToOneOutdialCancelRequest;
    };
    /**
     * Get latest Call Notes Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getCallNotesRequest = function() {
      return UIModel.getInstance().callNotesRequest;
    };
    /**
     * Get latest Campaign Dispositions Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getCampaignDispositionsRequest = function() {
      return UIModel.getInstance().campaignDispositionsRequest;
    };
    /**
     * Get latest Disposition Call Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getDispositionRequest = function() {
      return UIModel.getInstance().dispositionRequest;
    };
    /**
     * Get latest Disposition Manual Pass Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getDispositionManualPassRequest = function() {
      return UIModel.getInstance().dispositionManualPassRequest;
    };
    /**
     * Get latest Warm Transfer Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getWarmTransferRequest = function() {
      return UIModel.getInstance().warmXferRequest;
    };
    /**
     * Get latest Cold Transfer Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getColdTransferRequest = function() {
      return UIModel.getInstance().coldXferRequest;
    };
    /**
     * Get latest Warm Transfer Cancel Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getWarmTransferCancelRequest = function() {
      return UIModel.getInstance().warmXferCancelRequest;
    };
    /**
     * Get latest Requeue Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getRequeueRequest = function() {
      return UIModel.getInstance().requeueRequest;
    };
    /**
     * Get latest Barge-In Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getBargeInRequest = function() {
      return UIModel.getInstance().bargeInRequest;
    };
    /**
     * Get latest Hold Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getHoldRequest = function() {
      return UIModel.getInstance().holdRequest;
    };
    /**
     * Get latest Pause Record Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getPauseRecordRequest = function() {
      return UIModel.getInstance().pauseRecordRequest;
    };
    /**
     * Get latest Record Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getRecordRequest = function() {
      return UIModel.getInstance().recordRequest;
    };
    /**
     * Get latest Chat Presented Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getChatPresentedRequest = function() {
      return UIModel.getInstance().chatPresentedRequest;
    };
    /**
     * Get latest Chat Disposition Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getChatDispositionRequest = function() {
      return UIModel.getInstance().chatDispositionRequest;
    };
    /**
     * Get latest Chat Message Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getChatMessageRequest = function() {
      return UIModel.getInstance().chatMessageRequest;
    };
    /**
     * Get latest Chat Requeue Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getChatRequeueRequest = function() {
      return UIModel.getInstance().chatRequeueRequest;
    };
    /**
     * Get latest Chat Typing Request object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getChatTypingRequest = function() {
      return UIModel.getInstance().chatTypingRequest;
    };
    /**
     * Get latest Agent Stats object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getAgentStatsPacket = function() {
      return UIModel.getInstance().agentStatsPacket;
    };
    /**
     * Get latest Agent Daily Stats object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getAgentDailyStatsPacket = function() {
      return UIModel.getInstance().agentDailyStatsPacket;
    };
    /**
     * Get latest Queue Stats object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getQueueStatsPacket = function() {
      return UIModel.getInstance().queueStatsPacket;
    };
    /**
     * Get latest Chat Queue Stats object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getChatQueueStatsPacket = function() {
      return UIModel.getInstance().chatQueueStatsPacket;
    };
    /**
     * Get latest Campaign Stats object
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getCampaignStatsPacket = function() {
      return UIModel.getInstance().campaignStatsPacket;
    };
    /**
     * Get packet received on successful Login
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getLoginPacket = function() {
      return UIModel.getInstance().loginPacket;
    };
    /**
     * Get packet received on successful Configuration (2nd layer login)
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getConfigPacket = function() {
      return UIModel.getInstance().configPacket;
    };
    /**
     * Get latest received packet for Agent State
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getAgentStatePacket = function() {
      return UIModel.getInstance().agentStatePacket;
    };
    /**
     * Get latest received packet for the Current Call
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getCurrentCallPacket = function() {
      return UIModel.getInstance().currentCallPacket;
    };
    /**
     * Get latest received packet for initiating an offhook session
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getOffhookInitPacket = function() {
      return UIModel.getInstance().offhookInitPacket;
    };
    /**
     * Get latest received packet for terminating an offhook session
     * @memberof AgentLibrary.Core.Requests
     * @returns {object}
     */
    AgentLibrary.prototype.getOffhookTermPacket = function() {
      return UIModel.getInstance().offhookTermPacket;
    };
    /**
     * @namespace Notifications
     * @memberof AgentLibrary.Core
     */
    ///////////////////
    // notifications //
    ///////////////////
    /**
     * Get Dial Group Change notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getDialGroupChangeNotification = function() {
      return UIModel.getInstance().dialGroupChangeNotification;
    };
    /**
     * Get Dial Group Change Pending notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getDialGroupChangePendingNotification = function() {
      return UIModel.getInstance().dialGroupChangePendingNotification;
    };
    /**
     * Get End Call notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getEndCallNotification = function() {
      return UIModel.getInstance().endCallNotification;
    };
    /**
     * Get Gates Change notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getGatesChangeNotification = function() {
      return UIModel.getInstance().gatesChangeNotification;
    };
    /**
     * Get Generic notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getGenericNotification = function() {
      return UIModel.getInstance().genericNotification;
    };
    /**
     * Get New Call notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getNewCallNotification = function() {
      return UIModel.getInstance().newCallNotification;
    };
    /**
     * Get current call object
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getCurrentCall = function() {
      return UIModel.getInstance().currentCall;
    };
    /**
     * Get Add Session notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getAddSessionNotification = function() {
      return UIModel.getInstance().addSessionNotification;
    };
    /**
     * Get Drop Session notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getDropSessionNotification = function() {
      return UIModel.getInstance().dropSessionNotification;
    };
    /**
     * Get Early UII notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getEarlyUiiNotification = function() {
      return UIModel.getInstance().earlyUiiNotification;
    };
    /**
     * Get Chat Active notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getChatActiveNotification = function() {
      return UIModel.getInstance().chatActiveNotification;
    };
    /**
     * Get Chat Inactive notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getChatInactiveNotification = function() {
      return UIModel.getInstance().chatInactiveNotification;
    };
    /**
     * Get Chat Presented notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getChatPresentedNotification = function() {
      return UIModel.getInstance().chatPresentedNotification;
    };
    /**
     * Get Chat Typing notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getChatTypingNotification = function() {
      return UIModel.getInstance().chatTypingNotification;
    };
    /**
     * Get New Chat notification class
     * @memberof AgentLibrary.Core.Notifications
     * @returns {object}
     */
    AgentLibrary.prototype.getNewChatNotification = function() {
      return UIModel.getInstance().newChatNotification;
    };
    /**
     * @namespace Settings
     * @memberof AgentLibrary.Core
     */
    //////////////////////
    // settings objects //
    //////////////////////
    /**
     * Get Application Settings object containing the current state of application related data
     * @memberof AgentLibrary.Core.Settings
     * @returns {object}
     */
    AgentLibrary.prototype.getApplicationSettings = function() {
      return UIModel.getInstance().applicationSettings;
    };
    /**
     * Get Chat Settings object containing the current state of chat related data
     * @memberof AgentLibrary.Core.Settings
     * @returns {object}
     */
    AgentLibrary.prototype.getChatSettings = function() {
      return UIModel.getInstance().chatSettings;
    };
    /**
     * Get Connection Settings object containing the current state of connection related data
     * @memberof AgentLibrary.Core.Settings
     * @returns {object}
     */
    AgentLibrary.prototype.getConnectionSettings = function() {
      return UIModel.getInstance().connectionSettings;
    };
    /**
     * Get Inbound Settings object containing the current state of inbound related data
     * @memberof AgentLibrary.Core.Settings
     * @returns {object}
     */
    AgentLibrary.prototype.getInboundSettings = function() {
      return UIModel.getInstance().inboundSettings;
    };
    /**
     * Get Outbound Settings object containing the current state of outbound related data
     * @memberof AgentLibrary.Core.Settings
     * @returns {object}
     */
    AgentLibrary.prototype.getOutboundSettings = function() {
      return UIModel.getInstance().outboundSettings;
    };
    /**
     * Get Agent Settings object containing the current state of agent related data
     * @memberof AgentLibrary.Core.Settings
     * @returns {object}
     */
    AgentLibrary.prototype.getAgentSettings = function() {
      return UIModel.getInstance().agentSettings;
    };
    /**
     * Get Transfer Sessions
     * @memberof AgentLibrary.Core.Settings
     * @returns {object}
     */
    AgentLibrary.prototype.getTransferSessions = function() {
      return UIModel.getInstance().transferSessions;
    };
    /**
     * Get the Agent Permissions object containing the current state of agent permissions
     * @memberof AgentLibrary.Core.Settings
     * @returns {object}
     */
    AgentLibrary.prototype.getAgentPermissions = function() {
      return UIModel.getInstance().agentPermissions;
    };
    /**
     * @namespace Stats
     * @memberof AgentLibrary.Core
     */
    ///////////////////
    // stats objects //
    ///////////////////
    /**
     * Get the Agent stats object containing the current state of agent stats
     * @memberof AgentLibrary.Core.Settings
     * @returns {object}
     */
    AgentLibrary.prototype.getAgentStats = function() {
      return UIModel.getInstance().agentStats;
    };
    /**
     * Get the Agent Daily stats object containing the current state of agent daily stats
     * @memberof AgentLibrary.Core.Stats
     * @returns {object}
     */
    AgentLibrary.prototype.getAgentDailyStats = function() {
      return UIModel.getInstance().agentDailyStats;
    };
    /**
     * Get the Queue stats object containing the current state of queue stats
     * @memberof AgentLibrary.Core.Stats
     * @returns {object}
     */
    AgentLibrary.prototype.getQueueStats = function() {
      return UIModel.getInstance().queueStats;
    };
    /**
     * Get the Chat Queue stats object containing the current state of chat queue stats
     * @memberof AgentLibrary.Core.Stats
     * @returns {object}
     */
    AgentLibrary.prototype.getChatQueueStats = function() {
      return UIModel.getInstance().chatQueueStats;
    };
    /**
     * Get the Campaign stats object containing the current state of campaign stats
     * @memberof AgentLibrary.Core.Stats
     * @returns {object}
     */
    AgentLibrary.prototype.getCampaignStats = function() {
      return UIModel.getInstance().campaignStats;
    };
  }
  function initAgentLibrarySocket (context) {
    'use strict';
    var AgentLibrary = context.AgentLibrary;
    AgentLibrary.prototype.openSocket = function(callback){
      var instance = this;
      utils.setCallback(instance, CALLBACK_TYPES.OPEN_SOCKET, callback);
      if ('WebSocket' in window || 'MozWebSocket' in window){
        if(!instance.socket){
          var socketDest = UIModel.getInstance().applicationSettings.socketDest;
          utils.logMessage(LOG_LEVELS.DEBUG, "Attempting to open socket connection to " + socketDest, "");
          instance.socket = new WebSocket(socketDest);
          instance.socket.onopen = function() {
            UIModel.getInstance().applicationSettings.socketConnected = true;
            utils.fireCallback(instance, CALLBACK_TYPES.OPEN_SOCKET, {reconnect:instance._isReconnect});
            instance.socketOpened();
          };

          instance.socket.onmessage = function(evt){
            var data = JSON.parse(evt.data);
            if(data.ui_response){
              utils.processResponse(instance, data);
            }else if(data.ui_notification){
              utils.processNotification(instance, data);
            }else if(data.dialer_request){
              utils.processDialerResponse(instance, data);
            }else if(data.ui_stats){
              utils.processStats(instance, data);
            }else if(data.ui_request){
              utils.processRequest(instance, data);
            }
          };
          instance.socket.onclose = function(){
            utils.fireCallback(instance, CALLBACK_TYPES.CLOSE_SOCKET, '');
            UIModel.getInstance().applicationSettings.socketConnected = false;
            instance.socket = null;
            // cancel daily stats timer
            clearInterval(UIModel.getInstance().agentDailyIntervalId);
            UIModel.getInstance().agentDailyIntervalId = null;
            // cancel stats timer
            clearInterval(UIModel.getInstance().statsIntervalId);
            UIModel.getInstance().statsIntervalId = null;
            // if we are still logged in, try to reconnect
            if(UIModel.getInstance().agentSettings.isLoggedIn){
              setTimeout(function(){
                instance.openSocket();
              }, 5000);
            }
          };
        }
      }else{
        utils.logMessage(LOG_LEVELS.WARN, "WebSocket NOT supported by your Browser", "");
      }
    };
    AgentLibrary.prototype.closeSocket = function(){
      this.socket.close();
    };
    // when socket is successfully opened, check to see if there are any queued messaged
    // and if so, send them.
    AgentLibrary.prototype.socketOpened = function(){
      var instance = this;
      var currDts = new Date();
      var threeMins = 3 * 60 * 1000; // milliseconds
      var queuedMsg;
      // if this is a reconnect, we need to re-authenticate with IntelliServices & IntelliQueue
      if(instance._isReconnect){
        instance._isReconnect = false;
        // Add IntelliQueue reconnect
        var configRequest = JSON.parse(UIModel.getInstance().configRequest.formatJSON());
        var hashCode = UIModel.getInstance().connectionSettings.hashCode;
        configRequest.ui_request.hash_code = {
          "#text":hashCode
        };
        configRequest.ui_request.update_login = {
          "#text": "FALSE"
        };
        configRequest.ui_request.reconnect = {
          "#text": "TRUE"
        };
        instance._queuedMsgs.unshift({dts: new Date(), msg: JSON.stringify(configRequest)});
        // Add IntelliServices reconnect
        var loginRequest = JSON.parse(UIModel.getInstance().loginRequest.formatJSON());
        var agentId = UIModel.getInstance().agentSettings.agentId;
        loginRequest.ui_request.reconnect = {
          "#text":"TRUE"
        };
        loginRequest.ui_request.agent_id = {
          "#text": utils.toString(agentId)
        };
        instance._queuedMsgs.unshift({dts: new Date(), msg: JSON.stringify(loginRequest)});
      }
      for(var idx=0; idx < instance._queuedMsgs.length; idx++){
        queuedMsg = instance._queuedMsgs[idx];
        if(currDts.getTime() - queuedMsg.dts.getTime() < threeMins){
          // message queued less than 3 mins ago, send
          utils.logMessage(LOG_LEVELS.DEBUG, "Sending queued message to IntelliSocket.", queuedMsg.msg);
          utils.sendMessage(instance,queuedMsg.msg);
        }else{
          // message expired, don't send
          utils.logMessage(LOG_LEVELS.DEBUG, "Queued message expired, discarding.", queuedMsg.msg);
        }
      }
      // reset queued messages
      instance._queuedMsgs = [];
    };
  }
  function initAgentLibraryAgent (context) {
    /**
     * @namespace Agent
     * @memberof AgentLibrary
     */
    'use strict';
    var AgentLibrary = context.AgentLibrary;
    /**
     * Sends agent login message to IntelliServices
     * @memberof AgentLibrary.Agent
     * @param {string} username Agent's username
     * @param {string} password Agent's password
     * @param {function} [callback=null] Callback function when loginAgent response received
     */
    AgentLibrary.prototype.loginAgent = function(username, password, callback){
      UIModel.getInstance().loginRequest = new LoginRequest(username, password);
      var msg = UIModel.getInstance().loginRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.LOGIN, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Sends agent login message to IntelliServices, with flag to tell IntelliServices
     * that agent password is to be treated as case sensitive
     * @memberof AgentLibrary.Agent
     * @param {string} username Agent's username
     * @param {string} password Agent's password
     * @param {function} [callback=null] Callback function when loginAgent response received
     */
    AgentLibrary.prototype.loginAgentCaseSensitive = function(username, password, callback){
      UIModel.getInstance().loginRequest = new LoginRequest(username, password, true);
      var msg = UIModel.getInstance().loginRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.LOGIN, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Sends agent configure message (2nd layer login) to IntelliQueue
     * @memberof AgentLibrary.Agent
     * @param {string} dialDest The agent's number, sip | DID.
     * @param {string[]} [queueIds=null] The queue ids the agent will be logged into.
     * @param {string[]} [chatIds=null] The chat ids the agent will be logged into.
     * @param {string} [skillProfileId=null] The skill profile the agent will be logged into.
     * @param {string} [dialGroupId=null] The outbound dial group id the agent will be logged into.
     * @param {string} [updateFromAdminUI=false] Whether the request is generated from the AdminUI or not.
     * @param {function} [callback=null] Callback function when configureAgent response received.
     */
    AgentLibrary.prototype.configureAgent = function(dialDest, queueIds, chatIds, skillProfileId, dialGroupId, updateFromAdminUI, callback){
      UIModel.getInstance().configRequest = new ConfigRequest(dialDest, queueIds, chatIds, skillProfileId, dialGroupId, updateFromAdminUI);
      var msg = UIModel.getInstance().configRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.CONFIG, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Sends agent logout message to IntelliQueue
     * @memberof AgentLibrary.Agent
     * @param {number} agentId Id of the agent that will be logged out.
     * @param {function} [callback=null] Callback function when logoutAgent response received.
     */
    AgentLibrary.prototype.logoutAgent = function(agentId, callback){
      UIModel.getInstance().logoutRequest = new LogoutRequest(agentId);
      utils.setCallback(this, CALLBACK_TYPES.LOGOUT, callback);
      UIModel.getInstance().agentSettings.isLoggedIn = false;
      // Agent requested logout, just close socket??
      utils.fireCallback(this, CALLBACK_TYPES.LOGOUT, "");
      // this.closeSocket();
    };
    /**
     * Sends agent logout for the given agent to logout message to IntelliQueue
     * @memberof AgentLibrary.Agent
     * @param {number} agentToLogout Id of the agent that will be logged out.
     * @param {number} [requestMessage=""] Message to send for the logout request.
     * @param {function} [callback=null] Callback function when logoutAgent response received.
     */
    AgentLibrary.prototype.requestLogoutAgent = function(agentToLogout, requestMessage, callback){
      var isSupervisor = UIModel.getInstance().agentSettings.agentType === 'SUPERVISOR';
      UIModel.getInstance().logoutRequest = new LogoutRequest(agentToLogout, requestMessage, isSupervisor);
      utils.setCallback(this, CALLBACK_TYPES.LOGOUT, callback);
      if(UIModel.getInstance().logoutRequest.isSupervisor){
        //This is a supervisor request to log an agent out. Create the
        //logout packet and then send the packet to IntelliQueue.
        var msg = UIModel.getInstance().logoutRequest.formatJSON();
        utils.sendMessage(this, msg);
      }
    };
    /**
     * Sends agent state change message to IntelliQueue
     * @memberof AgentLibrary.Agent
     * @param {string} agentState The system/base state to transition to <br />
     * AVAILABLE | TRANSITION | ENGAGED | ON-BREAK | WORKING | AWAY | LUNCH | AUX-UNAVAIL-NO-OFFHOOK | AUX-UNAVAIL-OFFHOOK
     * @param {string} [agentAuxState=""] The aux state display label
     * @param {function} [callback=null] Callback function when agentState response received
     */
    AgentLibrary.prototype.setAgentState = function(agentState, agentAuxState, callback){
      UIModel.getInstance().agentStateRequest = new AgentStateRequest(agentState, agentAuxState);
      var msg = UIModel.getInstance().agentStateRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.AGENT_STATE, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Initiates an agent offhook session
     * @memberof AgentLibrary.Agent
     * @param {function} [callback=null] Callback function when offhookInit response received
     */
    AgentLibrary.prototype.offhookInit = function(callback){
      UIModel.getInstance().offhookInitRequest = new OffhookInitRequest();
      var msg = UIModel.getInstance().offhookInitRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.OFFHOOK_INIT, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Terminates agent's offhook session
     * @memberof AgentLibrary.Agent
     * @param {function} [callback=null] Callback function when pending callbacks response received
     */
    AgentLibrary.prototype.offhookTerm = function(callback){
      UIModel.getInstance().offhookTermRequest = new OffhookTermRequest();
      var msg = UIModel.getInstance().offhookTermRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.OFFHOOK_TERM, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Returns scheduled callbacks for the given agent
     * @memberof AgentLibrary.Agent
     * @param {number} [agentId=logged in agent id] Id of agent to get callbacks for
     * @param {function} [callback=null] Callback function when pending callbacks response received
     */
    AgentLibrary.prototype.getPendingCallbacks = function(agentId, callback){
      UIModel.getInstance().callbacksPendingRequest = new CallbacksPendingRequest(agentId);
      var msg = UIModel.getInstance().callbacksPendingRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.CALLBACK_PENDING, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Cancel a scheduled callback for the given agent based on lead id
     * @memberof AgentLibrary.Agent
     * @param {number} leadId Id of lead callback to cancel
     * @param {number} [agentId=logged in agent id] Id of agent to cancel specified lead callback for
     * @param {function} [callback=null] Callback function when callback is canceled
     */
    AgentLibrary.prototype.cancelCallback = function(leadId, agentId, callback){
      UIModel.getInstance().callbackCancelRequest = new CallbackCancelRequest(leadId, agentId);
      var msg = UIModel.getInstance().callbackCancelRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.CALLBACK_CANCEL, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Request stats messages to be sent every 5 seconds. The stats responses will be sent as
     * four possible callback types: agentStats, agentDailyStats, campaignStats, or queueStats
     * @memberof AgentLibrary.Agent
     */
    AgentLibrary.prototype.requestStats = function(){
      // start stats interval timer, request stats every 5 seconds
      UIModel.getInstance().statsIntervalId = setInterval(utils.sendStatsRequestMessage, 5000);
    };
  }
  function initAgentLibraryCall (context) {
    /**
     * @namespace Call
     * @memberof AgentLibrary
     */
    'use strict';
    var AgentLibrary = context.AgentLibrary;
    /**
     * Barge in on a call, can hear all parties and be heard by all
     * @memberof AgentLibrary.Call
     * @param {number} agentId Agent Id of the current logged in agent
     * @param {string} uii UII of the active call you wish to monitor
     * @param {number} monitorAgentId UII Agent Id of the agent you wish to monitor
     * @param {function} [callback=null] Callback function when barge in response received
     */
    AgentLibrary.prototype.bargeIn = function(agentId, uii, monitorAgentId, callback){
      UIModel.getInstance().bargeInRequest = new BargeInRequest("FULL", agentId, uii, monitorAgentId);
      var msg = UIModel.getInstance().bargeInRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.BARGE_IN, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Add a coaching session to the call, can hear all parties but only able to speak on agent channel
     * @memberof AgentLibrary.Call
     * @param {number} agentId Agent Id of the current logged in agent
     * @param {string} uii UII of the active call you wish to monitor
     * @param {number} monitorAgentId UII Agent Id of the agent you wish to monitor
     * @param {function} [callback=null] Callback function when coaching session response received
     */
    AgentLibrary.prototype.coach = function(agentId, uii, monitorAgentId, callback){
      UIModel.getInstance().bargeInRequest = new BargeInRequest("COACHING", agentId, uii, monitorAgentId);
      var msg = UIModel.getInstance().bargeInRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.COACH_CALL, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Transfer to another number and end the call for the original agent (cold transfer).
     * @memberof AgentLibrary.Call
     * @param {number} dialDest Number to transfer to
     * @param {number} [callerId=""] Caller Id for caller (DNIS)
     * @param {function} [callback=null] Callback function when cold transfer response received
     */
    AgentLibrary.prototype.coldXfer = function(dialDest, callerId, sipHeaders, callback){
      UIModel.getInstance().coldXferRequest = new XferColdRequest(dialDest, callerId, sipHeaders);
      var msg = UIModel.getInstance().coldXferRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.XFER_COLD, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Send a disposition for an inbound or outbound call
     * @memberof AgentLibrary.Call
     * @param {string} uii UII (unique id) for call
     * @param {string} dispId The disposition id
     * @param {string} notes Agent notes for call
     * @param {boolean} callback Boolean for whether or not this call is a callback
     * @param {string} [callbackDTS=""] date time stamp if callback
     * @param {string} [contactForwardNumber=null] Number for contact forwarding
     * @param {string} [survey=null] The survey response values for the call.
     * Format: survey = [ { label: "", externId: "", leadUpdateColumn: ""} ]
     * @param {string} [externId=null] The external id associated with the lead for this call (only for Outbound Dispositions).
     * @param {string} [leadId=null] The lead id associated with this call (only for Outbound Dispositions).
     */
    AgentLibrary.prototype.dispositionCall = function(uii, dispId, notes, callback, callbackDTS, contactForwardNumber, survey, externId, leadId){
      UIModel.getInstance().dispositionRequest = new DispositionRequest(uii, dispId, notes, callback, callbackDTS, contactForwardNumber, survey, externId, leadId);
      var msg = UIModel.getInstance().dispositionRequest.formatJSON();
      utils.sendMessage(this, msg);
      // cancel ping call timer
      clearInterval(UIModel.getInstance().pingIntervalId);
      UIModel.getInstance().pingIntervalId = null;
    };
    /**
     * Send a disposition for a manual pass on a lead
     * @memberof AgentLibrary.Call
     * @param {string} dispId The disposition id
     * @param {string} notes Agent notes for call
     * @param {boolean} callback Boolean for whether or not this call is a callback
     * @param {string} [callbackDTS=""] date time stamp if callback
     * @param {string} [leadId=null] The lead id
     * @param {string} [requestId=null] The request key for the lead
     * @param {string} [externId=null] The external id of the lead
     */
    AgentLibrary.prototype.dispositionManualPass = function(dispId, notes, callback, callbackDTS, leadId, requestId, externId){
      UIModel.getInstance().dispositionManualPassRequest = new DispositionManualPassRequest(dispId, notes, callback, callbackDTS, leadId, requestId, externId);
      var msg = UIModel.getInstance().dispositionManualPassRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Get a list of all campaign dispositions for given campaign id
     * @memberof AgentLibrary.Call
     * @param {string} campaignId Id for campaign to get dispositions for
     * @param {function} [callback=null] Callback function when campaign dispositions response received
     */
    AgentLibrary.prototype.getCampaignDispositions = function(campaignId, callback){
      UIModel.getInstance().campaignDispositionsRequest = new CampaignDispositionsRequest(campaignId);
      var msg = UIModel.getInstance().campaignDispositionsRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.CAMPAIGN_DISPOSITIONS, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Sends a hangup request message
     * @memberof AgentLibrary.Call
     * @param {string} [sessionId=""] Session to hangup, defaults to current call session id
     */
    AgentLibrary.prototype.hangup = function(sessionId){
      UIModel.getInstance().hangupRequest = new HangupRequest(sessionId);
      var msg = UIModel.getInstance().hangupRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Place a call on hold
     * @memberof AgentLibrary.Call
     * @param {boolean} holdState Whether we are putting call on hold or taking off hold - values true | false
     * @param {function} [callback=null] Callback function when hold response received
     */
    AgentLibrary.prototype.hold = function(holdState, callback){
      UIModel.getInstance().holdRequest = new HoldRequest(holdState);
      var msg = UIModel.getInstance().holdRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.HOLD, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Sends a manual outdial request message
     * @memberof AgentLibrary.Call
     * @param {string} destination Number to call - ANI
     * @param {number} callerId Number displayed to callee, DNIS
     * @param {number} [ringTime=60] Time in seconds to ring call
     * @param {string} [countryId='USA'] Country for the destination number
     * @param {number} [queueId=''] Queue id to tie manual call to
     */
    AgentLibrary.prototype.manualOutdial = function(destination, callerId, ringTime, countryId, queueId){
      UIModel.getInstance().oneToOneOutdialRequest = new OneToOneOutdialRequest(destination, callerId, ringTime, countryId, queueId);
      var msg = UIModel.getInstance().oneToOneOutdialRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Cancels a manual outdial request by UII.
     * @memberof AgentLibrary.Call
     * @param {string} uii UII of manual call request, the UII is returned in the EARLY_UII notification.
     */
    AgentLibrary.prototype.manualOutdialCancel = function(uii){
      UIModel.getInstance().oneToOneOutdialCancelRequest = new OneToOneOutdialCancelRequest(uii);
      var msg = UIModel.getInstance().oneToOneOutdialCancelRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Pause call recording
     * @memberof AgentLibrary.Call
     * @param {boolean} record Whether we are recording or not
     * @param {function} [callback=null] Callback function when pause record response received
     */
    AgentLibrary.prototype.pauseRecord = function(record, callback){
      UIModel.getInstance().pauseRecordRequest = new PauseRecordRequest(record);
      var msg = UIModel.getInstance().pauseRecordRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.PAUSE_RECORD, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Sends a preview dial request to call lead based on request id. Call previewFetch method first to get request id.
     * @memberof AgentLibrary.Call
     * @param {number} requestId Pending request id sent back with lead, required to dial lead.
     */
    AgentLibrary.prototype.previewDial = function(requestId){
      UIModel.getInstance().previewDialRequest = new PreviewDialRequest("", [], requestId);
      var msg = UIModel.getInstance().previewDialRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Sends a message to fetch preview dialable leads
     * @memberof AgentLibrary.Call
     * @param {array} [searchFields=[]] Array of objects with key/value pairs for search parameters
     * e.g. [ {key: "name", value: "Geoff"} ]
     * @param {function} [callback=null] Callback function when preview fetch completed, returns matched leads
     */
    AgentLibrary.prototype.previewFetch = function(searchFields, callback){
      UIModel.getInstance().previewDialRequest = new PreviewDialRequest("", searchFields, "");
      var msg = UIModel.getInstance().previewDialRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.PREVIEW_FETCH, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Pull back leads that match search criteria
     * @memberof AgentLibrary.Call
     * @param {array} [searchFields=[]] Array of objects with key/value pairs for search parameters
     * e.g. [ {key: "name", value: "Geoff"} ]
     * @param {function} [callback=null] Callback function when lead search completed, returns matched leads
     */
    AgentLibrary.prototype.searchLeads = function(searchFields, callback){
      UIModel.getInstance().previewDialRequest = new PreviewDialRequest("search", searchFields, "");
      var msg = UIModel.getInstance().previewDialRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.LEAD_SEARCH, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Set agent notes for a call
     * @memberof AgentLibrary.Call
     * @param {string} notes Agent notes to add to call
     * @param {function} [callback=null] Callback function when call notes response received
     */
    AgentLibrary.prototype.setCallNotes = function(notes, callback){
      UIModel.getInstance().callNotesRequest = new CallNotesRequest(notes);
      var msg = UIModel.getInstance().callNotesRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.CALL_NOTES, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Add a silent monitor session to a call, can hear all channels but can't be heard by any party
     * @memberof AgentLibrary.Call
     * @param {number} agentId Agent Id of the current logged in agent
     * @param {string} uii UII of the active call you wish to monitor
     * @param {number} monitorAgentId UII Agent Id of the agent you wish to monitor
     * @param {function} [callback=null] Callback function when silent monitor response received
     */
    AgentLibrary.prototype.monitor = function(agentId, uii, monitorAgentId, callback){
      UIModel.getInstance().bargeInRequest = new BargeInRequest("MUTE", agentId, uii, monitorAgentId);
      var msg = UIModel.getInstance().bargeInRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.SILENT_MONITOR, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Toggle call recording based on passed in boolean true | false
     * @memberof AgentLibrary.Call
     * @param {boolean} record Whether we are recording or not
     * @param {function} [callback=null] Callback function when record response received
     */
    AgentLibrary.prototype.record = function(record, callback){
      UIModel.getInstance().recordRequest = new RecordRequest(record);
      var msg = UIModel.getInstance().recordRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.RECORD, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Requeue a call
     * @memberof AgentLibrary.Call
     * @param {number} queueId Queue Id to send the call to
     * @param {number} skillId Skill Id for the requeued call
     * @param {boolean} maintain Whether or not to maintain the current agent
     * @param {function} [callback=null] Callback function when requeue response received
     */
    AgentLibrary.prototype.requeueCall = function(queueId, skillId, maintain, callback){
      UIModel.getInstance().requeueRequest = new RequeueRequest(queueId, skillId, maintain);
      var msg = UIModel.getInstance().requeueRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.REQUEUE, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Sends a TCPA Safe call request to call lead based on request id. Call safeModeFetch method first to get request id.
     * @memberof AgentLibrary.Call
     * @param {number} [requestId=""] Number displayed to callee, DNIS
     */
    AgentLibrary.prototype.safeModeCall = function(requestId){
      UIModel.getInstance().tcpaSafeRequest = new TcpaSafeRequest("", [], requestId);
      var msg = UIModel.getInstance().tcpaSafeRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Sends a message to fetch safe mode dialable leads
     * @memberof AgentLibrary.Call
     * @param {array} [searchFields=[]] Array of objects with key/value pairs for search parameters
     * e.g. [ {key: "name", value: "Geoff"} ]
     * @param {function} [callback=null] Callback function when safe mode fetch completed, returns matched leads
     */
    AgentLibrary.prototype.safeModeFetch = function(searchFields, callback){
      UIModel.getInstance().tcpaSafeRequest = new TcpaSafeRequest("", searchFields, "");
      var msg = UIModel.getInstance().tcpaSafeRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.SAFE_MODE_FETCH, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Pull back Safe Mode leads that match search criteria
     * @memberof AgentLibrary.Call
     * @param {array} [searchFields=[]] Array of objects with key/value pairs for search parameters
     * e.g. [ {key: "name", value: "Geoff"} ]
     * @param {function} [callback=null] Callback function when safe mode fetch completed, returns matched leads
     */
    AgentLibrary.prototype.safeSearchLeads = function(searchFields, callback){
      UIModel.getInstance().tcpaSafeRequest = new TcpaSafeRequest("search", searchFields, "");
      var msg = UIModel.getInstance().tcpaSafeRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.SAFE_MODE_SEARCH, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Transfer to another number while keeping the original agent on the line (warm transfer).
     * @memberof AgentLibrary.Call
     * @param {number} dialDest Number to transfer to
     * @param {number} [callerId=""] Caller Id for caller (DNIS)
     * @param {function} [callback=null] Callback function when warm transfer response received
     */
    AgentLibrary.prototype.warmXfer = function(dialDest, callerId, sipHeaders, callback){
      UIModel.getInstance().warmXferRequest = new XferWarmRequest(dialDest, callerId, sipHeaders);
      var msg = UIModel.getInstance().warmXferRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.XFER_WARM, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Cancel a warm transfer
     * @memberof AgentLibrary.Call
     * @param {number} dialDest Number that was transfered to
     */
    AgentLibrary.prototype.warmXferCancel = function(dialDest){
      UIModel.getInstance().warmXferCancelRequest = new XferWarmCancelRequest(dialDest);
      var msg = UIModel.getInstance().warmXferCancelRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Requests a script object based on given id
     * @memberof AgentLibrary.Call
     * @param {number} scriptId Id of script
     * @param {number} version The version number of the script, if the current loaded script version matches,
     *                 just return current script. Otherwise, fetch new version of script.
     * @param {function} [callback=null] Callback function when warm transfer response received
     */
    AgentLibrary.prototype.getScript = function(scriptId, version, callback){
      var model = UIModel.getInstance();
      var script = model.scriptSettings.loadedScripts[scriptId];
      utils.setCallback(this, CALLBACK_TYPES.SCRIPT_CONFIG, callback);
      if(script && script.version === version){
        // return from memory
        var savedScript = UIModel.getInstance().scriptSettings.loadedScripts[scriptId];
        callback(savedScript);
      }else{
        // load script
        model.scriptConfigRequest = new ScriptConfigRequest(scriptId);
        var msg = UIModel.getInstance().scriptConfigRequest.formatJSON();
        utils.sendMessage(this, msg);
      }
    };
    /**
     * Saves the results from a script
     * @memberof AgentLibrary.Call
     * @param {string} uii The UII of the call the script results belong to
     * @param {number} scriptId Id of script
     * @param {object} jsonResult JSON object of script results, name/value pairs
     */
    AgentLibrary.prototype.saveScriptResult = function(uii, scriptId, jsonResult){
      UIModel.getInstance().scriptResultRequest = new ScriptResultRequest(uii, scriptId, jsonResult);
      var msg = UIModel.getInstance().scriptResultRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
  }
  function initAgentLibraryLead (context) {
    /**
     * @namespace Lead
     * @memberof AgentLibrary
     */

    'use strict';
    var AgentLibrary = context.AgentLibrary;
    /**
     * Get the history for a given lead
     * @memberof AgentLibrary.Lead
     * @param {number} leadId The lead id to retrieve history for
     * @param {function} [callback=null] Callback function when lead history response received
     */
    AgentLibrary.prototype.leadHistory = function(leadId, callback){
      UIModel.getInstance().leadHistoryRequest = new LeadHistoryRequest(leadId);
      var msg = UIModel.getInstance().leadHistoryRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.LEAD_HISTORY, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Insert a lead to the given campaign
     * @memberof AgentLibrary.Lead
     * @param {object} dataObj agentId, campaignId, and lead info
     * @param {function} [callback=null] Callback function when lead history response received
     */
    AgentLibrary.prototype.leadInsert = function(dataObj, callback){
      UIModel.getInstance().leadInsertRequest = new LeadInsertRequest(dataObj);
      var msg = UIModel.getInstance().leadInsertRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.LEAD_INSERT, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Update lead information
     * @memberof AgentLibrary.Lead
     * @param {string} leadId Id for lead to update
     * @param {string} leadPhone Lead phone number
     * @param {object} baggage Object containing lead information
     * @param {function} [callback=null] Callback function when lead history response received
     */
    AgentLibrary.prototype.leadUpdate = function(leadId, leadPhone, baggage, callback){
      UIModel.getInstance().leadUpdateRequest = new LeadUpdateRequest(leadId, leadPhone, baggage);
      var msg = UIModel.getInstance().leadUpdateRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.LEAD_UPDATE, callback);
      utils.sendMessage(this, msg);
    };
  }
  function initAgentLibraryChat (context) {
    /**
     * @namespace Chat
     * @memberof AgentLibrary
     */
    'use strict';
    var AgentLibrary = context.AgentLibrary;
    /**
     * Set the agent chat alias
     * @memberof AgentLibrary.Chat
     * @param {string} alias The alias string to be used for agent chat messages
     */
    AgentLibrary.prototype.setChatAlias = function(alias){
      UIModel.getInstance().chatAliasRequest = new ChatAliasRequest(alias);
      var msg = UIModel.getInstance().chatAliasRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Request to enter/exit a public chat room
     * @memberof AgentLibrary.Chat
     * @param {string} action "ENTER" | "EXIT"
     * @param {integer} roomId Chat room id
     */
    AgentLibrary.prototype.publicChatRoom = function(action, roomId){
      UIModel.getInstance().chatRoomRequest = new ChatRoomRequest(action, "PUBLIC", roomId);
      var msg = UIModel.getInstance().chatRoomRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Request to enter/exit a private chat room
     * @memberof AgentLibrary.Chat
     * @param {string} action "ENTER" | "EXIT"
     * @param {integer} roomId Chat room id
     * @param {integer} agentOne Id for the logged in agent
     * @param {integer} agentTwo Id for the agent or supervisor the logged in agent is chatting with
     */
    AgentLibrary.prototype.privateChatRoom = function(action, roomId, agentOne, agentTwo){
      UIModel.getInstance().chatRoomRequest = new ChatRoomRequest(action, "PRIVATE", roomId, agentOne, agentTwo);
      var msg = UIModel.getInstance().chatRoomRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Send a chat message to the given room
     * @memberof AgentLibrary.Chat
     * @param {integer} roomId Id for chat room
     * @param {string} message The message to be sent
     * @param {function} [callback=null] Callback function when chat message received
     */
    AgentLibrary.prototype.sendChat = function(roomId, message, callback){
      UIModel.getInstance().chatSendRequest = new ChatSendRequest(roomId, message);
      var msg = UIModel.getInstance().chatSendRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.CHAT, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Get list of supervisors for logged in agent
     * @memberof AgentLibrary.Chat
     * @param {function} [callback=null] Callback function when chat message received
     */
    AgentLibrary.prototype.getSupervisors = function(callback){
      UIModel.getInstance().supervisorListRequest = new SupervisorListRequest();
      var msg = UIModel.getInstance().supervisorListRequest.formatJSON();
      utils.setCallback(this, CALLBACK_TYPES.SUPERVISOR_LIST, callback);
      utils.sendMessage(this, msg);
    };
    /**
     * Send accept/decline response when a chat is presented to an agent
     * @memberof AgentLibrary.Chat
     * @param {string} uii Unique identifier for the chat session
     * @param {string} response ACCEPT|REJECT response
     * @param {string} responseReason Agent reason for Reject
     */
    AgentLibrary.prototype.chatPresentedResponse = function(uii, messageId, response, responseReason){
      UIModel.getInstance().chatPresentedRequest = new ChatPresentedResponseRequest(uii, messageId, response, responseReason);
      var msg = UIModel.getInstance().chatPresentedRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Send an external chat message
     * @memberof AgentLibrary.Chat
     * @param {string} uii Unique identifier for the chat session
     * @param {string} agentId The agent associated with the chat
     * @param {string} message The message sent by the agent
     */
    AgentLibrary.prototype.chatMessage = function(uii, agentId, message){
      UIModel.getInstance().chatMessageRequest = new ChatMessageRequest(uii, agentId, message, false);
      var msg = UIModel.getInstance().chatMessageRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Send an whisper type chat message
     * @memberof AgentLibrary.Chat
     * @param {string} uii Unique identifier for the chat session
     * @param {string} agentId The agent associated with the chat
     * @param {string} message The message sent by the agent
     */
    AgentLibrary.prototype.chatWhisper = function(uii, agentId, message){
      UIModel.getInstance().chatMessageRequest = new ChatMessageRequest(uii, agentId, message, true);
      var msg = UIModel.getInstance().chatMessageRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Send a disposition to end a chat session
     * @memberof AgentLibrary.Chat
     * @param {string} uii Unique identifier for the chat session
     * @param {number} agentId The agent's id
     * @param {number} dispositionId Id of the selected disposition
     * @param {string} [notes=""] Agent notes
     * @param {boolean} sendAcknowlegement Whether or not to fire callback
     * @param {object} [script=null] Script data associated with the chat session
     */
    AgentLibrary.prototype.chatDisposition = function(uii, agentId, dispositionId, notes, sendAcknowlegement, script, sessionId){
      UIModel.getInstance().chatDispositionRequest = new ChatDispositionRequest(uii, agentId, dispositionId, notes, sendAcknowlegement, script, sessionId);
      var msg = UIModel.getInstance().chatDispositionRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Send the chat to a different Chat Queue
     * @memberof AgentLibrary.Chat
     * @param {string} uii Unique identifier for the chat session
     * @param {number} agentId The agent's id
     * @param {number} chatQueueId Id of the Chat Queue to requeue to
     * @param {number} skillId Skill id associated with the Chat Queue
     * @param {boolean} [maintainAgent=fakse] Whether or not to keep the current agent connected to the chat on requeue
     */
    AgentLibrary.prototype.chatRequeue = function(uii, agentId, chatQueueId, skillId, maintainAgent){
      UIModel.getInstance().chatRequeueRequest = new ChatRequeueRequest(uii, agentId, chatQueueId, skillId, maintainAgent);
      var msg = UIModel.getInstance().chatRequeueRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Sent when agent starts/stops typing
     * @memberof AgentLibrary.Chat
     * @param {string} uii Unique identifier for the chat session
     */
    AgentLibrary.prototype.chatTyping = function(uii){
      UIModel.getInstance().chatTypingRequest = new ChatTypingRequest(uii);
      var msg = UIModel.getInstance().chatTypingRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Request to add a session on an existing chat
     * @memberof AgentLibrary.Chat
     * @param {string} uii Unique identifier for the chat session
     * @param {string} agentId Current logged in agent id
     * @param {string} monitorAgentId Agent id handling this chat
     */
    AgentLibrary.prototype.monitorChat = function(uii, agentId, monitorAgentId){
      UIModel.getInstance().monitorChatRequest = new MonitorChatRequest(uii, agentId, monitorAgentId);
      var msg = UIModel.getInstance().monitorChatRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Request to terminate an active chat session
     * @memberof AgentLibrary.Chat
     * @param {string} uii Unique identifier for the chat session
     * @param {string} agentId Current logged in agent id
     * @param {string} sessionId Chat session id
     */
    AgentLibrary.prototype.leaveChat = function(uii, agentId, sessionId){
      UIModel.getInstance().leaveChatRequest = new LeaveChatRequest(uii, agentId, sessionId);
      var msg = UIModel.getInstance().leaveChatRequest.formatJSON();
      utils.sendMessage(this, msg);
    };
    /**
     * Request a list of active chats by agent id
     * @memberof AgentLibrary.Chat
     * @param {string} uii Unique identifier for the chat session
     * @param {string} agentId Current logged in agent id
     * @param {string} monitorAgentId Agent id handling chats
     */
    AgentLibrary.prototype.chatList = function(agentId, monitorAgentId){
      UIModel.getInstance().chatList = new ChatListRequest(agentId, monitorAgentId);
      var msg = UIModel.getInstance().chatList.formatJSON();
      utils.sendMessage(this, msg);
    };
  }
  function initAgentLibraryLogger (context) {
    'use strict';
    var AgentLibrary = context.AgentLibrary;
    AgentLibrary.prototype.openLogger = function(){
      var instance = this;
      if("indexedDB" in context){
        // Open database
        var dbRequest = indexedDB.open("AgentLibraryLogging", 5); // version number
        dbRequest.onerror = function(event){
          console.error("Error requesting DB access");
        };
        dbRequest.onsuccess = function(event){
          instance._db = event.target.result;
          //prune items older than 2 days
          instance.purgeLog();
          instance._db.onerror = function(event){
            // Generic error handler for all errors targeted at this database requests
            console.error("AgentLibrary: Database error - " + event.target.errorCode);
          };
          instance._db.onsuccess = function(event){
            console.log("AgentLibrary: Successful logging of record");
          };
        };
        // This event is only implemented in recent browsers
        dbRequest.onupgradeneeded = function(event){
          instance._db = event.target.result;
          // Create an objectStore to hold log information. Key path should be unique
          if(!instance._db.objectStoreNames.contains("logger")){
            var objectStore = instance._db.createObjectStore("logger", { autoIncrement: true });
            // simple indicies: index name, index column path
            objectStore.createIndex("logLevel", "logLevel", {unique: false});
            objectStore.createIndex("dts", "dts", {unique: false});
            // index for logLevel and date range
            var name = "levelAndDate";
            var keyPath = ['logLevel','dts'];
            objectStore.createIndex(name, keyPath, {unique: false});
          }
        };
      }else{
        console.warn("AgentLibrary: indexedDB NOT supported by your Browser.");
      }
    };
    /**
     * Purge records older than 2 days from the AgentLibrary log
     * @memberof AgentLibrary
     */
    AgentLibrary.prototype.purgeLog = function(){
      var instance = this;
      if(instance._db){
        var transaction = instance._db.transaction(["logger"], "readwrite");
        var objectStore = transaction.objectStore("logger");
        var dateIndex = objectStore.index("dts");
        var endDate = new Date();
        endDate.setDate(endDate.getDate() - 2); // two days ago
        var range = IDBKeyRange.upperBound(endDate);
        var destroy = dateIndex.openCursor(range).onsuccess = function(event){
          var cursor = event.target.result;
          if(cursor){
            objectStore.delete(cursor.primaryKey);
            cursor.continue();
          }
        };
      }
    };
    /**
     * Clear the AgentLibrary log by emptying the IndexedDB object store
     * @memberof AgentLibrary
     */
    AgentLibrary.prototype.clearLog = function(){
      var instance = this;
      var transaction = instance._db.transaction(["logger"], "readwrite");
      var objectStore = transaction.objectStore("logger");
      var objectStoreRequest = objectStore.clear();
      objectStoreRequest.onsuccess = function(event){
        console.log("AgentLibrary: logger database cleared");
      };
    };
    AgentLibrary.prototype.deleteDB = function(){
      var DBDeleteRequest = indexedDB.deleteDatabase("AgentLibraryLogging");
      DBDeleteRequest.onerror = function(event) {
        console.log("Error deleting database.");
      };
      DBDeleteRequest.onsuccess = function(event) {
        console.log("Database deleted successfully");
      };
    };
    AgentLibrary.prototype.getLogRecords = function(logLevel, startDate, endDate, maxRows, callback){
      logLevel = logLevel || "";
      var instance = this;
      var transaction = instance._db.transaction(["logger"], "readonly");
      var objStore = transaction.objectStore("logger");
      var index = null,
        cursor = null,
        range = null,
        limit = maxRows || 100;
      utils.setCallback(instance, CALLBACK_TYPES.LOG_RESULTS, callback);
      if(logLevel !== "" && logLevel.toUpperCase() !== "ALL" && logLevel.toUpperCase() !== "NO-STATS") { // looking for specific log level type
        if(startDate && endDate){
          var lowerBound = [logLevel.toLowerCase(), startDate];
          var upperBound = [logLevel.toLowerCase(), endDate];
          range = IDBKeyRange.bound(lowerBound,upperBound);
        }else if(startDate){
          range = IDBKeyRange.lowerBound([logLevel.toLowerCase(), startDate]);
        }else if(endDate){
          range = IDBKeyRange.upperBound([logLevel.toLowerCase(), endDate]);
        }
        if(range !== null){
          // with the provided date range
          var levelAndDateReturn = [];
          var idxLevelAndDate = 0;
          index = objStore.index("levelAndDate");
          index.openCursor(range, "prev").onsuccess = function(event){
            cursor = event.target.result;
            if(cursor && idxLevelAndDate < limit){
              levelAndDateReturn.push(cursor.value);
              idxLevelAndDate = idxLevelAndDate + 1;
              cursor.continue();
            }else{
              utils.fireCallback(instance, CALLBACK_TYPES.LOG_RESULTS, levelAndDateReturn);
            }
          };
        }else{
          // no date range specified, return all within log level
          var logLevelReturn = [];
          var idxLogLevel = 0;
          index = objStore.index("logLevel");
          index.openCursor(logLevel, "prev").onsuccess = function(event){
            cursor = event.target.result;
            if(cursor && idxLogLevel < limit){
              logLevelReturn.push(cursor.value);
              idxLogLevel = idxLogLevel + 1;
              cursor.continue();
            }else{
              utils.fireCallback(instance, CALLBACK_TYPES.LOG_RESULTS, logLevelReturn);
            }
          };
        }
      } else if(logLevel.toUpperCase() === "NO-STATS"){ // give us all types except stats
        if(startDate && endDate){
          range = IDBKeyRange.bound(startDate,endDate);
        }else if(startDate){
          range = IDBKeyRange.lowerBound(startDate);
        }else if(endDate){
          range = IDBKeyRange.upperBound(endDate);
        }
        if(range !== null){
          // with the provided date range
          var dtsNoStatsReturn = [];
          var idxDTSNoStats = 0;
          index = objStore.index("dts");
          index.openCursor(range, "prev").onsuccess = function(event){
            cursor = event.target.result;
            if(cursor && idxDTSNoStats < limit){
              if(cursor.value.logLevel !== "stats"){
                dtsNoStatsReturn.push(cursor.value);
                idxDTSNoStats = idxDTSNoStats + 1;
              }
              cursor.continue();
            }else{
              utils.fireCallback(instance, CALLBACK_TYPES.LOG_RESULTS, dtsNoStatsReturn);
            }
          };
        }else{
          // no date range specified, return all records
          var noStatsReturn = [];
          var idxNoStats = 0;
          objStore.openCursor().onsuccess = function(event){
            cursor = event.target.result;
            if(cursor && idxNoStats < limit){
              if(cursor.value.logLevel !== "stats"){
                noStatsReturn.push(cursor.value);
                idxNoStats = idxNoStats + 1;
              }
              cursor.continue();
            }else{
              utils.fireCallback(instance, CALLBACK_TYPES.LOG_RESULTS, noStatsReturn);
            }
          };
        }
      } else { // give us all log level types
        if(startDate && endDate){
          range = IDBKeyRange.bound(startDate,endDate);
        }else if(startDate){
          range = IDBKeyRange.lowerBound(startDate);
        }else if(endDate){
          range = IDBKeyRange.upperBound(endDate);
        }
        if(range !== null){
          // with the provided date range
          var dtsReturn = [];
          var idxDTS = 0;
          index = objStore.index("dts");
          index.openCursor(range, "prev").onsuccess = function(event){
            cursor = event.target.result;
            if(cursor && idxDTS < limit){
              dtsReturn.push(cursor.value);
              idxDTS = idxDTS + 1;
              cursor.continue();
            }else{
              utils.fireCallback(instance, CALLBACK_TYPES.LOG_RESULTS, dtsReturn);
            }
          };
        }else{
          // no date range specified, return all records
          var allValsReturn = [];
          var idxAll = 0;
          objStore.openCursor().onsuccess = function(event){
            cursor = event.target.result;
            if(cursor && idxAll < limit){
              allValsReturn.push(cursor.value);
              idxAll = idxAll + 1;
              cursor.continue();
            }else{
              utils.fireCallback(instance, CALLBACK_TYPES.LOG_RESULTS, allValsReturn);
            }
          };
        }
      }
      return null;
    };
  }
  var initAgentLibrary = function (context) {
    initAgentLibraryCore(context);
    initAgentLibrarySocket(context);
    initAgentLibraryAgent(context);
    initAgentLibraryCall(context);
    initAgentLibraryLead(context);
    initAgentLibraryChat(context);
    initAgentLibraryLogger(context);
    return context.AgentLibrary;
  };
  if (typeof define === 'function' && define.amd) {
    // Expose Library as an AMD module if it's loaded with RequireJS or
    // similar.
    //console.log("AgentLibrary: using AMD");
    define(function () {
      return initAgentLibrary({});
    });
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    //console.log("AgentLibrary: Using Node");
    module.exports = initAgentLibrary(this);
  } else {
    // Load Library normally (creating a Library global) if not using an AMD
    // loader.
    //console.log("AgentLibrary: Not using AMD");
    initAgentLibrary(this);
  }
} (this));
