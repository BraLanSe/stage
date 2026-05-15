package cv.igrp.fatura.compra.application.commands;

import cv.igrp.fatura.cadastro.infrastructure.persistence.entity.FornecedorEntity;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.FornecedorRepository;
import cv.igrp.fatura.cadastro.infrastructure.persistence.repository.ProdutoRepository;
import cv.igrp.fatura.compra.application.dto.FaturaCompraCreateDTO;
import cv.igrp.fatura.compra.application.dto.FaturaCompraItemDTO;
import cv.igrp.fatura.compra.infrastructure.persistence.entity.FaturaCompraEntity;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraItemImpostoRepository;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraItemRepository;
import cv.igrp.fatura.compra.infrastructure.persistence.repository.FaturaCompraRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrFaturaTipoEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.entity.PrSerieEntity;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrFaturaTipoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrImpostoRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrSerieRepository;
import cv.igrp.fatura.parametrizacao.infrastructure.persistence.repository.PrUnidadeRepository;
import cv.igrp.fatura.shared.config.ApplicationAuditorAware;
import cv.igrp.fatura.shared.domain.exceptions.IgrpResponseStatusException;
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
class CreateFaturaCompraCommandHandlerTest {

    @Mock FaturaCompraRepository faturaCompraRepo;
    @Mock FaturaCompraItemRepository itemRepo;
    @Mock FaturaCompraItemImpostoRepository impostoItemRepo;
    @Mock FornecedorRepository fornecedorRepo;
    @Mock PrFaturaTipoRepository tipoRepo;
    @Mock PrSerieRepository serieRepo;
    @Mock PrImpostoRepository impostoRepo;
    @Mock PrUnidadeRepository unidadeRepo;
    @Mock ProdutoRepository produtoRepo;
    @Mock ApplicationAuditorAware auditorAware;

    @InjectMocks
    CreateFaturaCompraCommandHandler handler;

    private FornecedorEntity fornecedor;
    private PrFaturaTipoEntity tipoFatura;
    private PrSerieEntity serie;

    @BeforeEach
    void setUp() {
        fornecedor = new FornecedorEntity();
        fornecedor.setId(1);
        fornecedor.setCodigo("F-00000001");
        fornecedor.setDesig("Fornecedor Teste");
        fornecedor.setIndColetivo(true);
        fornecedor.setAplicarImpostos(true);

        tipoFatura = new PrFaturaTipoEntity();
        tipoFatura.setId(1);

        serie = new PrSerieEntity();
        serie.setId(1);
        serie.setCodigo("FT");
        serie.setContador(0);
    }

    private FaturaCompraCreateDTO buildDto(BigDecimal quantidade, BigDecimal preco) {
        FaturaCompraItemDTO item = new FaturaCompraItemDTO();
        item.setNumLinha(1);
        item.setDesig("Serviço Teste");
        item.setQuantidade(quantidade);
        item.setPrecoUnitario(preco);

        FaturaCompraCreateDTO dto = new FaturaCompraCreateDTO();
        dto.setFornecedorId(1);
        dto.setTipoFaturaId(1);
        dto.setPrSerieId(1);
        dto.setDtFaturacao(LocalDate.now());
        dto.setItems(List.of(item));
        return dto;
    }

    private void stubRepositories() {
        when(fornecedorRepo.findById(1)).thenReturn(Optional.of(fornecedor));
        when(tipoRepo.findById(1)).thenReturn(Optional.of(tipoFatura));
        when(serieRepo.findByIdForUpdate(1)).thenReturn(Optional.of(serie));
        lenient().when(auditorAware.getPreferredUsername()).thenReturn("test-user");
        lenient().when(faturaCompraRepo.save(any())).thenAnswer(inv -> {
            FaturaCompraEntity e = inv.getArgument(0);
            e.setId(42);
            return e;
        });
    }

    @Test
    void shouldCreateFaturaCompraWithCorrectTotals() {
        stubRepositories();
        FaturaCompraCreateDTO dto = buildDto(bd("2"), bd("500.00"));
        dto.setFornecedorBanco("BCA");
        dto.setFornecedorIban("CV60 0002 0000 0000 1234 5");
        dto.setNossoBanco("CECV");
        dto.setNossoIban("CV60 0003 0000 0000 9876 5");

        ResponseEntity<FaturaCompraEntity> response = handler.handle(new CreateFaturaCompraCommand(dto));

        FaturaCompraEntity saved = response.getBody();
        assertAll(
                () -> assertEquals(HttpStatus.OK, response.getStatusCode()),
                () -> assertNotNull(saved),
                () -> assertEquals("FT-1", saved.getCodigo()),
                () -> assertEquals(new BigDecimal("1000.00"), saved.getValorIliquido()),
                () -> assertEquals(new BigDecimal("0.00"), saved.getValorImposto()),
                () -> assertEquals(new BigDecimal("1000.00"), saved.getValorFatura()),
                () -> assertEquals("RASCUNHO", saved.getEstado()),
                () -> assertFalse(saved.getPago())
        );
    }

