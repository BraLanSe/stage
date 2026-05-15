package cv.igrp.fatura.venda.application.service;

import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.EntidadeRepository;
import cv.igrp.fatura.venda.application.dto.FaturaVendaReadDTO;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
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
class FaturaPdfServiceTest {

    @Mock EntidadeRepository entidadeRepo;
    @Mock FaturaVendaRepository faturaVendaRepo;
    @InjectMocks FaturaPdfService service;

    @BeforeEach
    void setUp() {
        when(entidadeRepo.findAll()).thenReturn(Collections.emptyList());
    }

    // ── DTO builders ──────────────────────────────────────────────────────────

    private FaturaVendaReadDTO.ItemInfo item(String desig, BigDecimal qty, BigDecimal preco, BigDecimal total) {
        FaturaVendaReadDTO.ItemInfo i = new FaturaVendaReadDTO.ItemInfo();
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

    private FaturaVendaReadDTO baseDto(String codigo, BigDecimal iliquido, BigDecimal fatura) {
        FaturaVendaReadDTO dto = new FaturaVendaReadDTO();
        dto.setId(1);
        dto.setCodigo(codigo);
        dto.setDtFaturacao(LocalDate.of(2024, 6, 1));
        dto.setEstado("CONFIRMADO");
        dto.setValorIliquido(iliquido);
        dto.setValorFatura(fatura);
        dto.setValorImposto(BigDecimal.ZERO);
        dto.setDescontoComercial(BigDecimal.ZERO);
        dto.setDescontoFinanceiro(BigDecimal.ZERO);
        dto.setItems(List.of(item("Serviço A", BigDecimal.ONE, iliquido, fatura)));
        return dto;
    }

    // ── Valid PDF output ─────────────────────────────────────────────────────

    @Test
    void shouldReturnNonEmptyByteArrayForValidFatura() {
        byte[] pdf = service.gerarRecibo(baseDto("FT-1", bd("1000"), bd("1000")));

        assertAll(
                () -> assertNotNull(pdf),
                () -> assertTrue(pdf.length > 0, "PDF must not be empty")
        );
    }

    @Test
    void shouldProduceValidPdfSignatureForStandardFatura() {
        byte[] pdf = service.gerarRecibo(baseDto("FT-99", bd("500"), bd("575")));

        // PDF files start with %PDF
        String header = new String(pdf, 0, Math.min(4, pdf.length));
        assertEquals("%PDF", header);
    }

    // ── Edge case: no discount ───────────────────────────────────────────────

    @Test
    void shouldGeneratePdfWhenNoDiscountApplied() {
        FaturaVendaReadDTO dto = baseDto("FT-2", bd("800"), bd("800"));
        dto.setDescontoComercial(BigDecimal.ZERO);
        dto.setDescontoFinanceiro(BigDecimal.ZERO);

        byte[] pdf = service.gerarRecibo(dto);

        assertTrue(pdf.length > 0);
    }

    // ── Edge case: 100% commercial discount (valorFatura = 0) ───────────────

    @Test
    void shouldGeneratePdfWhenFaturaValueIsZero() {
        FaturaVendaReadDTO dto = baseDto("FT-3", bd("1000"), bd("0"));
        dto.setDescontoComercial(bd("1000"));

        byte[] pdf = service.gerarRecibo(dto);

        assertAll(
                () -> assertNotNull(pdf),
                () -> assertTrue(pdf.length > 0)
        );
    }

    // ── Edge case: cliente without NIF ───────────────────────────────────────

    @Test
    void shouldGeneratePdfForClientWithoutNif() {
        FaturaVendaReadDTO dto = baseDto("FT-4", bd("300"), bd("300"));

        FaturaVendaReadDTO.ClienteInfo cliente = new FaturaVendaReadDTO.ClienteInfo();
        cliente.setId(1);
        cliente.setDesig("Cliente Sem NIF");
        cliente.setNif(null);
        dto.setCliente(cliente);

        byte[] pdf = service.gerarRecibo(dto);

        String header = new String(pdf, 0, 4);
        assertEquals("%PDF", header);
    }

    // ── Edge case: cliente with NIF ──────────────────────────────────────────

    @Test
    void shouldGeneratePdfForClientWithNif() {
        FaturaVendaReadDTO dto = baseDto("FT-5", bd("250"), bd("287.50"));

        FaturaVendaReadDTO.ClienteInfo cliente = new FaturaVendaReadDTO.ClienteInfo();
        cliente.setId(2);
        cliente.setDesig("Empresa XYZ");
        cliente.setNif("123456789");
        dto.setCliente(cliente);

        byte[] pdf = service.gerarRecibo(dto);

        assertTrue(pdf.length > 0);
    }

    // ── Edge case: nota field present ────────────────────────────────────────

    @Test
    void shouldGeneratePdfWithNotaFieldPopulated() {
        FaturaVendaReadDTO dto = baseDto("FT-6", bd("100"), bd("115"));
        dto.setNota("Entrega expressa — dentro de 24h");

        byte[] pdf = service.gerarRecibo(dto);

        assertTrue(pdf.length > 0);
    }

    // ── Edge case: multiple items ────────────────────────────────────────────

    @Test
    void shouldGeneratePdfForFaturaWithMultipleItems() {
        FaturaVendaReadDTO dto = new FaturaVendaReadDTO();
        dto.setId(10);
        dto.setCodigo("FT-10");
        dto.setDtFaturacao(LocalDate.of(2024, 7, 15));
        dto.setEstado("CONFIRMADO");
        dto.setValorIliquido(bd("600"));
        dto.setValorFatura(bd("690"));
        dto.setValorImposto(bd("90"));
        dto.setDescontoComercial(BigDecimal.ZERO);
        dto.setDescontoFinanceiro(BigDecimal.ZERO);

        FaturaVendaReadDTO.ItemInfo i1 = item("Produto A", bd("2"), bd("100"), bd("230"));
        FaturaVendaReadDTO.ItemInfo i2 = item("Produto B", bd("4"), bd("100"), bd("460"));
        i2.setNumLinha(2);
        dto.setItems(List.of(i1, i2));

        byte[] pdf = service.gerarRecibo(dto);

        assertEquals("%PDF", new String(pdf, 0, 4));
    }

    // ── Edge case: no client info ────────────────────────────────────────────

    @Test
    void shouldGeneratePdfWhenClienteIsNull() {
        FaturaVendaReadDTO dto = baseDto("FT-7", bd("200"), bd("200"));
        dto.setCliente(null);

        assertDoesNotThrow(() -> service.gerarRecibo(dto));
    }

    private static BigDecimal bd(String v) { return new BigDecimal(v); }
}
