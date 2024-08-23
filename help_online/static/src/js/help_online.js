/** @odoo-module **/
/* Copyright 2024 Vertel AB */

import {Component} from "@odoo/owl";
import core, { _t } from 'web.core';
import {useDebounced} from "@web/core/utils/timing";
import {useService} from "@web/core/utils/hooks";
import Dialog from 'web.Dialog';
import ajax from 'web.ajax';
var time = require('web.time');
var session = require('web.session');


export class Helper extends Component {
    setup() {
        super.setup();
        this.action = useService("action");
        this.orm = useService("orm");
    }

    page_data() {
        let view = this.props.view || {};

        const data = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "args": [
                    view.model, view.type
                ],
                "model": 'help.online',
                "method": 'get_page_url',
                "kwargs": {
                    "context": session.user_context
                }
            },
            //this is how odoo core calculates id. Yes, it is indeed dumb
            "id": Math.floor(Math.random() * 1000 * 1000 * 1000)
        };

        return data
    }

    viewInfo(url) {
        // Extract the part after the hash (#)
        let hashPart = url.split('#')[1];

        // Split the parameters
        let params = new URLSearchParams(hashPart);

        // Get the model and view_type
        let model = params.get('model');
        let viewType = params.get('view_type');

        return {model, viewType}
    }

    async mCall() {
        let view = this.props.view || {};

        const url = window.location.href;
        const {model, viewType} = this.viewInfo(url);

        return ajax.jsonRpc('/web/dataset/call_kw', 'call', {
            model: 'help.online',
            method: 'get_page_url',
            args: [{ }],
            kwargs: {
                'model': model,
                'view_type': viewType,
            },
        }).then(function (data) {
            return data
        })
    }

    async onClickHelper() {
        const data = await this.mCall();
        if (data && !data.exists) {
            await this.triggerHelp(data.url)
        }
        window.open(data.url, '_blank');
    }

    async triggerHelp(url) {
        return new Promise(resolve => {
            Dialog.confirm(
                this,
                this.env._t("Page does not exist. Do you want to create?"),
                { confirm_callback: async() => {
                    await this.formElement(url);
                }},
            );
        });
    }

    async formElement(url) {
        // Create a form element
        const form = $('<form>', {
            id: 'formform',
            action: url + '?redirect=true',
            method: 'POST',
            target: '_blank'
        });

        // Create and append the CSRF token input
        const csrfInput = $('<input>', {
            name: 'csrf_token',
            value: core.csrf_token
        });

        form.append(csrfInput);

        // Append the form to the body and submit it
        $('body').append(form);
        form.submit();
        form.remove();
    }
}

Object.assign(Helper, {
    template: "help_online.Button",
    props: {
        searchModel: {type: Object, optional: true},
        pagerProps: {type: Object, optional: true},
    },
});