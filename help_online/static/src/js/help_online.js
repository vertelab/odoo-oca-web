/** @odoo-module **/
/* Copyright 2024 Vertel AB */

import {Component} from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import {useService} from "@web/core/utils/hooks";
import { Dialog } from "@web/core/dialog/dialog";
import { rpc } from "@web/core/network/rpc";
import { session } from "@web/session";
import { user } from "@web/core/user";
import { deleteConfirmationMessage, ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

export class Helper extends Component {
    static template = "help_online.Button";
    static props =  {
        searchModel: {type: Object, optional: true},
        pagerProps: {type: Object, optional: true},
    };

    setup() {
        super.setup();
        this.orm = useService("orm");
        this.dialog = useService("dialog");
    }

    // Get model and view info from the component context
    getModelAndViewInfo() {
        let model = null;
        let viewType = null;

        //thoughts&todo: this is a complex way to get model and viewType - get a better way man.

        if (!model) {
            let parent = this.__owl__.parent;
            let depth = 0;
            while (parent && !model && depth < 10) { // Limit depth to avoid infinite loops

                // Check if parent has model info in env
                if (parent.component.env && parent.component.env.config) {
                    model = parent.component.env.config.resModel;
                    viewType = parent.component.env.config.viewType;
                }

                // Check if parent has props with model info
                if (!model && parent.component.props) {
                    if (parent.component.props.resModel) {
                        model = parent.component.props.resModel;
                    }
                    if (parent.component.props.action) {
                        model = parent.component.props.action.res_model;
                        viewType = parent.component.props.action.view_mode?.split(',')[0];
                    }
                    if (parent.component.props.searchModel) {
                        if (parent.component.props.searchModel.config) {
                            model = parent.component.props.searchModel.config.resModel;
                            viewType = parent.component.props.searchModel.config.viewType;
                        }
                    }
                }

                parent = parent.parent;
                depth++;
            }
        }

        return {
            model: model || null,
            viewType: viewType || 'list' // default to 'list' if not found
        };
    }

    async mCall() {
        const { model, viewType } = this.getModelAndViewInfo();

        if (!model) {
            return null;
        }

        try {
            return await rpc('/web/dataset/call_kw', {
                model: 'help.online',
                method: 'get_page_url',
                args: [[]],
                kwargs: {
                    'model': model,
                    'view_type': viewType,
                    'user_id': user.userId,
                    'context': session.user_context || {},
                },
            });
        } catch (error) {
            console.error("RPC call failed:", error);
            return null;
        }
    }

    async onClickHelper() {
        const data = await this.mCall();

        if (!data) {
            console.error("No data received from server");
            return;
        }

        if (data && !data.exists) {
            await this.triggerHelp(data.url);
        }

        if (data.url) {
            window.open(data.url, '_blank');
        } else {
            console.error("No URL provided in response");
        }
    }

    async triggerHelp(url) {
        return new Promise(resolve => {
            this.dialog.add(ConfirmationDialog, {
                title: _t("Create Help Page"),
                body: _t("Page does not exist. Do you want to create it?"),
                confirm: async () => {
                    await this.formElement(url);
                    resolve();
                },
                cancel: () => {
                    resolve();
                }
            });
        });
    }

    async formElement(url) {
        // Create a simple page name based on the model and view type we extracted
        const { model, viewType } = this.getModelAndViewInfo();

        // Create a clean page name
        let pageName = 'help';
        if (model) {
            // Convert model name to a clean page name (e.g., calendar.event -> calendar-event)
            pageName += '-' + model.replace(/\./g, '-');
        }
        if (viewType) {
            pageName += '-' + viewType;
        }

        // Create the website page
        const formData = new FormData();
        formData.append('path', pageName);
        formData.append('csrf_token', odoo.csrf_token);

        const response = await fetch('/website/add', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text();

        // Parse the response
        let pageData;
        try {
            pageData = JSON.parse(result);
        } catch (e) {
            throw new Error(`Invalid response format: ${result}`);
        }

        // Open the appropriate editor
        if (pageData.view_id) {
            const editorUrl = `/odoo/ir.ui.view/${pageData.view_id}`;
            window.open(editorUrl, '_blank');
        } else if (pageData.url) {
            const editUrl = pageData.url + '?enable_editor=1';
            window.open(editUrl, '_blank');
        } else {
            throw new Error("Page created but no editor URL available");
        }
    }
}