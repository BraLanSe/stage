package cv.igrp.fatura.compra.application.service;

import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.EntidadeRepository;
import cv.igrp.fatura.compra.application.dto.FaturaCompraReadDTO;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FaturaCompraPdfServiceTest {

    @Mock EntidadeRepository entidadeRepo;
    @Mock FaturaCompraRepository faturaCompraRepo;
    @InjectMocks FaturaCompraPdfService service;

    @BeforeEach
    void setUp() {
        when(entidadeRepo.findAll()).thenReturn(Collections.emptyList());
    }

    // ── DTO builders ──────────────────────────────────────────────────────────

    private FaturaCompraReadDTO.ItemInfo item(String desig, BigDecimal qty, BigDecimal preco, BigDecimal total) {
        FaturaCompraReadDTO.ItemInfo i = new FaturaCompraReadDTO.ItemInfo();
        i.setNumLinha(1);
        i.setDesig(desig);
        i.setQuantidade(qty);
        i.setPrecoUnitario(preco);
        i.setValorBruto(qty.multiply(preco));
        i.setValorLiquido(total);
        i.setValorTotal(total);
        i.setValorImposto(BigDecimal.ZERO);
        i.setImpostos(Collections.emptyList());
        return i;
    }

    private FaturaCompraReadDTO baseDto(String codigo, BigDecimal iliquido, BigDecimal fatura) {
        FaturaCompraReadDTO dto = new FaturaCompraReadDTO();
        dto.setId(1);
        dto.setCodigo(codigo);
        dto.setDtFaturacao(LocalDate.of(2024, 6, 1));
        dto.setEstado("CONFIRMADO");
        dto.setValorIliquido(iliquido);
        dto.setValorFatura(fatura);
        dto.setValorImposto(BigDecimal.ZERO);
        dto.setDescontoComercial(BigDecimal.ZERO);
        dto.setDescontoFinanceiro(BigDecimal.ZERO);
        dto.setItems(List.of(item("Material A", BigDecimal.ONE, iliquido, fatura)));
        return dto;
    }

    // ── Valid PDF output ─────────────────────────────────────────────────────

    @Test
    void shouldReturnNonEmptyByteArrayForValidFaturaCompra() {
        byte[] pdf = service.gerarPdf(baseDto("FC-1", bd("2000"), bd("2000")));

        assertAll(
                () -> assertNotNull(pdf),
                () -> assertTrue(pdf.length > 0)
        );
    }

    @Test
    void shouldProduceValidPdfSignatureForFaturaCompra() {
        byte[] pdf = service.gerarPdf(baseDto("FC-2", bd("1500"), bd("1725")));

        assertEquals("%PDF", new String(pdf, 0, 4));
    }

    // ── Edge case: no discount ───────────────────────────────────────────────

    @Test
    void shouldGeneratePdfWhenNoDiscountApplied() {
        FaturaCompraReadDTO dto = baseDto("FC-3", bd("500"), bd("500"));
        dto.setDescontoComercial(BigDecimal.ZERO);
        dto.setDescontoFinanceiro(BigDecimal.ZERO);

        byte[] pdf = service.gerarPdf(dto);
        assertTrue(pdf.length > 0);
    }

    // ── Edge case: 100% discount — valorFatura = 0 ──────────────────────────

    @Test
    void shouldGeneratePdfWhenFaturaValueIsZero() {
        FaturaCompraReadDTO dto = baseDto("FC-4", bd("1000"), bd("0"));
        dto.setDescontoComercial(bd("1000"));

        byte[] pdf = service.gerarPdf(dto);

        assertAll(
                () -> assertNotNull(pdf),
                () -> assertTrue(pdf.length > 0)
        );
    }

    // ── Edge case: fornecedor without NIF ────────────────────────────────────

    @Test
    void shouldGeneratePdfForFornecedorWithoutNif() {
        FaturaCompraReadDTO dto = baseDto("FC-5", bd("400"), bd("400"));
        FaturaCompraReadDTO.FornecedorInfo forn = new FaturaCompraReadDTO.FornecedorInfo();
        forn.setId(1);
        forn.setDesig("Fornecedor Sem NIF");
        forn.setNif(null);
        dto.setFornecedor(forn);

        byte[] pdf = service.gerarPdf(dto);
        assertEquals("%PDF", new String(pdf, 0, 4));
    }

    // ── Edge case: fornecedor with NIF ───────────────────────────────────────

    @Test
    void shouldGeneratePdfForFornecedorWithNif() {
        FaturaCompraReadDTO dto = baseDto("FC-6", bd("750"), bd("862.50"));
        FaturaCompraReadDTO.FornecedorInfo forn = new FaturaCompraReadDTO.FornecedorInfo();
        forn.setId(2);
        forn.setDesig("Fornecedor ABC Lda.");
        forn.setNif("987654321");
        dto.setFornecedor(forn);

        byte[] pdf = service.gerarPdf(dto);
        assertTrue(pdf.length > 0);
    }

    // ── Edge case: banking information present ───────────────────────────────

    @Test
    void shouldGeneratePdfWithBankingInformation() {
        FaturaCompraReadDTO dto = baseDto("FC-7", bd("300"), bd("300"));
        dto.setFornecedorBanco("BCA");
        dto.setFornecedorIban("CV60 0002 0000 0000 1234 5");
        dto.setNossoBanco("CECV");
        dto.setNossoIban("CV60 0003 0000 0000 9876 5");

        byte[] pdf = service.gerarPdf(dto);
        assertEquals("%PDF", new String(pdf, 0, 4));
    }

    // ── Edge case: no banking information ───────────────────────────────────

    @Test
    void shouldGeneratePdfWithNoBankingInformation() {
        FaturaCompraReadDTO dto = baseDto("FC-8", bd("200"), bd("200"));
        dto.setFornecedorBanco(null);
        dto.setFornecedorIban(null);
        dto.setNossoBanco(null);
        dto.setNossoIban(null);

        assertDoesNotThrow(() -> service.gerarPdf(dto));
    }

    // ── Edge case: nota present ──────────────────────────────────────────────

    @Test
    void shouldGeneratePdfWithNotaFieldPopulated() {
        FaturaCompraReadDTO dto = baseDto("FC-9", bd("100"), bd("115"));
        dto.setNota("Fatura de fornecimento de materiais — Q2 2024");

        byte[] pdf = service.gerarPdf(dto);
        assertTrue(pdf.length > 0);
    }

    // ── Edge case: no fornecedor info ─────────────────────────────────────────

    @Test
    void shouldGeneratePdfWhenFornecedorIsNull() {
        FaturaCompraReadDTO dto = baseDto("FC-10", bd("150"), bd("150"));
        dto.setFornecedor(null);

        assertDoesNotThrow(() -> service.gerarPdf(dto));
    }

    // ── Edge case: multiple items ─────────────────────────────────────────────

    @Test
    void shouldGeneratePdfForFaturaCompraWithMultipleItems() {
        FaturaCompraReadDTO dto = new FaturaCompraReadDTO();
        dto.setId(20);
        dto.setCodigo("FC-20");
        dto.setDtFaturacao(LocalDate.of(2024, 8, 10));
        dto.setEstado("CONFIRMADO");
        dto.setValorIliquido(bd("900"));
        dto.setValorFatura(bd("1035"));
        dto.setValorImposto(bd("135"));
        dto.setDescontoComercial(BigDecimal.ZERO);
        dto.setDescontoFinanceiro(BigDecimal.ZERO);

        FaturaCompraReadDTO.ItemInfo i1 = item("Papel A4", bd("10"), bd("50"), bd("575"));
        FaturaCompraReadDTO.ItemInfo i2 = item("Tinta preta", bd("4"), bd("100"), bd("460"));
        i2.setNumLinha(2);
        dto.setItems(List.of(i1, i2));

        byte[] pdf = service.gerarPdf(dto);
        assertEquals("%PDF", new String(pdf, 0, 4));
    }

    private static BigDecimal bd(String v) { return new BigDecimal(v); }
}
