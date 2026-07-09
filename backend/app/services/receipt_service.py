from io import BytesIO

import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from app.models.finance import Receipt


def render_receipt_pdf(receipt: Receipt) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle(f"Recu {receipt.numero}")
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(72, 790, "Institut NENGAPETA")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(72, 765, "Recu de paiement")
    pdf.drawString(72, 735, f"Numero: {receipt.numero}")
    pdf.drawString(72, 715, f"Eleve: {receipt.student.user.nom} {receipt.student.user.prenom or ''}")
    pdf.drawString(72, 695, f"Matricule: {receipt.student.matricule}")
    pdf.drawString(72, 675, f"Montant: {receipt.payment.montant} {receipt.payment.devise}")
    pdf.drawString(72, 655, f"Reference: {receipt.payment.reference}")

    qr = qrcode.make(receipt.qr_payload)
    qr_buffer = BytesIO()
    qr.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    pdf.drawImage(ImageReader(qr_buffer), 390, 660, width=110, height=110)
    pdf.showPage()
    pdf.save()
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
