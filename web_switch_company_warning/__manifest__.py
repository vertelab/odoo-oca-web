# Copyright 2017 Akretion <raphael.reverdy@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Multicompany - Switch Company Warning",
    "summary": "Show a warning if current company has been switched"
               " in another tab or window.",
    "version": "12.0.1.0.0",
    "category": "web",
    "website": "https://github.com/OCA/web",
    "license": "AGPL-3",
    "author": "Akretion, "
              "Odoo Community Association (OCA)",
    "depends": [
        'web',
    ],
    "data": [
        "view/view.xml",
    ],
    "qweb": [
        "static/src/xml/switch_company_warning.xml",
    ],
    'installable': True,
    "application": False,
}