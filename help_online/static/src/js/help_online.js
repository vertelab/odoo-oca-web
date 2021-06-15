odoo.define('oca.HelpOnline', function (require) {
    "use strict";

    var core = require('web.core');
    var QWeb = core.qweb;
    var _t = core._t;
    var BasicController = require('web.BasicController');
    var ControlPanel = require('web.ControlPanel');
    var Dialog = require('web.Dialog');
    var utils = require('web.utils');
    const rpc = require("web.rpc");
    var time = require('web.time');
    
    ControlPanel.patch('oca.HelpOnline.monkeypatch', T =>
        class extends T {
                _formatFields(fields) {
                    var ret = super._formatFields(fields);
                    var self = this;
                    let view = this.props.view || {};
                    if ($(self.el).find('div.o_help_online_buttons').length == 0 && view.model) {
                        var data = {
                            "jsonrpc": "2.0",
                            "method": "call",
                            "params": {
                                "args": [
                                    view.model, view.type
                                ],
                                "model": 'help.online',
                                "method": 'get_page_url',
                                "kwargs": {
                                    "context": odoo.session_info.user_context
                                }
                            },
                        //this is how odoo core calculates id. Yes, it is indeed dumb
                        "id": Math.floor(Math.random() * 1000 * 1000 * 1000)
                        };
                        var url = "/web/dataset/call_kw/help.online/get_page_url";
                        //we have to make a manual jquery call because of odoo core issues with rpc
                        $.ajax(url, _.extend({}, {}, {
                            url: url,
                            dataType: 'json',
                            type: 'POST',
                            data: JSON.stringify(data, time.date_to_utc),
                            contentType: 'application/json'
                        })).then(function(result) {
                            console.log(result);
                            if (result.result && ! _.isEmpty(result.result)) {
                                var $helpButton =  self.render_help_button(result.result);
                                // update the control panel with the new help button
                                console.log($helpButton);
                                $(self.el).find('div.o_cp_bottom_right').append($helpButton);
                            }
                        });
                    }
                   return ret
                }

                render_help_button(url_info) {
                    console.log("url info: ", url_info);
                    var $helpButton = $(QWeb.render("HelpOnline.Button", {'url_info': url_info}));
                    $helpButton.tooltip();
                    if (url_info.exists === false) {
                        console.log("im true");
                        $helpButton.on('click', function (event) {
                            console.log("hej", arguments);
                            var evt = event;
                            evt.preventDefault();
                            var self = this;
                            Dialog.confirm(
                                self,
                                _t('Page does not exist. Do you want to create?'),
                                {confirm_callback:  function() {
                                    var form = $("<form></form>");
                                    let csrf_input = $('<input name="csrf_token"/>');
                                    csrf_input.val(core.csrf_token);
                                    form.append(csrf_input);
                                    form.attr({
                                            id     : "formform",
                                            // The location given in the link itself
                                            action : evt.target.href, 
                                            method : "POST",
                                            // Open in new window/tab
                                            target : evt.target.target
                                    });
                                    $("body").append(form);
                                    $("#formform").submit();
                                    $("#formform").remove();
                                    return false;
                                }
                            });
                        });
                    }
                    return $helpButton;
            }
        })
})