    @Test
    void shouldPersistBankingInformation() {
        stubRepositories();
        FaturaCompraCreateDTO dto = buildDto(bd("1"), bd("100.00"));
        dto.setFornecedorBanco("BCA");
        dto.setFornecedorIban("CV60 0002 0000 0000 1234 5");
        dto.setNossoBanco("CECV");
        dto.setNossoIban("CV60 0003 0000 0000 9876 5");

        FaturaCompraEntity saved = handler.handle(new CreateFaturaCompraCommand(dto)).getBody();

        assertAll(
                () -> assertEquals("BCA", saved.getFornecedorBanco()),
                () -> assertEquals("CV60 0002 0000 0000 1234 5", saved.getFornecedorIban()),
                () -> assertEquals("CECV", saved.getNossoBanco()),
                () -> assertEquals("CV60 0003 0000 0000 9876 5", saved.getNossoIban())
        );
    }

    @Test
    void shouldSetInitialStateToRascunho() {
        stubRepositories();
        FaturaCompraEntity saved = handler.handle(
                new CreateFaturaCompraCommand(buildDto(bd("1"), bd("100.00")))).getBody();

        assertAll(
                () -> assertEquals("RASCUNHO", saved.getEstado()),
                () -> assertFalse(saved.getPago()),
                () -> assertEquals(BigDecimal.ZERO, saved.getValorPago()),
                () -> assertEquals(new BigDecimal("100.00"), saved.getValorPorPagar())
        );
    }

    @Test
    void shouldIncrementSerieCounter() {
        stubRepositories();
        serie.setContador(5);

        handler.handle(new CreateFaturaCompraCommand(buildDto(bd("1"), bd("50.00"))));

        verify(serieRepo).save(argThat(s -> s.getContador() == 6));
    }

    @Test
    void shouldGenerateCodigoFromSerieAndCounter() {
        stubRepositories();
        serie.setCodigo("FC");
        serie.setContador(9);

        FaturaCompraEntity saved = handler.handle(
                new CreateFaturaCompraCommand(buildDto(bd("1"), bd("50.00")))).getBody();

        assertEquals("FC-10", saved.getCodigo());
    }

    @Test
    void shouldThrowNotFoundWhenFornecedorDoesNotExist() {
        when(fornecedorRepo.findById(99)).thenReturn(Optional.empty());
        FaturaCompraCreateDTO dto = buildDto(bd("1"), bd("100.00"));
        dto.setFornecedorId(99);

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new CreateFaturaCompraCommand(dto)));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void shouldThrowWhenDtVencimentoBeforeDtFaturacao() {
        stubRepositories();
        FaturaCompraCreateDTO dto = buildDto(bd("1"), bd("100.00"));
        dto.setDtFaturacao(LocalDate.of(2024, 6, 15));
        dto.setDtVencimentoFatura(LocalDate.of(2024, 6, 1));

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new CreateFaturaCompraCommand(dto)));

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, ex.getStatusCode());
    }

    @Test
    void shouldThrowBadRequestWhenDesigMissingAndNoProdutoId() {
        stubRepositories();
        FaturaCompraItemDTO item = new FaturaCompraItemDTO();
        item.setNumLinha(1);
        item.setDesig("");
        item.setQuantidade(bd("1"));
        item.setPrecoUnitario(bd("100"));

        FaturaCompraCreateDTO dto = new FaturaCompraCreateDTO();
        dto.setFornecedorId(1);
        dto.setTipoFaturaId(1);
        dto.setPrSerieId(1);
        dto.setDtFaturacao(LocalDate.now());
        dto.setItems(List.of(item));

        IgrpResponseStatusException ex = assertThrows(IgrpResponseStatusException.class,
                () -> handler.handle(new CreateFaturaCompraCommand(dto)));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void shouldCalculateValorFaturaWithMultipleItems() {
        stubRepositories();

        FaturaCompraItemDTO item1 = new FaturaCompraItemDTO();
        item1.setNumLinha(1);
        item1.setDesig("Item A");
        item1.setQuantidade(bd("2"));
        item1.setPrecoUnitario(bd("100.00"));

        FaturaCompraItemDTO item2 = new FaturaCompraItemDTO();
        item2.setNumLinha(2);
        item2.setDesig("Item B");
        item2.setQuantidade(bd("3"));
        item2.setPrecoUnitario(bd("50.00"));

        FaturaCompraCreateDTO dto = new FaturaCompraCreateDTO();
        dto.setFornecedorId(1);
        dto.setTipoFaturaId(1);
        dto.setPrSerieId(1);
        dto.setDtFaturacao(LocalDate.now());
        dto.setItems(List.of(item1, item2));

        FaturaCompraEntity saved = handler.handle(new CreateFaturaCompraCommand(dto)).getBody();

        // item1=200 + item2=150 = 350
        assertAll(
                () -> assertEquals(new BigDecimal("350.00"), saved.getValorIliquido()),
                () -> assertEquals(new BigDecimal("350.00"), saved.getValorFatura()),
                () -> assertEquals(2, saved.getItems().size())
        );
    }

    @Test
    void shouldMapFornecedorToEntity() {
        stubRepositories();
        FaturaCompraEntity saved = handler.handle(
                new CreateFaturaCompraCommand(buildDto(bd("1"), bd("100.00")))).getBody();

        assertSame(fornecedor, saved.getFornecedor());
    }

    private static BigDecimal bd(String val) {
        return new BigDecimal(val);
    }
}
