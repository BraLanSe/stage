package cv.igrp.fatura.venda.application.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.DadosBancariosEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.DadosBancariosRepository;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaItemEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;

@Service
@RequiredArgsConstructor
public class FaturaVendaPdfService {

    private final DadosBancariosRepository dadosBancariosRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Color BRAND_DARK  = new Color(30, 58, 95);
    private static final Color BRAND_LIGHT = new Color(227, 234, 244);
    private static final Color GREY_TEXT   = new Color(90, 90, 90);

    public byte[] generate(FaturaVendaEntity f) {
        var dadosBancarios = dadosBancariosRepository.findAll().stream().findFirst().orElse(null);
        try (var out = new ByteArrayOutputStream()) {
            var doc = new Document(PageSize.A4, 40, 40, 50, 40);
            PdfWriter.getInstance(doc, out);
            doc.open();

            addHeader(doc, f);
            doc.add(Chunk.NEWLINE);
            addParties(doc, f);
            doc.add(Chunk.NEWLINE);
            addItemsTable(doc, f);
            doc.add(Chunk.NEWLINE);
            if (f.getMeioPagamento() != null && !f.getMeioPagamento().isBlank()) {
                addMeioPagamento(doc, f.getMeioPagamento());
            }
            addTotals(doc, f);
            if (f.getNota() != null && !f.getNota().isBlank()) {
                doc.add(Chunk.NEWLINE);
                addNota(doc, f.getNota());
            }
            doc.add(Chunk.NEWLINE);
            addFooter(doc, f, dadosBancarios);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF da fatura " + f.getId(), e);
        }
    }

    // ── Header ──────────────────────────────────────────────────────────────

