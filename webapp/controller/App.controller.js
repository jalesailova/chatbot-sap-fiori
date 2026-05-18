sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    // Namespace logdakı xətaya uyğun olaraq "chatbot_ui_js.chatbotuijs" olmalıdır
    return Controller.extend("chatbotuijs.chatbotuijs.controller.Main", {
        
        onInit: function () {
            var oModel = new JSONModel({
                messages: [
                    { 
                        sender: "Bot", 
                        text: "Salam! Mən HR Dəstək Botuyam. Xahiş edirəm Personal number təqdim edəsiniz.", 
                        timestamp: new Date().toLocaleTimeString() 
                    }
                ]
            });
            this.getView().setModel(oModel, "chatModel");
        },

        onSend: function () {
    var oInput = this.byId("messageInput");
    var sText = oInput.getValue();
    if (!sText) return;

    var oChatModel = this.getView().getModel("chatModel");
    var aMessages = oChatModel.getProperty("/messages");

    aMessages.push({
        sender: "Mən",
        text: sText,
        timestamp: new Date().toLocaleTimeString()
    });
    oChatModel.refresh();
    oInput.setValue("");

    var oModel = this.getOwnerComponent().getModel();

    // ✅ Collection-a bound action — EntitySet üzərindən çağırılır, key yoxdur
    var oAction = oModel.bindContext(
        "/ZI_MY_CHATBOT_JS/com.sap.gateway.srvd.zui_my_chatbot_js.v0001.ExecuteBotCommand_JS(...)"
    );

    // ✅ Böyük hərf ilə — COMMAND və RESULT
    oAction.setParameter("COMMAND", sText);
    oAction.setParameter("RESULT", "");  // məcburi field, boş göndər

    oAction.execute().then(function () {
        var oContext = oAction.getBoundContext();
        var oResult = oContext.getObject();
        // ✅ RESULT böyük hərf ilə
        var sResponse = oResult.RESULT || oResult.result || "Cavab gəlmədi";

        aMessages.push({
            sender: "Bot",
            text: sResponse,
            timestamp: new Date().toLocaleTimeString()
        });
        oChatModel.refresh();
    }).catch(function (oError) {
        console.error(oError);
        aMessages.push({
            sender: "Bot",
            text: "Xəta baş verdi: " + oError.message,
            timestamp: new Date().toLocaleTimeString()
        });
        oChatModel.refresh();
    });
}
    });
});