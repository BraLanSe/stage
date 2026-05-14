package cv.igrp.fatura.venda.application.commands;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.ClienteEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ClienteRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ProdutoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrFaturaTipoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrSerieEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrFaturaTipoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrImpostoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrSerieRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrUnidadeRepository;
import cv.igrp.fatura.shared.config.ApplicationAuditorAware;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
import cv.igrp.fatura.venda.application.dto.FaturaVendaCreateDTO;
import cv.igrp.fatura.venda.application.dto.FaturaVendaItemDTO;
import cv.igrp.fatura.venda.infrastructure.persistence.entity.FaturaVendaEntity;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaItemImpostoRepository;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaItemRepository;
import cv.igrp.fatura.venda.infrastructure.persistence.repository.FaturaVendaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateFaturaVendaCommandHandlerTest {

    @Mock FaturaVendaRepository faturaVendaRepo;
    @Mock FaturaVendaItemRepository itemRepo;
    @Mock FaturaVendaItemImpostoRepository impostoItemRepo;
    @Mock ClienteRepository clienteRepo;
    @Mock PrFaturaTipoRepository tipoRepo;
    @Mock PrSerieRepository serieRepo;
    @Mock PrImpostoRepository impostoRepo;
    @Mock PrUnidadeRepository unidadeRepo;
    @Mock ProdutoRepository produtoRepo;
    @Mock ApplicationAuditorAware auditorAware;

    @InjectMocks
    CreateFaturaVendaCommandHandler handler;

    private ClienteEntity cliente;
    private PrFaturaTipoEntity tipoFatura;
    private PrSerieEntity serie;

    @BeforeEach
    void setUp() {
        cliente = new ClienteEntity();
        cliente.setId(1);
        cliente.setCodigo("C-00000001");
        cliente.setDesig("Cliente Teste");
        cliente.setIndColetivo(false);
        cliente.setAplicarImpostos(true);

        tipoFatura = new PrFaturaTipoEntity();
        tipoFatura.setId(1);

        serie = new PrSerieEntity();
        serie.setId(1);
        serie.setCodigo("FV");
        serie.setContador(0);
    }

    private FaturaVendaItemDTO buildItem(int linha, BigDecimal qty, BigDecimal preco) {
        FaturaVendaItemDTO item = new FaturaVendaItemDTO();
        item.setNumLinha(linha);
        item.setDesig("Produto " + linha);
        item.setQuantidade(qty);
        item.setPrecoUnitario(preco);
        return item;
    }

    private FaturaVendaCreateDTO buildDto(FaturaVendaItemDTO... items) {
        FaturaVendaCreateDTO dto = new FaturaVendaCreateDTO();
        dto.setClienteId(1);
        dto.setTipoFaturaId(1);
        dto.setPrSerieId(1);
        dto.setDtFaturacao(LocalDate.now());
        dto.setItems(List.of(items));
        return dto;
    }

    private void stubRepositories() {
        when(clienteRepo.findById(1)).thenReturn(Optional.of(cliente));
        when(tipoRepo.findById(1)).thenReturn(Optional.of(tipoFatura));
        when(serieRepo.findByIdForUpdate(1)).thenReturn(Optional.of(serie));
        lenient().when(auditorAware.getPreferredUsername()).thenReturn("test-user");
        lenient().when(faturaVendaRepo.save(any())).thenAnswer(inv -> {
            FaturaVendaEntity e = inv.getArgument(0);
            e.setId(99);
            return e;
        });
    }

    @Test
    void shouldCreateFaturaVendaWithCorrectTotals() {
        stubRepositories();
        FaturaVendaItemDTO item = buildItem(1, bd("4"), bd("250.00"));
        FaturaVendaCreateDTO dto = buildDto(item);

        ResponseEntity<FaturaVendaEntity> response = handler.handle(new CreateFaturaVendaCommand(dto));
        FaturaVendaEntity saved = response.getBody();

        assertAll(
                () -> assertEquals(HttpStatus.OK, response.getStatusCode()),
                () -> assertNotNull(saved),
                () -> assertEquals("FV-1", saved.getCodigo()),
                () -> assertEquals(new BigDecimal("1000.00"), saved.getValorIliquido()),
                () -> assertEquals(new BigDecimal("0.00"), saved.getValorImposto()),
                () -> assertEquals(new BigDecimal("1000.00"), saved.getValorFatura())
        );
    }

    @Test
    void shouldSetInitialStateToRascunhoAndUnpaid() {
        stubRepositories();
        FaturaVendaEntity saved = handler.handle(
                new CreateFaturaVendaCommand(buildDto(buildItem(1, bd("1"), bd("100"))))).getBody();

        assertAll(
                () -> assertEquals("RASCUNHO", saved.getEstado()),
                () -> assertFalse(saved.getPago()),
                () -> assertEquals(new BigDecimal("100.00"), saved.getValorPorPagar()),
                () -> assertEquals(BigDecimal.ZERO, saved.getValorPago())
        );
    }

    @Test
    void shouldApplyCommercialDiscountCorrectlyOnItem() {
        stubRepositories();
        FaturaVendaItemDTO item = buildItem(1, bd("1"), bd("1000.00"));
        item.setDescontoComercialPerc(bd("10"));

        FaturaVendaEntity saved = handler.handle(
                new CreateFaturaVendaCommand(buildDto(item))).getBody();

        // bruto=1000, descC 10%=100, liquido=900, no IVA, total=900
        assertAll(
                () -> assertEquals(new BigDecimal("1000.00"), saved.getValorIliquido()),
                () -> assertEquals(new BigDecimal("1000.00"), saved.getValorFatura()),
                () -> assertEquals(1, saved.getItems().size()),
                () -> assertEquals(bd("900.0000"), saved.getItems().get(0).getValorLiquido()),
                () -> assertEquals(bd("100.0000"), saved.getItems().get(0).getDescontoComercialValor())
        );
    }

    @Test
    void shouldApplyBothDiscountsSequentially() {
        stubRepositories();
        FaturaVendaItemDTO item = buildItem(1, bd("1"), bd("1000.00"));
        item.setDescontoComercialPerc(bd("10"));
        item.setDescontoFinanceiroPerc(bd("5"));

        FaturaVendaEntity saved = handler.handle(
                new CreateFaturaVendaCommand(buildDto(item))).getBody();

        // bruto=1000, descC 10%=100 → afterC=900, descF 5%=45 → liquido=855
        assertAll(
                () -> assertEquals(bd("855.0000"), saved.getItems().get(0).getValorLiquido()),
                () -> assertEquals(bd("45.0000"), saved.getItems().get(0).getDescontoFinanceiroValor())
        );
    }

    @Test
    void shouldIncrementSerieCounterOnEachCreation() {
        stubRepositories();
        serie.setContador(3);

        handler.handle(new CreateFaturaVendaCommand(buildDto(buildItem(1, bd("1"), bd("10")))));

        verify(serieRepo).save(argThat(s -> s.getContador() == 4));
    }

    @Test
    void shouldSumMultipleItemsIntoTotals() {
        stubRepositories();
        FaturaVendaItemDTO item1 = buildItem(1, bd("2"), bd("100.00"));
        FaturaVendaItemDTO item2 = buildItem(2, bd("1"), bd("300.00"));

        FaturaVendaEntity saved = handler.handle(
                new CreateFaturaVendaCommand(buildDto(item1, item2))).getBody();

        assertAll(
                () -> assertEquals(new BigDecimal("500.00"), saved.getValorIliquido()),
                () -> assertEquals(new BigDecimal("500.00"), saved.getValorFatura()),
                () -> assertEquals(2, saved.getItems().size())
        );
    }

    @Test
    void shouldThrowNotFoundWhenClienteDoesNotExist() {
        when(clienteRepo.findById(999)).thenReturn(Optional.empty());
        FaturaVendaCreateDTO dto = buildDto(buildItem(1, bd("1"), bd("100")));
        dto.setClienteId(999);

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new CreateFaturaVendaCommand(dto)));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void shouldThrowWhenDtVencimentoIsBeforeDtFaturacao() {
        stubRepositories();
        FaturaVendaCreateDTO dto = buildDto(buildItem(1, bd("1"), bd("100")));
        dto.setDtFaturacao(LocalDate.of(2024, 5, 10));
        dto.setDtVencimentoFatura(LocalDate.of(2024, 4, 1));

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new CreateFaturaVendaCommand(dto)));

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    }

    @Test
    void shouldThrowBadRequestWhenDesigMissingOnFreeTextItem() {
        stubRepositories();
        FaturaVendaItemDTO item = new FaturaVendaItemDTO();
        item.setNumLinha(1);
        item.setDesig("   ");
        item.setQuantidade(bd("1"));
        item.setPrecoUnitario(bd("100"));

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new CreateFaturaVendaCommand(buildDto(item))));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void shouldThrowBadRequestWhenPrecoPuMissingOnFreeTextItem() {
        stubRepositories();
        FaturaVendaItemDTO item = new FaturaVendaItemDTO();
        item.setNumLinha(1);
        item.setDesig("Serviço sem preço");
        item.setQuantidade(bd("1"));
        item.setPrecoUnitario(null);

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new CreateFaturaVendaCommand(buildDto(item))));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void shouldMapClienteToSavedEntity() {
        stubRepositories();
        FaturaVendaEntity saved = handler.handle(
                new CreateFaturaVendaCommand(buildDto(buildItem(1, bd("1"), bd("50"))))).getBody();

        assertSame(cliente, saved.getCliente());
    }

    private static BigDecimal bd(String val) {
        return new BigDecimal(val);
    }
}
