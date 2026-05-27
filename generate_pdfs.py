"""
Generate professional A4 PDF letters for PainFree Philippines.
Produces:
  pdfs/letter-grotto-en.pdf
  pdfs/letter-zeilig-en.pdf
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
    Table, TableStyle
)
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT

# ── Colours ──────────────────────────────────────────────────────────────────
NAVY  = colors.HexColor('#06111F')
TEAL  = colors.HexColor('#00B4D8')
GREY  = colors.HexColor('#637083')
INK   = colors.HexColor('#0F1F30')
INK2  = colors.HexColor('#2D4257')
WHITE = colors.white

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'pdfs')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Style helpers ─────────────────────────────────────────────────────────────
def make_styles():
    base = getSampleStyleSheet()

    title = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=22,
        textColor=NAVY,
        alignment=TA_LEFT,
        spaceAfter=8,
    )
    subtitle = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=18,
        textColor=TEAL,
        alignment=TA_LEFT,
        spaceAfter=4,
    )
    credential = ParagraphStyle(
        'Credential',
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=14,
        textColor=GREY,
        alignment=TA_LEFT,
        spaceAfter=2,
    )
    body = ParagraphStyle(
        'DocBody',
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=INK2,
        alignment=TA_JUSTIFY,
        spaceAfter=10,
        spaceBefore=2,
    )
    body_bold = ParagraphStyle(
        'DocBodyBold',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=16,
        textColor=INK,
        alignment=TA_JUSTIFY,
        spaceAfter=4,
    )
    section_h = ParagraphStyle(
        'SectionHead',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=NAVY,
        alignment=TA_LEFT,
        spaceBefore=14,
        spaceAfter=6,
    )
    bullet = ParagraphStyle(
        'Bullet',
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        textColor=INK2,
        alignment=TA_LEFT,
        leftIndent=14,
        spaceAfter=5,
    )
    ref = ParagraphStyle(
        'Ref',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=GREY,
        alignment=TA_JUSTIFY,
        leftIndent=18,
        firstLineIndent=-18,
        spaceAfter=6,
    )
    watermark = ParagraphStyle(
        'Watermark',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=TEAL,
        alignment=TA_RIGHT,
        spaceAfter=0,
    )
    footer_style = ParagraphStyle(
        'Footer',
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=GREY,
        alignment=TA_CENTER,
    )
    return dict(
        title=title, subtitle=subtitle, credential=credential,
        body=body, body_bold=body_bold, section_h=section_h,
        bullet=bullet, ref=ref, watermark=watermark,
        footer_style=footer_style,
    )

S = make_styles()


def hr():
    return HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#D4DDE8'),
                      spaceAfter=10, spaceBefore=10)


def sp(h=6):
    return Spacer(1, h)


def header_block(org_name, watermark_text):
    """Returns top header table: org on left, watermark label on right."""
    data = [[
        Paragraph(f'<font color="#00B4D8"><b>{org_name}</b></font>', S['subtitle']),
        Paragraph(watermark_text, S['watermark']),
    ]]
    t = Table(data, colWidths=['70%', '30%'])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, 0), 1.5, TEAL),
    ]))
    return t


def footer_para():
    return Paragraph(
        'PainFree Philippines  ·  painfree.ph  ·  +63 962 181 1360',
        S['footer_style']
    )


def on_every_page(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8.5)
    canvas.setFillColor(GREY)
    canvas.drawCentredString(
        A4[0] / 2,
        1.6 * cm,
        'PainFree Philippines  ·  painfree.ph  ·  +63 962 181 1360'
    )
    canvas.restoreState()


# ─────────────────────────────────────────────────────────────────────────────
# PDF 1 — Prof. Itamar Grotto
# ─────────────────────────────────────────────────────────────────────────────
def build_grotto():
    path = os.path.join(OUTPUT_DIR, 'letter-grotto-en.pdf')
    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=2.4*cm, rightMargin=2.4*cm,
        topMargin=2.6*cm, bottomMargin=2.8*cm,
    )

    story = []

    # Header
    story.append(header_block('PainFree Philippines', 'OFFICIAL MEDICAL REVIEW'))
    story.append(sp(16))

    # Title
    story.append(Paragraph(
        'PROPOSAL: INTEGRATION OF PEMF TECHNOLOGY IN HEALTH INSTITUTIONS',
        S['title']
    ))
    story.append(sp(4))

    # Author block
    story.append(Paragraph('<b>Written / Advised by:</b>', S['credential']))
    story.append(Paragraph('Prof. Itamar Grotto, MD', S['body_bold']))
    story.append(Paragraph(
        'Former Associate Director General, Ministry of Health',
        S['credential']
    ))
    story.append(Paragraph(
        'Member of the Executive Board, World Health Organization (WHO)',
        S['credential']
    ))
    story.append(sp(8))

    story.append(Paragraph('<i>To: Health Institution Directors / Decision Makers</i>', S['credential']))
    story.append(Paragraph(
        '<b>Subject:</b> Integration of PEMF Technology for Rehabilitation and Pain Management',
        S['credential']
    ))
    story.append(sp(8))
    story.append(hr())

    # Executive Summary
    story.append(Paragraph('Executive Summary — General Background', S['section_h']))
    story.append(Paragraph(
        'PEMF (Pulsed Electromagnetic Field Therapy) technology utilizes low-frequency pulsed '
        'electromagnetic fields for therapeutic purposes. It is primarily used for pain management, '
        'orthopedic and neurological rehabilitation, fracture healing, and inflammation reduction.',
        S['body']
    ))
    story.append(Paragraph(
        'The technology has been FDA-approved since 1979 and is in routine use in leading centers '
        'worldwide, including the Mayo Clinic and the US military.',
        S['body']
    ))
    story.append(hr())

    # Mechanism
    story.append(Paragraph('Biological Mechanism of Action', S['section_h']))
    story.append(Paragraph(
        'PEMF influences the cellular and molecular levels by affecting ion channels and mitochondrial '
        'activity. It stimulates the secretion of growth factors (IGF-1, VEGF, BMP), promotes ATP '
        'production, and reduces pro-inflammatory cytokines.',
        S['body']
    ))
    story.append(hr())

    # Clinical Indications
    story.append(Paragraph('Clinical Indications', S['section_h']))
    indications = [
        ('<b>Orthopedic Fractures and Fixations:</b> Accelerating the healing of fractures with '
         'non-union, and improving fixation stability following fusion surgeries.'),
        ('<b>Osteoarthritis (OA):</b> Reducing pain and improving function in joints, particularly '
         'the knee and hip.'),
        ('<b>Lower Back Pain:</b> Reducing chronic pain after surgeries and in cases of Failed Back '
         'Surgery Syndrome.'),
        ('<b>Fibromyalgia:</b> Improving functional metrics, sleep quality, and reducing inflammation.'),
        ('<b>Diabetic and Chronic Wounds:</b> Accelerating healing and reducing infections.'),
        ('<b>Neurological Rehabilitation:</b> Improving nerve conduction, motor function, and balance '
         'in post-stroke rehabilitation scenarios.'),
        ('<b>Chronic Pain in the Elderly:</b> Comparative studies have demonstrated the superior '
         'efficacy of PEMF over TENS and Ultrasound in treating chronic pain and accelerating '
         'rehabilitation.'),
    ]
    for item in indications:
        story.append(Paragraph(f'•  {item}', S['bullet']))
    story.append(hr())

    # Safety
    story.append(Paragraph('Safety and Regulation', S['section_h']))
    safety = [
        '<b>FDA Class III Device Approval:</b> Approved indications include fracture healing, soft tissue pain, and osteoarthritis.',
        '<b>CE Standard and AMAR Approval:</b> Approved by the Israeli Ministry of Health for use as part of physiotherapy treatment.',
        '<b>Safety Profile:</b> Negligible side effects; no heat generation or significant biological risk.',
        '<b>Contraindications:</b> Pacemakers, pregnancy, and active tumors.',
    ]
    for item in safety:
        story.append(Paragraph(f'•  {item}', S['bullet']))
    story.append(hr())

    # Applied Advantages
    story.append(Paragraph('Applied Advantages for Health Institutions', S['section_h']))
    advantages = [
        'Integration of new technology serving as a model for innovative physiotherapy care.',
        'Reduction of workload on physiotherapy staff (hands-free treatment).',
        'Possibility for independent treatment by the patient (without a constant therapist).',
        'Shortening of hospitalization times and reduction in medication use (primarily painkillers).',
        'Potential for home treatment models to shorten waiting lists.',
    ]
    for item in advantages:
        story.append(Paragraph(f'•  {item}', S['bullet']))
    story.append(hr())

    # Economic Model
    story.append(Paragraph('Proposed Economic Model', S['section_h']))
    story.append(Paragraph(
        'Average Revenue per Patient: approx. ₱2,214–₱2,583 per treatment',
        S['body']
    ))
    econ = [
        '<b>Initial Pilot:</b> 10 devices across 3 departments.',
        '<b>ROI (Return on Investment):</b> Positive ROI within less than six months (based on Mayo Clinic data — 22% reduction in hospitalization, 18% decrease in direct costs, ROI achieved in 5.4 months).',
    ]
    for item in econ:
        story.append(Paragraph(f'•  {item}', S['bullet']))
    story.append(hr())

    # Summary
    story.append(Paragraph('Summary and Recommendation', S['section_h']))
    story.append(Paragraph(
        'Scientific evidence, regulatory approval, and clear economic savings point to high potential '
        'for integrating PEMF as an integral part of treatment and rehabilitation programs in health '
        'institutions. It is recommended to start with an applied pilot to evaluate clinical and '
        'economic effectiveness under real-world conditions.',
        S['body']
    ))
    story.append(hr())

    # References
    story.append(Paragraph('Main Sources & References', S['section_h']))
    story.append(Paragraph('<b>Systematic Reviews:</b>', S['body_bold']))
    refs = [
        '1.  Paolucci T, et al. Electromagnetic Field Therapy in Musculoskeletal Pain: A Systematic Review. <i>Journal of Pain Research</i>, 2020.',
        '2.  Han C, et al. Promising Application of Pulsed Electromagnetic Fields in Musculoskeletal Disorders. <i>Biomedicine & Pharmacotherapy</i>, 2020.',
    ]
    for r in refs:
        story.append(Paragraph(r, S['ref']))

    story.append(Paragraph('<b>Economic Research:</b>', S['body_bold']))
    story.append(Paragraph(
        '3.  Mayo Clinic Internal Report (2018): Found a 22% reduction in hospitalization, an 18% decrease in direct costs, and a return on investment within 5.4 months.',
        S['ref']
    ))

    story.append(Paragraph('<b>Additional Clinical Studies:</b>', S['body_bold']))
    refs2 = [
        '4.  Sutbeyaz ST, et al. Pulsed Electromagnetic Field Therapy for Low Back Pain. <i>Archives of Physical Medicine and Rehabilitation</i>.',
        '5.  Osti L, et al. PEMF following Rotator Cuff Repair: A Randomized Controlled Trial. <i>Journal of Orthopaedic Surgery and Research</i>.',
    ]
    for r in refs2:
        story.append(Paragraph(r, S['ref']))

    doc.build(story, onFirstPage=on_every_page, onLaterPages=on_every_page)
    print(f'  Generated: {path}')


# ─────────────────────────────────────────────────────────────────────────────
# PDF 2 — Prof. Gabi Zeilig
# ─────────────────────────────────────────────────────────────────────────────
def build_zeilig():
    path = os.path.join(OUTPUT_DIR, 'letter-zeilig-en.pdf')
    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=2.4*cm, rightMargin=2.4*cm,
        topMargin=2.6*cm, bottomMargin=2.8*cm,
    )

    story = []

    # Header
    story.append(header_block('PainFree Philippines', 'OFFICIAL MEDICAL REVIEW'))
    story.append(sp(16))

    # Title
    story.append(Paragraph(
        'ON TREATMENT WITH LOW-INTENSITY PULSED ELECTROMAGNETIC FIELDS (PEMF)',
        S['title']
    ))
    story.append(sp(4))

    # Author block
    story.append(Paragraph('<b>Written by:</b>', S['credential']))
    story.append(Paragraph('Prof. Gabi Zeilig, MD', S['body_bold']))
    story.append(Paragraph(
        'Former Director, Neurological Rehabilitation Unit, Sheba Medical Center, Tel Hashomer',
        S['credential']
    ))
    story.append(Paragraph(
        'Director of Rehabilitation Projects, Sheba Medical Center',
        S['credential']
    ))
    story.append(Paragraph('<i>(Translated from Hebrew)</i>', S['credential']))
    story.append(sp(8))
    story.append(hr())

    # Opening
    story.append(Paragraph(
        'Millions of men and women around the world are desperately searching for solutions to their '
        'suffering due to pain and the resulting decline in functional ability. The individual suffering '
        'is immense, and the economic costs to both individuals and the healthcare system are enormous.',
        S['body']
    ))
    story.append(Paragraph(
        'Degenerative changes in joints, musculoskeletal inflammation, and trauma are the primary causes '
        'of pain and functional limitation.',
        S['body']
    ))
    story.append(Paragraph(
        'Current standard treatments include physical methods — manual therapy and physiotherapy combined '
        'with various technologies (ultrasound, laser, etc.) — as well as oral and intra-articular '
        'medications, and surgical interventions (joint replacement, etc.), with outcomes that do not '
        'always satisfy patients. This must be compounded by the side effects of pharmacological '
        'treatment, especially when administered over long periods.',
        S['body']
    ))
    story.append(hr())

    # Evidence base
    story.append(Paragraph('A Growing Evidence Base', S['section_h']))
    story.append(Paragraph(
        'The use of pulsed electromagnetic field treatment (PEMF) has gained significant momentum in '
        'recent decades and is supported by a rich body of medical literature. It is most commonly '
        'offered as a complementary therapy alongside other treatments such as physiotherapy.',
        S['body']
    ))
    story.append(Paragraph(
        'As early as <b>1982</b>, an article published in <i>JAMA</i> demonstrated the efficacy of '
        'PEMF in healing non-union fractures. In <b>1984</b>, an article in the prestigious journal '
        '<i>The Lancet</i> demonstrated the effectiveness of PEMF in patients suffering from shoulder '
        'pain due to rotator cuff damage. Publications on this topic multiplied significantly thereafter.',
        S['body']
    ))
    story.append(Paragraph(
        'In <b>2016</b>, an article published in <i>Rheumatology</i> (Impact Factor 7.580) showed the '
        'effectiveness of PEMF in reducing pain in patients with knee osteoarthritis. A systematic '
        'review published in <b>2020</b> in the <i>Journal of Pain Research</i> (IF 3.133) indicated '
        'the effectiveness of PEMF in reducing pain caused by musculoskeletal conditions, including '
        'fibromyalgia.',
        S['body']
    ))
    story.append(Paragraph(
        'In <b>2020</b>, another review published in <i>Biomedicine & Pharmacotherapy</i> (IF 6.529) '
        'demonstrated PEMF efficacy in patients suffering from back pain (discopathies) and tendon '
        'inflammation (tendinitis). An article published in <b>2019</b> in <i>Pain & Therapy</i> '
        '(IF 5.725) showed the effectiveness of PEMF in reducing lower back pain.',
        S['body']
    ))
    story.append(Paragraph(
        'Finally, in <b>2020</b>, a comprehensive review in <i>Physical Therapy</i> (IF 3.021) '
        'indicated that PEMF treatment — whether as a standalone therapy or in combination with '
        'physiotherapy — has a positive effect on pain, stiffness, and physical function in patients '
        'suffering from degenerative changes in the knees, hands, and cervical spine.',
        S['body']
    ))
    story.append(hr())

    # Mechanism
    story.append(Paragraph('Mechanism of Action', S['section_h']))
    story.append(Paragraph(
        'The mechanism of action of PEMF, while not yet fully understood, is based on stimulating '
        'the clearance of inflammatory substances and promoting the growth of cartilage cells.',
        S['body']
    ))
    story.append(Paragraph(
        'The treatment has no side effects. PEMF use has received FDA approval for the following '
        'specific medical conditions:',
        S['body']
    ))
    fda = [
        '<b>1979:</b> FDA approved PEMF therapy for stimulating bone growth.',
        '<b>1987:</b> FDA approved PEMF for adjunct therapy for treating post-operative edema and pain.',
        '<b>2004:</b> PEMF approved as an adjunct to cervical fusion surgery.',
    ]
    for item in fda:
        story.append(Paragraph(f'•  {item}', S['bullet']))
    story.append(hr())

    # Conclusion
    story.append(Paragraph('Conclusion', S['section_h']))
    story.append(Paragraph(
        'There is undoubtedly a place to integrate PEMF technology in rehabilitative treatments for '
        'populations suffering from pain and functional impairment in any of the medical conditions '
        'mentioned in this review.',
        S['body']
    ))
    story.append(hr())

    # References
    story.append(Paragraph('References', S['section_h']))
    refs = [
        '1.  Bassett CAL, Mitchell SN, Gaston SR. Pulsing Electromagnetic Field Treatment in Ununited Fractures and Failed Arthrodeses. <i>JAMA</i>. 1982;247(5):623–628.',
        '2.  Binder A, et al. Pulsed electromagnetic field therapy of persistent rotator cuff tendinitis. <i>Lancet</i>. 1984 Mar 31;1(8379):695–8.',
        '3.  Bagnato GL, et al. Pulsed electromagnetic fields in knee osteoarthritis: a double blind, placebo-controlled, randomized clinical trial. <i>Rheumatology (Oxford)</i>. 2016 Apr;55(4):755–62.',
        '4.  Paolucci T, et al. Electromagnetic field therapy: a rehabilitative perspective in the management of musculoskeletal pain — a systematic review. <i>J. Pain. Res</i>. 2020;12(13):1385–1400.',
        '5.  Hu H, et al. Promising application of Pulsed Electromagnetic Fields (PEMFs) in musculoskeletal disorders. <i>Biomedicine & Pharmacotherapy</i>. 2020 Nov;131:110767.',
        '6.  Lisi AJ, et al. A Pulsed Electromagnetic Field Therapy Device for Non-Specific Low Back Pain: A Pilot Randomized Controlled Trial. <i>Pain Ther</i>. 2019;8(1):133–140.',
        '7.  Wang T, et al. Effects of electromagnetic fields on osteoarthritis. <i>Biomed Pharmacother</i>. 2019 Oct;118:109282.',
    ]
    for r in refs:
        story.append(Paragraph(r, S['ref']))

    story.append(sp(14))
    story.append(hr())

    # Signature
    story.append(Paragraph('<b>Prof. Gabi Zeilig, MD</b>', S['body_bold']))
    story.append(Paragraph('Director of Rehabilitation Projects', S['credential']))
    story.append(Paragraph('Former Director, Neurological Rehabilitation Unit', S['credential']))
    story.append(Paragraph('Rehabilitation Division, Sheba Medical Center, Tel Hashomer', S['credential']))

    doc.build(story, onFirstPage=on_every_page, onLaterPages=on_every_page)
    print(f'  Generated: {path}')


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('Generating PDFs...')
    build_grotto()
    build_zeilig()
    print('Done.')
