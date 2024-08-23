/** @odoo-module **/
/* Copyright 2024 Vertel AB

 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {ControlPanel} from "@web/search/control_panel/control_panel";
import {Helper} from "./help_online";
import {patch} from "@web/core/utils/patch";

ControlPanel.components = {
    ...ControlPanel.components,
    Helper
}

patch(ControlPanel.prototype, "help_online.ControlPanel", {
    setup() {
        this._super(...arguments);
        this.forbiddenSubTypes = ["base_settings"];

    },
});