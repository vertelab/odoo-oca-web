# -*- coding: utf-8 -*-
# Copyright 2014 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    'name': 'Help Online',
    'version': '16.0.1.0.0',
    'author': "ACSONE SA/NV,Odoo Community Association (OCA)",
    'maintainer': 'Vertel AB',
    'website': 'vertel.se',
    'license': 'AGPL-3',
    'category': 'Documentation',
    'depends': [
        'website',
    ],
    'data': [
        'security/ir.model.access.csv',
        'security/help_online_groups.xml',
        'security/help_online_rules.xml',
        'wizards/export_help_wizard_view.xml',
        'wizards/import_help_wizard_view.xml',
        'views/ir_ui_view_view.xml',
        'views/help_online_view.xml',
        'data/ir_config_parameter_data.xml',
    ],
    'assets': {
        'web.assets_backend': [
            "help_online/static/src/xml/help_online.xml",

            (
                "after",
                "web/static/src/search/control_panel/control_panel.js",
                "help_online/static/src/**/*.js",
            ),
            (
                "after",
                "web/static/src/search/control_panel/control_panel.xml",
                "help_online/static/src/xml/control_panel.xml",
            ),
            (
                "after",
                "web/static/src/views/form/control_panel/form_control_panel.xml",
                "help_online/static/src/xml/form_control_panel.xml",
            ),
        ],
    },
    'installable': True,
}
