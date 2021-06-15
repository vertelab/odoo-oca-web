odoo.define('oca.HelpOnline', function (require) {
    "use strict";

    var core = require('web.core');
    var QWeb = core.qweb;
    var _t = core._t;
    var BasicController = require('web.BasicController');
    var ControlPanel = require('web.ControlPanel');
    var Dialog = require('web.Dialog');
    var utils = require('web.utils');
    
    ControlPanel.patch('oca.HelpOnline.monkeypatch', T =>
        class extends T {
                _formatFields(fields) {
                    
                    var self = this;
                    // Reference hooks
                   console.log('Nu kör vi!', this);
                   let view = this.props.view || {};
                   if ($(self.el).find('div.o_help_online_buttons').length == 0 && view.model) {
                       this.rpc({model: 'help.online', method: 'get_page_url', args: [view.model, view.type]}).then(function(result) {
                           console.log(result);
                            if (result && ! _.isEmpty(result)) {
                                var $helpButton =  self.render_help_button(result);
                                // update the control panel with the new help button
                                console.log($helpButton);
                                $(self.el).find('nav.o_cp_switch_buttons').after($helpButton);
                            }
                        });
                    }
                   return super._formatFields(fields);
                }
                
                render_help_button(url_info) {
                    console.log("render_help_button")
                    var $helpButton = $(QWeb.render("HelpOnline.Button", {'url_info': url_info}));
                    $helpButton.tooltip();
                    if (url_info.exists === false) {
                        $helpButton.on('click', function (event) {
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

