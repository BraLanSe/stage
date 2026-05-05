package cv.igrp.fatura.venda.application.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import cv.igrp.fatura.venda.application.dto.FaturaVendaReadDTO;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
public class FaturaPdfService {

    private static final Color BRAND_BLUE = new Color(53, 121, 246);
    private static final Color LIGHT_GRAY = new Color(248, 249, 250);

    public byte[] gerarRecibo(FaturaVendaReadDTO fatura) {
        Document doc = new Document(PageSize.A4, 45, 45, 55, 45);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            Font titleFont  = new Font(Font.HELVETICA, 22, Font.BOLD, BRAND_BLUE);
            Font headFont   = new Font(Font.HELVETICA, 9,  Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 9,  Font.NORMAL);
            Font smallGray  = new Font(Font.HELVETICA, 8,  Font.NORMAL, Color.GRAY);
            Font whiteHead  = new Font(Font.HELVETICA, 9,  Font.BOLD, Color.WHITE);

            // ── Header ────────────────────────────────────────────
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setSpacingAfter(12);

            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.addElement(new Paragraph("eFatura", titleFont));
            titleCell.addElement(new Paragraph("Sistema de Facturação Electrónica", smallGray));
            header.addCell(titleCell);

            PdfPCell docCell = new PdfPCell();
            docCell.setBorder(Rectangle.NO_BORDER);
            docCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Font docNumFont = new Font(Font.HELVETICA, 14, Font.BOLD);
            Paragraph docNum = new Paragraph(fatura.getCodigo() != null ? fatura.getCodigo() : "—", docNumFont);
            docNum.setAlignment(Element.ALIGN_RIGHT);
            docCell.addElement(docNum);
            String estadoLabel = "CONFIRMADO".equals(fatura.getEstado()) ? "Confirmado" : "Rascunho";
            Font estadoFont = new Font(Font.HELVETICA, 9, Font.BOLD,
                    "CONFIRMADO".equals(fatura.getEstado()) ? new Color(16, 185, 129) : new Color(245, 158, 11));
            Paragraph estadoPar = new Paragraph(estadoLabel, estadoFont);
            estadoPar.setAlignment(Element.ALIGN_RIGHT);
            docCell.addElement(estadoPar);
            header.addCell(docCell);

            doc.add(header);

            // separator line
            PdfPTable sep = new PdfPTable(1);
            sep.setWidthPercentage(100);
            sep.setSpacingAfter(12);
            PdfPCell sepCell = new PdfPCell();
            sepCell.setFixedHeight(2f);
            sepCell.setBackgroundColor(BRAND_BLUE);
            sepCell.setBorder(Rectangle.NO_BORDER);
            sep.addCell(sepCell);
            doc.add(sep);

            // ── Client + Invoice Info ──────────────────────────────
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(14);

            PdfPCell clientBlock = new PdfPCell();
            clientBlock.setBorder(Rectangle.NO_BORDER);
            clientBlock.setBackgroundColor(LIGHT_GRAY);
            clientBlock.setPadding(10);
            clientBlock.addElement(new Paragraph("CLIENTE", new Font(Font.HELVETICA, 7, Font.BOLD, Color.GRAY)));
            String clienteNome = fatura.getCliente() != null ? fatura.getCliente().getDesig() : "—";
            String clienteNif  = fatura.getCliente() != null && fatura.getCliente().getNif() != null
                    ? "NIF: " + fatura.getCliente().getNif() : "";
            clientBlock.addElement(new Paragraph(clienteNome, new Font(Font.HELVETICA, 10, Font.BOLD)));
            if (!clienteNif.isEmpty()) clientBlock.addElement(new Paragraph(clienteNif, normalFont));
            infoTable.addCell(clientBlock);

            PdfPCell dateBlock = new PdfPCell();
            dateBlock.setBorder(Rectangle.NO_BORDER);
            dateBlock.setBackgroundColor(LIGHT_GRAY);
            dateBlock.setPadding(10);
            dateBlock.addElement(new Paragraph("DETALHES", new Font(Font.HELVETICA, 7, Font.BOLD, Color.GRAY)));
            addInfoRow(dateBlock, "Data de emissão:", fatura.getDtFaturacao() != null ? fatura.getDtFaturacao().toString() : "—", headFont, normalFont);
            addInfoRow(dateBlock, "Vencimento:", fatura.getDtVencimentoFatura() != null ? fatura.getDtVencimentoFatura().toString() : "—", headFont, normalFont);
            addInfoRow(dateBlock, "Condições:", fatura.getTermCondicoes() != null ? fatura.getTermCondicoes() : "—", headFont, normalFont);
            infoTable.addCell(dateBlock);

            doc.add(infoTable);

            // ── Items Table ────────────────────────────────────────
            PdfPTable itemTable = new PdfPTable(5);
            itemTable.setWidthPercentage(100);
            itemTable.setSpacingAfter(12);
            itemTable.setWidths(new float[]{4f, 1.2f, 2f, 1.5f, 2f});

            addTH(itemTable, "Descrição",      whiteHead);
            addTH(itemTable, "Qtd.",           whiteHead);
            addTH(itemTable, "Preço/Unid.",    whiteHead);
            addTH(itemTable, "Desc.%",         whiteHead);
            addTH(itemTable, "Total",          whiteHead);

            boolean odd = false;
            if (fatura.getItems() != null) {
                for (var item : fatura.getItems()) {
                    Color rowBg = odd ? LIGHT_GRAY : Color.WHITE;
                    odd = !odd;
                    addTD(itemTable, item.getDesig() != null ? item.getDesig() : "—", normalFont, rowBg, Element.ALIGN_LEFT);
                    String qty = item.getQuantidade() != null ? item.getQuantidade().stripTrailingZeros().toPlainString() : "—";
                    addTD(itemTable, qty, normalFont, rowBg, Element.ALIGN_CENTER);
                    addTD(itemTable, item.getPrecoUnitario() != null ? cveFmt(item.getPrecoUnitario()) : "—", normalFont, rowBg, Element.ALIGN_RIGHT);
                    String disc = item.getDescontoComercialPerc() != null && item.getDescontoComercialPerc().compareTo(BigDecimal.ZERO) > 0
                            ? item.getDescontoComercialPerc().stripTrailingZeros().toPlainString() + "%" : "—";
                    addTD(itemTable, disc, normalFont, rowBg, Element.ALIGN_CENTER);
                    addTD(itemTable, item.getValorTotal() != null ? cveFmt(item.getValorTotal()) : "—", normalFont, rowBg, Element.ALIGN_RIGHT);
                }
            }

            doc.add(itemTable);

            // ── Totals ─────────────────────────────────────────────
            PdfPTable totals = new PdfPTable(2);
            totals.setWidthPercentage(40);
            totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totals.setSpacingAfter(20);

            addTotalRow(totals, "Subtotal (ilíq.):", fatura.getValorIliquido(), headFont, normalFont, Color.WHITE);
            addTotalRow(totals, "IVA:",              fatura.getValorImposto(),   headFont, normalFont, Color.WHITE);
            addTotalRowHighlight(totals, "TOTAL A PAGAR:", fatura.getValorFatura());

            doc.add(totals);

            // ── Nota ───────────────────────────────────────────────
            if (fatura.getNota() != null && !fatura.getNota().isBlank()) {
                Paragraph notaLabel = new Paragraph("Nota:", headFont);
                doc.add(notaLabel);
                doc.add(new Paragraph(fatura.getNota(), normalFont));
                doc.add(Chunk.NEWLINE);
            }

            // ── Audit Footer ───────────────────────────────────────
            doc.add(Chunk.NEWLINE);
            PdfPTable footerSep = new PdfPTable(1);
            footerSep.setWidthPercentage(100);
            PdfPCell fsCell = new PdfPCell();
            fsCell.setFixedHeight(1f);
            fsCell.setBackgroundColor(new Color(229, 231, 235));
            fsCell.setBorder(Rectangle.NO_BORDER);
            footerSep.addCell(fsCell);
            doc.add(footerSep);

            String auditText = "Documento gerado electronicamente";
            if (fatura.getCreatedBy() != null) {
                String dateStr = fatura.getCreatedDate() != null
                        ? fatura.getCreatedDate().toLocalDate().toString() : "—";
                auditText = "Criado por " + fatura.getCreatedBy() + " em " + dateStr;
            }
            Paragraph footer = new Paragraph(auditText, smallGray);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF da fatura", e);
        } finally {
            doc.close();
        }
        return out.toByteArray();
    }

    // ── helpers ───────────────────────────────────────────────────

    private static void addInfoRow(PdfPCell cell, String label, String value, Font lf, Font vf) {
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", lf));
        p.add(new Chunk(value, vf));
        cell.addElement(p);
    }

    private static void addTH(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BRAND_BLUE);
        cell.setPadding(6);
        cell.setBorderColor(BRAND_BLUE);
        table.addCell(cell);
    }

    private static void addTD(PdfPTable table, String text, Font font, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(5);
        cell.setHorizontalAlignment(align);
        cell.setBorderColor(new Color(229, 231, 235));
        table.addCell(cell);
    }

    private static void addTotalRow(PdfPTable table, String label, BigDecimal value,
                                    Font lf, Font vf, Color bg) {
        PdfPCell lc = new PdfPCell(new Phrase(label, lf));
        lc.setPadding(4); lc.setBackgroundColor(bg); lc.setBorderColor(new Color(229, 231, 235));
        table.addCell(lc);
        PdfPCell vc = new PdfPCell(new Phrase(value != null ? cveFmt(value) : "—", vf));
        vc.setPadding(4); vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vc.setBackgroundColor(bg); vc.setBorderColor(new Color(229, 231, 235));
        table.addCell(vc);
    }

    private static void addTotalRowHighlight(PdfPTable table, String label, BigDecimal value) {
        Font boldWhite = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
        PdfPCell lc = new PdfPCell(new Phrase(label, boldWhite));
        lc.setPadding(6); lc.setBackgroundColor(BRAND_BLUE); lc.setBorderColor(BRAND_BLUE);
        table.addCell(lc);
        PdfPCell vc = new PdfPCell(new Phrase(value != null ? cveFmt(value) : "—", boldWhite));
        vc.setPadding(6); vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vc.setBackgroundColor(BRAND_BLUE); vc.setBorderColor(BRAND_BLUE);
        table.addCell(vc);
    }

    private static String cveFmt(BigDecimal value) {
        if (value == null) return "—";
        return String.format("%,.2f CVE", value);
    }
}
