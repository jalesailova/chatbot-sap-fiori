sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    // Bura diqqət! Logda axtarılan yol budur:
    return Controller.extend("chatbotuijs.chatbotuijs.controller.Main", {
        
        onInit: function () {
            var oModel = new JSONModel({
                messages: [
                    { 
                        sender: "Bot", 
                        text: "Salam! Mən HR Dəstək Botuyam. Sizə necə kömək edə bilərəm?", 
                        timestamp: new Date().toLocaleTimeString() 
                    }
                ]
            });
            this.getView().setModel(oModel, "chatModel");
        },

        onSend: function () {
            var oInput = this.byId("messageInput");
            var sText = oInput.getValue();
            
            if (!sText) {
                return;
            }

            var oChatModel = this.getView().getModel("chatModel");
            var aMessages = oChatModel.getProperty("/messages");

            // 1. Öz mesajımız
            aMessages.push({
                sender: "Mən",
                text: sText,
                timestamp: new Date().toLocaleTimeString()
            });
            oChatModel.refresh(); 
            oInput.setValue("");  

            // 2. Action çağırışı
            var oModel = this.getOwnerComponent().getModel();
            var oAction = oModel.bindContext("/ZI_MY_CHATBOT_JS(0)/com.sap.gateway.srvd.zui_my_chatbot_js.v0001.ExecuteBotCommand_JS(...)");
            oAction.setParameter("command", sText);
            
            // 3. Yazır...
            aMessages.push({
                sender: "Bot",
                text: "Yazır...",
                timestamp: new Date().toLocaleTimeString()
            });
            oChatModel.refresh();

            // 4. İcra
oAction.execute().then(function () {
    var oContext = oAction.getBoundContext();
    // Bura diqqət: result sahəsini birbaşa götürürük
    var sResponse = oContext.getProperty("result"); 

    aMessages.pop(); // "Yazır..." mesajını sil
    aMessages.push({
        sender: "Bot",
        text: sResponse ? sResponse : "Bot cavab vermədi.",
        timestamp: new Date().toLocaleTimeString()
    });
    oChatModel.refresh();
}).
catch(function (oError) {
                aMessages.pop(); 
                aMessages.push({
                    sender: "Bot",
                    text: "Backend xətası baş verdi.",
                    timestamp: new Date().toLocaleTimeString()
                });
                oChatModel.refresh();
            });
        }
    });
});