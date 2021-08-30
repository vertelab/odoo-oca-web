from odoo import fields, models, api, _
import base64
from lxml import etree


class IrUIView(models.Model):
    _inherit = 'ir.ui.view'

    @api.depends('name')
    def _identify_documentation(self):
        for rec in self:
            if rec.name and rec.name.startswith('help-'):
                rec.is_documentation = True
            else:
                rec.is_documentation = False

    is_documentation = fields.Boolean(string="Is Documentation", compute=_identify_documentation, store=True)

    def export_documentation(self):
        active_ids = self.env.context.get('active_ids', [])
        if not active_ids:
            active_ids = self.id
        view_ids = self.env['ir.ui.view'].browse(active_ids)

        root = etree.Element("odoo")
        data = etree.SubElement(root, 'data')

        for rec in view_ids:
            # record
            record = etree.SubElement(data, 'record')
            record.set('id', rec.name)
            record.set('model', 'ir.ui.view')

            # field
            field = etree.SubElement(record, 'field')
            field.set('name', 'name')
            field.text = rec.name

            field = etree.SubElement(record, 'field')
            field.set('name', 'type')
            field.text = 'qweb'

            field = etree.SubElement(record, 'field')
            field.set('name', 'key')
            field.text = rec.key

            # arch
            field = etree.SubElement(record, 'field')
            field.set('name', 'arch')
            field.set('type', 'xml')

            field.append(etree.fromstring(rec.arch_base))

        xml_data = etree.tostring(root, pretty_print=True, xml_declaration=True, encoding='utf-8').decode('utf-8')

        attachment = self.env['ir.attachment'].create({
            'name': 'view.xml',
            'datas': base64.encodebytes(xml_data.encode('utf-8')),
            'mimetype': 'application/xml',
        })

        simplified_form_view = self.env.ref("help_online.view_attachment_simplified_form")

        action = {
            "name": _("Export Documentation"),
            "view_mode": "form",
            "view_id": simplified_form_view.id,
            "res_model": "ir.attachment",
            "type": "ir.actions.act_window",
            "target": "self",
            "res_id": attachment.id,
        }

        return action
