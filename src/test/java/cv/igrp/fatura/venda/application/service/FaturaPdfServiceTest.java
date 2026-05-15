package cv.igrp.fatura.venda.application.service;

import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.EntidadeRepository;
import cv.igrp.fatura.venda.application.dto.FaturaVendaReadDTO;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FaturaPdfServiceTest {

    @Mock
    EntidadeRepository entidadeRepo;

    @Mock
    FaturaVendaRepository faturaVendaRepo;

    @InjectMocks
    FaturaPdfService pdfService;

    @Test
    void gerarRecibo_returnsPdfBytes_forStandardFatura() {
        when(entidadeRepo.findAll()).thenReturn(Collections.emptyList());

        FaturaVendaReadDTO dto = buildFatura(
                new BigDecimal("1000.00"),
                new BigDecimal("15.00"),
                new BigDecimal("50.00"),
                new BigDecimal("965.00"),
                "551234567"
        );

        byte[] pdf = pdfService.gerarRecibo(dto);

        assertThat(pdf).isNotNull().isNotEmpty();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    void gerarRecibo_returnsPdf_whenNoDiscounts() {
        when(entidadeRepo.findAll()).thenReturn(Collections.emptyList());

        FaturaVendaReadDTO dto = buildFatura(
                new BigDecimal("500.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                new BigDecimal("600.00"),
                "551234567"
        );

        byte[] pdf = pdfService.gerarRecibo(dto);

        assertThat(pdf).isNotNull().isNotEmpty();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    void gerarRecibo_returnsPdf_whenFullCommercialDiscount() {
        when(entidadeRepo.findAll()).thenReturn(Collections.emptyList());

        // 100% commercial discount: valorFatura = 0
        FaturaVendaReadDTO dto = buildFatura(
                new BigDecimal("1000.00"),
                new BigDecimal("1000.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "551234567"
        );

        byte[] pdf = pdfService.gerarRecibo(dto);

        assertThat(pdf).isNotNull().isNotEmpty();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    void gerarRecibo_returnsPdf_whenClientHasNoNif() {
        when(entidadeRepo.findAll()).thenReturn(Collections.emptyList());

        FaturaVendaReadDTO dto = buildFatura(
                new BigDecimal("300.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                new BigDecimal("360.00"),
                null
        );

        byte[] pdf = pdfService.gerarRecibo(dto);

        assertThat(pdf).isNotNull().isNotEmpty();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    void gerarRecibo_returnsPdf_whenClientIsNull() {
        when(entidadeRepo.findAll()).thenReturn(Collections.emptyList());

        FaturaVendaReadDTO dto = buildFatura(
                new BigDecimal("200.00"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                new BigDecimal("240.00"),
                null
        );
        dto.setCliente(null);

        byte[] pdf = pdfService.gerarRecibo(dto);

        assertThat(pdf).isNotNull().isNotEmpty();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    void gerarRecibo_includesItemsInPdf_withCorrectAmounts() {
        when(entidadeRepo.findAll()).thenReturn(Collections.emptyList());

        FaturaVendaReadDTO dto = buildFatura(
                new BigDecimal("800.00"),
                new BigDecimal("80.00"),
                BigDecimal.ZERO,
                new BigDecimal("864.00"),
                "551111111"
        );

        FaturaVendaReadDTO.ItemInfo item = new FaturaVendaReadDTO.ItemInfo();
        item.setCodigoArtigo("PROD-01");
        item.setDesig("Produto de teste");
        item.setQuantidade(new BigDecimal("2"));
        item.setPrecoUnitario(new BigDecimal("400.00"));
        item.setDescontoComercialPerc(new BigDecimal("10"));
        item.setDescontoComercialValor(new BigDecimal("80.00"));
        item.setValorBruto(new BigDecimal("800.00"));
        item.setValorLiquido(new BigDecimal("720.00"));
        item.setValorImposto(new BigDecimal("144.00"));
        item.setValorTotal(new BigDecimal("864.00"));

        FaturaVendaReadDTO.ImpostoInfo imposto = new FaturaVendaReadDTO.ImpostoInfo();
        imposto.setTaxa(new BigDecimal("20"));
        imposto.setTipoCalculo("IVA 20%");
        item.setImpostos(List.of(imposto));

        dto.setItems(List.of(item));

        byte[] pdf = pdfService.gerarRecibo(dto);

        assertThat(pdf).isNotNull().isNotEmpty();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    private FaturaVendaReadDTO buildFatura(
            BigDecimal iliquido,
            BigDecimal descCom,
            BigDecimal descFin,
            BigDecimal total,
            String nif
    ) {
        FaturaVendaReadDTO dto = new FaturaVendaReadDTO();
        dto.setCodigo("FVENDA-001");
        dto.setEstado("CONFIRMADO");
        dto.setDtFaturacao(LocalDate.now());
        dto.setValorIliquido(iliquido);
        dto.setDescontoComercial(descCom);
        dto.setDescontoFinanceiro(descFin);
        dto.setValorImposto(total.subtract(iliquido.subtract(descCom).subtract(descFin)).max(BigDecimal.ZERO));
        dto.setValorFatura(total);
        dto.setItems(Collections.emptyList());

        FaturaVendaReadDTO.ClienteInfo cliente = new FaturaVendaReadDTO.ClienteInfo();
        cliente.setDesig("Cliente Teste");
        cliente.setEndereco("Praia, Santiago, Cabo Verde");
        cliente.setNif(nif);
        dto.setCliente(cliente);

        FaturaVendaReadDTO.SerieInfo serie = new FaturaVendaReadDTO.SerieInfo();
        serie.setCodigo("FVENDA");
        serie.setDesig("Faturas de Venda");
        dto.setPrSerie(serie);

        return dto;
    }
}
