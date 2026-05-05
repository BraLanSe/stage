package cv.igrp.fatura.venda.application.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.EntidadeEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.EntidadeRepository;
import cv.igrp.fatura.venda.application.dto.FaturaVendaReadDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    // ── Palette ────────────────────────────────────────────────────
    private static final Color BRAND_BLUE       = new Color(31,  78,  160);
    private static final Color ACCENT_BLUE      = new Color(53,  121, 246);
    private static final Color BRAND_BLUE_LIGHT = new Color(220, 231, 255);
    private static final Color LIGHT_GRAY       = new Color(247, 248, 250);
    private static final Color MID_GRAY         = new Color(229, 231, 235);
    private static final Color TEXT_GRAY        = new Color(107, 114, 128);
    private static final Color SUCCESS_GREEN    = new Color(16,  185, 129);
    private static final Color WARN_AMBER       = new Color(245, 158, 11);
    private static final Color DANGER_RED       = new Color(220, 53,  69);
    private static final Color ALT_ROW          = new Color(239, 246, 255);

    private static final DateTimeFormatter DATE_FMT     = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // ──────────────────────────────────────────────────────────────
    public byte[] gerarRecibo(FaturaVendaReadDTO fatura) {

        // Fetch empresa (graceful: PDF still generates if none configured)
        EntidadeEntity empresa = null;
        try {
            empresa = entidadeRepo.findAll().stream().findFirst().orElse(null);
        } catch (Exception ignored) {}

        Document doc = new Document(PageSize.A4, 45f, 45f, 50f, 65f);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            writer.setPageEvent(new PageFooterEvent(fatura, empresa));
            doc.open();

            // ── Fonts — CP1252 for full Portuguese character support ──
            BaseFont bf, bfB;
            try {
                bf  = BaseFont.createFont(BaseFont.HELVETICA,      BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                bfB = BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            } catch (Exception e) {
                bf = bfB = BaseFont.createFont();
            }

            Font fXlBlue  = new Font(bfB, 20, Font.BOLD,   BRAND_BLUE);
            Font fLgBlue  = new Font(bfB, 13, Font.BOLD,   BRAND_BLUE);
            Font fBold9   = new Font(bfB,  9, Font.BOLD);
            Font fBold8   = new Font(bfB,  8, Font.BOLD);
            Font fBold7   = new Font(bfB,  7, Font.BOLD,   TEXT_GRAY);
            Font fNorm9   = new Font(bf,   9, Font.NORMAL);
            Font fNorm8   = new Font(bf,   8, Font.NORMAL);
            Font fGray7   = new Font(bf,   7, Font.NORMAL, TEXT_GRAY);
            Font fWh9B    = new Font(bfB,  9, Font.BOLD,   Color.WHITE);
            Font fWh8B    = new Font(bfB,  8, Font.BOLD,   Color.WHITE);
            Font fWh10B   = new Font(bfB, 10, Font.BOLD,   Color.WHITE);
            Font fBlueSm  = new Font(bfB,  7, Font.BOLD,   BRAND_BLUE);

            // ══════════════════════════════════════════════════════
            // 1. HEADER — Company (left)  |  Document identity (right)
            // ══════════════════════════════════════════════════════
            PdfPTable hdr = new PdfPTable(2);
            hdr.setWidthPercentage(100);
            hdr.setWidths(new float[]{1.15f, 0.85f});
            hdr.setSpacingAfter(8f);

            // Left: company block
            PdfPCell compCell = noBorderCell();
            String empresaName = (empresa != null && has(empresa.getDesig()))
                    ? empresa.getDesig() : "eFatura";
            compCell.addElement(new Paragraph(empresaName, fXlBlue));
            if (empresa != null) {
                if (has(empresa.getNif()))
                    compCell.addElement(new Paragraph("NIF: " + empresa.getNif(), fGray7));
                if (has(empresa.getEndereco()))
                    compCell.addElement(new Paragraph(empresa.getEndereco(), fGray7));
                if (has(empresa.getTelefone()))
                    compCell.addElement(new Paragraph("Tel: " + empresa.getTelefone(), fGray7));
                if (has(empresa.getEmail()))
                    compCell.addElement(new Paragraph(empresa.getEmail(), fGray7));
                // Fiscal regime (lazy — protected)
                String regimeTxt = null;
                try {
                    if (empresa.getPrEnquadramento() != null)
                        regimeTxt = empresa.getPrEnquadramento().getCodigo()
                                + " — " + empresa.getPrEnquadramento().getDesig();
                } catch (Exception ignored) {}
                if (regimeTxt != null) {
                    Font regFont = new Font(bfB, 7, Font.BOLD, new Color(79, 70, 229));
                    compCell.addElement(new Paragraph("Regime: " + regimeTxt, regFont));
                }
            }
            hdr.addCell(compCell);

            // Right: document identity
            PdfPCell docCell = noBorderCell();
            docCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            String tipoLabel = (fatura.getTipoFatura() != null && fatura.getTipoFatura().getDesig() != null)
                    ? fatura.getTipoFatura().getDesig().toUpperCase(Locale.ROOT) : "FATURA";
            Paragraph tipoP = new Paragraph(tipoLabel, fXlBlue);
            tipoP.setAlignment(Element.ALIGN_RIGHT);
            docCell.addElement(tipoP);

            String codigo = fatura.getCodigo() != null ? fatura.getCodigo() : "—";
            Paragraph codeP = new Paragraph("Nº " + codigo, fLgBlue);
            codeP.setAlignment(Element.ALIGN_RIGHT);
            docCell.addElement(codeP);

            Color estadoColor;
            String estadoTxt;
            switch (fatura.getEstado() != null ? fatura.getEstado() : "") {
                case "CONFIRMADO" -> { estadoColor = SUCCESS_GREEN; estadoTxt = "● CONFIRMADO"; }
                case "ANULADO"    -> { estadoColor = DANGER_RED;    estadoTxt = "● ANULADO"; }
                default           -> { estadoColor = WARN_AMBER;    estadoTxt = "● RASCUNHO"; }
            }
            Paragraph estadoP = new Paragraph(estadoTxt, new Font(bfB, 9, Font.BOLD, estadoColor));
            estadoP.setAlignment(Element.ALIGN_RIGHT);
            docCell.addElement(estadoP);
            hdr.addCell(docCell);
            doc.add(hdr);

            // Blue header rule
            addRule(doc, BRAND_BLUE, 2.5f, 10f);

            // ══════════════════════════════════════════════════════
            // 2. INFO BLOCKS — Invoice details (left) | Client (right)
            // ══════════════════════════════════════════════════════
            PdfPTable infoTbl = new PdfPTable(2);
            infoTbl.setWidthPercentage(100);
            infoTbl.setSpacingAfter(14f);

            // Invoice details
            PdfPCell invCell = infoBlock("DETALHES DA FATURA", fBold7, LIGHT_GRAY);
            addLine(invCell, "Nº Documento:", codigo,             fBold9, fNorm9);
            if (fatura.getPrSerie() != null && has(fatura.getPrSerie().getCodigo()))
                addLine(invCell, "Série:", fatura.getPrSerie().getCodigo(), fBold9, fNorm9);
            addLine(invCell, "Data de emissão:", fmtDate(fatura.getDtFaturacao()), fBold9, fNorm9);
            if (fatura.getDtVencimentoFatura() != null)
                addLine(invCell, "Vencimento:", fmtDate(fatura.getDtVencimentoFatura()), fBold9, fNorm9);
            if (has(fatura.getTermCondicoes()))
                addLine(invCell, "Condições:", fatura.getTermCondicoes(), fBold9, fNorm9);
            if (fatura.getDtConfirmacao() != null)
                addLine(invCell, "Confirmação:", fmtDate(fatura.getDtConfirmacao()), fBold9, fNorm9);
            infoTbl.addCell(invCell);

            // Client details
            PdfPCell cliCell = infoBlock("CLIENTE / DESTINATÁRIO", fBold7, LIGHT_GRAY);
            if (fatura.getCliente() != null) {
                var c = fatura.getCliente();
                cliCell.addElement(new Paragraph(has(c.getDesig()) ? c.getDesig() : "—",
                        new Font(bfB, 10, Font.BOLD)));
                if (has(c.getNif()))
                    addLine(cliCell, "NIF:", c.getNif(),           fBold9, fNorm9);
                if (has(c.getEndereco()))
                    addLine(cliCell, "Morada:", c.getEndereco(),   fBold9, fNorm9);
                if (has(c.getTelefone()))
                    addLine(cliCell, "Tel:", c.getTelefone(),      fBold9, fNorm9);
                if (has(c.getEmail()))
                    addLine(cliCell, "Email:", c.getEmail(),       fBold9, fNorm9);
            } else {
                cliCell.addElement(new Paragraph("—", fNorm9));
            }
            infoTbl.addCell(cliCell);
            doc.add(infoTbl);

            // ══════════════════════════════════════════════════════
            // 3. ITEMS TABLE — 6 columns
            // ══════════════════════════════════════════════════════
            PdfPTable itemsTbl = new PdfPTable(6);
            itemsTbl.setWidthPercentage(100);
            itemsTbl.setWidths(new float[]{3.6f, 0.9f, 1.8f, 1.1f, 1.1f, 1.8f});
            itemsTbl.setSpacingAfter(14f);

            for (String h : new String[]{
                    "Designação / Descrição", "Qtd.",
                    "Preço Unit.", "Desc.%", "IVA%", "Total"}) {
                PdfPCell th = new PdfPCell(new Phrase(h, fWh9B));
                th.setBackgroundColor(BRAND_BLUE);
                th.setPadding(6f);
                th.setBorderColor(BRAND_BLUE);
                itemsTbl.addCell(th);
            }

            boolean alt = false;
            if (fatura.getItems() != null) {
                for (var item : fatura.getItems()) {
                    Color rowBg = alt ? ALT_ROW : Color.WHITE;
                    alt = !alt;

                    // Designation cell (+ optional description sub-line)
                    PdfPCell desCell = new PdfPCell();
                    desCell.setBackgroundColor(rowBg);
                    desCell.setPadding(5f);
                    desCell.setBorderColor(MID_GRAY);
                    desCell.addElement(new Paragraph(
                            has(item.getDesig()) ? item.getDesig() : "—", fNorm9));
                    if (has(item.getDescr()))
                        desCell.addElement(new Paragraph(item.getDescr(), fGray7));
                    itemsTbl.addCell(desCell);

                    td(itemsTbl, qty(item.getQuantidade()),           fNorm9,         rowBg, Element.ALIGN_CENTER);
                    td(itemsTbl, cve(item.getPrecoUnitario()),        fNorm9,         rowBg, Element.ALIGN_RIGHT);
                    td(itemsTbl, pct(item.getDescontoComercialPerc()),fNorm9,         rowBg, Element.ALIGN_CENTER);

                    // IVA% from first imposto record
                    String taxaStr = "—";
                    if (item.getImpostos() != null && !item.getImpostos().isEmpty()) {
                        BigDecimal t = item.getImpostos().get(0).getTaxa();
                        if (t != null) taxaStr = t.stripTrailingZeros().toPlainString() + "%";
                    }
                    td(itemsTbl, taxaStr, fNorm9, rowBg, Element.ALIGN_CENTER);
                    td(itemsTbl, cve(item.getValorTotal()), new Font(bfB, 9, Font.BOLD), rowBg, Element.ALIGN_RIGHT);
                }
            }
            doc.add(itemsTbl);

            // ══════════════════════════════════════════════════════
            // 4. BOTTOM — Notes (left) | Fiscal summary + Totals (right)
            // ══════════════════════════════════════════════════════
            PdfPTable btm = new PdfPTable(2);
            btm.setWidthPercentage(100);
            btm.setWidths(new float[]{1f, 1f});
            btm.setSpacingAfter(14f);

            // Notes cell
            PdfPCell notesCell = noBorderCell();
            notesCell.setVerticalAlignment(Element.ALIGN_TOP);
            notesCell.setPaddingRight(10f);
            if (has(fatura.getNota())) {
                notesCell.addElement(new Paragraph("Notas:", fBold8));
                notesCell.addElement(new Paragraph(fatura.getNota(), fNorm8));
            }
            btm.addCell(notesCell);

            // Right: fiscal summary + totals
            PdfPCell rightCell = noBorderCell();
            rightCell.setPadding(0f);

            // ── Tax breakdown table ──────────────────────────────
            PdfPTable taxTbl = new PdfPTable(3);
            taxTbl.setWidthPercentage(100);
            taxTbl.setSpacingAfter(4f);

            PdfPCell rfHdr = new PdfPCell(new Phrase("RESUMO FISCAL", fBlueSm));
            rfHdr.setColspan(3);
            rfHdr.setBackgroundColor(BRAND_BLUE_LIGHT);
            rfHdr.setBorderColor(MID_GRAY);
            rfHdr.setPadding(5f);
            taxTbl.addCell(rfHdr);

            for (String h : new String[]{"Base Imponível", "Taxa", "Valor IVA"}) {
                PdfPCell th = new PdfPCell(new Phrase(h, fWh8B));
                th.setBackgroundColor(ACCENT_BLUE);
                th.setPadding(5f);
                th.setBorderColor(MID_GRAY);
                th.setHorizontalAlignment(Element.ALIGN_CENTER);
                taxTbl.addCell(th);
            }

            // Aggregate by tax rate
            Map<BigDecimal, BigDecimal[]> taxMap = new TreeMap<>(Comparator.naturalOrder());
            if (fatura.getItems() != null) {
                for (var item : fatura.getItems()) {
                    if (item.getImpostos() == null) continue;
                    for (var imp : item.getImpostos()) {
                        BigDecimal taxa  = imp.getTaxa() != null
                                ? imp.getTaxa().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                        BigDecimal base  = imp.getBaseCalculo()  != null ? imp.getBaseCalculo()  : BigDecimal.ZERO;
                        BigDecimal valor = imp.getValorImposto() != null ? imp.getValorImposto() : BigDecimal.ZERO;
                        taxMap.merge(taxa, new BigDecimal[]{base, valor},
                                (a, b) -> new BigDecimal[]{a[0].add(b[0]), a[1].add(b[1])});
                    }
                }
            }
            if (taxMap.isEmpty()) {
                // Fallback single row from invoice-level totals
                BigDecimal base  = fatura.getValorIliquido() != null ? fatura.getValorIliquido() : BigDecimal.ZERO;
                BigDecimal valor = fatura.getValorImposto()  != null ? fatura.getValorImposto()  : BigDecimal.ZERO;
                taxRow(taxTbl, base, BigDecimal.valueOf(15), valor, fNorm8);
            } else {
                for (var e : taxMap.entrySet())
                    taxRow(taxTbl, e.getValue()[0], e.getKey(), e.getValue()[1], fNorm8);
            }
            rightCell.addElement(taxTbl);

            // ── Totals table ─────────────────────────────────────
            PdfPTable totsTbl = new PdfPTable(2);
            totsTbl.setWidthPercentage(100);

            totalLine(totsTbl, "Valor Ilíquido (Base):",
                    fatura.getValorIliquido(), fBold9, fNorm9, Color.WHITE);

            BigDecimal dc = fatura.getDescontoComercial();
            if (dc != null && dc.compareTo(BigDecimal.ZERO) > 0)
                totalLine(totsTbl, "Desconto Comercial:", dc.negate(), fBold9, fNorm9, Color.WHITE);
            BigDecimal df = fatura.getDescontoFinanceiro();
            if (df != null && df.compareTo(BigDecimal.ZERO) > 0)
                totalLine(totsTbl, "Desconto Financeiro:", df.negate(), fBold9, fNorm9, Color.WHITE);

            totalLine(totsTbl, "Total IVA:", fatura.getValorImposto(), fBold9, fNorm9, Color.WHITE);
            totalHighlight(totsTbl, "TOTAL A PAGAR:", fatura.getValorFatura(), BRAND_BLUE, fWh10B);

            if (Boolean.TRUE.equals(fatura.getPago())) {
                totalHighlight(totsTbl, "VALOR PAGO:", fatura.getValorPago(), SUCCESS_GREEN, fWh10B);
                totalHighlight(totsTbl, "EM DÍVIDA:", fatura.getValorPorPagar(), BRAND_BLUE, fWh10B);
            }

            rightCell.addElement(totsTbl);
            btm.addCell(rightCell);
            doc.add(btm);

            // ══════════════════════════════════════════════════════
            // 5. LEGAL FOOTER BAR
            // ══════════════════════════════════════════════════════
            addRule(doc, MID_GRAY, 1f, 6f);

            PdfPTable legalTbl = new PdfPTable(1);
            legalTbl.setWidthPercentage(100);
            PdfPCell lc = noBorderCell();
            lc.setBackgroundColor(LIGHT_GRAY);
            lc.setPadding(8f);

            Paragraph proc = new Paragraph("Processado por computador", new Font(bfB, 8, Font.BOLD, BRAND_BLUE));
            proc.setAlignment(Element.ALIGN_CENTER);
            lc.addElement(proc);

            // Audit info
            StringBuilder audit = new StringBuilder();
            if (has(fatura.getCreatedBy()))
                audit.append("Emitido por: ").append(fatura.getCreatedBy());
            if (fatura.getCreatedDate() != null) {
                if (audit.length() > 0) audit.append("  •  ");
                audit.append("Data: ").append(fatura.getCreatedDate().format(DATETIME_FMT));
            }
            if (audit.length() > 0) {
                Paragraph ap = new Paragraph(audit.toString(), fGray7);
                ap.setAlignment(Element.ALIGN_CENTER);
                lc.addElement(ap);
            }

            // Document reference line
            StringBuilder ref = new StringBuilder("Código: ").append(codigo);
            if (fatura.getPrSerie() != null && has(fatura.getPrSerie().getCodigo()))
                ref.append("  •  Série: ").append(fatura.getPrSerie().getCodigo());
            Paragraph refP = new Paragraph(ref.toString(), fGray7);
            refP.setAlignment(Element.ALIGN_CENTER);
            lc.addElement(refP);

            // Legal disclaimer
            StringBuilder legal = new StringBuilder(
                    "Documento gerado electronicamente pelo sistema eFatura — IGRP.");
            if (empresa != null && has(empresa.getNif()))
                legal.append("  NIF Emissor: ").append(empresa.getNif()).append(".");
            legal.append("  Conforme legislação fiscal da República de Cabo Verde.");
            Paragraph legalP = new Paragraph(legal.toString(), fGray7);
            legalP.setAlignment(Element.ALIGN_CENTER);
            lc.addElement(legalP);

            legalTbl.addCell(lc);
            doc.add(legalTbl);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF da fatura: " + e.getMessage(), e);
        } finally {
            doc.close();
        }
        return out.toByteArray();
    }

    // ── Page event: running footer with page numbers ───────────────

    private static final class PageFooterEvent extends PdfPageEventHelper {
        private final FaturaVendaReadDTO fatura;
        private final EntidadeEntity empresa;

        PageFooterEvent(FaturaVendaReadDTO fatura, EntidadeEntity empresa) {
            this.fatura  = fatura;
            this.empresa = empresa;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            try {
                PdfContentByte cb = writer.getDirectContent();
                BaseFont bfGray = BaseFont.createFont(
                        BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                Font f = new Font(bfGray, 7, Font.NORMAL, new Color(156, 163, 175));

                Phrase pageNum = new Phrase("Página " + writer.getPageNumber(), f);
                ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT, pageNum,
                        document.right(), 30f, 0f);

                StringBuilder left = new StringBuilder();
                if (empresa != null && has(empresa.getNif()))
                    left.append("NIF: ").append(empresa.getNif()).append("  |  ");
                if (fatura.getCodigo() != null)
                    left.append(fatura.getCodigo());
                ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                        new Phrase(left.toString(), f), document.left(), 30f, 0f);
            } catch (Exception ignored) {}
        }
    }

    // ── Layout helpers ─────────────────────────────────────────────

    private static void addRule(Document doc, Color color, float h, float after) throws DocumentException {
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

    private static PdfPCell noBorderCell() {
        PdfPCell c = new PdfPCell();
        c.setBorder(Rectangle.NO_BORDER);
        c.setPadding(4f);
        return c;
    }

    private static PdfPCell infoBlock(String title, Font titleFont, Color bg) {
        PdfPCell c = new PdfPCell();
        c.setBackgroundColor(bg);
        c.setBorderColor(MID_GRAY);
        c.setBorder(Rectangle.BOX);
        c.setPadding(10f);
        c.addElement(new Paragraph(title, titleFont));
        c.addElement(Chunk.NEWLINE);
        return c;
    }

    private static void addLine(PdfPCell cell, String label, String value, Font lf, Font vf) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", lf));
        p.add(new Chunk(value, vf));
        cell.addElement(p);
    }

    private static void td(PdfPTable tbl, String text, Font font, Color bg, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setBackgroundColor(bg);
        c.setPadding(5f);
        c.setHorizontalAlignment(align);
        c.setBorderColor(MID_GRAY);
        tbl.addCell(c);
    }

    private static void taxRow(PdfPTable tbl, BigDecimal base, BigDecimal taxa, BigDecimal valor, Font f) {
        PdfPCell c1 = new PdfPCell(new Phrase(cve(base), f));
        c1.setPadding(4f); c1.setBorderColor(MID_GRAY); c1.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tbl.addCell(c1);

        String taxaStr = taxa != null ? taxa.stripTrailingZeros().toPlainString() + "%" : "—";
        PdfPCell c2 = new PdfPCell(new Phrase(taxaStr, f));
        c2.setPadding(4f); c2.setBorderColor(MID_GRAY); c2.setHorizontalAlignment(Element.ALIGN_CENTER);
        tbl.addCell(c2);

        PdfPCell c3 = new PdfPCell(new Phrase(cve(valor), f));
        c3.setPadding(4f); c3.setBorderColor(MID_GRAY); c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tbl.addCell(c3);
    }

    private static void totalLine(PdfPTable tbl, String label, BigDecimal value,
                                   Font lf, Font vf, Color bg) {
        PdfPCell lc = new PdfPCell(new Phrase(label, lf));
        lc.setPadding(4f); lc.setBackgroundColor(bg); lc.setBorderColor(MID_GRAY);
        tbl.addCell(lc);
        PdfPCell vc = new PdfPCell(new Phrase(cve(value), vf));
        vc.setPadding(4f); vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vc.setBackgroundColor(bg); vc.setBorderColor(MID_GRAY);
        tbl.addCell(vc);
    }

    private static void totalHighlight(PdfPTable tbl, String label, BigDecimal value, Color bg, Font fw) {
        PdfPCell lc = new PdfPCell(new Phrase(label, fw));
        lc.setPadding(7f); lc.setBackgroundColor(bg); lc.setBorderColor(bg);
        tbl.addCell(lc);
        PdfPCell vc = new PdfPCell(new Phrase(cve(value), fw));
        vc.setPadding(7f); vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vc.setBackgroundColor(bg); vc.setBorderColor(bg);
        tbl.addCell(vc);
    }

    // ── Value formatters ───────────────────────────────────────────

    private static String cve(BigDecimal v) {
        if (v == null) return "—";
        return String.format("%,.2f CVE", v);
    }

    private static String qty(BigDecimal v) {
        if (v == null) return "—";
        return v.stripTrailingZeros().toPlainString();
    }

    private static String pct(BigDecimal v) {
        if (v == null || v.compareTo(BigDecimal.ZERO) == 0) return "—";
        return v.stripTrailingZeros().toPlainString() + "%";
    }

    private static String fmtDate(LocalDate d) {
        return d != null ? d.format(DATE_FMT) : "—";
    }

    private static boolean has(String s) {
        return s != null && !s.isBlank();
    }
}
