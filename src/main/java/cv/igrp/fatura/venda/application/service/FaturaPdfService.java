package cv.igrp.fatura.venda.application.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.EntidadeEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.EntidadeRepository;
import cv.igrp.fatura.venda.application.dto.FaturaVendaReadDTO;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FaturaPdfService {

    private final EntidadeRepository entidadeRepo;
    private final FaturaVendaRepository faturaVendaRepo;

    private static final Color BLACK      = new Color(0,   0,   0);
    private static final Color MID_GRAY   = new Color(180, 180, 180);
    private static final Color LIGHT_GRAY = new Color(240, 240, 240);
    private static final Color TEXT_GRAY  = new Color(110, 110, 110);
    private static final Color DARK       = new Color(30,  30,  30);

    private static final BigDecimal EUR_RATE = new BigDecimal("110.265");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Locale PT = new Locale("pt", "PT");

    // ─────────────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public byte[] gerarReciboById(Integer id) {
        return faturaVendaRepo.findById(id)
                .map(f -> gerarRecibo(FaturaVendaReadDTO.from(f)))
                .orElseThrow(() -> new NoSuchElementException("Fatura " + id + " não encontrada"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    public byte[] gerarRecibo(FaturaVendaReadDTO fatura) {

        EntidadeEntity empresa = null;
        try { empresa = entidadeRepo.findAll().stream().findFirst().orElse(null); }
        catch (Exception ignored) {}

        Document doc = new Document(PageSize.A4, 50f, 50f, 50f, 50f);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            writer.setPageEvent(new PageFooterEvent());
            doc.open();

            BaseFont bf, bfB;
            try {
                bf  = BaseFont.createFont(BaseFont.HELVETICA,      BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                bfB = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            } catch (Exception e) { bf = bfB = BaseFont.createFont(); }

            Font fCompName = new Font(bfB, 13, Font.BOLD,   DARK);
            Font fNorm9    = new Font(bf,   9, Font.NORMAL, DARK);
            Font fNorm8    = new Font(bf,   8, Font.NORMAL, DARK);
            Font fGray8    = new Font(bf,   8, Font.NORMAL, TEXT_GRAY);
            Font fBold9    = new Font(bfB,  9, Font.BOLD,   DARK);
            Font fBold8    = new Font(bfB,  8, Font.BOLD,   DARK);
            Font fBold7    = new Font(bfB,  7, Font.BOLD,   TEXT_GRAY);
            Font fClientN  = new Font(bfB, 10, Font.BOLD,   DARK);
            Font fItemBold = new Font(bfB,  8, Font.BOLD,   DARK);
            Font fTotECV   = new Font(bfB, 11, Font.BOLD,   DARK);
            Font fTotEUR   = new Font(bf,   8, Font.NORMAL, TEXT_GRAY);
            Font fSmall    = new Font(bf,   7, Font.NORMAL, TEXT_GRAY);

            String codigo = str(fatura.getCodigo(), "—");

            // ═══════════════════════════════════════════════════════════════
            // 1. HEADER — Empresa (esq) | Fatura N.º + ORIGINAL (dir)
            // ═══════════════════════════════════════════════════════════════
            PdfPTable hdr = new PdfPTable(2);
            hdr.setWidthPercentage(100);
            hdr.setWidths(new float[]{1.6f, 0.4f});
            hdr.setSpacingAfter(4f);

            // Left: empresa
            PdfPCell compCell = noborder();
            compCell.addElement(new Paragraph(str(empresa != null ? empresa.getDesig() : null, "eFatura"), fCompName));
            if (empresa != null) {
                if (ok(empresa.getEndereco()))  compCell.addElement(p(empresa.getEndereco(), fGray8));
                if (ok(empresa.getTelefone()))  compCell.addElement(p("Tel. " + empresa.getTelefone(), fGray8));
                if (ok(empresa.getEmail()))     compCell.addElement(p(empresa.getEmail(), fGray8));
                if (ok(empresa.getNif()))       compCell.addElement(p("NIF: " + empresa.getNif(), fNorm8));
            }
            hdr.addCell(compCell);

            // Right: stacked bordered boxes — invoice number / series / ORIGINAL
            String serieLabel = "";
            if (fatura.getPrSerie() != null) {
                var s = fatura.getPrSerie();
                serieLabel = ok(s.getDesig()) ? s.getDesig() : str(s.getCodigo(), "");
            }

            PdfPTable docBoxes = new PdfPTable(1);
            docBoxes.setWidthPercentage(100);
            docBoxes.addCell(box("Fatura N.º " + codigo, fBold9));
            if (ok(serieLabel)) docBoxes.addCell(box(serieLabel, fGray8));
            docBoxes.addCell(box("ORIGINAL", fBold9));

            PdfPCell docCell = noborder();
            docCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            docCell.addElement(docBoxes);
            hdr.addCell(docCell);
            doc.add(hdr);

            // Separator
            hRule(doc, MID_GRAY, 0.5f, 6f);

            // ═══════════════════════════════════════════════════════════════
            // 2. CLIENTE
            // ═══════════════════════════════════════════════════════════════
            PdfPTable cliTbl = new PdfPTable(1);
            cliTbl.setWidthPercentage(100);
            cliTbl.setSpacingAfter(6f);

            PdfPCell cliCell = new PdfPCell();
            cliCell.setBorder(Rectangle.BOX);
            cliCell.setBorderColor(MID_GRAY);
            cliCell.setPadding(8f);

            Paragraph cliLbl = new Paragraph("Dados do cliente", fBold7);
            cliLbl.setSpacingAfter(3f);
            cliCell.addElement(cliLbl);

            if (fatura.getCliente() != null) {
                var c = fatura.getCliente();
                if (ok(c.getDesig()))    cliCell.addElement(p(c.getDesig(), fClientN));
                if (ok(c.getEndereco())) cliCell.addElement(p(c.getEndereco(), fNorm8));
                if (ok(c.getNif()))      cliCell.addElement(p("NIF: " + c.getNif(), fNorm8));
            } else {
                cliCell.addElement(p("—", fNorm8));
            }
            cliTbl.addCell(cliCell);
            doc.add(cliTbl);

            // ═══════════════════════════════════════════════════════════════
            // 3. TABELA INFO (7 colunas)
            // ═══════════════════════════════════════════════════════════════
            PdfPTable infoTbl = new PdfPTable(7);
            infoTbl.setWidthPercentage(100);
            infoTbl.setWidths(new float[]{0.6f, 0.9f, 0.7f, 1.1f, 0.8f, 1.5f, 0.9f});
            infoTbl.setSpacingAfter(6f);

            for (String h : new String[]{"Nº","Requisição","Moeda","Desc. Financeiro","Data","Cond. Pagamento","Data Fatura"}) {
                PdfPCell th = new PdfPCell(new Phrase(h, fBold8));
                th.setBackgroundColor(LIGHT_GRAY);
                th.setBorderColor(MID_GRAY);
                th.setPadding(4f);
                infoTbl.addCell(th);
            }

            String descFinStr = fatura.getDescontoFinanceiro() != null
                    ? fatura.getDescontoFinanceiro().setScale(1, RoundingMode.HALF_UP).toPlainString() + "%"
                    : "0,0%";

            for (String v : new String[]{
                    codigo,
                    "-----",
                    "ECV",
                    descFinStr,
                    fmtDate(fatura.getDtFaturacao()),
                    str(fatura.getTermCondicoes(), "—"),
                    fmtDate(fatura.getDtVencimentoFatura() != null
                            ? fatura.getDtVencimentoFatura() : fatura.getDtFaturacao())
            }) {
                PdfPCell td = new PdfPCell(new Phrase(v, fNorm8));
                td.setBorderColor(MID_GRAY);
                td.setPadding(4f);
                infoTbl.addCell(td);
            }
            doc.add(infoTbl);

            // ═══════════════════════════════════════════════════════════════
            // 4. TABELA ARTIGOS (7 colunas)
            // ═══════════════════════════════════════════════════════════════
            PdfPTable itemsTbl = new PdfPTable(7);
            itemsTbl.setWidthPercentage(100);
            itemsTbl.setWidths(new float[]{0.8f, 3.2f, 0.7f, 0.7f, 1.1f, 0.8f, 1.1f});
            itemsTbl.setSpacingAfter(16f);

            for (String h : new String[]{"Codigo","Descrição","Qtd.","Unid.","Pr Unit.","Imposto","Valor"}) {
                PdfPCell th = new PdfPCell(new Phrase(h, fBold8));
                th.setBackgroundColor(LIGHT_GRAY);
                th.setBorderColor(MID_GRAY);
                th.setPadding(5f);
                itemsTbl.addCell(th);
            }

            boolean alt = false;
            if (fatura.getItems() != null) {
                for (var item : fatura.getItems()) {
                    Color bg = alt ? new Color(248, 248, 248) : Color.WHITE;
                    alt = !alt;

                    String impLabel = resolveImposto(item);
                    String valStr   = item.getValorTotal() != null ? money(item.getValorTotal()) : "—";
                    String puStr    = item.getPrecoUnitario() != null ? money(item.getPrecoUnitario()) : "—";
                    String qtyStr   = item.getQuantidade() != null ? money(item.getQuantidade()) : "—";

                    itd(itemsTbl, str(item.getCodigoArtigo(), "—"), fNorm8,    bg, Element.ALIGN_LEFT);
                    itd(itemsTbl, str(item.getDesig(), "—"),         fNorm8,    bg, Element.ALIGN_LEFT);
                    itd(itemsTbl, qtyStr,                            fNorm8,    bg, Element.ALIGN_RIGHT);
                    itd(itemsTbl, "Unid",                            fNorm8,    bg, Element.ALIGN_CENTER);
                    itd(itemsTbl, puStr,                             fNorm8,    bg, Element.ALIGN_RIGHT);
                    itd(itemsTbl, impLabel,                          fNorm8,    bg, Element.ALIGN_CENTER);
                    itd(itemsTbl, valStr,                            fItemBold, bg, Element.ALIGN_RIGHT);
                }
            }
            doc.add(itemsTbl);

            // ═══════════════════════════════════════════════════════════════
            // 5. NOTA
            // ═══════════════════════════════════════════════════════════════
            if (ok(fatura.getNota())) {
                Paragraph notaLbl = new Paragraph("NOTA:", fBold8);
                notaLbl.setSpacingAfter(2f);
                doc.add(notaLbl);
                Paragraph notaTxt = new Paragraph(fatura.getNota(), fNorm9);
                notaTxt.setSpacingAfter(14f);
                doc.add(notaTxt);
            }

            // ═══════════════════════════════════════════════════════════════
            // 6. TOTAIS (esq) | QR CODE (dir)
            // ═══════════════════════════════════════════════════════════════
            BigDecimal subTotal = safe(fatura.getValorIliquido());
            BigDecimal totalECV = safe(fatura.getValorFatura());
            BigDecimal descCom  = safe(fatura.getDescontoComercial());
            BigDecimal descFin  = safe(fatura.getDescontoFinanceiro());
            BigDecimal totalEUR = EUR_RATE.compareTo(BigDecimal.ZERO) > 0
                    ? totalECV.divide(EUR_RATE, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            String taxLabel = resolveTaxLabel(fatura);

            PdfPTable btm = new PdfPTable(2);
            btm.setWidthPercentage(100);
            btm.setWidths(new float[]{1f, 1f});
            btm.setSpacingAfter(10f);

            // Totais
            PdfPTable totTbl = new PdfPTable(2);
            totTbl.setWidthPercentage(100);
            totRow(totTbl, "Imposto",      taxLabel,         fBold8, fNorm8);
            totRow(totTbl, "Descontos",    money(descCom),   fBold8, fNorm8);
            totRow(totTbl, "Desconto",     money(descFin),   fBold8, fNorm8);
            totRow(totTbl, "Sub Total",    money(subTotal),  fBold8, fNorm8);
            totRowHL(totTbl, "Total (ECV)", money(totalECV), fTotECV);
            totRow(totTbl, "Total ( EUR )", money(totalEUR), fTotEUR, fTotEUR);

            PdfPCell leftCell = noborder();
            leftCell.setVerticalAlignment(Element.ALIGN_TOP);
            leftCell.addElement(totTbl);
            btm.addCell(leftCell);

            // QR code
            String nifEmp = empresa != null && ok(empresa.getNif()) ? empresa.getNif() : "000000000";
            String dtStr  = fatura.getDtFaturacao() != null
                    ? fatura.getDtFaturacao().toString().replace("-", "") : "";
            String qrContent = "CV" + nifEmp
                    + codigo.replaceAll("[^0-9A-Za-z]", "")
                    + dtStr
                    + totalECV.setScale(2, RoundingMode.HALF_UP)
                              .toPlainString().replace(".", "").replace(",", "");

            PdfPCell rightCell = noborder();
            rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            rightCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            byte[] qrBytes = buildQR(qrContent, 130);
            if (qrBytes != null) {
                Image qrImg = Image.getInstance(qrBytes);
                qrImg.setAlignment(Element.ALIGN_CENTER);
                rightCell.addElement(qrImg);
                Paragraph qrTxt = new Paragraph(qrContent, fSmall);
                qrTxt.setAlignment(Element.ALIGN_CENTER);
                rightCell.addElement(qrTxt);
            }
            btm.addCell(rightCell);
            doc.add(btm);

            // ═══════════════════════════════════════════════════════════════
            // 7. RODAPÉ — "TRIBUTO ESPECIAL UNIFICADO" (esq) | texto legal (dir)
            // ═══════════════════════════════════════════════════════════════
            PdfPTable footer = new PdfPTable(2);
            footer.setWidthPercentage(100);
            footer.setWidths(new float[]{0.44f, 0.56f});

            PdfPCell tribCell = new PdfPCell(new Phrase("\"TRIBUTO ESPECIAL UNIFICADO\"", fBold9));
            tribCell.setBorder(Rectangle.BOX);
            tribCell.setBorderColor(MID_GRAY);
            tribCell.setPadding(8f);
            tribCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            tribCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            footer.addCell(tribCell);

            PdfPCell legalCell = noborder();
            legalCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            legalCell.setPaddingLeft(12f);
            legalCell.addElement(p(
                    "Este documento foi gerado e validado pela Plataforma Eletrônica da e-Fatura CV"
                    + " e o link no QR Code comprova a sua validade.", fSmall));
            footer.addCell(legalCell);
            doc.add(footer);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF: " + e.getMessage(), e);
        } finally {
            doc.close();
        }
        return out.toByteArray();
    }

    // ─── QR Code ─────────────────────────────────────────────────────────────
    private static byte[] buildQR(String content, int size) {
        try {
            QRCodeWriter w = new QRCodeWriter();
            BitMatrix m = w.encode(content, BarcodeFormat.QR_CODE, size, size);
            BufferedImage img = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
            for (int x = 0; x < size; x++)
                for (int y = 0; y < size; y++)
                    img.setRGB(x, y, m.get(x, y) ? BLACK.getRGB() : 0xFFFFFF);
            ByteArrayOutputStream b = new ByteArrayOutputStream();
            ImageIO.write(img, "PNG", b);
            return b.toByteArray();
        } catch (Exception e) { return null; }
    }

    // ─── Resolvers ────────────────────────────────────────────────────────────
    private static String resolveImposto(FaturaVendaReadDTO.ItemInfo item) {
        if (item.getImpostos() != null && !item.getImpostos().isEmpty()) {
            var i = item.getImpostos().get(0);
            if (ok(i.getTipoCalculo())) return i.getTipoCalculo();
            if (i.getTaxa() != null)
                return "IVA " + i.getTaxa().setScale(0, RoundingMode.HALF_UP).toPlainString() + "%";
        }
        return "IVA";
    }

    private static String resolveTaxLabel(FaturaVendaReadDTO fatura) {
        if (fatura.getItems() != null) {
            for (var item : fatura.getItems()) {
                if (item.getImpostos() != null && !item.getImpostos().isEmpty()) {
                    var i = item.getImpostos().get(0);
                    if (ok(i.getTipoCalculo())) return i.getTipoCalculo();
                    if (i.getTaxa() != null && i.getTaxa().compareTo(BigDecimal.ZERO) > 0)
                        return "IVA " + i.getTaxa().setScale(0, RoundingMode.HALF_UP).toPlainString() + "%";
                }
            }
        }
        return "IVA";
    }

    // ─── Page footer ──────────────────────────────────────────────────────────
    private static final class PageFooterEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            try {
                BaseFont bf = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                PdfContentByte cb = writer.getDirectContent();
                ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                        new Phrase("Página " + writer.getPageNumber(),
                                new Font(bf, 7, Font.NORMAL, new Color(160, 160, 160))),
                        document.right(), 28f, 0f);
            } catch (Exception ignored) {}
        }
    }

    // ─── Layout helpers ───────────────────────────────────────────────────────
    private static void hRule(Document doc, Color color, float h, float after) throws DocumentException {
        PdfPTable t = new PdfPTable(1);
        t.setWidthPercentage(100);
        t.setSpacingAfter(after);
        PdfPCell c = new PdfPCell();
        c.setFixedHeight(h);
        c.setBackgroundColor(color);
        c.setBorder(Rectangle.NO_BORDER);
        t.addCell(c);
        doc.add(t);
    }

    private static PdfPCell noborder() {
        PdfPCell c = new PdfPCell();
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(3f);
        return c;
    }

    private static PdfPCell box(String text, Font font) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setBorder(Rectangle.BOX);
        c.setBorderColor(MID_GRAY);
        c.setPadding(6f);
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        return c;
    }

    private static Paragraph p(String text, Font font) {
        return new Paragraph(text, font);
    }

    private static void itd(PdfPTable t, String text, Font font, Color bg, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setBackgroundColor(bg);
        c.setPadding(4f);
        c.setHorizontalAlignment(align);
        c.setBorderColor(MID_GRAY);
        t.addCell(c);
    }

    private static void totRow(PdfPTable t, String lbl, String val, Font lf, Font vf) {
        PdfPCell lc = new PdfPCell(new Phrase(lbl, lf));
        lc.setBorder(Rectangle.BOTTOM);
        lc.setBorderColor(MID_GRAY);
        lc.setPadding(4f);
        t.addCell(lc);

        PdfPCell vc = new PdfPCell(new Phrase(val, vf));
        vc.setBorder(Rectangle.BOTTOM);
        vc.setBorderColor(MID_GRAY);
        vc.setPadding(4f);
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        t.addCell(vc);
    }

    private static void totRowHL(PdfPTable t, String lbl, String val, Font f) {
        PdfPCell lc = new PdfPCell(new Phrase(lbl, f));
        lc.setBorder(Rectangle.NO_BORDER);
        lc.setPadding(5f);
        t.addCell(lc);

        PdfPCell vc = new PdfPCell(new Phrase(val, f));
        vc.setBorder(Rectangle.NO_BORDER);
        vc.setPadding(5f);
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        t.addCell(vc);
    }

    // ─── Value helpers ────────────────────────────────────────────────────────
    private static String money(BigDecimal v) {
        if (v == null) return "0,00";
        return String.format(PT, "%,.2f", v.setScale(2, RoundingMode.HALF_UP));
    }

    private static String fmtDate(LocalDate d) {
        return d != null ? d.format(DATE_FMT) : "—";
    }

    private static BigDecimal safe(BigDecimal v) {
        return v != null ? v.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private static boolean ok(String s) {
        return s != null && !s.isBlank();
    }

    private static String str(String s, String fallback) {
        return ok(s) ? s : fallback;
    }
}