    private void addHeader(Document doc, FaturaVendaEntity f) throws DocumentException {
        var tbl = new PdfPTable(2);
        tbl.setWidthPercentage(100);
        tbl.setWidths(new float[]{60, 40});

        var titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, Color.WHITE);
        var subFont   = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.WHITE);

        var tipo = f.getTipoFatura() != null ? f.getTipoFatura().getDesig() : "FATURA";
        var titleCell = new PdfPCell();
        titleCell.setBackgroundColor(BRAND_DARK);
        titleCell.setPadding(12);
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.addElement(new Phrase(tipo.toUpperCase(), titleFont));
        titleCell.addElement(new Phrase(f.getCodigo(), subFont));
        tbl.addCell(titleCell);

        var metaFont  = new Font(Font.HELVETICA, 8, Font.NORMAL, GREY_TEXT);
        var valFont   = new Font(Font.HELVETICA, 9, Font.BOLD, BRAND_DARK);
        var rightCell = new PdfPCell();
        rightCell.setBackgroundColor(BRAND_LIGHT);
        rightCell.setPadding(12);
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        rightCell.addElement(labelValue("Data de Faturação", format(f.getDtFaturacao()), metaFont, valFont));
        if (f.getDtVencimentoFatura() != null) {
            rightCell.addElement(labelValue("Data de Vencimento", format(f.getDtVencimentoFatura()), metaFont, valFont));
        }
        tbl.addCell(rightCell);

        doc.add(tbl);
    }

    // ── Parties ─────────────────────────────────────────────────────────────

    private void addParties(Document doc, FaturaVendaEntity f) throws DocumentException {
        var tbl = new PdfPTable(2);
        tbl.setWidthPercentage(100);
        tbl.setWidths(new float[]{50, 50});

        tbl.addCell(partyCell("Cliente", buildClienteBlock(f)));
        tbl.addCell(partyCell("Série", f.getPrSerie() != null ? f.getPrSerie().getDesig() : "—"));

        doc.add(tbl);
    }

    private String buildClienteBlock(FaturaVendaEntity f) {
        var c = f.getCliente();
        if (c == null) return "—";
        var sb = new StringBuilder(c.getDesig());
        if (c.getNif() != null)      sb.append("\nNIF: ").append(c.getNif());
        if (c.getEndereco() != null) sb.append("\n").append(c.getEndereco());
        if (c.getEmail() != null)    sb.append("\n").append(c.getEmail());
        return sb.toString();
    }

    private PdfPCell partyCell(String label, String body) {
        var bodyFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(30, 30, 30));
        var flat = new PdfPCell();
        flat.setBorder(Rectangle.BOX);
        flat.setBorderColor(BRAND_LIGHT);
        flat.setBorderWidth(0.5f);
        flat.setPadding(8);

        var lbl = new Paragraph(label.toUpperCase(),
                new Font(Font.HELVETICA, 7, Font.BOLD, GREY_TEXT));
        lbl.setSpacingAfter(3);
        flat.addElement(lbl);
        flat.addElement(new Paragraph(body, bodyFont));

        return flat;
    }

    // ── Items table ──────────────────────────────────────────────────────────

    private void addItemsTable(Document doc, FaturaVendaEntity f) throws DocumentException {
        var tbl = new PdfPTable(6);
        tbl.setWidthPercentage(100);
        tbl.setWidths(new float[]{8, 34, 10, 14, 14, 14});

        String[] headers = {"#", "Descrição", "Qtd", "Preço Unit.", "Imposto", "Total"};
        for (String h : headers) {
            var cell = new PdfPCell(new Phrase(h,
                    new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE)));
            cell.setBackgroundColor(BRAND_DARK);
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            tbl.addCell(cell);
        }

        var rowFont  = new Font(Font.HELVETICA, 8, Font.NORMAL);
        var rowFontB = new Font(Font.HELVETICA, 8, Font.BOLD);
        boolean alt = false;
        for (FaturaVendaItemEntity item : f.getItems()) {
            Color bg = alt ? BRAND_LIGHT : Color.WHITE;
            tbl.addCell(numCell(String.valueOf(item.getNumLinha()), rowFont, bg));
            tbl.addCell(textCell(item.getDesig(), rowFont, bg));
            tbl.addCell(numCell(fmt4(item.getQuantidade()), rowFont, bg));
            tbl.addCell(numCell(fmt2(item.getPrecoUnitario()), rowFont, bg));
            tbl.addCell(numCell(fmt2(item.getValorImposto()), rowFont, bg));
            tbl.addCell(numCell(fmt2(item.getValorTotal()), rowFontB, bg));
            alt = !alt;
        }

        doc.add(tbl);
    }

    // ── Payment method ───────────────────────────────────────────────────────

    private void addMeioPagamento(Document doc, String meioPagamento) throws DocumentException {
        var tbl = new PdfPTable(1);
        tbl.setWidthPercentage(45);
        tbl.setHorizontalAlignment(Element.ALIGN_RIGHT);

        var cell = new PdfPCell();
        cell.setBorder(Rectangle.TOP);
        cell.setBorderColor(BRAND_LIGHT);
        cell.setPadding(5);
        cell.addElement(new Phrase("Meio de Pagamento: " + meioPagamento,
                new Font(Font.HELVETICA, 8, Font.ITALIC, GREY_TEXT)));
        tbl.addCell(cell);

        doc.add(tbl);
    }

    // ── Totals ───────────────────────────────────────────────────────────────

    private void addTotals(Document doc, FaturaVendaEntity f) throws DocumentException {
        var tbl = new PdfPTable(2);
        tbl.setWidthPercentage(45);
        tbl.setHorizontalAlignment(Element.ALIGN_RIGHT);
        tbl.setWidths(new float[]{60, 40});

        addTotalRow(tbl, "Valor Ilíquido",      fmt2(f.getValorIliquido()),      false);
        if (f.getDescontoComercial().compareTo(BigDecimal.ZERO) != 0)
            addTotalRow(tbl, "Desc. Comercial", "-" + fmt2(f.getDescontoComercial()), false);
        if (f.getDescontoFinanceiro().compareTo(BigDecimal.ZERO) != 0)
            addTotalRow(tbl, "Desc. Financeiro", "-" + fmt2(f.getDescontoFinanceiro()), false);
        addTotalRow(tbl, "IVA",                 fmt2(f.getValorImposto()),        false);
        addTotalRow(tbl, "TOTAL",               fmt2(f.getValorFatura()),          true);

        doc.add(tbl);
    }

    private void addTotalRow(PdfPTable tbl, String label, String value, boolean highlight) {
        var lFont = new Font(Font.HELVETICA, 9, highlight ? Font.BOLD : Font.NORMAL,
                highlight ? Color.WHITE : GREY_TEXT);
        var vFont = new Font(Font.HELVETICA, 9, Font.BOLD,
                highlight ? Color.WHITE : BRAND_DARK);
        Color bg = highlight ? BRAND_DARK : Color.WHITE;

        var lc = new PdfPCell(new Phrase(label, lFont));
        lc.setBackgroundColor(bg);
        lc.setPadding(5);
        lc.setBorder(Rectangle.TOP);
        lc.setBorderColor(BRAND_LIGHT);

        var vc = new PdfPCell(new Phrase(value, vFont));
        vc.setBackgroundColor(bg);
        vc.setPadding(5);
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vc.setBorder(Rectangle.TOP);
        vc.setBorderColor(BRAND_LIGHT);

        tbl.addCell(lc);
        tbl.addCell(vc);
    }

    // ── Notes ────────────────────────────────────────────────────────────────

    private void addNota(Document doc, String nota) throws DocumentException {
        var label = new Paragraph("Notas",
                new Font(Font.HELVETICA, 7, Font.BOLD, GREY_TEXT));
        label.setSpacingAfter(3);
        doc.add(label);
        doc.add(new Paragraph(nota, new Font(Font.HELVETICA, 8, Font.NORMAL)));
    }

    // ── Footer: QR code + Dados Bancários ───────────────────────────────────

    private void addFooter(Document doc, FaturaVendaEntity f, DadosBancariosEntity banco) throws Exception {
        var tbl = new PdfPTable(2);
        tbl.setWidthPercentage(100);
        tbl.setWidths(new float[]{22, 78});

        // Left: QR code
        var qrCell = new PdfPCell();
        qrCell.setBorder(Rectangle.BOX);
        qrCell.setBorderColor(BRAND_LIGHT);
        qrCell.setBorderWidth(0.5f);
        qrCell.setPadding(6);
        qrCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        qrCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        try {
            Image qr = buildQrCode(f);
            qr.scaleToFit(80, 80);
            qrCell.addElement(qr);
        } catch (Exception e) {
            qrCell.addElement(new Paragraph("QR indisponível",
                    new Font(Font.HELVETICA, 7, Font.ITALIC, GREY_TEXT)));
        }
        tbl.addCell(qrCell);

        // Right: dados bancários
        var bankCell = new PdfPCell();
        bankCell.setBorder(Rectangle.BOX);
        bankCell.setBorderColor(BRAND_LIGHT);
        bankCell.setBorderWidth(0.5f);
        bankCell.setPadding(8);
        bankCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        var sectionLbl = new Paragraph("DADOS BANCÁRIOS",
                new Font(Font.HELVETICA, 7, Font.BOLD, GREY_TEXT));
        sectionLbl.setSpacingAfter(4);
        bankCell.addElement(sectionLbl);

        var lf = new Font(Font.HELVETICA, 8, Font.NORMAL, GREY_TEXT);
        var vf = new Font(Font.HELVETICA, 9, Font.BOLD, BRAND_DARK);

        if (banco != null) {
            bankCell.addElement(labelValue("Banco", safe(banco.getBanco()), lf, vf));
            bankCell.addElement(labelValue("IBAN",  safe(banco.getIban()),  lf, vf));
            if (banco.getSwift() != null && !banco.getSwift().isBlank()) {
                bankCell.addElement(labelValue("SWIFT", banco.getSwift(), lf, vf));
            }
        } else {
            bankCell.addElement(new Paragraph("Sem dados bancários registados.",
                    new Font(Font.HELVETICA, 8, Font.ITALIC, GREY_TEXT)));
        }
        tbl.addCell(bankCell);

        doc.add(tbl);
    }

    private Image buildQrCode(FaturaVendaEntity f) throws Exception {
        String nif = (f.getCliente() != null && f.getCliente().getNif() != null)
                ? f.getCliente().getNif() : "N/A";
        String content = String.format("NIF:%s;DATA:%s;TOTAL:%s;COD:%s",
                nif, format(f.getDtFaturacao()), fmt2(f.getValorFatura()), f.getCodigo());

        var hints = new EnumMap<EncodeHintType, Object>(EncodeHintType.class);
        hints.put(EncodeHintType.MARGIN, 1);
        BitMatrix matrix = new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, 150, 150, hints);

        var bos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", bos);
        return Image.getInstance(bos.toByteArray());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Phrase labelValue(String label, String value, Font lf, Font vf) {
        var p = new Phrase();
        p.add(new Chunk(label + ": ", lf));
        p.add(new Chunk(value + "\n", vf));
        return p;
    }

    private String safe(String s) {
        return s != null && !s.isBlank() ? s : "—";
    }

    private PdfPCell numCell(String text, Font font, Color bg) {
        var cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setPadding(5);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(BRAND_LIGHT);
        cell.setBorderWidth(0.3f);
        return cell;
    }

    private PdfPCell textCell(String text, Font font, Color bg) {
        var cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(BRAND_LIGHT);
        cell.setBorderWidth(0.3f);
        return cell;
    }

    private String format(java.time.LocalDate d) {
        return d != null ? d.format(DATE_FMT) : "—";
    }

    private String fmt2(BigDecimal v) {
        return v == null ? "0,00" : v.setScale(2, RoundingMode.HALF_UP)
                .toPlainString().replace('.', ',');
    }

    private String fmt4(BigDecimal v) {
        if (v == null) return "0";
        var stripped = v.stripTrailingZeros();
        return stripped.scale() <= 0
                ? stripped.toPlainString()
                : v.setScale(2, RoundingMode.HALF_UP).toPlainString().replace('.', ',');
    }
}
