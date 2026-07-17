from io import BytesIO

import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.pdfgen import canvas

from app.models.finance import Receipt


def render_receipt_pdf(receipt: Receipt) -> bytes:
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title=f"Reçu {receipt.numero}",
        author="Institut NENGAPETA",
    )
    styles = getSampleStyleSheet()
    emerald = colors.HexColor("#0f766e")
    graphite = colors.HexColor("#10242f")
    line = colors.HexColor("#d7e4e1")
    pale = colors.HexColor("#eef7f5")

    title_style = ParagraphStyle("ReceiptTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=18, leading=23, textColor=graphite)
    subtitle_style = ParagraphStyle("ReceiptSubtitle", parent=styles["Normal"], fontSize=9, leading=13, textColor=colors.HexColor("#64748b"))
    label_style = ParagraphStyle("ReceiptLabel", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=colors.HexColor("#475569"))
    value_style = ParagraphStyle("ReceiptValue", parent=styles["Normal"], fontSize=9, leading=12, textColor=graphite)

    student_name = " ".join(
        value
        for value in [receipt.student.user.nom, receipt.student.user.postnom, receipt.student.user.prenom]
        if value
    )
    fee_label = receipt.payment.fee.fee_type.nom if receipt.payment and receipt.payment.fee and receipt.payment.fee.fee_type else "Frais scolaire"
    payment_date = receipt.payment.date_paiement.strftime("%d/%m/%Y à %H:%M") if receipt.payment and receipt.payment.date_paiement else "-"

    qr = qrcode.make(receipt.qr_payload)
    qr_buffer = BytesIO()
    qr.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)

    header = Table(
        [
            [
                [
                    Paragraph("INSTITUT NENGAPETA", ParagraphStyle("School", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9, textColor=emerald)),
                    Paragraph("Reçu de paiement", title_style),
                    Paragraph("Gestion des inscriptions et paiements des frais scolaires", subtitle_style),
                ],
                Image(qr_buffer, width=28 * mm, height=28 * mm),
            ]
        ],
        colWidths=[125 * mm, 32 * mm],
        rowHeights=[32 * mm],
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("BOX", (0, 0), (-1, -1), 0.6, line),
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))

    rows = [
        [Paragraph("Numéro du reçu", label_style), Paragraph(receipt.numero, value_style)],
        [Paragraph("Référence paiement", label_style), Paragraph(receipt.payment.reference, value_style)],
        [Paragraph("Élève", label_style), Paragraph(student_name or "Élève non renseigné", value_style)],
        [Paragraph("Matricule", label_style), Paragraph(receipt.student.matricule, value_style)],
        [Paragraph("Type de frais", label_style), Paragraph(fee_label, value_style)],
        [Paragraph("Montant payé", label_style), Paragraph(f"{receipt.payment.montant} {receipt.payment.devise}", ParagraphStyle("Amount", parent=value_style, fontName="Helvetica-Bold", fontSize=11, textColor=emerald))],
        [Paragraph("Date de paiement", label_style), Paragraph(payment_date, value_style)],
        [Paragraph("Statut", label_style), Paragraph(receipt.payment.statut.capitalize(), value_style)],
    ]
    details = Table(rows, colWidths=[50 * mm, 107 * mm])
    details.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), pale),
        ("GRID", (0, 0), (-1, -1), 0.4, line),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))

    footer = Table(
        [[Paragraph("Caissier / Agent comptable", subtitle_style), Paragraph("Signature et cachet", subtitle_style)]],
        colWidths=[78 * mm, 78 * mm],
    )
    footer.setStyle(TableStyle([
        ("LINEABOVE", (0, 0), (-1, 0), 0.6, line),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 18),
    ]))

    story = [
        header,
        Spacer(1, 10),
        details,
        Spacer(1, 18),
        Paragraph("Ce reçu est généré automatiquement par le système de l'Institut NENGAPETA. Le QR code permet de vérifier la référence du paiement.", subtitle_style),
        Spacer(1, 32),
        footer,
    ]
    document.build(story)
    return buffer.getvalue()


def render_student_card_pdf(receipt_payload: str, full_name: str, matricule: str, classe: str | None) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle(f"Carte eleve {matricule}")
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(72, 780, "Carte d'eleve - Institut NENGAPETA")
    pdf.setFont("Helvetica", 12)
    pdf.drawString(72, 740, f"Nom: {full_name}")
    pdf.drawString(72, 720, f"Matricule: {matricule}")
    pdf.drawString(72, 700, f"Classe: {classe or 'Non renseignee'}")
    qr = qrcode.make(receipt_payload)
    qr_buffer = BytesIO()
    qr.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    pdf.drawImage(ImageReader(qr_buffer), 380, 680, width=130, height=130)
    pdf.showPage()
    pdf.save()
    return buffer.getvalue()
